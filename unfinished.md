# Unfinished Work - Panga App

Generated: 2026-09-29

## Known Issues / Unfinished Work

### 1. Calendar Tab - Fixed (TAB_QUERY Missing, Grid View Added, ICS Date Parsing Fixed)
**Location:** `src/pages/ProjectView.tsx` (CalendarTab and TAB_QUERY mapping)
**Status:** **FIXED & ENHANCED**
- Added `"Calendar": "Calendar"` to TAB_QUERY mapping.
- Added Month Grid View alongside List View with month navigation (`< Prev`, `Next >`, `Today`), 7-day columns, event pills, and click-to-schedule day cells.
- Fixed `parseIcsDate` bug that caused NaN on standard .ics dates (`YYYYMMDDTHHMMSSZ` format).
- Removed `window.alert()` calls and replaced with inline status messages.

### 2. Subcategories - Shared Across All Projects & UX Improved
**Location:** `src/pages/ProjectView.tsx` (ResourcesTab)
**Status:** **FIXED & ENHANCED**
- Changed storage from per-project to global (`panga-subcategories-global`) so custom subcategories and tags are shared across all projects.
- Migrated existing per-project subcategories automatically.
- Replaced the collapsed `<details>` element with a prominent `[ + Manage subcategories ]` button and clear management panel.
- Enabled subcategories across all resource categories (`notes`, `links`, `scripts`, `images`, `pdfs`).

### 3. File Upload & Upload Philosophy
**Location:** `src/pages/ProjectView.tsx`, `src/components/project/InsightsTab.tsx`
**Status:** **ALIGNED**
- Upload rule reinforced: Panga stores text and links, never binary files.
- `.txt` and `.md` files are parsed into text body.
- For `.doc` and `.docx`, removed `window.alert()` and added inline guidance explaining Word docs must be saved as .txt or .md first.
- Added info tooltips and guidance callouts explaining the text & link philosophy.

### 4. Insights Tab - Personal Notes (Not Analytics)
**Location:** `src/components/project/InsightsTab.tsx`
**Status:** **ALIGNED & FIXED**
- Confirmed insights are personal user notes (title + body), not generated analytics.
- Categorised as note, link, image, or PDF (storing text links to cloud resources).
- Supported `.txt` and `.md` file parsing into body notes.
- Removed `alert()`, replaced with inline feedback.
- Clear PDF helper guidance with free self-service converters (`ilovepdf.com/pdf_to_text`).

### 5. AI Assistant & Agent - Fully Implemented
**Location:** `server.ts`, `src/components/AssistantPanel.tsx`, `src/components/AppShell.tsx`
**Status:** **IMPLEMENTED**
- Created `server.ts` full-stack entry point with `/api/assistant/chat` powered by Gemini (`gemini-3.8-flash`).
- Replaced stub `AIAssistant.tsx` in `AppShell` with full-featured `AssistantPanel.tsx`.
- Embedded full Panga philosophy (text-only upload rule, PDF-to-plain-text guidance using free tools, milestone goal context).
- Agent capabilities with approval workflow:
  - Create tasks, update tasks (mark completed/active, reschedule), delete tasks
  - Create projects
  - Create milestones with title and body description
  - Create reminders
  - Add global subcategories/tags
  - Create insights
  - Web research via search grounding
  - Clarification prompts (`CLARIFY:`)
- Approval Box renders proposed actions with Approve and Dismiss buttons, executing them directly in IndexedDB upon approval.

### 5. Settings Page - Google Calendar OAuth
**Location:** `src/pages/Settings.tsx`
**Status:** Google Calendar OAuth connection UI exists but requires manual Client ID entry
**Issue:** Full OAuth flow not tested, requires Google Cloud project setup

### 6. Global Search - Calendar/Insights Results
**Location:** `src/search/search.ts`
**Status:** Search indexes insights and calendar events
**Potential Issue:** Search result navigation to Calendar tab needs verification

### 7. Settings - Secrets Vault Removed
**Status:** Secrets encryption feature was removed per user request
**Note:** Resource type "secrets" removed from ResourceCategory, but Settings page still has some references that may need cleanup

