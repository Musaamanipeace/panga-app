import { chromium } from "playwright-core";
const URL = "http://127.0.0.1:5199/";
const browser = await chromium.launch({ executablePath: "/usr/bin/google-chrome", args: ["--no-sandbox"] });
const page = await browser.newPage({ viewport: { width: 1400, height: 900 } });
const errors = [];
page.on("console", (m) => { if (m.type() === "error") errors.push(m.text()); });
page.on("pageerror", (e) => errors.push(`[pageerror] ${e.message}\n${e.stack}`));

await page.goto(URL, { waitUntil: "networkidle" });
await page.waitForSelector("#email-input", { timeout: 30000 });

// Try signup
await page.fill("#email-input", "test@example.com");
await page.fill("#password-input", "password123");
// Switch to signup mode
await page.click("text=Sign Up");
await page.click("button[type=submit]");
await page.waitForTimeout(2000);

console.log("URL:", page.url());
console.log("body:", (await page.textContent("body")).replace(/\s+/g," ").slice(0,500));
console.log("errors:", errors.join("\n") || "(none)");
await page.screenshot({ path: "/tmp/kilo/fresh.png", fullPage: true });
await browser.close();
