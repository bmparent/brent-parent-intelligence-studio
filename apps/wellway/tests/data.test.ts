import test from "node:test";
import assert from "node:assert/strict";
import {
  seedState,
  series,
  summary,
  formatValue,
  ingest,
  parseCsv,
  reducer,
  validateBackup,
  validateRecord,
  day,
} from "../src/lib/data.ts";
test("sleep average excludes the missing night rather than counting zero", () => {
  const s = summary(seedState(), "sleep");
  assert.equal(s.coverage, 6);
  assert.equal(s.average, (6.4 + 6.9 + 7.2 + 5.8 + 6.8 + 6.7) / 6);
  assert.equal(s.rows[2].value, null);
  assert.equal(formatValue(6.7, "sleep"), "6h 42m");
});
test("overlapping device totals use one preferred record and preserve the alternative", () => {
  const s = seedState();
  s.observations.push({
    ...s.observations.find(
      (r) => r.date === s.demoDate && r.metric === "steps",
    )!,
    id: "other-total",
    sourceId: "another-watch",
    value: 10000,
  });
  const r = series(s, "steps").at(-1)!;
  assert.equal(r.value, 6240);
  assert.equal(r.alternatives, 1);
});
test("ingestion is idempotent, rejects invalid units and retains valid new records", () => {
  const s = seedState();
  const first = { ...s.observations[0], id: "incoming-1" };
  const invalid = { ...first, id: "invalid-1", unit: "minutes" };
  const a = ingest(s.observations, [first, first, invalid], "Sample");
  assert.equal(a.report.accepted, 1);
  assert.equal(a.report.duplicates, 1);
  assert.equal(a.report.rejected, 1);
  const b = ingest([...s.observations, ...a.records], [first], "Sample");
  assert.equal(b.report.accepted, 0);
  assert.equal(b.report.duplicates, 1);
});
test("CSV supports quoted context, rejects missing columns and malformed quotes", () => {
  const rows = parseCsv(
    'id,date,metric,value,unit,sourceId,note\na,2026-09-12,sleep,7.5,h,csv,"A note, with commas"',
  );
  assert.equal(
    (rows[0] as { note: string; value: number }).note,
    "A note, with commas",
  );
  assert.equal((rows[0] as { note: string; value: number }).value, 7.5);
  assert.throws(() => parseCsv("date,value\n2026-09-12,5"), /Missing column/);
  assert.throws(
    () =>
      parseCsv('id,date,metric,value,unit,sourceId\n"a,2026-09-12,sleep,5,h,x'),
    /not closed/,
  );
});
test("invalid calendar dates, non-finite values and blank CSV values are rejected", () => {
  const r = seedState().observations[0];
  assert.match(validateRecord({ ...r, date: "2026-02-31" })!, /real YYYY/);
  assert.match(validateRecord({ ...r, value: NaN })!, /finite/);
  assert.match(
    validateRecord({ ...r, metric: "energy", unit: "score", value: 7 })!,
    /range/,
  );
  const rows = parseCsv(
    "id,date,metric,value,unit,sourceId\na,2026-09-12,sleep,,h,csv",
  );
  assert.equal(ingest([], rows, "Sample").report.rejected, 1);
});
test("repeated same-day check-ins replace the daily energy observation", () => {
  let s = seedState();
  const c = {
    id: "x",
    date: s.demoDate,
    energy: 4,
    stress: 2,
    minutes: 10,
    note: "Fictional note.",
  };
  s = reducer(s, { type: "checkin", value: c });
  s = reducer(s, { type: "checkin", value: { ...c, energy: 2 } });
  assert.equal(s.checkins.filter((x) => x.date === s.demoDate).length, 1);
  assert.equal(
    s.observations.filter((x) => x.date === s.demoDate && x.metric === "energy")
      .length,
    1,
  );
  assert.equal(series(s, "energy").at(-1)?.value, 2);
});
test("next demo day retains history and does not invent wearable readings", () => {
  let s = seedState();
  s = reducer(s, { type: "toggle", id: "walk" });
  const before = s.observations.length;
  const oldDate = s.demoDate;
  s = reducer(s, { type: "advance" });
  assert.equal(s.demoDate, day(oldDate, 1));
  assert.equal(s.observations.length, before);
  assert.equal(series(s, "sleep").at(-1)?.value, null);
  assert.deepEqual(s.plan[0].doneDates, [oldDate]);
});
test("advisor approval updates the member plan and retains evidence identifiers", () => {
  let s = seedState();
  s = reducer(s, {
    type: "review",
    value: {
      id: "review-1",
      createdAt: new Date().toISOString(),
      context: "Sample",
      proposal: "Draft",
      sources: ["sample-sleep-2026-09-12"],
      status: "draft",
    },
  });
  s = reducer(s, {
    type: "approve",
    id: "review-1",
    proposal: "A reviewed adjustment.",
  });
  assert.equal(s.plan[0].detail, "A reviewed adjustment.");
  assert.equal(s.reviews[0].status, "approved");
  assert.deepEqual(s.reviews[0].sources, ["sample-sleep-2026-09-12"]);
});
test("disconnection preserves previously ingested history", () => {
  const initial = seedState();
  const s = reducer(initial, { type: "disconnect", id: "sample-watch" });
  assert.equal(s.connections[0].state, "disconnected");
  assert.deepEqual(s.observations, initial.observations);
});
test("backup validation accepts the complete seed and rejects malformed nested state", () => {
  const s = seedState();
  assert.equal(validateBackup(JSON.parse(JSON.stringify(s))), true);
  assert.equal(validateBackup({ ...s, schemaVersion: 2 }), false);
  assert.equal(validateBackup({ ...s, observations: [{ id: "bad" }] }), false);
  assert.equal(
    validateBackup({ ...s, plan: [{ ...s.plan[0], doneDates: null }] }),
    false,
  );
  assert.equal(validateBackup({ ...s, reviews: [{ id: "bad" }] }), false);
  assert.equal(
    validateBackup({ ...s, checkins: [{ ...s.checkins[0], energy: 19 }] }),
    false,
  );
});
