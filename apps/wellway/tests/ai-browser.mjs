import assert from "node:assert/strict";
import { createRequire } from "node:module";
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
const require = createRequire(import.meta.url);
const { chromium } = require(
  process.env.WELLWAY_PLAYWRIGHT_MODULE || "playwright",
);
const output = path.resolve(
  process.env.WELLWAY_BROWSER_ARTIFACTS || "artifacts/wellway-browser",
);
await mkdir(output, { recursive: true });
const browser = await chromium.launch({ headless: true });
const page = await browser.newPage({ viewport: { width: 390, height: 844 } });
const errors = [],
  requests = [];
page.on("pageerror", (error) => errors.push(error.message));
let behavior = "error";
await page.route("**/api/wellway/status", (route) =>
  route.fulfill({ json: { aiConfigured: true } }),
);
await page.route("**/api/wellway/ask", async (route) => {
  const input = route.request().postDataJSON();
  requests.push(input);
  if (behavior === "error")
    return route.fulfill({
      status: 502,
      json: { error: "Test interruption. Please retry." },
    });
  if (behavior === "delay")
    await new Promise((resolve) => setTimeout(resolve, 800));
  const ref =
    input.mode === "member" ? "missing:sleep:2026-09-08" : "visit:agenda";
  await route
    .fulfill({
      json: {
        mode: "live",
        segments: [
          {
            kind: input.mode === "followup" ? "draft" : "explanation",
            text:
              input.mode === "member"
                ? "No sleep observation was supplied on September 8."
                : "Bring this written sleep question to the next advisor review.",
            sourceIds: [ref],
          },
        ],
      },
    })
    .catch(() => {});
});
try {
  await page.goto(process.env.WELLWAY_TEST_URL || "http://127.0.0.1:4319/");
  await page.locator(".wellway-app h1").waitFor();
  await page
    .getByRole("button", { name: "Ask about my week", exact: true })
    .click();
  await page.getByRole("checkbox", { name: /Use live AI/ }).check();
  await page
    .getByLabel("Your question", { exact: true })
    .fill("September 8 sleep?");
  await page.getByRole("button", { name: "Ask", exact: true }).click();
  await page
    .getByRole("alert")
    .filter({ hasText: "Test interruption" })
    .waitFor();
  assert.equal(await page.locator(".conversation-turn").count(), 0);
  behavior = "success";
  await page.getByRole("button", { name: "Retry", exact: true }).click();
  await page.locator(".conversation-turn").waitFor();
  assert.match(
    await page.locator(".conversation").innerText(),
    /Live AI response/,
  );
  await page
    .getByLabel("Your question", { exact: true })
    .fill("What about that day?");
  await page.getByRole("button", { name: "Ask", exact: true }).click();
  await page.locator(".conversation-turn").nth(1).waitFor();
  assert.equal(requests.at(-1).history.length, 2);
  assert.equal(requests.at(-1).history[0].content, "September 8 sleep?");
  behavior = "delay";
  await page.getByRole("button", { name: "Ask", exact: true }).click();
  await page
    .getByRole("button", { name: "Cancel request", exact: true })
    .click();
  await page
    .getByText("Request cancelled. No answer was added.", { exact: true })
    .waitFor();
  await page.waitForTimeout(900);
  assert.equal(await page.locator(".conversation-turn").count(), 2);
  await page.getByRole("button", { name: "Ask", exact: true }).click();
  await page
    .getByRole("button", { name: "Cancel request", exact: true })
    .waitFor();
  await page.keyboard.press("Escape");
  await page
    .getByRole("button", { name: "Ask about my week", exact: true })
    .click();
  await page.waitForTimeout(900);
  assert.equal(await page.locator(".conversation-turn").count(), 0);
  await page.keyboard.press("Escape");
  behavior = "success";
  await page.getByRole("button", { name: "Join visit", exact: true }).click();
  await page
    .getByLabel("What would you like to talk about?")
    .fill("Sleep question without other personal context.");
  for (const name of ["Health history", "Check-ins", "Current plan and focus"])
    await page.getByRole("checkbox", { name, exact: true }).uncheck();
  await page
    .getByRole("button", { name: "Prepare summary with live AI", exact: true })
    .click();
  await page.getByText("Live AI preparation", { exact: true }).waitFor();
  assert.deepEqual(requests.at(-1).evidence.scope, {
    charts: true,
    history: false,
    checkin: false,
    plan: false,
  });
  assert.doesNotMatch(
    JSON.stringify(requests.at(-1).evidence.records),
    /history-|plan:|checkin:|knee|penicillin/i,
  );
  await page.getByRole("button", { name: "Join visit", exact: true }).click();
  await page.getByRole("button", { name: "End visit", exact: true }).click();
  await page
    .getByRole("button", {
      name: "Prepare follow-up with live AI",
      exact: true,
    })
    .click();
  await page.getByText("Live AI draft · Editable", { exact: true }).waitFor();
  await page
    .getByRole("button", { name: "Save for advisor review", exact: true })
    .click();
  const state = await page.evaluate(() =>
    JSON.parse(localStorage.getItem("wellway.journey.v1")),
  );
  assert.equal(state.reviews[0].origin, "live");
  assert.equal(state.reviews[0].status, "draft");
  assert.doesNotMatch(
    JSON.stringify(state.reviews[0].sourceRecords),
    /history-|plan:|checkin:|knee|penicillin/i,
  );
  assert.deepEqual(errors, []);
  const result = {
    status: "passed",
    provider: "mocked; no paid calls",
    requests: requests.map((r) => ({
      mode: r.mode,
      scope: r.evidence.scope,
      historyTurns: r.history.length,
    })),
    checks: [
      "retry",
      "continuity",
      "cancel",
      "stale result after close",
      "scoped preparation",
      "scoped draft",
      "separate approval",
    ],
    errors,
  };
  await writeFile(
    path.join(output, "ai-browser-results.json"),
    JSON.stringify(result, null, 2),
  );
  console.log(JSON.stringify(result));
} catch (error) {
  await page.screenshot({
    path: path.join(output, "ai-browser-failure.png"),
    animations: "disabled",
  });
  throw error;
} finally {
  await browser.close();
}
