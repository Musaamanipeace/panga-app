# USER_RULES.md

Every rule the user has given me, verbatim where possible, dated. Rules persist until the user removes them.

## 2026-11-22 — task prompt: bootstrap agent workflow

- "Inspect the repo first. If any file below already exists, merge into it. Never overwrite or delete existing content without asking me."
- "Do not assume my stack, test commands, or conventions. Detect them from the repo. If you can't detect something, list it under 'Open questions' in your final report and leave a clearly marked `TODO(user)` placeholder in the doc."
- "Make one small commit per file or logical unit, each on a branch, via the issue workflow defined below. Use that workflow for this task itself: create an issue ('Bootstrap agent workflow'), branch, commit in small pieces, open a PR containing `Closes #N`, merge if mergeable."
- "Do not invent rules I haven't given. Everything you write must trace to this prompt. Where you add something extra, mark it `(suggested, needs user approval)`."
- "New rules I state in chat go into `USER_RULES.md` immediately, with the date, in my words. Rules persist until I remove them."

## 2026-11-22 — revised implementation plan (BYOK Supabase, no Google)

- "Users bring their own Supabase project (URL + anon key). The app never ships with a default Supabase instance."
- "Only three ways to persist data: default offline (local IndexedDB), online sync via the user's own Supabase, download/upload a JSON snapshot."
- "Completely remove Google Drive sync and all references to it."
- Follow-up decision: "Every Google/Drive reference" — remove Google Calendar integration too and rewrite Google Drive link wording. Keep the local calendar.
- "Sign-up: User must first provide their own Supabase URL + anon key in Settings, then create an account. Sign-in: user already has credentials configured, enters username + password."
- Follow-up decision: "allow optional guest login, but even as a guest, you could go to settings, add the key, and once you do that, it should prompt you to sign in using user name and password, as your data will now be stored on supabase, not just locally." Then: "it should ask the user what the user wants" (sign in / create account / migrate data).
- "Data must not leak between users or after sign-out."
- "JSON export while signed in must restore the user as signed-in (not as guest) when imported later."
- Follow-up decision: snapshot must carry "all saved data. username, login status, supabase data"; "uploading a json file, should be the same as logging in."
- "my sign in is not a security measure. its just so that i can acces my data from the cloud." Therefore full parity is preferred over secrecy: include the Supabase session and API keys in the JSON snapshot.
- "API key fields in Settings must start empty (no pre-filled characters). Use placeholders only."
- Header Sync UI decision: "Keep a status indicator" — a simple storage-mode badge, no export/import actions.
- "Improve voice-to-speech transcription speed with concrete technical changes." (steps 4 and 5 of the plan)

## 2026-11-25 — Google Drive auth/sync & API key input behavior

- Google Drive sign-in and JSON backup sync is implemented client-side across the landing page, Settings, and Menu (showing signed-in / signed-out status in the Menu), with explicit confirmation & conflict guardrails between local and online work.
- AI provider API key inputs in Settings must never come preloaded with starred/autofilled values; masked stars and `Saved` status appear only when a human keyed in and saved a key, and an eye icon provides a 1-click peek that hides automatically without a second click.

## 2026-11-26 — Reminders dated checklist & no-server rules (owner vision)

- "drop the sever, we won need it. notifications inside the app are fine enough." No server, no Web Push, no background scheduling, no snooze, no advance-notice offsets, and no missed/catch-up alerts list.
- "a reminder is as such, you can add a timed notification, or you could leave it as a reminder. when you tick it off, it deletes. you dont need to be reminded any more."
- "youll go to your reminders and check. ooh, what i gotta do today, and you might not care about it. then you can see what did i not do yesterday, so you go to past events, and you tick some off, and leave some open."
- "you can set daily reminders. weekly, whatever. 2 day, 3 day. thas the vision." Ticking a repeating reminder completes the current occurrence and advances it to its next scheduled date rather than deleting the series.

## 2026-11-27 — Media Drive routes, workspace templates/nesting, Notes persistence, quiet auto-sync & escape UX

- **Add Media tab**: Quickly save image and sound files directly to Google Drive (`panga/media`); store only lightweight routes/metadata in JSON backups (never raw binary blobs in JSON) and cache recent previews locally for offline access.
- **Notes & Train of Thought**: Notes tab defaults to an open editor and saves/restores draft state; Train of Thought is workspace-scoped, collapses at 5 items for `Show history` / `Show fewer`, and includes a Copy button on each thought item.
- **Main workspace & starter templates**: `Main` acts as the global workspace and prompts to move newly created items into a specific workspace. Preload `Developer` (git commands + workspace scripts), `Daily routine` (can start empty), and `Social events` templates — deletable and restorable on demand.
- **Nested workspaces alongside folders & split workspace controls**: Support parent workspaces and subworkspaces alongside existing note folders; separate the workspace switcher from a dedicated `+ Add workspace` button; support global cross-workspace search across all workspaces.
- **Consistent mobile & desktop dismissal**: Include escape/dismiss buttons across components (bottom `Close`/`Cancel` for phone ergonomics alongside top-right `×` and `Escape` key).
- **Google Drive auto-sync & alerts**: Auto-sync quietly after edits and prompt only on conflicts; include remaining in-app reminder alert banners and `.ics`/`.zip` calendar import.
