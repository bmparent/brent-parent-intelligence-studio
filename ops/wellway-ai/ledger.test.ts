import test from "node:test";
import assert from "node:assert/strict";
import { DatabaseSync } from "node:sqlite";
import { mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join, dirname, resolve } from "node:path";
import { initialize, reserve, type Storage } from "./ledger";
function storage(file = ":memory:") {
  const db = new DatabaseSync(file);
  const s: Storage = {
    sql: {
      exec(query, ...params) {
        return db
          .prepare(query)
          .all(...(params as (string | number)[])) as never;
      },
    },
    transactionSync(fn) {
      db.exec("BEGIN IMMEDIATE");
      try {
        const result = fn();
        db.exec("COMMIT");
        return result;
      } catch (e) {
        db.exec("ROLLBACK");
        throw e;
      }
    },
  };
  initialize(s);
  return { s, db };
}
const request = (i: number) => ({
  requestId: `request-${i}`,
  visitor: `visitor-${i}`,
  microUsd: 100,
  totalCap: 500,
  dailyCap: 500,
  now: Date.parse("2026-09-12T18:00:00Z"),
});
test("independent visitors and concurrent admissions share one hard allowance", async () => {
  const { s, db } = storage();
  const results = await Promise.all(
    Array.from({ length: 20 }, (_, i) =>
      Promise.resolve().then(() => reserve(s, request(i))),
    ),
  );
  assert.equal(results.filter((r) => r.ok).length, 5);
  assert.equal(
    [...s.sql.exec<{ used: number }>("SELECT used FROM budget")][0].used,
    500,
  );
  db.close();
});
test("duplicate requests and new browser identities cannot bypass the global cap", () => {
  const { s, db } = storage();
  assert.equal(reserve(s, request(1)).ok, true);
  assert.equal(reserve(s, request(1)).reason, "duplicate");
  for (let i = 2; i <= 5; i++) assert.equal(reserve(s, request(i)).ok, true);
  assert.equal(reserve(s, request(6)).reason, "budget");
  db.close();
});
test("failed upstream calls retain reservations and caps survive restarts and daily rollover", () => {
  const dir = mkdtempSync(join(tmpdir(), "wellway-ledger-")),
    file = join(dir, "quota.sqlite");
  try {
    let { s, db } = storage(file);
    assert.equal(reserve(s, { ...request(1), totalCap: 100 }).ok, true);
    db.close();
    ({ s, db } = storage(file));
    assert.equal(
      reserve(s, {
        ...request(2),
        totalCap: 100,
        now: request(2).now + 86400000,
      }).reason,
      "budget",
    );
    db.close();
  } finally {
    assert.equal(dirname(resolve(dir)), resolve(tmpdir()));
    rmSync(dir, { recursive: true });
  }
});
test("per-visitor limits hold across sessions; missing budget fails closed", () => {
  const { s, db } = storage();
  for (let i = 0; i < 3; i++)
    assert.equal(
      reserve(s, { ...request(i), visitor: "same-network" }).ok,
      true,
    );
  assert.equal(
    reserve(s, { ...request(4), visitor: "same-network" }).reason,
    "visitor",
  );
  assert.equal(reserve(s, { ...request(5), totalCap: 0 }).reason, "disabled");
  db.close();
});
