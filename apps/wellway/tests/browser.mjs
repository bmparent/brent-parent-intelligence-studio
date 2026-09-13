/** Real browser acceptance. Supply Playwright through WELLWAY_PLAYWRIGHT_MODULE if not installed locally. */
import assert from "node:assert/strict";
import { createRequire } from "node:module";
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
const require = createRequire(import.meta.url);
const { chromium, firefox, webkit } = require(
  process.env.WELLWAY_PLAYWRIGHT_MODULE || "playwright",
);
const url = process.env.WELLWAY_TEST_URL || "http://127.0.0.1:4319/";
const output = path.resolve(
  process.env.WELLWAY_BROWSER_ARTIFACTS || "artifacts/wellway-browser",
);
await mkdir(output, { recursive: true });
const results = [];
async function ready(page) {
  await page.locator(".wellway-app h1").waitFor({ timeout: 90000 });
  await page.evaluate(() => document.fonts.ready);
}
async function overflow(page) {
  const size = await page.evaluate(() => ({
    width: innerWidth,
    scroll: document.documentElement.scrollWidth,
  }));
  assert.ok(size.scroll <= size.width + 1, JSON.stringify(size));
}
async function shot(page, name) {
  await page.screenshot({
    path: path.join(output, `${name}.png`),
    animations: "disabled",
  });
}
const cases = [
  ["chromium", 1440],
  ["chromium", 768],
  ["chromium", 390],
  ["chromium", 360],
  ["webkit", 390],
  ["firefox", 1440],
].filter(
  ([engine, width]) =>
    !process.env.WELLWAY_BROWSER_CASE ||
    process.env.WELLWAY_BROWSER_CASE === `${engine}-${width}`,
);
for (const [engine, width] of cases) {
  const browser = await { chromium, firefox, webkit }[engine].launch({
    headless: true,
  });
  const context = await browser.newContext({
    viewport: { width, height: width === 1440 ? 1100 : 844 },
    hasTouch: engine !== "firefox" && width < 800,
  });
  const page = await context.newPage();
  const errors = [];
  page.on("pageerror", (e) => errors.push(e.message));
  page.on("console", (msg) => {
    if (msg.type() === "error") errors.push(msg.text());
  });
  await page.route("**/api/wellway/status", (r) =>
    r.fulfill({ json: { aiConfigured: false } }),
  );
  try {
    await page.goto(url, { waitUntil: "domcontentloaded" });
    await ready(page);
    await overflow(page);
    assert.equal(await page.locator(".metric-card").count(), 3);
    assert.ok((await page.locator(".portrait").count()) > 0);
    await shot(page, `${engine}-${width}-today`);
    // Touch chart inspection exposes the actual missing day.
    await page.locator(".nav-item").filter({ hasText: "My journey" }).click();
    const gap = page.locator('svg [role=button][aria-label^="Sep 8,"]');
    if (engine !== "firefox" && width < 800) await gap.tap();
    else await gap.click();
    await page.locator(".source-detail").waitFor();
    assert.match(
      await page.locator(".source-detail").innerText(),
      /No observation/,
    );
    await overflow(page);
    await shot(page, `${engine}-${width}-journey`);
    await page.locator(".nav-item").filter({ hasText: "Today" }).click();
    const trigger = page.getByRole("button", {
      name: "Ask about my week",
      exact: true,
    });
    await trigger.click();
    await page
      .getByRole("button", {
        name: "What happened on September 8?",
        exact: true,
      })
      .click();
    assert.match(
      await page.locator(".conversation").innerText(),
      /No sleep observation/i,
    );
    await page.locator(".supporting-records summary").first().click();
    assert.match(
      await page.locator(".supporting-records").first().innerText(),
      /2026-09-08/,
    );
    for (let i = 0; i < 18; i++) {
      await page.keyboard.press("Tab");
      assert.ok(
        await page.evaluate(
          () => !!document.activeElement.closest("[role=dialog]"),
        ),
      );
    }
    await shot(page, `${engine}-${width}-assistant`);
    await page.keyboard.press("Escape");
    assert.equal(await page.locator("[role=dialog]").count(), 0);
    assert.ok(await trigger.evaluate((el) => el === document.activeElement));
    // Check-in edits require an explicit discard; visit drafts instead autosave.
    await page
      .getByRole("button", { name: "Start check-in", exact: true })
      .click();
    await page
      .getByRole("button", { name: "Energy 4 out of 5", exact: true })
      .click();
    await page.keyboard.press("Escape");
    await page
      .getByRole("button", { name: "Keep editing", exact: true })
      .waitFor();
    await page
      .getByRole("button", { name: "Keep editing", exact: true })
      .click();
    await page.keyboard.press("Escape");
    await page
      .getByRole("button", { name: "Discard changes", exact: true })
      .click();
    await page.getByRole("button", { name: "Join visit", exact: true }).click();
    await page
      .getByLabel("What would you like to talk about?")
      .fill("Review the missing sleep day.");
    for (const name of [
      "Health history",
      "Check-ins",
      "Current plan and focus",
    ])
      await page.getByRole("checkbox", { name, exact: true }).uncheck();
    await page.keyboard.press("Escape");
    await page
      .getByRole("button", { name: "Resume visit", exact: true })
      .click();
    assert.equal(
      await page.getByLabel("What would you like to talk about?").inputValue(),
      "Review the missing sleep day.",
    );
    await page.getByRole("button", { name: "Join visit", exact: true }).click();
    assert.match(
      await page.locator("[role=dialog]").innerText(),
      /Simulated visit/,
    );
    await page.locator(".modal").evaluate((el) => (el.scrollTop = 0));
    await shot(page, `${engine}-${width}-visit`);
    const nameBox = await page.locator(".visit-name").boundingBox();
    const pipBox = await page.locator(".member-pip").boundingBox();
    assert.ok(nameBox && pipBox);
    await page
      .getByRole("button", { name: "Hide camera", exact: true })
      .click();
    assert.equal(await page.locator(".camera-off").count(), 1);
    await page.getByRole("button", { name: "Unmute", exact: true }).click();
    await page.getByRole("button", { name: "End visit", exact: true }).click();
    const note = page.locator(".modal textarea");
    assert.doesNotMatch(await note.inputValue(), /walk|shift|knee|penicillin/i);
    await note.fill("Keep this sleep question for the advisor.");
    await page.keyboard.press("Escape");
    await page
      .getByRole("button", { name: "Resume visit", exact: true })
      .click();
    assert.equal(
      await note.inputValue(),
      "Keep this sleep question for the advisor.",
    );
    // A resized visual viewport exercises the same constrained dialog layout used by a keyboard.
    if (width < 800) {
      await page.setViewportSize({ width, height: 420 });
      await note.focus();
      await page
        .getByRole("button", { name: "Save for advisor review", exact: true })
        .scrollIntoViewIfNeeded();
      await overflow(page);
      await shot(page, `${engine}-${width}-keyboard-layout`);
      await page.setViewportSize({ width, height: 844 });
    }
    await page
      .getByRole("button", { name: "Save for advisor review", exact: true })
      .click();
    await page
      .locator(".review-panel textarea")
      .fill("Preserve this advisor edit.");
    await page.locator(".nav-item").filter({ hasText: "My plan" }).click();
    await page.locator(".nav-item").filter({ hasText: "Advisor" }).click();
    assert.equal(
      await page.locator(".review-panel textarea").inputValue(),
      "Preserve this advisor edit.",
    );
    const stored = await page.evaluate(() =>
      JSON.parse(localStorage.getItem("wellway.journey.v1")),
    );
    assert.equal(stored.reviews[0].status, "draft");
    assert.doesNotMatch(
      JSON.stringify(stored.reviews[0].sourceRecords),
      /history-|checkin:|plan:/,
    );
    const before = stored.plan;
    await page
      .getByRole("button", { name: "Approve plan", exact: true })
      .click();
    assert.deepEqual(
      await page.evaluate(
        () => JSON.parse(localStorage.getItem("wellway.journey.v1")).plan,
      ),
      before,
    );
    await page.locator(".nav-item").filter({ hasText: "Today" }).click();
    await page
      .getByRole("button", { name: "Pause motion", exact: true })
      .click();
    assert.equal(await page.locator(".motion-paused").count(), 1);
    await page.emulateMedia({ reducedMotion: "reduce" });
    assert.equal(await page.locator(".motion-paused").count(), 1);
    await page.evaluate(() =>
      sessionStorage.setItem("wellway.glassFallback", "true"),
    );
    await page.reload();
    await ready(page);
    await overflow(page);
    await shot(page, `${engine}-${width}-fallback`);
    if (width === 1440 && engine === "chromium") {
      await page.evaluate(() => (document.documentElement.style.zoom = "2"));
      await overflow(page);
      await page
        .getByRole("button", { name: "Ask about my week", exact: true })
        .click();
      await page
        .getByLabel("Your question", { exact: true })
        .fill("September 8 sleep?");
      await page.getByRole("button", { name: "Ask", exact: true }).click();
      await overflow(page);
      await shot(page, "chromium-200-percent-zoom");
    }
    assert.deepEqual(errors, []);
    results.push({ engine, width, status: "passed", errors });
  } catch (error) {
    await shot(page, `${engine}-${width}-failure`).catch(() => {});
    results.push({
      engine,
      width,
      status: "failed",
      error: error.stack,
      errors,
    });
  } finally {
    await browser.close();
  }
  console.log(JSON.stringify(results.at(-1)));
}
await writeFile(
  path.join(output, "browser-results.json"),
  JSON.stringify(results, null, 2),
);
assert.ok(
  results.every((r) => r.status === "passed"),
  "Browser acceptance failures; inspect browser-results.json",
);
