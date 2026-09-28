# Panga — Build Phases & Setup

This document tracks what's done, what's next, and the exact steps to get running locally.

## Phase status

| Phase | Description | Status |
|-------|-------------|--------|
| 0 | Vite + React + TypeScript + PWA scaffold | ✅ Done |
| 1 | Dexie schema + CRUD for all entities | ✅ Done |
| 2 | Landing + OTP auth (dev mode) | ✅ Done |
| 3 | Home screen (alerts, summary, project grid, cross-project tabs) | ✅ Done |
| 4 | Project workspace (7 tabs) | ✅ Done |
| 5 | Settings (Gemini, Google, Vault, Assistant, Sync, Danger) | ✅ Done |
| 6 | Global search (Ctrl+K palette) | ✅ Done |
| 7 | Assistant panel (chat, clarification, approval) | ✅ Done |
| 8 | Secrets vault (PBKDF2 + AES-GCM) | ✅ Done |
| 9 | Google Calendar sync + Drive picker | ✅ Done |
| 10 | Design system (sliding, no emoji, responsive, hints) | ✅ Done |
| 11 | Bug fixes (migration, DB open errors, hover hints) | ✅ Done |
| 12 | Docs rewrite | ✅ Done |

## Local setup

```bash
git clone <repo>
cd panga-app
npm install
npm run dev
```

Open `http://localhost:5173` (or the port Vite prints).

### Login

1. Click **Login** on the landing page
2. Enter any email (e.g. `me@example.com`)
3. **Dev mode**: the 6-digit code appears on screen — no email service needed
4. Enter the code → **Verify and enter** → you're on `/home`

### First project

1. Click **+ Add project**
2. Name it, optional description
3. Click **Create project** → opens the project workspace

## Required external keys (self-service)

### 1. Gemini API Key (for Assistant & AI Plan)
1. Go to https://aistudio.google.com/apikey
2. Create an API key (free tier includes Flash models)
3. In Panga: **Settings → Gemini API** → paste key → **Save**

### 2. Google OAuth Client ID (for Calendar sync)
1. Go to https://console.cloud.google.com/apis/credentials
2. Create/select a project
3. **APIs & Services → Library** → enable **Google Calendar API** and **Google Drive API**
4. **Credentials → Create Credentials → OAuth Client ID**
   - Application type: **Web application**
   - Authorized JavaScript origins: add your dev origin (e.g. `http://localhost:5173`) and production origin
5. Copy the **Client ID**
6. In Panga: **Settings → Google Calendar** → paste Client ID → **Connect**
7. Sign in with Google, grant Calendar + Drive scopes

### 3. Google Picker API Key (for Drive folder selection)
1. In the same Google Cloud project: **APIs & Services → Credentials**
2. **Create Credentials → API Key**
3. **API restrictions** → restrict to **Google Picker API**
4. **Application restrictions** → HTTP referrers: add your origins
5. Copy the **API Key**
6. In Panga: **Settings → Google Drive** → paste Picker key
7. When uploading an Image/PDF, the Picker opens to choose the destination folder (once per project)

## Optional: Real OTP emails (EmailJS)

1. Free account at https://www.emailjs.com (200 emails/month)
2. Add email service, create template with `to_email` and `passcode` variables
3. Copy **Service ID**, **Template ID**, **Public Key**
4. Create `.env.local`:
   ```bash
   VITE_EMAILJS_SERVICE_ID=your_service_id
   VITE_EMAILJS_TEMPLATE_ID=your_template_id
   VITE_EMAILJS_PUBLIC_KEY=your_public_key
   ```
Without these, dev mode shows the code on screen — login still works.

## Optional: Supabase sync

1. New project at https://supabase.com
2. **Project Settings → API** → copy **Project URL** and **anon public key**
3. Create `.env.local`:
   ```bash
   VITE_SUPABASE_URL=https://your-project.supabase.co
   VITE_SUPABASE_ANON_KEY=your_anon_key
   ```
4. In Supabase SQL editor, create tables matching the Dexie schema (see `docs/database.md`) and enable RLS with policies for the anon role
5. In Panga: **Settings → Supabase Sync** → **Sync now** (placeholder for now)

## Build commands

```bash
npm run dev      # Dev server with HMR
npm run build    # Type-check + production build
npm run lint     # oxlint (fast, no config needed)
npm run preview  # Preview production build
```

## Project structure

```
src/
├── auth/           # OTP + session
├── components/     # Shared UI primitives + feature components
│   ├── home/       # Home screen tabs
│   ├── project/    # Project workspace tabs
│   └── ui.tsx      # Slide, Drawer, Editable, Disclosure, useAsync, etc.
├── data/           # Dexie + all CRUD modules (ONLY db.ts touches IndexedDB)
├── pages/          # Landing, Home, ProjectView, Settings
├── search/         # globalSearch() only
├── sync/           # Google (Calendar+Drive) + Supabase client
├── App.tsx         # Routes, dbReady gate, route sliding
├── main.tsx        # Entry
└── index.css       # Design system (all styling here)
docs/               # ui.md, database.md, backend-features.md, build-phases.md
public/             # PWA icons, favicon
```

## Troubleshooting

### "Database could not be opened"
- A failed migration used to leave the UI stuck on "Loading..."
- Now `dbReady` surfaces the error with a **Retry** button that reloads the page
- If it persists: open DevTools → Application → IndexedDB → delete `panga-db` → reload

### "No Gemini API key"
- Add it in Settings → Gemini API
- The assistant and AI Plan mode will not work without it

### "Google Calendar not connected"
- Add OAuth Client ID in Settings → Google Calendar → Connect
- Ensure Calendar API is enabled in Google Cloud Console

### "Drive upload failed"
- Add Picker API Key in Settings → Google Drive
- Ensure Drive API is enabled and Picker API is enabled/restricted to the key

### Build fails with "Cannot find module"
- Run `npm install`
- Check `tsconfig.json` paths — all imports use relative or `/src/` aliases

---

## Quick test checklist (manual)

| Feature | Test |
|---------|------|
| Login | Dev mode OTP works, lands on `/home` |
| Add project | Drawer slides from right, project appears in grid |
| Project view | 7 tabs navigate, sliding animation |
| Home tabs | Tasks/Contacts/Schedule/Reminders filter & link |
| Settings | Each section loads, Gemini/Google/Vault save |
| Search | Ctrl+K opens palette, results navigate |
| Assistant | FAB opens panel, chat works (needs Gemini key) |
| Vault | Create passphrase, add secret, reveal/hide |
| Responsive | Resize window — no horizontal scroll, chips wrap, grid stacks |
| Hover hints | Every button/icon shows tooltip |

---

_Update this doc when setup steps change._