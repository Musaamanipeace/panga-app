import { chromium } from "playwright-core";
const URL = "http://127.0.0.1:5199/";
const browser = await chromium.launch({ executablePath: "/usr/bin/google-chrome", args: ["--no-sandbox"] });
const page = await browser.newPage({ viewport: { width: 1400, height: 900 } });
const errors = [];
page.on("console", (m) => { if (m.type() === "error") errors.push(m.text()); });
page.on("pageerror", (e) => errors.push(`[pageerror] ${e.message}\n${e.stack}`));
page.on("response", (resp) => {
  if (resp.status() >= 400) console.log(`RESOURCE ${resp.status()}: ${resp.url()}`);
});

await page.goto(URL, { waitUntil: "networkidle" });
await page.waitForTimeout(5000);
console.log("body:", (await page.textContent("body")).replace(/\s+/g," ").slice(0,500));
console.log("errors:", errors.join("\n") || "(none)");
await browser.close();