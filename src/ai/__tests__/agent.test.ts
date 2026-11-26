import "fake-indexeddb/auto";
import { afterEach, describe, expect, it, vi } from "vitest";
import { db } from "../../data/db";
import { accountDb } from "../../data/accountDb";
import * as chatMod from "../chat";
import {
  buildAgentSystemInstruction,
  executeAgentAction,
  executeReadCalls,
  parseAgentReply,
  runAgentTurn,
  sortActionsParentFirst,
  type AgentAction,
} from "../agent";
import { listAllNotes } from "../../data/notes";
import { listAllLinks } from "../../data/links";
import { listAllTasks } from "../../data/tasks";
import { listTaskLists } from "../../data/taskLists";
import { listTaskListFolders } from "../../data/taskListFolders";
import { listReminders } from "../../data/reminders";
import { listClips } from "../../data/clips";

afterEach(async () => {
  vi.restoreAllMocks();
  await Promise.all([
    db.taskListFolders.clear(),
    db.taskLists.clear(),
    db.tasks.clear(),
    db.noteFolders.clear(),
    db.notes.clear(),
    db.linkFolders.clear(),
    db.links.clear(),
    accountDb.reminderFolders.clear(),
    accountDb.reminders.clear(),
    db.resources.clear(),
    db.trainOfThought.clear(),
  ]);
});

