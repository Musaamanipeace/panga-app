You are an expert React developer. Your task is to refactor our application from a traditional server/PostgreSQL architecture to a Local-First architecture using IndexedDB, offline JSON state snapshot downloads/uploads, and automatic background sync via Google Drive (AppData folder).

Follow this implementation spec strictly:

---

### ENVIRONMENT & CREDENTIAL SPECIFICATION
The app is strictly local-first and requires **NO environment variables** to run.
All keys, OAuth Client IDs, and cloud sync credentials are configured client-side directly by the user in the Settings interface (stored securely in browser IndexedDB):
- **Google Client ID**: Entered directly in Settings &rarr; Cloud Backup &amp; Sync &rarr; Google Drive.
- **Gemini API Key**: Entered directly in Settings &rarr; Gemini API Key.
- **GitHub Gist Token**: Entered directly in Settings &rarr; Cloud Backup &amp; Sync &rarr; GitHub Gist.

The exported user snapshot files strictly contain application state and version metadata ONLY—never include app credentials, client IDs, or session tokens in user backup files.

---

### PHASE 1: Quick Upload Landing & Local-First Core

1. **Zero-Authentication Quick Upload:**
   - On initial app load (or when no local IndexedDB state exists), present a prominent "Quick Upload / Restore Snapshot" dropzone alongside the main workspace option.
   - Dropping or selecting a `.json` snapshot file must validate its schema, write it directly into IndexedDB, and hydrate the application state immediately without requiring Google sign-in or account setup.

2. **IndexedDB Core & Export Utilities:**
   - Configure IndexedDB (using Dexie.js or native IndexedDB wrapper) as the single primary source of truth for all runtime reads and writes.
   - Implement an "Export Backup" feature that packages the full local database state into a structured, downloadable JSON file with versioning metadata:
     `{ metadata: { version: "1.0", exportedAt: "ISO_DATE" }, data: { ... } }`

---

### PHASE 2: Google Drive AppData Sync & Settings Interface

1. **Settings Control Panel:**
   - Build a clear Settings interface featuring:
     - **Sync Status Badge:** Displays real-time status ("Offline Only", "Connected to Google Drive", "Syncing...", or "Last synced at [Timestamp]").
     - **Google Authentication:** "Connect Google Drive" button initiating Google Identity Services (GIS) OAuth flow using the `https://www.googleapis.com/auth/drive.appdata` scope.
     - **Manual Backup Actions:** Explicit "Download Backup (.json)" and "Upload Snapshot (.json)" file input controls.

2. **Automated Background Syncing:**
   - Implement debounced listeners on IndexedDB mutations that automatically upload the serialized snapshot (`app-state-snapshot.json`) to the user's hidden Google Drive `appDataFolder`.
   - Upon explicit Google sign-in on a new device, check `appDataFolder` for an existing snapshot and offer to restore it into IndexedDB.

---

### PHASE 3: Legacy Backend Removal (Execute ONLY after Phases 1 & 2 verification)

1. Remove all legacy PostgreSQL connection utilities, server ORM instances (e.g., Prisma, Drizzle), REST API fetch modules, and server-side authentication routing.
2. Update state management hooks and UI feedback components to reflect local storage and Google Drive sync status exclusively.