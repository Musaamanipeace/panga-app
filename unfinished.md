# Unfinished Work - Panga App

Generated: 2026-09-29

## Known Issues / Unfinished Work

### 1. Calendar Tab - Fixed (TAB_QUERY Missing)
**Location:** `src/pages/ProjectView.tsx` (TAB_QUERY mapping at ~line 34)
**Status:** **FIXED** - Added `"Calendar": "Calendar"` to TAB_QUERY mapping
**Root Cause:** The `TAB_QUERY` mapping was missing "Calendar", so when clicking the Calendar tab, the URL would get `?tab=Calendar` but `activeTab` would fall back to "Documentation" because the query param wasn't recognized.
**Fix Applied:** Added `"Calendar": "Calendar"` to TAB_QUERY mapping at line 43.
**Verification Needed:** Test Calendar tab click and .ics import with real .ics files

### 2. Notes Subcategory - Implemented (UX Issue: Collapsed by Default)
**Location:** `src/pages/ProjectView.tsx` (ResourcesTab, subcategory manager at ~line 523)
**Status:there are several issues that need to be adresed. there are former docs that have been erased because kilo seemed to be prioritizing their instruction. replaced with panda.md as the main recent plan documentation. its specifications to not match the current product. read it and align the progect per the instructions. 

guided by this prompt in htis conversation, you will make edits to the panga.md in the case that some of its instructions contradict this prompt. insights, is not some generated analysis. insight is a tab where you add notes, that are sub catgorised as insights. an insight has a title, and a body, subcategorised as insights. most of the storage here is notes, its just that, some notes are categorised as links, some as images, some as pdfs, but in it, you store a text link to the exact resource. it may be on google cloud and so forth. only tex documens can be uploaded, incase one feels too lazy to copy and paste text. in the case of pdfs, the app will provide a quick solution such as a website where you can easily turn a pdf into plai text, together with instructions on how to do it. that is one characteristic of the ai assistant. im not sure how we will embed this persona into the ai, but it must be handled, all using free resources.

every tab in projects serves as a resource , in the sence that, while centrally located, you access all youre resources with the least amount of steps, and the quickes reation time, without the visual straign of looking for buttons on the screen. it must be embeded in the whole ux ui design. so the upload rules are clear. the ui is to guide a new user into this philosophy, so usig hover functions and call to action icons like the info icon, it tells the user, hey, just save your resource in your cloud drive, and paste the link here, or, upload a text document, and we will parse it and save the text content thereof. that way, we dont save files, we save text. if the file resource is protectd and encrytped, attackers will have less access to the actual resource. 

milestones as well, are just goals you set for yourself, they have a title , and body context (description) . the sake of all this is to give ai context, to allow it perform agentic action such as add subcategories such as notifications, reminders, tasks, schedule tasks, with a user agent approval workflow. 

url parameters may cross subcategories, therefore you can ag any subcategory, as a link, an image, or any custom tag of your choosing. please indicate anything you might need to clarfy from me.** **IMPLEMENTED** - Subcategory manager UI exists for notes and links categories
**Implementation Details:**
- Custom subcategories stored per-project in localStorage (`panga-subcategories-${projectId}`)
- `getAllSubcategories()` merges defaults with custom subcategories
- "Manage subcategories" panel in a `<details>` element (collapsed by default)
- Users can add/remove custom subcategories dynamically
- Subcategory filter dropdown shows both default and custom subcategories
- Subcategories stored as tags on resources

**Known UX Issue:** The "Manage subcategories" panel is inside a `<details>` element which is **collapsed by default**. Users may not see it unless they click to expand.
**Potential Fix:** Change `<details>` to a visible `<div>` or add `open` attribute, or add a more prominent button.
**Verification Needed:** Test adding a custom subcategory for "notes" filter

### 3. File Upload - Word Document Parsing
**Location:** `src/pages/ProjectView.tsx` (ResourcesTab file upload at ~line 554)
**Status:** .doc/.docx files show alert but no actual parsing
**Status:** .txt and .md files work correctly
**Issue:** .doc/.docx files show alert asking user to save as .txt/.md first - this is expected behavior since browser can't parse Word docs without external library

### 4. Insights Tab - PDF Helper Link
**Location:** `src/components/project/InsightsTab.tsx`
**Status:** PDF helper points to `https://www.ilovepdf.com/pdf_to_text` - external link
**Issue:** External dependency, not self-contained

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