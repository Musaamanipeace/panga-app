# Panga: Merged Design and Build Plan

Personal, open-source, offline-first project and resource planner for one user. Priority: reach resources and scheduling tools and data in the fewest steps. This document merges the earlier "Final plan" with the latest specifications. Where they conflict, the latest specification wins (noted in section 14).

## 1. Current state

**Built:** Vite, React, TypeScript, PWA scaffold; Dexie (IndexedDB) data layer with create, edit and delete for projects, tasks, resources, documentation, milestones, issues, reminders, insights and calendar; in-memory global search; voice input; email + OTP login (EmailJS free tier, dev-mode fallback); milestones with blocking-task links that auto-complete; milestones have a title and description giving the AI context; resources store text and links (no file bytes in IndexedDB); file upload parses .txt/.md into text; custom resource subcategories (tags) per project; calendar tab with .ics import from Google Calendar.

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
- **Upload rule (applies to every project tab):** we never store files, we store text. The UI teaches this on hover and via the info icon — keep your resource in your cloud drive and paste the link, or drop in a text document and the app parses it and saves the text content. A protected or encrypted file that only lives behind a link gives an attacker less to reach. See §5.2.

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

Every resource is stored as text, never as a file (the upload rule, §2). The UI guides a new user on hover and via the info icon: keep your resource in your cloud drive and paste the link, or upload a text document and the app parses it and saves the text content. Categories contain editable subcategories implemented as tags (see section 10).

- **Notes:** type and save plain text, or upload a text document (parsed into the body). Supports .txt, .md, .doc, .docx files — .txt and .md are parsed directly; .doc/.docx must be saved as .txt or .md first (Word cannot be parsed in-browser). Title and tags. Suggested default tags: Prompts, Reports and Memos (carried over from the earlier plan; see section 14).
- **Links:** the URL is validated before saving. Title and tags. Default tags:
  - AI Chats: one click opens a specific Gemini, Claude or GPT conversation (`provider` field; sign-in may be required). Not embedded, to avoid lag.
  - Multi-tab Bookmarks: a group of links opened together.
  - My Links: socials, portfolios, businesses.
  - More tags can be added freely.
- **Scripts:** plain text or a text document (parsed into the body). Supports .txt, .md, .doc, .docx — .doc/.docx must be saved as .txt/.md first.
- **Images:** stores Google Drive links only (text, not the file). Paste a share link, or choose upload to send the file to Google Drive into an organised folder the user selects (section 9).
- **PDFs:** a Google Drive link (text, not the file). The assistant can also point you to a free site that converts a PDF to plain text so you can paste the result (see Insights, section 5.5, and AI, section 7).
- Only text documents (.txt, .md) can be uploaded anywhere in Resources; their contents are parsed into the body. PDFs and images are never uploaded as files — they are pasted as links. Word documents (.doc/.docx) must be saved as .txt or .md first.
- **Subcategories:** each resource category supports custom subcategories (tags). Default subcategories are provided per category; users can add, rename, and remove their own subcategories. Subcategories are stored as tags on resources. Subcategory management is available via the "Manage subcategories" panel in the Resources tab.

### 5.3 Issues
GitHub-style issues tailored to personal work. Fields: title, description, labels, severity, open or closed, comments, optional milestone link. No assignees or team features.

### 5.4 Milestones

A milestone is a goal you set for yourself: a **title** and a **body** description. They exist to give the AI context so it can perform agentic action — adding subcategories of work such as notifications, reminders, and tasks — and scheduling tasks, but always with a user/approval workflow (section 7). Phase-checkpoint behaviour is layered on top of the goal: an optional target date and blocking tasks. Hovering a milestone lists its blocking tasks and their state. A milestone auto-completes when all linked tasks are done and reopens if one is reopened. Milestones with no linked tasks are manual.

### 5.5 Insights

A tab for notes you add to yourself. Each insight is a saved note with a **title** and a **body**, sub-categorised as an insight. Most entries are plain notes; any entry can instead be categorised as a **link**, an **image**, or a **PDF**. For those categories you store a *text link* to the exact resource (e.g. a Google Drive share link) — never the file itself. You only ever upload a **text document** (the lazy copy-paste escape hatch): the app parses it and saves the text as the insight body. When you need to bring in a PDF, the assistant points you to a free, self-service website that turns a PDF into plain text (with instructions), and you paste the result. All helper resources are free and self-service.

Insights are user notes, **not** generated analysis — there is no automatic completion-rate chart, milestone progress bar, or computed summary here.

### 5.6 Tasks
A checklist. Status: active, inactive, completed. Every task is labelled "AI" (to be done by the AI) or "Manual". Optional date and time. This is also where scheduling happens: manual scheduling by setting a date and time, or AI-assisted through the agent (section 7).

### 5.7 Contacts
Links, phone numbers and emails, each as its own contact type, with tags. Contacts can be linked to projects. All contacts appear on the home Contacts tab.

## 6. Global search

Always accessible and static: a command palette combined with a file search. Searches projects, tasks, resources, contacts, milestones, issues, documentation, settings (API keys panel, subcategory manager, calendar connection), saved files by filename, and insights by title/body/tags/link. Each result type has a hover hint. Swappable for an indexed engine (FlexSearch) later with no UI changes.

## 7. AI

Provider: Google Gemini API, free tier (Flash models). Claude and OpenAI have no free tier. The key is entered once in Settings and stored in the browser (Dexie `settings`, no backend). Anyone with access to your browser profile could read it, which is acceptable for personal use.

