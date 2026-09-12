/** DOM integration checks. This is not browser or responsive visual verification. */
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { webcrypto } from "node:crypto";
const { JSDOM, VirtualConsole } = await import(
  process.env.WELLWAY_JSDOM_MODULE || "jsdom"
);
const html = await readFile(
  new URL("../dist/wellway-demo.html", import.meta.url),
  "utf8",
);
const errors = [];
const consoleBridge = new VirtualConsole();
consoleBridge.on("jsdomError", (e) => {
  if (!/CSS|navigation/.test(e.message)) errors.push(e.message);
});
function create(backup) {
  return new JSDOM(html, {
    url: "https://wellway-demo.test/",
    runScripts: "dangerously",
    pretendToBeVisual: true,
    virtualConsole: consoleBridge,
    beforeParse(w) {
      Object.defineProperty(w, "crypto", { value: webcrypto });
      w.scrollTo = () => {};
      w.HTMLElement.prototype.scrollIntoView = () => {};
      w.URL.createObjectURL = () => "blob:wellway-test";
      w.URL.revokeObjectURL = () => {};
      if (backup) w.localStorage.setItem("wellway.journey.v1", backup);
    },
  });
}
const dom = create();
const w = dom.window;
const d = w.document;
const tick = () => new Promise((r) => setTimeout(r, 30));
await tick();
function button(text) {
  const b = [
    ...(d.querySelector("[role=dialog]") || d).querySelectorAll("button"),
  ].find((b) => b.textContent.trim() === text);
  assert.ok(b, `Button exists: ${text}`);
  return b;
}
async function click(text) {
  button(text).click();
  await tick();
}
function value(el, v) {
  const proto =
    el.tagName === "TEXTAREA"
      ? w.HTMLTextAreaElement.prototype
      : w.HTMLInputElement.prototype;
  Object.getOwnPropertyDescriptor(proto, "value").set.call(el, String(v));
  el.dispatchEvent(new w.Event("input", { bubbles: true }));
  el.dispatchEvent(new w.Event("change", { bubbles: true }));
}
const state = () => JSON.parse(w.localStorage.getItem("wellway.journey.v1"));
function nav(page) {
  d.querySelectorAll(".nav-item").forEach((b) => {
    if (b.textContent.trim() === page) b.click();
  });
  return tick();
}
assert.match(d.querySelector("h1").textContent, /A little progress/);
assert.equal(d.querySelectorAll(".metric-card").length, 3);
await click("Start check-in");
assert.ok(d.querySelector("[role=dialog]"));
d.querySelector('[aria-label="Energy 4 out of 5"]').click();
d.querySelector('[aria-label="Stress 2 out of 5"]').click();
await tick();
await click("Continue");
[...d.querySelectorAll(".time-options button")]
  .find((b) => b.textContent.startsWith("5"))
  .click();
await tick();
await click("Continue");
value(d.querySelector("textarea"), "My fictional work shift changed.");
await tick();
await click("Save check-in");
assert.equal(state().checkins.at(-1).energy, 4);
assert.equal(state().checkins.at(-1).minutes, 5);
assert.match(d.body.textContent, /A plan that fits your day/);
await nav("My journey");
await click("Energy");
const dayButtons = [...d.querySelectorAll("svg [role=button]")];
dayButtons.at(-1).dispatchEvent(new w.MouseEvent("click", { bubbles: true }));
await tick();
assert.match(d.querySelector(".source-detail").textContent, /4 \/ 5/);
await click("View values");
assert.ok(d.querySelector("table"));
await nav("My plan");
button("Adjust").click();
await tick();
const fields = d.querySelectorAll(".modal input");
value(fields[1], 7);
value(fields[2], "After breakfast");
await tick();
d.querySelector(".modal form").dispatchEvent(
  new w.Event("submit", { bubbles: true, cancelable: true }),
);
await tick();
assert.equal(state().plan[0].minutes, 7);
assert.equal(state().plan[0].time, "After breakfast");
d.querySelector(".task-check").click();
await tick();
assert.equal(state().plan[0].doneDates.length, 1);
await nav("Advisor");
await click("Prepare a draft");
assert.equal(state().reviews[0].status, "draft");
value(d.querySelector("textarea"), "");
await tick();
assert.equal(button("Approve in demo").disabled, true);
value(
  d.querySelector("textarea"),
  "Try the existing walk for five minutes after breakfast.",
);
await tick();
await click("Approve in demo");
assert.equal(state().reviews[0].status, "approved");
assert.match(state().plan[0].detail, /after breakfast/);
await nav("Connections");
const ring = [...d.querySelectorAll(".connection-card")].find((c) =>
  c.textContent.includes("Sample sleep tracker"),
);
ring.querySelector("button").click();
await tick();
await click("Import sample records");
await new Promise((r) => setTimeout(r, 1100));
assert.equal(state().imports[0].accepted, 7);
assert.equal(state().imports[0].duplicates, 1);
assert.equal(state().imports[0].rejected, 1);
await click("Done");
let count = state().observations.length;
const ringNow = [...d.querySelectorAll(".connection-card")].find((c) =>
  c.textContent.includes("Sample sleep tracker"),
);
[...ringNow.querySelectorAll("button")]
  .find((b) => b.textContent.trim() === "Disconnect")
  .click();
await tick();
[...d.querySelectorAll(".modal button")]
  .find((b) => b.textContent.trim() === "Disconnect")
  .click();
