# Panga — setup after this package

## 1. Install & run

```bash
cp .env.example .env   # fill values below
npm install
npm run dev
```

## 2. Environment variables (only what you need)

| Variable | Required? | Purpose |
|----------|-----------|---------|
| `VITE_GOOGLE_CLIENT_ID` | For Drive sync | Google Cloud OAuth Web client ID (`drive.appdata` scope) |
| `VITE_SUPABASE_URL` | Optional | Supabase project URL |
| `VITE_SUPABASE_ANON_KEY` | Optional | Supabase anon key |
| `GEMINI_API_KEY` | Optional | Server proxy only; prefer keys in **Settings → AI** |

You can also enter Google Client ID, Supabase URL/key, and **all AI keys** in the app Settings UI (stored in IndexedDB).

## 3. Supabase (optional)

1. Create a project at https://supabase.com  
2. SQL Editor → paste and run `supabase/schema.sql`  
3. Project Settings → API → copy URL + anon key into `.env` or Settings  

Local Dexie remains primary; Supabase is ready for multi-device Postgres sync.

## 4. AI (recommended)

1. Open **Settings → AI assistant**  
2. Prefer **OpenRouter** (one key, free + paid models, live list)  
3. Paste key → models load from the provider (no hard-coded free model names)  
4. Optional: Gemini, OpenAI, Claude, Grok, Groq  

## 5. Google Drive

1. Google Cloud Console → OAuth client (Web)  
2. Authorized JS origins: your app origin  
3. Put Client ID in `.env` or Settings  
4. Connect → Export once (enables auto-sync)

## Removed in this package

- Puter (SDK, auth, sync, UI)
- Email backup (Resend/SendGrid)

## Kept

- Offline-first Dexie
- Google Drive AppData sync
- Local JSON snapshot download/upload