describe("AI agent engine", () => {
  it("parses READ, UI, and ACTION directives cleanly (including bullet/numbered prefixes)", () => {
    const reply = `Checking your notes now.
1. READ:{"tool":"search","query":"passport"}
- UI:{"tool":"navigate","tab":"Notes"}
* ACTION:{"type":"create_note","description":"Create note 'Trip'","data":{"title":"Trip","body":"Pack passport"}}`;

    const parsed = parseAgentReply(reply);
    expect(parsed.cleanText).toBe("Checking your notes now.");
    expect(parsed.reads).toEqual([{ tool: "search", query: "passport" }]);
    expect(parsed.uiCalls).toEqual([{ tool: "navigate", tab: "Notes" }]);
    expect(parsed.actions).toHaveLength(1);
    expect(parsed.actions[0].type).toBe("create_note");
  });

  it("explicitly forbids legacy projects, milestones, resources tab, and fake execution prose", async () => {
    const prompt = await buildAgentSystemInstruction("/home?tab=Notes");
    expect(prompt).not.toContain("create_project");
    expect(prompt).not.toContain("create_milestone");
    expect(prompt).not.toContain("create_insight");
    expect(prompt).toContain("NO projects, NO milestones, and NO resources tab");
    expect(prompt).toContain('NEVER write "Approved"');
    expect(prompt).toContain("Task lists");
    expect(prompt).toContain("Notes");
  });

  it("sorts parent-first and resolves folderName -> listName chains (clean -> compound -> sweep/mop/dig) with full Undo", async () => {
    const unsorted: AgentAction[] = [
      { type: "create_task", description: "Add sweep", data: { title: "sweep", listName: "compound" } },
      { type: "create_task", description: "Add mop", data: { title: "mop", listName: "compound" } },
      { type: "create_task", description: "Add dig", data: { title: "dig", listName: "compound" } },
      { type: "create_task_list", description: "Create compound list", data: { title: "compound", folderName: "clean" } },
      { type: "create_task_list_folder", description: "Create clean folder", data: { title: "clean" } },
    ];

    const sorted = sortActionsParentFirst(unsorted);
    expect(sorted.map((a) => a.type)).toEqual([
      "create_task_list_folder",
      "create_task_list",
      "create_task",
      "create_task",
      "create_task",
    ]);

    // Approving a child before its named parent exists fails cleanly
    await expect(executeAgentAction(sorted[1])).rejects.toThrow(/clean/);

    // Sequential execution in sorted order resolves folder -> list -> tasks
    const undos: Array<() => Promise<void>> = [];
    for (const act of sorted) {
      const exec = await executeAgentAction(act);
      if (exec.undo) undos.push(exec.undo);
    }

    const folders = await listTaskListFolders();
    const lists = await listTaskLists();
    const tasks = await listAllTasks();

    expect(folders).toHaveLength(1);
    expect(folders[0].title).toBe("clean");
    expect(lists).toHaveLength(1);
    expect(lists[0].title).toBe("compound");
    expect(lists[0].folderId).toBe(folders[0].id);
    expect(tasks.map((t) => t.title)).toEqual(expect.arrayContaining(["sweep", "mop", "dig"]));
    expect(tasks.every((t) => t.listId === lists[0].id)).toBe(true);

    // Reverse undo removes everything cleanly
    for (const u of undos.reverse()) await u();
    expect(await listAllTasks()).toHaveLength(0);
    expect(await listTaskLists()).toHaveLength(0);
    expect(await listTaskListFolders()).toHaveLength(0);
  });

  it("runs multi-step READ loop via runAgentTurn and sorts returned actions", async () => {
    const spy = vi
      .spyOn(chatMod, "chatCompletion")
      .mockResolvedValueOnce({
        text: 'Let me check your task lists first.\nREAD:{"tool":"list_tasks","listId":null}',
        provider: "gemini",
        model: "gemini-2.5-flash",
      })
      .mockResolvedValueOnce({
        text: `I can create that structure for you.
ACTION:{"type":"create_task","description":"Add sweep","data":{"title":"sweep","listName":"compound"}}
ACTION:{"type":"create_task_list","description":"Create compound list","data":{"title":"compound","folderName":"clean"}}
ACTION:{"type":"create_task_list_folder","description":"Create clean folder","data":{"title":"clean"}}`,
        provider: "gemini",
        model: "gemini-2.5-flash",
      });

    const navigate = vi.fn();
    const turn = await runAgentTurn(
      [{ role: "user", content: "create a tasklist folder called clean and list compound with sweep" }],
      "/home",
      navigate
    );

    expect(spy).toHaveBeenCalledTimes(2);
    expect(turn.clarify).toBeNull();
    expect(turn.cleanText).toBe("I can create that structure for you.");
    expect(turn.actions.map((a) => a.type)).toEqual([
      "create_task_list_folder",
      "create_task_list",
      "create_task",
    ]);
  });

  it("executes note, link, task list, task, and reminder writes with working Undo", async () => {
    // Task list + task
    const listRes = await executeAgentAction({
      type: "create_task_list",
      description: "Create Groceries list",
      data: { title: "Groceries" },
    });
    const lists = await listTaskLists();
    expect(lists.map((l) => l.title)).toContain("Groceries");

    const taskRes = await executeAgentAction({
      type: "create_task",
      description: "Add Milk",
      data: { listId: lists[0].id, title: "Buy milk" },
    });
    expect((await listAllTasks()).map((t) => t.title)).toContain("Buy milk");

    await taskRes.undo!();
    expect(await listAllTasks()).toHaveLength(0);

    await listRes.undo!();
    expect(await listTaskLists()).toHaveLength(0);

    // Note create + append + undo + delete + undo
    const noteRes = await executeAgentAction({
      type: "create_note",
      description: "Create note",
      data: { title: "Ideas", body: "Line 1" },
    });
    const noteId = (await listAllNotes())[0].id;
    const appendRes = await executeAgentAction({
      type: "update_note",
      description: "Append to note",
      data: { id: noteId, appendBody: "Line 2" },
    });
    expect((await listAllNotes())[0].body).toBe("Line 1\nLine 2");

    await appendRes.undo!();
    expect((await listAllNotes())[0].body).toBe("Line 1");

    const delNoteRes = await executeAgentAction({
      type: "delete_note",
      description: "Delete note",
      data: { id: noteId },
    });
    expect(await listAllNotes()).toHaveLength(0);
    await delNoteRes.undo!();
    expect(await listAllNotes()).toHaveLength(1);
    await noteRes.undo!();
    expect(await listAllNotes()).toHaveLength(0);

    // Link
    const linkRes = await executeAgentAction({
      type: "create_link",
      description: "Save link",
      data: { url: "example.com/docs", title: "Example Docs" },
    });
    expect((await listAllLinks())[0].url).toBe("https://example.com/docs");
    await linkRes.undo!();
    expect(await listAllLinks()).toHaveLength(0);

    // Reminder
    const remRes = await executeAgentAction({
      type: "create_reminder",
      description: "Set reminder",
      data: { message: "Call dentist", triggerAt: "2026-11-24T09:00:00" },
    });
    expect((await listReminders())[0].message).toBe("Call dentist");
    await remRes.undo!();
    expect(await listReminders()).toHaveLength(0);
  });

  it("supports search read tool and clipboard copy/paste with Undo", async () => {
    const writeText = vi.fn().mockResolvedValue(undefined);
    const readText = vi.fn().mockResolvedValue("https://panga.app/guide");
    Object.defineProperty(navigator, "clipboard", {
      value: { writeText, readText },
      configurable: true,
    });

    await executeAgentAction({
      type: "create_note",
      description: "Create note",
      data: { title: "Passport renewal", body: "Appointment on Friday" },
    });

    const searchOut = await executeReadCalls([{ tool: "search", query: "passport" }]);
    expect(searchOut).toContain("Passport renewal");

    const copyRes = await executeAgentAction({
      type: "copy_text",
      description: "Copy text",
      data: { text: "Appointment on Friday", saveToClipboardTab: true },
    });
    expect(writeText).toHaveBeenCalledWith("Appointment on Friday");
    expect(await listClips()).toHaveLength(1);
    await copyRes.undo!();
    expect(await listClips()).toHaveLength(0);

    const pasteRes = await executeAgentAction({
      type: "paste_from_system_clipboard",
      description: "Paste link from clipboard",
      data: { target: "link" },
    });
    expect((await listAllLinks())[0].url).toBe("https://panga.app/guide");
    await pasteRes.undo!();
    expect(await listAllLinks()).toHaveLength(0);
  });
});