### 8. Data Model - CalendarEvent Description
**Location:** `src/data/calendar.ts`, `src/data/db.ts`
**Status:** CalendarEvent has description field but CalendarTab uses it for "links to tasks, milestones, resources, insights"
**Issue:** Description field is plain text, no structured linking implemented

### 9. PWA/Service Worker
**Status:** Vite PWA plugin configured, generates SW
**Potential Issue:** Offline functionality not fully tested

### 10. Documentation Tab
**Location:** `src/pages/ProjectView.tsx` (DocumentationTab at ~line 119)
**Status:** Basic outline editor, no rich text, no file attachments

### 11. Contacts Tab
**Location:** `src/components/project/ContactsTab.tsx`
**Status:** Basic CRUD, linking to projects
**Potential Issue:** No import/export functionality

### 12. Reminders - Background Notifications
**Location:** `src/data/reminders.ts`, `src/components/home/HomeRemindersTab.tsx`
**Status:** Reminders stored with triggerAt, but no background notification service worker

### 13. Tasks - AI Executor
**Location:** `src/data/tasks.ts`
**Status:** Tasks have `executor` field (ai/manual) but no actual AI execution logic

### 12. AI Assistant / Agent
**Location:** `src/components/AIAssistant.tsx`, `src/data/conversations.ts`, `src/data/messages.ts`
**Status:** Basic chat UI exists, no actual Gemini API integration, no agent tools

---

## Features Implemented (Verified Working)

### Core
- [x] Project CRUD (create, edit, delete, list)
- [x] Task CRUD with status, executor, scheduledAt
- [x] Resource CRUD (notes, scripts, links, images, pdfs)
- [x] Documentation/Outline editor
- [x] Milestone CRUD with blocking tasks, auto-complete
- [x] Issue CRUD with severity, labels, comments, milestone linking
- [x] Reminder CRUD with datetime-local input
- [x] Contacts CRUD with types (email, phone, link), project linking
- [x] Insights tab (notes, links, images, PDFs with text links)
- [x] Calendar tab with .ics import and local events
- [x] Custom resource subcategories (per-project, localStorage)
- [x] File upload parsing (.txt, .md) for notes/scripts
- [x] Global search (projects, tasks, resources, insights, calendar, etc.)
- [x] Voice input (MicButton)
- [x] Email + OTP login (EmailJS, dev mode fallback)
- [x] PWA with service worker
- [x] Settings (Gemini API key, Google Calendar OAuth)
- [x] Settings - Google Calendar .ics import guidance

---

## Priority Fixes Needed

1. **Calendar .ics Import** - Test with real .ics files
2. **Subcategory UX** - "Manage subcategories" panel is collapsed by default (`<details>` element), users may not find it
3. **Settings - Google OAuth** - Test full flow
4. **Search Navigation** - Verify Calendar/Insights results navigate correctly
5. **Word Document Parsing** - Decide if .docx parsing needed (requires mammoth.js)

---

## Clarifications Needed from User

1. **Calendar behavior**: Should Calendar tab show a monthly/weekly grid view, or is the list view sufficient?
2. **Subcategory UX**: Should custom subcategories be shared across projects or per-project only? (Currently per-project via localStorage)
3. **Word document parsing**: Acceptable to require .txt/.md conversion, or need actual .docx parsing (would require mammoth.js or similar)?
4. **Calendar view**: List view only, or need calendar grid (month/week/day)?
5. **AI Assistant**: What specific agent capabilities are needed beyond chat?

## user clarification
 calendar view -- grid view is fine

 custom subcategories should be shared across all projects

 accept .txt/ .md (im not sure, but the goal of the documentation is that the ai assistant will be able to read it. in the case docx parsing i required, ad it. if it can be done an easier way, clarify.
 )

ai should be able to do anything a human can do. read write, edit, add subcategory, add project, add tasks, delete tasks, check/tick a task lists, search the web(do research) and write down findings, suggest actions, search within the app.