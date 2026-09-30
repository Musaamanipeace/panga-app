Here are deep, feature-by-feature prompt specs designed specifically for your codebase architecture (React 19, Vite, TypeScript, Dexie IndexedDB local-first storage, Express server, and Gemini AI). You can copy, modify, and feed these directly into your code generator or developer assistant.

---

### Prompt 1: Multitab Navigation & Tab Management (Scrolling, Collapse, Toggle, History, Custom Tabs)

**Context:**
We want to enhance workspace navigation in our application (`src/components/AppShell.tsx`, `src/pages/ProjectView.tsx`, and state/utility modules) by introducing advanced multi-tab controls.

**Requirements:**

1. **Multi-Tab Scrolling & Layout:**
* Modify the main tab navigation bar to support horizontal scrolling when tabs overflow the viewport width. Add clean scroll indicators or subtle overflow shadows.
* Implement collapsible and expandable tab sub-sections or side drawers.
* Add a global toggle switch/shortcut to collapse all open tab panels into a compact horizontal tab bar.
in such a case, it can collapse back to previous state. eg im in projects, open a project, theres a clear back button that lets me select a diferent project, the screen is decluttered yet every component easily accessible through tree like scrollers, such features.

2. **Custom Project Tabs:**
* Extend the project data model (`src/data/projects.ts` and `src/data/db.ts`) to support user-created **Custom Tabs**.
* A custom tab entity should contain: `id`, `projectId`, `title`, `icon`, `order`, `layoutType` (`grid` | `list` | `doc`), and `resourceIds[]`.
* Provide UI inside `ProjectView.tsx` to add, edit, reorder, and delete custom tabs.

