/** Durable budget coordination only. No questions, evidence, responses or patient records are stored. */
export interface Sql {
  exec<T = Record<string, unknown>>(
    query: string,
    ...params: unknown[]
  ): Iterable<T>;
}
export interface Storage {
  sql: Sql;
  transactionSync<T>(fn: () => T): T;
}
export type Reservation = {
  requestId: string;
  visitor: string;
  microUsd: number;
  totalCap: number;
  dailyCap: number;
  now: number;
};
export function initialize(storage: Storage) {
  storage.sql.exec(
    "CREATE TABLE IF NOT EXISTS budget (id INTEGER PRIMARY KEY, used INTEGER NOT NULL)",
  );
  storage.sql.exec("INSERT OR IGNORE INTO budget VALUES (1, 0)");
  storage.sql.exec(
    "CREATE TABLE IF NOT EXISTS daily (day TEXT PRIMARY KEY, used INTEGER NOT NULL, calls INTEGER NOT NULL)",
  );
  storage.sql.exec(
    "CREATE TABLE IF NOT EXISTS requests (id TEXT PRIMARY KEY, visitor TEXT NOT NULL, day TEXT NOT NULL, at INTEGER NOT NULL)",
  );
}
export function reserve(storage: Storage, r: Reservation) {
  return storage.transactionSync(() => {
    const sql = storage.sql;
    if (
      !Number.isSafeInteger(r.microUsd) ||
      r.microUsd <= 0 ||
      !Number.isSafeInteger(r.totalCap) ||
      !Number.isSafeInteger(r.dailyCap) ||
      r.totalCap <= 0 ||
      r.dailyCap <= 0
    )
      return { ok: false, reason: "disabled" };
    const today = new Date(r.now).toISOString().slice(0, 10);
    sql.exec("DELETE FROM requests WHERE day < ?", today);
    sql.exec("DELETE FROM daily WHERE day < ?", today);
    if (
      [...sql.exec("SELECT id FROM requests WHERE id = ?", r.requestId)].length
    )
      return { ok: false, reason: "duplicate" };
    const used = Number(
      [...sql.exec<{ used: number }>("SELECT used FROM budget WHERE id=1")][0]
        .used,
    );
    const daily = [
      ...sql.exec<{ used: number; calls: number }>(
        "SELECT used,calls FROM daily WHERE day = ?",
        today,
      ),
    ][0] || { used: 0, calls: 0 };
    if (
      used + r.microUsd > r.totalCap ||
      daily.used + r.microUsd > r.dailyCap ||
      daily.calls >= 100
    )
      return { ok: false, reason: "budget" };
    const visits = [
      ...sql.exec<{ at: number }>(
        "SELECT at FROM requests WHERE visitor = ? AND day = ?",
        r.visitor,
        today,
      ),
    ];
    if (
      visits.length >= 12 ||
      visits.filter((v) => v.at > r.now - 60_000).length >= 3
    )
      return { ok: false, reason: "visitor" };
    sql.exec("UPDATE budget SET used = used + ? WHERE id = 1", r.microUsd);
    sql.exec(
      "INSERT INTO daily(day,used,calls) VALUES(?,?,1) ON CONFLICT(day) DO UPDATE SET used=used+excluded.used,calls=calls+1",
      today,
      r.microUsd,
    );
    sql.exec(
      "INSERT INTO requests(id,visitor,day,at) VALUES(?,?,?,?)",
      r.requestId,
      r.visitor,
      today,
      r.now,
    );
    return { ok: true, reason: "reserved", reservedMicroUsd: r.microUsd };
  });
}
