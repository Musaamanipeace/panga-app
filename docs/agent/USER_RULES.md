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
