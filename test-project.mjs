import { chromium } from "playwright-core";
const URL = "http://127.0.0.1:5199/";
const browser = await chromium.launch({ executablePath: "/usr/bin/google-chrome", args: ["--no-sandbox"] });
const page = await browser.newPage({ viewport: { width: 1400, height: 900 } });
const errors = [];
page.on("console", (m) => { if (m.type() === "error") errors.push(m.text()); });
page.on("pageerror", (e) => errors.push(`[pageerror] ${e.message}\n${e.stack}`));

await page.goto(URL, { waitUntil: "networkidle" });
await page.waitForSelector("#email-input", { timeout: 30000 });
await page.fill("#email-input", "test@example.com");
await page.click("button[type=submit]");
const dev = await page.textContent(".otp-dev-hint strong");
await page.fill("#otp-input", dev);
await page.click("button[type=submit]");
await page.waitForSelector(".page.home", { timeout: 15000 });
await page.waitForTimeout(1000);

// Create a project
await page.click("text=+ Add project");
await page.waitForTimeout(500);
await page.fill("#new-project-name", "Test Project");
await page.fill("#new-project-description", "A test project");
await page.click("button[type=submit]");
await page.waitForTimeout(2000);

// Check project appears
const body = await page.textContent("body");
console.log("After create:", body.replace(/\s+/g," ").slice(0,400));

// Click the project to open it
await page.click(".project-card");
await page.waitForTimeout(2000);
console.log("Project view URL:", page.url());

const projectBody = await page.textContent("body");
console.log("Project view:", projectBody.replace(/\s+/g," ").slice(0,600));

console.log("ERRORS:", errors.join("\n") || "(none)");
await page.screenshot({ path: "/tmp/kilo/project-test.png", fullPage: true });
await browser.close();