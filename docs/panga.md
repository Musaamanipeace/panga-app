# Panga: Merged Design and Build Plan

Personal, open-source, offline-first project and resource planner for one user. Priority: reach resources and scheduling tools and data in the fewest steps. This document merges the earlier "Final plan" with the latest specifications. Where they conflict, the latest specification wins (noted in section 14).

## 1. Current state

**Built:** Vite, React, TypeScript, PWA scaffold; Dexie (IndexedDB) data layer with create, edit and delete for projects, tasks, resources, documentation, milestones, issues and reminders; in-memory global search; voice input; email + OTP login (EmailJS free tier, dev-mode fallback); milestones with blocking-task links that auto-complete.

**Known bugs (fix first, section 12):**
- The app gets stuck on the Add Project screen.
- Existing projects in the database do not load.
- Components do not fit when the window is resized.
- Not yet reproduced. Main suspect: the Dexie v2 to v3 migration (goals renamed to milestones) failing and leaving the database unopened. Second suspect: add-project drawer state.

## 2. Design principles

- No emojis anywhere. Status marks are text labels or CSS-drawn shapes.
- Monospace, utilitarian type from the landing page. No proportional or promotional text.
- **Remove** the page-load transition (machete cut) and the light effects (login glint). **Replace** with sliding element transitions: pages and tabs slide horizontally, drawers and panels slide from their edge, lists expand and collapse, buttons compress on click.
- Every button, icon and feature shows a hover hint explaining what it does.
- Every component fits at any window size: no fixed widths, no overflow, wrapping handled.
- Every saved item can be renamed, edited and deleted.

## 3. Authentication and first screen

1. The first clickable element on the landing page is Login.
2. Enter an email. An OTP is sent (EmailJS free tier; dev mode shows the code on screen if EmailJS is not configured).
3. After verification the user lands on the home screen. Routes are session-gated. Logout is in the header.

## 4. Home screen (before opening or creating a project)

Cross-project tabs:
1. **Tasks:** all tasks, with an active filter.
2. **Contacts:** all contacts.
3. **Schedule:** scheduled tasks and calendar events, with Google Meet Join buttons.
4. **Reminders:** due, upcoming, overdue.

Also on the home screen, top to bottom:
1. **Alerts** (computed, not stored): overdue tasks, due or overdue reminders, missed milestones, high-severity open issues.
2. **Summary row:** active tasks, remaining and scheduled tasks, aggregate milestone progress. Cards deep-link to the relevant tab or project.
3. **Add Project.**
4. **Project grid:** rename, delete, progress with a pending-task hover hint.

## 5. Project workspace tabs

After creating a project the user can type text or add files into these scopes.

### 5.1 Documentation
Type notes or add text documents describing the project (README, rules, instructions, wireframes, designs, charts, spreadsheets). Purpose: give the AI context.

### 5.2 Resources
Categories contain editable subcategories. Defaults can be renamed and restored, and custom subcategories can be added.

- **Notes:** type and save plain text, or upload a text file. Title and tags. Suggested default subcategories: Prompts, Reports and Memos (carried over from the earlier plan; see section 14).
- **Links:** the URL is validated before saving. Title and tags. Default subcategories:
  - AI Chats: one click opens a specific Gemini, Claude or GPT conversation (`provider` field; sign-in may be required). Not embedded, to avoid lag.
  - Multi-tab Bookmarks: a group of links opened together.
  - My Links: socials, portfolios, businesses.
  - More subcategories can be added.
- **Scripts:** plain text or a text file.
- **Secrets:** plain text or a text file, for env variables and similar. Encrypted at rest (section 8).
- **Images:** stores Google Drive links only. Choosing upload sends the file to Google Drive, into an organised folder the user selects.
- **PDFs:** same behaviour as Images.

### 5.3 Issues
GitHub-style issues tailored to personal work. Fields: title, description, labels, severity, open or closed, comments, optional milestone link. No assignees or team features.

### 5.4 Milestones
Phase checkpoints with target date and blocking tasks. Hovering a milestone lists its blocking tasks and their state. A milestone auto-completes when all linked tasks are done and reopens if one is reopened. Milestones with no linked tasks are manual.

### 5.5 Insights
Task completion rate, milestone progress, open versus closed issues, overdue counts, recent activity.

### 5.6 Tasks
A checklist. Status: active, inactive, completed. Every task is labelled "AI" (to be done by the AI) or "Manual". Optional date and time. This is also where scheduling happens: manual scheduling by setting a date and time, or AI-assisted through the agent (section 7).

### 5.7 Contacts
Links, phone numbers and emails, each as its own contact type, with tags. Contacts can be linked to projects. All contacts appear on the home Contacts tab.

## 6. Global search

Always accessible and static: a command palette combined with a file search. Searches projects, tasks, resources, contacts, milestones, issues, documentation, settings (API keys panel, subcategory manager, calendar connection), and saved files by filename. Each result type has a hover hint. Swappable for an indexed engine (FlexSearch) later with no UI changes.

## 7. AI

Provider: Google Gemini API, free tier (Flash models). Claude and OpenAI have no free tier. The key is entered once in Settings and stored in the browser (Dexie `settings`, no backend). Anyone with access to your browser profile could read it, which is acceptable for personal use.

