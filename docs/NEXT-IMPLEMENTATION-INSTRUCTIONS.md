# Panga — Next Implementation Instructions

**Read this whole file before writing any code.** These are concrete, decided instructions — do not re-research alternatives, do not ask the user which library to use, the decisions are already made below. Follow the stages in order. **After every stage, commit and push to `main`** using the exact commands given at the end of each stage.

Current state: Stage 1 (scaffold) and Stage 2 (local data layer + full UX/UI shell) are complete. All six project tabs (Documentation, Tasks, Resources, Goals, Issues, Reminders), global search (`Ctrl/Cmd+K`), and an AI assistant panel (UI only, placeholder reply) are working against local IndexedDB via Dexie. Nothing is connected to Firebase yet.

---

## Stage 3: Voice-to-text input

**Library: none needed.** Use the browser's built-in **Web Speech API** (`SpeechRecognition` / `webkitSpeechRecognition`). It is free, requires no API key, no signup, and no network call to any paid service — it runs through the browser's own speech engine (Chrome, Edge, and Chrome-based mobile browsers support it natively; Firefox and Safari have partial/no support, so this feature must degrade gracefully, not break the app, on unsupported browsers).

### 3.1 Create the hook
Create `src/components/useVoiceInput.ts`:
```ts
import { useRef, useState, useCallback } from "react";

export function isVoiceInputSupported(): boolean {
  return typeof window !== "undefined" &&
    ("SpeechRecognition" in window || "webkitSpeechRecognition" in window);
}

export function useVoiceInput(onResult: (text: string) => void) {
  const [listening, setListening] = useState(false);
  const recognitionRef = useRef<any>(null);

  const start = useCallback(() => {
    if (!isVoiceInputSupported()) return;
    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    const recognition = new SpeechRecognition();
    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.lang = "en-US";

    recognition.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript;
      onResult(transcript);
    };
    recognition.onend = () => setListening(false);
    recognition.onerror = () => setListening(false);

    recognitionRef.current = recognition;
    recognition.start();
    setListening(true);
  }, [onResult]);

  const stop = useCallback(() => {
    recognitionRef.current?.stop();
    setListening(false);
  }, []);

  return { listening, start, stop, supported: isVoiceInputSupported() };
}
```

### 3.2 Create a reusable mic button component
Create `src/components/MicButton.tsx`:
```tsx
import { useVoiceInput } from "./useVoiceInput";

interface Props {
  onResult: (text: string) => void;
}

export default function MicButton({ onResult }: Props) {
  const { listening, start, stop, supported } = useVoiceInput(onResult);
  if (!supported) return null; // hide entirely on unsupported browsers, don't show a broken button

  return (
    <button
      type="button"
      className={`mic-btn ${listening ? "mic-btn-active" : ""}`}
      onClick={listening ? stop : start}
      aria-label={listening ? "Stop recording" : "Start voice input"}
      title={listening ? "Listening... click to stop" : "Click to speak"}
    >
      {listening ? "🔴" : "🎤"}
    </button>
  );
}
```

### 3.3 Add this CSS to `src/index.css`
```css
.mic-btn {
  border: 1px solid var(--color-border);
  border-radius: var(--radius);
  background: var(--color-bg);
  cursor: pointer;
  font-size: 14px;
  padding: 8px 10px;
}
.mic-btn-active {
  background: var(--color-accent-issue);
  color: white;
  animation: pulse 1.2s infinite;
}
@keyframes pulse {
  0% { opacity: 1; }
  50% { opacity: 0.6; }
  100% { opacity: 1; }
}
```

### 3.4 Wire `<MicButton>` into every free-text input the user types into
Do this in **every** form below — the pattern is identical each time: add `<MicButton onResult={(text) => setX(text)} />` next to the `<input>`, inside the same flex container so it sits directly beside the text field.

- `src/pages/Dashboard.tsx` — the "New project name..." input
- `src/pages/ProjectView.tsx`:
  - `DocumentationTab` — the "New doc section title..." input, AND add a second mic button next to each `<textarea>` that appends the transcribed text to the existing content (`onResult={(text) => onContentChange(entry.id, entry.content + " " + text)}`)
  - `TasksTab` — the "New task..." input
  - `ResourcesTab` — both the "Title" and the value input
  - `GoalsTab` — the "New goal..." input
  - `IssuesTab` — the "New issue / setback..." input
  - `RemindersTab` — the "Reminder message..." input
- `src/components/AIAssistant.tsx` — the chat input box