await tick();
assert.equal(state().observations.length, count);
const csvInput = d.querySelector("input[type=file]");
const csvText =
  "id,date,metric,value,unit,sourceId\nexample-1,2026-09-12,sleep,7.2,h,csv-local\nexample-2,2026-09-12,sleep,999,h,csv-local\n";
Object.defineProperty(csvInput, "files", {
  configurable: true,
  value: [
    { name: "sample.csv", size: csvText.length, text: async () => csvText },
  ],
});
csvInput.dispatchEvent(new w.Event("change", { bubbles: true }));
await tick();
assert.match(
  d.querySelector("[role=dialog]").textContent,
  /Review before importing/,
);
await click("Cancel");
assert.equal(state().observations.length, count);
csvInput.dispatchEvent(new w.Event("change", { bubbles: true }));
await tick();
await click("Add 1 record");
assert.equal(state().observations.length, count + 1);
assert.equal(state().imports[0].rejected, 1);
d.querySelector('[aria-label="Close dialog"]').click();
await tick();
count = state().observations.length;
await nav("Help & guide");
assert.match(d.querySelector("h1").textContent, /Find your way/);
const importInput = d.querySelector("input[type=file]");
Object.defineProperty(importInput, "files", {
  configurable: true,
  value: [{ size: 2, text: async () => "{bad json" }],
});
importInput.dispatchEvent(new w.Event("change", { bubbles: true }));
await tick();
assert.ok(d.querySelector("[role=alert]"));
assert.equal(state().observations.length, count);
Object.defineProperty(importInput, "files", {
  configurable: true,
  value: [{ size: 2000, text: async () => JSON.stringify(state()) }],
});
importInput.dispatchEvent(new w.Event("change", { bubbles: true }));
await tick();
assert.ok(d.querySelector("[role=dialog]"));
await click("Restore backup");
assert.match(d.querySelector(".success-text").textContent, /Backup restored/);
await nav("Today");
await click("Ask about my week");
await click("What changed this week?");
assert.match(d.querySelector(".assistant-answer").textContent, /not its cause/);
assert.match(
  d.querySelector(".modal-subtitle").textContent,
  /without a live model/,
);
await click("What is in my history?");
assert.match(d.querySelector('.assistant-answer').textContent,/invented demonstration notes/);
assert.match(d.querySelector('.source-list').textContent,/history-2023-knee/);
d.querySelector('[aria-label="Close dialog"]').click();
await tick();
await click("Explore the demo");
assert.match(d.querySelector("[role=dialog]").textContent, /A quick tour/);
d.dispatchEvent(
  new w.KeyboardEvent("keydown", { key: "Escape", bubbles: true }),
);
await tick();
assert.equal(d.querySelector("[role=dialog]"), null);
// The visit is a scripted local workflow, and must never request devices/network.
d.querySelector('[aria-label="View Alex’s member profile"]').click();
await tick();
assert.match(d.querySelector("[role=dialog]").textContent, /Past knee strain/);
assert.match(d.querySelector("[role=dialog]").textContent, /Penicillin/);
d.querySelector('[aria-label="Close dialog"]').click();
await tick();
await click("Pause motion");
assert.ok(d.querySelector(".motion-paused"));
await click("Resume motion");
assert.equal(d.querySelector(".motion-paused"), null);
await click("Try a video visit");
assert.match(
  d.querySelector("[role=dialog]").textContent,
  /No camera, microphone/,
);
await click("Enter demo visit");
await click("My sleep");
assert.match(d.querySelector(".visit-caption").textContent, /of 7 nights/);
await click("Hide sample camera");
assert.ok(d.querySelector(".camera-off"));
await click("Unmute demo mic");
assert.match(d.querySelector(".member-pip").textContent, /Demo mic on/);
await click("Hide captions");
assert.equal(d.querySelector(".visit-caption"), null);
await click("Show captions");
await click("End demo visit");
const existingPlan = state().plan[0].detail;
value(
  d.querySelector(".modal textarea"),
  "Discuss the existing walk after breakfast at the next check-in.",
);
await tick();
await click("Save for advisor review");
assert.equal(state().reviews[0].status, "draft");
assert.equal(state().plan[0].detail, existingPlan);
assert.match(
  d.querySelector(".review-panel textarea").value,
  /Discuss the existing walk/,
);
await click("Approve in demo");
assert.match(state().plan[0].detail, /Discuss the existing walk/);
// Starting from Advisor must also load a newly saved visit draft, not stale text.
await click("Try a video visit");
d.querySelector(".modal input[type=checkbox]").click();
await tick();
await click("Enter demo visit");
assert.equal(d.querySelectorAll(".topic-buttons button").length, 1);
assert.match(
  d.querySelector(".visit-caption").textContent,
  /chose not to share/,
);
await click("End demo visit");
await click("Save for advisor review");
assert.deepEqual(state().reviews[0].sources, []);
assert.match(
  d.querySelector(".review-panel textarea").value,
  /Discuss the timing/,
);
const backup = w.localStorage.getItem("wellway.journey.v1");
const reloaded = create(backup);
await tick();
assert.equal(
  JSON.parse(reloaded.window.localStorage.getItem("wellway.journey.v1")).plan[0]
    .time,
  "After breakfast",
);
assert.deepEqual(errors, []);
console.log(
  "DOM integration passed: check-in → chart source → plan edit/completion → advisor review → sample import/disconnect → backup validation/restore → guided answer → tour → profiles → motion controls → simulated visit → editable follow-up → advisor approval → no-sharing visit → persisted reload.",
);
dom.window.close();
reloaded.window.close();