- **Assistant:** chat panel. Conversations are stored locally for a limited time (default 7 days).
- **Agent:** has read, write and edit tools. From context you give it, it can add subcategories, issues, milestones and tasks. It always asks for approval before writing. It stays limited to task work: plans, schedules, editing selections, and web research. It does not design new algorithms or answer general questions.
- **Scheduling by prompt:** the user types a goal in plain language. If the request is ambiguous, an interactive prompt box slides up from the chat base with targeted clarifying questions. Confirmed changes are written to tasks and the schedule with an animated shift.
- Web research depends on Gemini free-tier limits, which must be checked before building.

## 8. Secrets encryption

Passphrase-derived key (PBKDF2 to AES-GCM, WebCrypto, no external library), set once per session or device. Secrets are encrypted at rest in IndexedDB. The passphrase is never stored, only a verification hash.

## 9. Google integrations

One Google Cloud project, client-side sign-in (Google Identity Services), no backend.

- **Calendar:** real OAuth sync, read-only to start. Imports events including Meet-enabled ones into `calendarEvents`. Each event with a `hangoutLink` shows a Join Meet button that opens it directly. Manually added local events live in the same table (`source: local | google`).
- **Drive:** Images and PDFs. Requires the Drive scope and the Google Picker (extra API key) so the user can choose the destination folder.

**Needed from you** (free, self-service; I cannot create Google resources for you):
1. A free Gemini API key from https://aistudio.google.com/apikey.
2. A Google Cloud project with the Calendar and Drive APIs enabled, an OAuth Client ID (Web application, with your origin authorised), and a Picker API key.

Click-by-click steps will go in the README when this phase starts. The OAuth flow can be scaffolded first and go live once the client ID is added in Settings.

## 10. Data model (category + subtype, Supabase-shaped)

- `resources`: one table with `category` (notes, links, scripts, secrets, images, pdfs), `subcategory`, `title`, `tags[]`, and a `meta` object (JSONB in Supabase) for category-specific fields: body or attached text file, URL and `provider`, Drive file id and folder id, encrypted payload.
- `resourceSubcategories`: editable list per category with an `isDefault` flag so defaults can be renamed and restored.
- `contacts`: `type` (email, phone, link), `value`, `tags[]`, `linkedProjectIds[]`.
- `tasks`: adds `executor` (ai or manual) and optional `scheduledAt`.
- `issues`: adds labels, comments, milestone link.
- `milestones`: existing, with `blockingTaskIds[]`.
- `calendarEvents`: `source`, `startsAt`, `endsAt`, `meetLink`.
- `conversations` and `messages`: assistant history with an expiry.
- `settings`: key and value (API keys, verification hash).
- Every record keeps `id`, `createdAt`, `updatedAt`, `syncStatus`, and (where applicable) `projectId`.
- The Dexie version bump includes a migration from current resources rows (best-effort category mapping, remainder to Notes).

## 11. Build order

1. Fix bugs and resize layout (section 12).
2. Sliding transitions in place of machete and glint; remove emojis (section 2).
3. Schema changes and migration (section 10).
4. Home screen (section 4).
5. Workspace tabs (section 5), then secrets encryption (section 8).
6. Global search coverage (section 6).
7. Assistant and agent (section 7).
8. Google Calendar and Drive (section 9).
9. Final UI pass across every tab and state at several window sizes.
10. Supabase sync using the existing `syncStatus` fields, with conflict handling and optional Google sign-in.
11. Rewrite the `docs/` folder from this plan, with a short setup doc for the Gemini key and Google credentials.

## 12. Debugging approach

Run the app in the sandbox rather than reading CSS blind. Reproduce the Add Project hang and the empty project list first (check that the database opens and the v3 migration completes). Then click through every tab and state (empty, populated, drawer open, hover) at narrow, medium and wide window sizes, and fix overflow, alignment, z-index and wrapping issues as found.

## 13. What is unchanged from the earlier plan

Category + subtype schema for Supabase, real Google Calendar sync with Meet links, free Gemini for AI, encrypted secrets, search covering settings and saved files, no emojis, hover hints, the bug-fix pass, and the docs rewrite. All are kept above.

## 14. Conflicts resolved, and questions

Resolved in favour of the latest specification:
- Machete transition and glint are removed, not extended.
- AI chat links moved from a top-level resource type into Links as a default subcategory.
- Contacts moved from a resource type to its own tab and a home tab.
- Images are Drive links, not files stored in IndexedDB.
- The separate per-project Scheduler tab is folded into Tasks (with a home Schedule tab).

Please confirm or correct:
1. The login to dashboard transition is also removed. Sliding replaces it.
2. Prompts and Reports and Memos are no longer top-level. Assumed they are default Notes subcategories.
3. Insights content is as listed in 5.5.
4. Issue fields are as listed in 5.3.
5. Link validation: format check (valid http or https) plus best-effort reachability. Browsers block most cross-site checks, so reachability cannot be guaranteed.
6. The agent may work on AI-labelled tasks only within its scope (plans, edits, research).
7. Assistant history is kept 7 days.
8. Rename and restore defaults apply to both Resources and Links subcategories.
9. Drive folder selection: pick once per project, or each upload?