Do not skip any of these. The point of this feature is that **every place the user can type, they can also speak** — that consistency is a UX requirement, not an optional nice-to-have.

### 3.5 Commit and push
```bash
git add -A
git commit -m "Stage 3: add free browser-native voice-to-text input (Web Speech API) to every text field"
git push origin main
```

---

## Stage 4: Firebase Auth + Firestore sync engine

This is the biggest stage. Do it in this exact order, and do not skip the auth gate step — without it, anyone with the URL could read/write the Firestore data.

### 4.1 Prerequisite (user action, not yours)
The user must have already completed the "Firebase project setup" steps in `README.md` and filled in `.env.local`. If `.env.local` doesn't exist or is empty, stop and tell the user to do that first — do not fabricate placeholder Firebase keys.

### 4.2 Add Firestore security rules
In the Firebase console (Firestore Database → Rules), the user needs to paste:
```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /users/{userId}/{document=**} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
  }
}
```
This scopes every document under `/users/{their-own-uid}/...` — no other authenticated user can read or write it. Tell the user to click "Publish" after pasting this.

### 4.3 Auth gate
Create `src/sync/auth.ts`:
```ts
import { signInWithPopup, GoogleAuthProvider, onAuthStateChanged, signOut, type User } from "firebase/auth";
import { auth } from "./firebase";

const provider = new GoogleAuthProvider();

export function signIn() {
  return signInWithPopup(auth, provider);
}

export function logOut() {
  return signOut(auth);
}

export function watchAuthState(callback: (user: User | null) => void) {
  return onAuthStateChanged(auth, callback);
}
```

Wrap the app: in `src/App.tsx`, before rendering `<AppShell>`, check auth state. If no user, render a simple "Sign in with Google" button (reuse the Landing page — add a sign-in button there) instead of the dashboard routes. Store the signed-in `uid` in a small React context (`src/sync/AuthContext.tsx`) so every sync function below can read `auth.currentUser.uid` without prop-drilling it through every component.

### 4.4 Firestore collection paths
Every entity is stored at:
```
/users/{uid}/projects/{projectId}
/users/{uid}/tasks/{taskId}
/users/{uid}/resources/{resourceId}
/users/{uid}/docEntries/{docId}
/users/{uid}/goals/{goalId}
/users/{uid}/issues/{issueId}
/users/{uid}/reminders/{reminderId}
```
Flat collections per type (not nested under each project) so Firestore queries stay simple — filter by `projectId` field, exactly like the Dexie queries already do.

### 4.5 The sync engine
Create `src/sync/syncEngine.ts`. Its job, in plain terms:
1. On sign-in, do one full pull: for each collection above, fetch all docs for this uid, upsert them into the matching Dexie table (skip if local `updatedAt` is newer — last-write-wins per the plan doc).
2. Set up a Firestore `onSnapshot` listener per collection, so remote changes stream into Dexie automatically while the app is open.
3. Hook into every existing `data/*.ts` CRUD function (`createTask`, `updateTask`, `createResource`, etc.) so that after the local Dexie write succeeds, the same change is pushed to Firestore — but only if `navigator.onLine` is true and the user's sync setting (see 4.6) is `"auto"`. If offline or in manual mode, mark the record's `syncStatus` as `"pending"` (the field already exists on every entity in `db.ts`) and leave it queued.
4. A `flushPendingChanges()` function that pushes every locally-`"pending"` record to Firestore — call this (a) automatically whenever the browser fires an `online` event, and (b) whenever the user clicks a manual "Sync now" button.

Do not rewrite the `data/*.ts` files' function signatures. Import the sync engine's `queueForSync(collectionName, record)` function and call it as the last line of every create/update function in `data/projects.ts`, `data/tasks.ts`, `data/resources.ts`, `data/docs.ts`, `data/goals.ts`, `data/issues.ts`, `data/reminders.ts`.

### 4.6 Sync mode setting
Create a `settings` table in Dexie (`src/data/db.ts`, add `settings: "key"` to the schema, storing `{ key: "syncMode", value: "auto" | "manual" }`). Add a Settings page (`src/pages/Settings.tsx`, route `/settings`, link it from the header) with a toggle between the two modes, defaulting to `"auto"`. Add the one-time tooltip described in the plan doc (§5): track a `firstAutoSyncDate` in the same settings table, and if 7 days have passed since it was first set and a `syncTipShown` flag is not yet true, show one dismissible tooltip near the sync status indicator, then set the flag permanently.

