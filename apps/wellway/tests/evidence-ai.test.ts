import test from "node:test";
import assert from "node:assert/strict";
import { evidence, seedState, summary, reducer, validateBackup } from "../src/lib/data";
import { newVisit, guidedFollowup } from "../src/lib/visit";
import {
  validateEvidence,
  validateAIRequest,
  validateAIResult,
  providerPayload,
  reservation,
  MODEL,
} from "../src/lib/ai-contract";

test("malformed persisted visit drafts and unrenderable references are rejected", () => {
  const valid = { ...seedState(), visitDraft: newVisit() };
  assert.equal(validateBackup(valid), true);
  for (const visitDraft of [null, 0, {}, { ...newVisit(), stage: "unknown" }, { ...newVisit(), scope: {} }, { ...newVisit(), sourceRecords: [{ id: "x", kind: "agenda", text: "Question", sourceId: "visit", date: {} }] }]) {
    assert.equal(validateBackup({ ...valid, visitDraft }), false);
  }
  assert.equal(validateBackup({ ...valid, plan: [] }), false);
});

test("dated evidence matches all displayed chart periods and comparisons, preserving gaps and units", () => {
  const state = seedState();
  for (const days of [7, 14, 28]) {
    const p = validateEvidence(evidence(state, { days }));
    for (const metric of ["sleep", "steps", "energy"] as const) {
      assert.equal(
        p.records.filter(
          (r) =>
            r.metric === metric && ["observation", "missing"].includes(r.kind),
        ).length,
        days * 2,
      );
      assert.equal(
        p.records.find((r) => r.id === `summary:${metric}:displayed`)!.value,
        summary(state, metric, days).average,
      );
    }
    const gap = p.records.find((r) => r.id === "missing:sleep:2026-09-08")!;
    assert.equal(gap.value, null);
    assert.equal(gap.unit, "h");
    const steps = p.records.find(
      (r) =>
        r.date === "2026-09-08" &&
        r.metric === "steps" &&
        r.kind === "observation",
    )!;
    assert.equal(steps.value, 4900);
    assert.equal(steps.sourceId, "sample-watch");
    assert.ok(steps.recordedAt && steps.importedAt);
  }
});
test("server recomputes aggregates and rejects invalid dates, duplicate rows, units and excluded records", () => {
  const packet = evidence(seedState());
  const wrong = structuredClone(packet);
  wrong.records.find((r) => r.kind === "summary")!.value = 9999;
  assert.notEqual(
    validateEvidence(wrong).records.find((r) => r.kind === "summary")!.value,
    9999,
  );
  for (const mutate of [
    (p: typeof packet) => p.records.push(p.records[0]),
    (p: typeof packet) => (p.records[0].unit = "seconds"),
    (p: typeof packet) => (p.scope.charts = false),
    (p: typeof packet) => (p.window.end = "2026-02-30"),
  ]) {
    const p = structuredClone(packet);
    mutate(p);
    assert.throws(() => validateEvidence(p));
  }
});
test("visit privacy removes excluded context from prompts, follow-up and saved references", () => {
  const state = seedState();
  state.checkins[0].note = "PRIVATE_CHECKIN_SENTINEL";
  state.plan[0].detail = "PRIVATE_PLAN_SENTINEL";
  state.observations.find((r) => r.metric === "energy")!.note =
    "PRIVATE_CHECKIN_SENTINEL";
  const v = {
    ...newVisit(),
    agenda: "Why is there a sleep gap?",
    visited: ["sleep"],
    scope: { charts: true, history: false, checkin: false, plan: false },
  };
  const draft = guidedFollowup(state, v);
  const text = JSON.stringify(draft);
  assert.doesNotMatch(
    text,
    /PRIVATE_|knee|penicillin|shift|work schedule|history-2026/,
  );
  assert.match(draft.text, /sleep/);
  assert.ok(draft.sources.includes("summary:sleep:displayed"));
  validateEvidence(draft.evidence);
  const none = guidedFollowup(state, {
    ...v,
    scope: { charts: false, history: false, checkin: false, plan: false },
  });
  assert.deepEqual(none.sources, ["visit:agenda"]);
  assert.equal(none.evidence.records.length, 1);
});
test("follow-up follows the discussed topic instead of imposing a schedule change", () => {
  const state = seedState();
  const sleep = guidedFollowup(state, {
    ...newVisit(),
    agenda: "Sleep question",
    visited: ["sleep"],
  });
  const history = guidedFollowup(state, {
    ...newVisit(),
    agenda: "Review my intake",
    visited: ["history"],
  });
  assert.match(sleep.text, /sleep record/);
  assert.doesNotMatch(sleep.text, /walk|work schedule/);
  assert.match(history.text, /intake notes/);
  assert.doesNotMatch(history.text, /sleep record|work schedule/);
});
test("citations must be present in the authorized packet and belong to each response segment", () => {
  const p = evidence(seedState());
  const valid = {
    segments: [
      {
        kind: "explanation",
        text: "No sleep record was supplied on September 8.",
        sourceIds: ["missing:sleep:2026-09-08"],
      },
    ],
  };
  assert.deepEqual(validateAIResult(valid, p).sources, [
    "missing:sleep:2026-09-08",
  ]);
  assert.throws(() =>
    validateAIResult(
      { segments: [{ ...valid.segments[0], sourceIds: ["invented"] }] },
      p,
    ),
  );
  assert.throws(() =>
    validateAIResult(
      { segments: [{ ...valid.segments[0], sourceIds: [] }] },
      p,
    ),
  );
});
test("provider request keeps bounded continuity, uses the pinned model and has no tools or approval action", () => {
  const input = validateAIRequest({
    requestId: crypto.randomUUID(),
    mode: "member",
    question: "What about that day?",
    history: [
      { role: "user", content: "September 8 sleep?" },
      { role: "assistant", content: "No supplied sleep reading." },
    ],
    evidence: evidence(seedState()),
  });
  const payload = providerPayload(input);
  assert.equal(payload.model, MODEL);
  assert.equal(payload.store, false);
  assert.equal(payload.max_output_tokens, 1200);
  assert.equal(payload.input.length, 4);
  assert.ok(!("tools" in payload));
  assert.ok(reservation(payload).inputTokens >= JSON.stringify(payload).length);
  assert.throws(() =>
    validateAIRequest({ ...input, question: "x".repeat(1001) }),
  );
  assert.throws(() =>
    validateAIRequest({ ...input, history: Array(7).fill(input.history[0]) }),
  );
});
test("visit and advisor drafts survive serialization and follow-up approval cannot rewrite an activity", () => {
  let state = seedState();
  const v = { ...newVisit(), agenda: "Keep this agenda" };
  state = reducer(state, { type: "visit-draft", value: v });
  assert.equal(JSON.parse(JSON.stringify(state)).visitDraft.agenda, v.agenda);
  state = reducer(state, {
    type: "review",
    value: {
      id: "followup",
      createdAt: new Date().toISOString(),
      proposal: "Original",
      context: "Only agenda shared",
      status: "draft",
      sources: ["visit:agenda"],
      targetPlanId: "followup",
    },
  });
  state = reducer(state, {
    type: "review-edit",
    id: "followup",
    proposal: "Saved edit",
  });
  const before = structuredClone(state.plan);
  state = reducer(state, {
    type: "approve",
    id: "followup",
    proposal: state.reviews[0].proposal,
  });
  assert.deepEqual(state.plan, before);
  assert.equal(state.reviews[0].proposal, "Saved edit");
  assert.equal(state.reviews[0].status, "approved");
});