- **Assistant:** chat panel. Conversations are stored locally for a limited time (default 7 days).
- **Agent:** has read, write and edit tools. From context you give it, it can add subcategories, issues, milestones and tasks. It always asks for approval before writing. It stays limited to task work: plans, schedules, editing selections, and web research. It does not design new algorithms or answer general questions.
- **Content ingestion helper:** the assistant knows how to bring content in from formats the user can't paste directly. For a PDF it names a free, self-service site that renders the PDF as plain text and walks the user through it, then the text is saved normally. No paid APIs.
- **Scheduling by prompt:** the user types a goal in plain language. If the request is ambiguous, an interactive prompt box slides up from the chat base with targeted clarifying questions. Confirmed changes are written to tasks and the schedule with an animated shift.
- Web research depends on Gemini free-tier limits, which must be checked before building.

## 8. Secrets encryption

Passphrase-derived key (PBKDF2 to AES-GCM, WebCrypto, no external library), set once per session or device. Secrets are encrypted at rest in IndexedDB. The passphrase is never stored, only a verification hash.

## 9. Google integrations

One Google Cloud project, client-side sign-in (Google Identity Services), no backend.

- **Calendar:** an internal calendar tracks local events with links to other resources (tasks, milestones, resources, insights). Google Calendar is imported via a guided workflow: the assistant prompts the user to export their Google Calendar(s) as .ics files (Google Calendar → Settings → Import & export → Export → download .zip containing .ics per calendar; or export a single calendar via its "More" → Settings and sharing → Export calendar), then the user uploads the .ics file(s) and the app parses them into local `google`-sourced calendarEvents. Device note: export must be done on desktop (not mobile). This keeps all logic local and avoids OAuth/Drive scopes.
- **Drive:** Images and PDFs. Requires the Drive scope and the Google Picker (extra API key) so the user can choose the destination folder.

**Needed from you** (free, self-service; I cannot create Google resources for you):
1. A free Gemini API key from https://aistudio.google.com/apikey.
2. A Google Cloud project with the Calendar and Drive APIs enabled, an OAuth Client ID (Web application, with your origin authorised), and a Picker API key.

Click-by-click steps will go in the README when this phase starts. The OAuth flow can be scaffolded first and go live once the client ID is added in Settings.

## 10. Data model (category + subtype, Supabase-shaped)

- `resources`: one table with `category` (notes, links, scripts, images, pdfs), `subcategory`, `title`, `tags[]`, and category-specific fields: `body` (text, for notes/scripts/links/pdfs), `url` and `provider` (links), `images[]` with a `link` each (Drive share link text), `files[]` with a `link` each and a `text` field (parsed text from uploaded text docs). We never store file bytes — images and PDFs are links; uploaded text documents (.txt, .md) are parsed into `text`. Word documents (.doc/.docx) must be saved as .txt/.md first.
- `resourceSubcategories`: editable tags per category with an `isDefault` flag so defaults can be renamed and restored. Custom subcategories are shared across all projects (stored globally in storage) and merged with defaults at runtime. Tags and subcategories can cross resource types.
- `insights`: user notes for the Insights tab — `projectId`, `title`, `body`, `type` (note|link|image|pdf), `link` (text link for link/image/pdf types), `tags[]`, `createdAt`, `updatedAt`, `syncStatus`. Not generated analytics.
- `contacts`: `type` (email, phone, link), `value`, `tags[]`, `linkedProjectIds[]`.
- `tasks`: adds `executor` (ai or manual) and optional `scheduledAt`.
- `issues`: adds labels, comments, milestone link.
- `milestones`: adds `description` (body context) on top of the existing `blockingTaskIds[]` to give AI agent context for suggested actions, reminders, and scheduling.
- `calendarEvents`: `source`, `startsAt`, `endsAt`, `meetLink`, `description` (links to tasks, milestones, resources, insights). Supported in both monthly Grid view and List view.
- `conversations` and `messages`: assistant history with an expiry.
- `settings`: key and value (API keys, verification hash).
- Every record keeps `id`, `createdAt`, `updatedAt`, `syncStatus`, and (where applicable) `projectId`.
- The Dexie version bump (v5) includes a migration that creates the `insights` table and backfills `description` on existing milestones.

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
- **Insights is NOT generated analysis.** It is a tab where you add your own notes (title + body), sub-categorised as insights. Some notes can instead be categorised as a link, image, or PDF — and for those you store a text link to the exact resource, never the file. Only text documents can be uploaded (parsed to text). PDFs get a quick, free, self-service PDF→plain-text helper with instructions. All helper resources are free.
- **We store text, not files, everywhere.** The UI guides new users on hover and via the info icon to paste a cloud link, or upload a text document that gets parsed. Protected/encrypted files behind links keep the page contents off the server.
- **Milestones are goals with a title and a body** (description). Their purpose is to give the AI context for agentic actions — adding subcategories such as notifications, reminders, and tasks, plus scheduling — with a user/approval workflow.

Please confirm or correct:
1. The login to dashboard transition is also removed. Sliding replaces it.
2. Prompts and Reports and Memos are no longer top-level. Assumed they are default Notes subcategories.
3. Insights is as described in 5.5 — user notes, not analytics.
4. Issue fields are as listed in 5.3.
5. Link validation: format check (valid http or https) plus best-effort reachability. Browsers block most cross-site checks, so reachability cannot be guaranteed.
6. The agent may work on AI-labelled tasks only within its scope (plans, edits, research).
7. Assistant history is kept 7 days.
8. Rename and restore defaults apply to both Resources and Links subcategories.
9. Drive folder selection: pick once per project, or each upload?
10. Calendar import & view: Internal calendar with guided .ics import flow and both Grid view and List view.
11. Custom subcategories are shared across all projects.
12. AI Assistant acts as a full personal agent: read, write, edit, add subcategory, add project, add/delete tasks, check off tasks, web research, suggest actions, search within the app, and guide on PDF plain-text conversion using free tools, with user approval before modifying data.