### 4.7 Sync status indicator
Add a small dot in `AppShell.tsx`'s header: grey when there are pending (unsynced) records in Dexie, green when everything is synced, spinning/pulsing while a sync is actively in flight. Query pending count with `db.tasks.where("syncStatus").equals("pending").count()` (and the same for every other table, summed).

### 4.8 Commit and push
```bash
git add -A
git commit -m "Stage 4: Firebase Auth (Google sign-in) + Firestore sync engine with auto/manual mode and offline queueing"
git push origin main
```

---

## Stage 5: Contacts module

Not yet built. Add:
- `src/data/contacts.ts` — CRUD following the exact same pattern as `src/data/goals.ts` (same shape: `listX`, `createX`, `updateX`, `deleteX`), using the `Contact` type already defined in `db.ts`.
- A global (not per-project) `src/pages/Contacts.tsx` page, route `/contacts`, linked from the header next to the search bar.
- On each Contact, a "linked projects" multi-select (populate options from `listProjects()`).
- On the Resources tab of a project, add an option to create a resource with `category: "contact"` whose `value` is the linked contact's `id` — so a contact can be attached as a project resource for quick sharing, matching the original spec ("share a project resource" via contact).

Commit:
```bash
git add -A
git commit -m "Stage 5: global Contacts module, linkable to projects and resources"
git push origin main
```

---

## Stage 6: AI Planner (Gemini)

1. Create a Vercel account (free) if the user hasn't, and run `vercel link` in the project root to connect it (ask the user to do the interactive login step themselves — do not attempt to automate OAuth).
2. Get a free Gemini API key from https://aistudio.google.com/apikey — tell the user to generate one and give it to you, then set it as a Vercel environment variable: `vercel env add GEMINI_API_KEY`.
3. Create `api/plan.js` (Vercel serverless function, plain JS is fine):
```js
export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).end();
  const { tasks, hours } = req.body;

  const prompt = `Given these tasks (with estimated minutes and due dates): ${JSON.stringify(tasks)}
and these available time blocks today: ${JSON.stringify(hours)},
produce a JSON array of {taskId, startTime, endTime} ordered to prioritize near-due tasks
and fit within the given blocks. Respond with ONLY the JSON array, no other text.`;

  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${process.env.GEMINI_API_KEY}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] }),
    }
  );
  const data = await response.json();
  const text = data.candidates?.[0]?.content?.parts?.[0]?.text ?? "[]";
  const clean = text.replace(/```json|```/g, "").trim();
  res.status(200).json(JSON.parse(clean));
}
```
4. Create `src/ai/planner.ts` — a `requestSchedule(tasks, hours)` function that `fetch()`s `/api/plan` (same-origin when deployed on Vercel) with the above payload and returns the parsed schedule.
5. Add a "Plan my day" page or panel (`src/pages/Planner.tsx`, route `/planner`, linked from the header) — a form for entering time blocks (start/end pairs), a button that calls `listAllActiveTasks()` from `data/tasks.ts` plus the entered hours, sends them to `requestSchedule`, and renders the returned schedule as an ordered list.
6. Re-check Gemini's current free-tier rate limits before shipping this (they change) — search "Gemini API free tier rate limits" and confirm `gemini-1.5-flash` (or whatever the current free-tier default model is named at build time) is still free before hardcoding the model name above.

Commit:
```bash
git add -A
git commit -m "Stage 6: AI planner via Gemini API through a Vercel serverless function"
git push origin main
```

---

## Non-negotiable rules for whoever implements this

1. **Never add Cloud Functions.** They require the Blaze plan (card on file). Any server-side logic goes through the Vercel `api/` folder instead.
2. **Never introduce a paid service without asking the user first**, even a generous free tier — confirm no credit card is required.
3. **Every new CRUD file follows the existing pattern** in `src/data/*.ts` exactly (same function naming: `listX`, `createX`, `updateX`, `deleteX`; same `syncStatus`/`createdAt`/`updatedAt` fields). Do not introduce a different pattern.
4. **Commit and push to `main` after every stage**, using the exact commit message given at the end of that stage's section above. Do not batch multiple stages into one commit.
5. **Run `npx tsc --noEmit` and `npm run build` before every commit.** If either fails, fix it before committing — never commit broken code.
6. **Do not remove the placeholder AI assistant reply logic** in `AIAssistant.tsx` until Stage 6's planner is working AND a follow-up stage (not yet written — ask the user before starting it) explicitly wires the assistant's chat input to a real model with app context. Right now the chat UI shell exists on purpose, but must keep its honest placeholder text until told otherwise.
