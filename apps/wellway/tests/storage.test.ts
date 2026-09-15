import test from "node:test";
import assert from "node:assert/strict";
import { loadWorkspace, RECOVERY_KEY } from "../src/lib/storage";
import { seedState, STORAGE_KEY, reducer } from "../src/lib/data";

test("valid edits survive; malformed and future-version saves retain exact recovery bytes", () => {
  for (const raw of ["{broken", JSON.stringify({ schemaVersion: 99 }), JSON.stringify(seedState())]) {
    const values = new Map([[STORAGE_KEY, raw]]);
    const storage = { getItem: (k: string) => values.get(k) ?? null, setItem: (k: string, v: string) => { values.set(k, v); } };
    const result = loadWorkspace(storage);
    assert.equal(values.get(STORAGE_KEY), raw);
    if (result.warning) assert.equal(values.get(RECOVERY_KEY), raw);
    else assert.deepEqual(result.state, JSON.parse(raw));
    assert.equal(result.writable, true);
  }
});
test("unavailable storage and conflicting recovery copies never allow overwriting", () => {
  assert.equal(loadWorkspace({ getItem() { throw Error("denied"); }, setItem() { throw Error("denied"); } }).writable, false);
  const result = loadWorkspace({ getItem: (k) => k === STORAGE_KEY ? "broken-new" : "broken-old", setItem() { assert.fail("must preserve both copies"); } });
  assert.equal(result.writable, false);
});
test("dismissal cannot mutate an approved review", () => {
  let state = seedState();
  state = reducer(state, { type: "review", value: { id: "review", createdAt: new Date().toISOString(), context: "Fictional", proposal: "Discuss schedule", status: "draft", sources: [], targetPlanId: "followup" } });
  state = reducer(state, { type: "review-edit", id: "review", proposal: "Edited schedule" });
  assert.ok(state.reviews[0].editedAt);
  state = reducer(state, { type: "approve", id: "review", proposal: "Edited schedule" });
  assert.equal(reducer(state, { type: "dismiss", id: "review" }).reviews[0].status, "approved");
});
