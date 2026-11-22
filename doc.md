You are an expert React developer. Your task is to keep this application local-first: IndexedDB is the source of truth, JSON snapshots are the portable backup, and cloud sync uses the user's own Supabase project.

Follow this implementation spec strictly:

---

### ENVIRONMENT & CREDENTIAL SPECIFICATION
The app is strictly local-first and requires **NO environment variables** to run.
All keys and credentials are configured client-side directly by the user in the Settings interface:
- **Supabase URL + anon key**: Entered in Settings → Supabase. Required for creating an account and for cloud sync.
- **Gemini API Key**: Entered in Settings → AI assistant.
- **Other AI provider keys**: Entered in Settings → AI assistant.

---

### PHASE 1: Quick Upload Landing & Local-First Core

1. **Zero-Authentication Quick Upload:**
   - On initial app load (or when no local IndexedDB state exists), present a prominent "Quick Upload / Restore Snapshot" dropzone alongside the main workspace option.
   - Dropping or selecting a `.json` snapshot file must validate its schema, write it directly into IndexedDB, and hydrate the application state immediately without requiring an account setup.

2. **IndexedDB Core & Export Utilities:**
   - Configure IndexedDB (using Dexie.js or native IndexedDB wrapper) as the single primary source of truth for all runtime reads and writes.
   - Implement an "Export Backup" feature that packages the full local database state into a structured, downloadable JSON file with versioning metadata:
     `{ metadata: { version: "1.0", exportedAt: "ISO_DATE" }, data: { ... } }`

---

### PHASE 2: Settings Interface & Bring-Your-Own Supabase

1. **Settings Control Panel:**
   - Build a clear Settings interface featuring:
     - **Storage status badge:** Shows "Local only" or "Supabase sync". Detailed sync progress stays in the Account & sync section.
     - **Supabase configuration:** URL + anon key fields, stored on this device. Required before creating an account.
     - **Manual Backup Actions:** Explicit "Download Backup (.json)" and "Upload Snapshot (.json)" file input controls.

2. **Cloud Sync:**
   - Each signed-in user gets an isolated IndexedDB database; Supabase mirrors records through `panga_records` with row-level security.
   - Sync starts when the user signs in and continues in the background; no other cloud provider is used.

---

### PHASE 3: Legacy Backend Removal (Execute ONLY after Phases 1 & 2 verification)

1. Remove all legacy PostgreSQL connection utilities, server ORM instances (e.g., Prisma, Drizzle), REST API fetch modules, and server-side authentication routing.
2. Update state management hooks and UI feedback components to reflect local storage and Supabase sync status exclusively.
