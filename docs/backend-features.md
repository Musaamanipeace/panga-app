# Panga — Backend Features & Implementation Notes

This document describes the non-UI modules: authentication, data access, sync, search, encryption, and AI.

## Authentication (`src/auth/`)

### OTP flow (`otp.ts`)
- EmailJS free tier (200 emails/month) when configured via `.env.local`
- Dev mode fallback: OTP returned in response, shown inline — no email service required for development
- 6-digit code, 10 min TTL, stored in `sessionStorage`
- `sendOtp(email)` → `{ devCode? }`
- `verifyOtp(email, code)` → boolean, consumes the code on success

### Session (`session.ts`)
- Email stored in `localStorage` under `panga_session_email`
- `isLoggedIn()` checks for presence
- `setSession(email)` / `clearSession()` dispatch custom `panga:session-change` event so route guards react immediately
- No JWT, no server — purely client-side gate

## Data layer (`src/data/`)

### Design
- **Single source of truth**: `db.ts` defines the Dexie schema and is the only file importing Dexie
- **Re-export pattern**: Every feature module (`tasks.ts`, `resources.ts`, etc.) imports types from `db.ts` and exports CRUD functions
- **No direct IndexedDB access** anywhere else — not even in sync modules

### Core modules

| Module | Responsibility |
|--------|----------------|
| `db.ts` | Dexie schema, migrations, `dbReady` promise |
| `utils.ts` | `newId()` (crypto.randomUUID), `now()` (Date.now) |
| `projects.ts` | Project CRUD, cascade delete, stats |
| `tasks.ts` | Task CRUD, status cycling, executor, scheduling, overdue/due helpers |
| `subcategories.ts` | Editable subcategory lists per resource category; default rename/restore |
| `resources.ts` | Unified resource CRUD, link validation, meta normalisation |
| `contacts.ts` | Contact CRUD, project linking, `mailto:`/`https:` href helpers |
| `docs.ts` | DocEntry CRUD, file attachment (dataURL, ≤2 MB) |
| `milestones.ts` | Milestone CRUD, blocker toggling, auto-reconcile |
| `issues.ts` | Issue CRUD, labels, comments, severity, milestone link |
| `reminders.ts` | Reminder CRUD, bucketing (overdue/due/upcoming), dismissal |
| `calendar.ts` | Local events + Google import, meetLink, pruning |
| `insights.ts` | Per-project metrics: completion rate, weekly bars, issue counts, activity feed |
| `dashboard.ts` | Home aggregates: alerts, summary cards, project grid stats |
| `settings.ts` | Key/value get/set, Gemini/Google/Drive/Vault/Assistant configs |
| `secrets.ts` | **PBKDF2 → AES-GCM** (WebCrypto only), passphrase never stored |
| `conversations.ts` | Assistant history with TTL (default 7 days), pruning |

### Secrets encryption (`secrets.ts`)

```
Passphrase → PBKDF2 (210k iterations, SHA-256, 16-byte salt)
        → 256-bit AES-GCM key (WebCrypto)
        → Encrypt: random 12-byte IV + ciphertext
        → Store: { iv: base64, data: base64 }
        → Verifier: encrypt known plaintext with same key, store { salt, iv, digest }
```

- Passphrase never persisted
- `unlockVault(passphrase)` → derives key, verifies digest, caches `sessionKey` in memory
- `lockVault()` / `isVaultUnlocked()` for session management
- All encryption/decryption happens client-side

## Sync

### Google (`src/sync/google.ts`)
- **One Google Cloud project**, client-side only (Google Identity Services + Picker)
- OAuth scopes: `calendar.readonly` + `drive.file`
- Token stored in `settings.googleAccessToken` (access_token + expires_at + scope)
- **Calendar**: `syncGoogleCalendar(days)` → fetches rolling window from primary calendar, imports events with `hangoutLink` for Meet, prunes missing
- **Drive**: `uploadToDrive(projectId, dataUrl, name, mimeType)` → multipart upload to Drive, stores only reference (`driveFileId`, `driveFolderId`, `webViewLink`); folder chosen once per project via Picker, remembered in `settings.googleDriveFolderByProject`
- Picker API key required for Drive folder selection

### Supabase (`src/sync/supabase.ts`)
- Client initialised once from `VITE_SUPABASE_URL` / `VITE_SUPABASE_ANON_KEY`
- `syncSupabase()` placeholder — full bidirectional sync with RLS is a future build phase
- Tables map 1:1; `syncStatus` field tracks pending/synced

## Global search (`src/search/search.ts`)

- **Single entry point**: `globalSearch(query)` returns typed `SearchResult[]`
- Covers: projects, tasks, resources, contacts, milestones, issues, docEntries, reminders, saved files (by filename), settings panels
- Each result has `hint` for tooltip, `target` for deep-linking
- Current implementation: in-memory substring match on all tables (fast enough for personal scale)
- Swappable for FlexSearch (already in deps) with zero UI changes

## AI Assistant (`src/components/AssistantPanel.tsx`)

### Provider
- **Google Gemini API** (free tier, Flash models)
- Key stored in `settings.geminiApiKey`, sent only to `generativelanguage.googleapis.com`

### Assistant (chat)
- Conversations stored locally, expire after N days (default 7)
- System prompt restricts scope: planning, scheduling, editing, research within Panga
- Model: `gemini-2.0-flash`
- Streaming not implemented — single request/response

### Agent (planned/partial)
- Tools: read/write tasks, resources, milestones, issues, docs
- **Always asks for approval** before writing (approval box slides up)
- Scheduling by prompt: natural language → clarifying questions (interactive box) → confirmed writes with animated shift
- Web research limited by Gemini free-tier quotas

### Clarification flow
When model response starts with `CLARIFY:`, the text is parsed into question + options, shown in a sliding box above the composer. User selects an option → appended to prompt → re-sent.

## Voice input (`src/components/useVoiceInput.ts`)

- Web Speech API (`SpeechRecognition` / `webkitSpeechRecognition`)
- `MicButton` component on every text field
- Appends transcript to field value
- "MIC" / "MIC+" / "STOP" labels

## Build & dev

```bash
npm run dev      # Vite dev server
npm run build    # tsc -b && vite build
npm run lint     # oxlint
npm run preview  # vite preview
```

### Environment (`.env.local`)

```bash
# Optional — Supabase
VITE_SUPABASE_URL=
VITE_SUPABASE_ANON_KEY=

# Optional — EmailJS (for real OTP emails)
VITE_EMAILJS_SERVICE_ID=
VITE_EMAILJS_TEMPLATE_ID=
VITE_EMAILJS_PUBLIC_KEY=

# Required at runtime (entered in Settings UI)
# - Gemini API Key
# - Google OAuth Client ID
# - Google Picker API Key
```

---

_Update when backend features change._