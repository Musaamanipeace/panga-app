import { chromium } from "playwright-core";
const URL = "http://127.0.0.1:5199/";
const browser = await chromium.launch({ executablePath: "/usr/bin/google-chrome", args: ["--no-sandbox"] });
const page = await browser.newPage({ viewport: { width: 1400, height: 900 } });
const errors = [];
page.on("console", (m) => { if (m.type() === "error") errors.push(m.text()); });
page.on("pageerror", (e) => errors.push(`[pageerror] ${e.message}\n${e.stack}`));

// Build a legacy Dexie v2 database (idb version 20) with pre-migration data.
await page.route("**/*", (r) => (r.request().resourceType() === "script" ? r.abort() : r.continue()));
await page.goto(URL, { waitUntil: "domcontentloaded" });
await page.waitForTimeout(500);
const seeded = await page.evaluate(async () => {
  await new Promise((res) => { const d = indexedDB.deleteDatabase("panga-db"); d.onsuccess = () => res("deleted"); d.onerror = () => res("err"); d.onblocked = () => res("blocked"); });
  const schemas = {
    projects: "id, status, updatedAt, syncStatus",
    tasks: "id, projectId, status, dueDate, updatedAt, syncStatus, *tags",
    resources: "id, projectId, category, updatedAt, syncStatus, *tags",
    docEntries: "id, projectId, type, order, updatedAt, syncStatus",
    goals: "id, projectId, status, targetDate, updatedAt, syncStatus",
    issues: "id, projectId, status, severity, updatedAt, syncStatus",
    contacts: "id, name, updatedAt, syncStatus, *linkedProjectIds",
    reminders: "id, projectId, triggerAt, status, updatedAt, syncStatus",
    settings: "key",
  };
  const db = await new Promise((res, rej) => {
    const r = indexedDB.open("panga-db", 20);
    r.onupgradeneeded = () => { for (const [n, s] of Object.entries(schemas)) { const st = r.result.createObjectStore(n, { keyPath: "id" }); for (const p of s.split(",").slice(1)) { const t = p.trim(); const multi = t.startsWith("*"); const name = multi ? t.slice(1) : t; st.createIndex(name, name, multi ? { multiEntry: true } : undefined); } } };
    r.onsuccess = () => res(r.result); r.onerror = () => rej(r.error);
  });
  const put = (store, rec) => new Promise((res, rej) => { const t = db.transaction(store, "readwrite"); t.objectStore(store).put(rec); t.oncomplete = res; t.onerror = () => rej(t.error); });
  await put("projects", { id: "p1", name: "Legacy Project", description: "from v2", status: "active", createdAt: 1, updatedAt: 2, syncStatus: "synced" });
  await put("projects", { id: "p2", name: "Second Legacy", description: "", status: "active", createdAt: 1, updatedAt: 3, syncStatus: "synced" });
  await put("goals", { id: "g1", projectId: "p1", title: "Ship v1", targetDate: 100, status: "achieved", createdAt: 1, updatedAt: 2, syncStatus: "synced" });
  await put("resources", { id: "r1", projectId: "p1", category: "link", title: "Old link", tags: [], value: "https://example.com", textBody: null, images: [], createdAt: 1, updatedAt: 2, syncStatus: "synced" });
  await put("resources", { id: "r2", projectId: "p1", category: "prompt", title: "Old prompt", tags: [], textBody: "hello", images: [], createdAt: 1, updatedAt: 2, syncStatus: "synced" });
  await put("contacts", { id: "c1", name: "Ada", tags: [], linkedProjectIds: ["p1"], email: "ada@example.com", createdAt: 1, updatedAt: 2, syncStatus: "synced" });
  await put("settings", { id: "appInitialized", key: "appInitialized", value: true });
  db.close();
  return "ok";
});
console.log("seeded:", seeded);
await page.unroute("**/*");

await page.goto(URL, { waitUntil: "networkidle" });
await page.fill("#email-input", "t@e.com");
await page.click("button[type=submit]");
const dev = await page.textContent(".otp-dev-hint strong");
await page.fill("#otp-input", dev);
await page.click("button[type=submit]");
await page.waitForTimeout(3000);

const state = await page.evaluate(() => new Promise((res) => {
  const r = indexedDB.open("panga-db");
  r.onsuccess = () => {
    const d = r.result; const out = { idbVersion: d.version, stores: [...d.objectStoreNames] };
    const tx = d.transaction(["projects","milestones","resources","contacts","resourceSubcategories"], "readonly");
    for (const s of ["projects","milestones","resources","contacts","resourceSubcategories"]) { const q = tx.objectStore(s).getAll(); q.onsuccess = () => { out[s] = q.result; }; }
    tx.oncomplete = () => { d.close(); res(out); };
  };
  r.onerror = () => res({ error: String(r.error) });
}));
console.log("idbVersion:", state.idbVersion, "stores:", JSON.stringify(state.stores));
console.log("projects:", JSON.stringify(state.projects));
console.log("milestones:", JSON.stringify(state.milestones));
console.log("resources:", JSON.stringify(state.resources));
console.log("contacts:", JSON.stringify(state.contacts));
console.log("resourceSubcategories:", JSON.stringify(state.resourceSubcategories));
console.log("body:", (await page.textContent("body")).replace(/\s+/g, " ").slice(0, 400));
console.log("ERRORS:", errors.join("\n") || "(none)");
await page.screenshot({ path: "/tmp/kilo/migrate.png", fullPage: true });
await browser.close();