to a tab ou can add components such as editor, options(copy, delete, edit, export as txt, and it can have any preexisting componet eg body, different body types(text, list, timer, resource, )


3. **Tab Navigation History:**
* Build a tab history tracker Hook/Service (`src/data/tabHistory.ts` or similar React state hook).
* Track forward and backward navigation across tabs within a project workspace.
* Add back/forward arrow actions and a "Quick Tab History" dropdown menu next to the main tab header to easily switch to recently visited tabs.



---

### Prompt 2: Rich Text & Large Robust Editor with Autosave & Draft States

**Context:**
Our current note/doc editing needs a significant upgrade. We need a robust, large-scale rich editor that prevents data loss during editing.

**Requirements:**

1. **Robust Editor:**
* Replace or upgrade basic text areas across `src/data/docs.ts` and `src/components/` with a feature-rich, full-height Markdown/Rich Text Editor (e.g., dynamic toolbar with headings, code blocks, checklists, tables, blockquotes, and full-screen focus mode).


2. **Autosave Entry States & Draft Storage:**
* Implement auto-saving for active form fields and document inputs.
* Save in-progress entry states to Dexie (`docEntries` or a new `drafts` table) on keypress or input change (debounced at 500ms).
* Display an explicit autosave status indicator ("Saving...", "Saved to local draft", or "Unsaved changes") in the editor header.
* If the user leaves a tab or reloads the app unexpectedly, restore the latest uncommitted draft upon re-opening the entity.



---

### Prompt 3: Custom & Preset List Resources (Title, List Body, Custom Resource Types)

**Context:**
Resources currently follow a fixed schema in `src/data/resources.ts`. We need to expand resource types to handle customizable items and structured list resources.

**Requirements:**

1. **Preset List Resource Type:**
* Update `Resource` model in `src/data/resources.ts` and `db.ts` to include a new type: `'preset-list'`.
* A preset list resource must have a `title` and a structured `body` that contains an array of list items (`[{ id, text, checked, tags }]`).
* Create UI components to view, check off, reorder, add, and delete items inside a preset list resource.


2. **Custom Resources & Field Extensions:**
* Allow users to define **Custom Resource Types** with custom key-value metadata fields (e.g., custom URL, price, vendor, or custom file links).
* Render these dynamic metadata fields within the resource details viewer and edit modal.


3. **Global Resource Copying & Text Utilities:**
* Add dedicated action buttons to copy resource content: "Copy Title", "Copy Body/List", or "Copy Full Text".
* Include visual toast feedback ("Copied to clipboard") upon clicking copy actions.



---

### Prompt 4: Universal Options Selector, Cursor Routing, & Storage Box

**Context:**
We want to simplify interaction across all items (tasks, resources, issues, milestones) with unified action menus, smart cursor focus, and a global "Storage Box" (Clipboard/Stash).

**Requirements:**

1. **Universal Options Selector:**
* Build a reusable context/dropdown menu component (`src/components/ItemOptionSelector.tsx`) for tasks, resources, issues, and doc entries.
* Supported actions: `Copy Text (Title/Body)`, `Edit Item`, `Duplicate Item`, `Move to Storage Box`, `Export Item`, `Delete`.


2. **Move Cursor / Focus to Target Action:**
* Implement keyboard navigation and automatic cursor focusing (e.g., pressing `E` focuses the title input, pressing `/` focuses search, selecting edit automatically moves cursor to the primary target input).


3. **Global Storage Box (Stash):**
* Create a global **Storage Box** panel accessible anywhere in the app shell.
* Users can drag, drop, or click "Move to Storage Box" to stash temporary snippets, resources, or task templates for later reuse or cross-project copying.



---

### Prompt 5: AI Suite — Prompt, Plan, Research, File Organization & AI Utilities

**Context:**
We have a server-side Gemini API route (`api/assistant/chat.js` or `server.ts`) and AI Assistant components. We need to expand this into an all-in-one AI power tool suite.

**Requirements:**

1. **AI Prompt Generator & Plan Generation:**
* Add explicit AI tools in `AssistantPanel.tsx` or entity modals to:
* **Generate Prompts:** Polish or create structured system/user prompts.
* **Generate Project Plans:** Input a high-level goal and automatically parse AI responses into actionable milestones, tasks, and documentation entries.




2. **AI Research & Report Utility:**
* Create an "AI Research" tab or modal utilizing Gemini with Google Search grounding enabled (`enableSearch: true`).
* Generate structured Markdown reports and allow one-click insertion of reports into project docs or resources.


3. **AI File & Resource Organization:**
* Implement an automated AI categorization helper that scans unorganized resources or project files and suggests ideal tags, categories, or custom tab placements.



---

### Prompt 6: Voice-Based "Train of Thought" Assistant & Activity Manager

**Context:**
To prevent losing context during interruptions, we need a voice-first memory aid and activity tracker.

**Requirements:**

1. **Train of Thought Assistant (Voice-First):**
* Integrate speech recognition (utilizing `useVoiceInput.ts` and `MicButton.tsx`) into a dedicated "Train of Thought" floating widget.
* Allow the user to speak or quickly dictate what they were working on or thinking about (e.g., "I was working on debugging the database migration before this call").
* Store these thoughts as chronological voice/text entries in IndexedDB (`src/data/trainOfThought.ts`).
* When returning to the app or switching projects, display a banner: *"Last time you were doing: [Thought snippet]"*.


2. **Activity Manager:**
* Build an **Activity Manager** log (`src/data/activity.ts`) that tracks CRUD actions across projects, tasks, resources, and docs.
* Display recent workspace activities in a timeline view with filter controls by entity or date.



---

### Prompt 7: Global Quick Tools, Email/Social Drafter, & Grammar Autocorrect

**Context:**
Users need fast shortcuts to productivity tools and content drafting utilities without leaving their current view.

**Requirements:**

1. **Global Quick Tools & Shortcuts List:**
* Create a slide-over or floating modal ("Quick Tools") accessible via a global shortcut (`Cmd/Ctrl + K` or quick launcher button).
* Display a searchable list of resources, quick utilities, and system action shortcuts.


2. **Email & Social Post Drafter:**
* Build drafting modal tools powered by Gemini AI:
* **Email Drafter:** Converts project milestones/updates into formal or casual email updates.
* **Social Post Drafter:** Formats project announcements, milestones, or release notes for platforms like X, LinkedIn, or Dev.to.


* Include quick "Copy to Clipboard" buttons.


3. **Grammar & Spelling Autocorrect Utility:**
* Add a "Check Grammar & Polish" button to the editor toolbar and rich text fields that sends text to Gemini for spell checking, tone optimization, and formatting cleanup.



---

### Prompt 8: Organized Home Tab, Tab History Navigation, & "I'm Stuck" Help Button

**Context:**
The home page (`src/pages/Home.tsx`) needs to serve as an intuitive command center, paired with smart navigation and panic/guidance features.

**Requirements:**

1. **Organized Quick-Step Home Tab:**
* Redesign `Home.tsx` into a streamlined dashboard that aggregates urgent tasks, upcoming milestones, recent documents, and quick resource shortcuts in 3 easy steps/sections.


2. **Instant Insights & Task-Related Insights:**
* Synthesize project state (issues, blocking milestones, open docs) into real-time visual project health cards and action items on the Home tab and `InsightsTab.tsx`.


3. **"I'm Stuck" Button (Stuck Handler):**
* Add an **"I'm Stuck"** help button in the header or assistant bar.
* Clicking this button analyzes the user's active project, overdue tasks, open issues, and train-of-thought log, then uses Gemini AI to give 3 simple, immediate step-by-step suggestions on what to do next.



---

### Prompt 9: Robust Search & Complete Export System

**Context:**
Upgrade search capabilities across IndexedDB and build a comprehensive data export system.

**Requirements:**

1. **Robust Search Mechanism:**
* Enhance `src/search/search.ts` (using FlexSearch/Dexie) to support full-text search across titles, bodies, tags, task descriptions, and custom resource fields.
* Support filters by entity type, date range, project, and status.


2. **File & Data Export System:**
* Add a global and per-project **Export Utility**.
* Support exporting project reports, doc entries, resources, and task lists into multiple formats: `.json` snapshot, Markdown (`.md`), plain text (`.txt`), or CSV/PDF formats.