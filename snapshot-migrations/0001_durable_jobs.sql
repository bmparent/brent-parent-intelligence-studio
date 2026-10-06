CREATE TABLE IF NOT EXISTS snapshot_orders(id TEXT PRIMARY KEY, token TEXT NOT NULL UNIQUE, status TEXT NOT NULL, record TEXT NOT NULL, payment_intent TEXT, expires INTEGER NOT NULL);
CREATE INDEX IF NOT EXISTS snapshot_payment ON snapshot_orders(payment_intent);
CREATE TABLE IF NOT EXISTS snapshot_jobs(order_id TEXT PRIMARY KEY REFERENCES snapshot_orders(id), state TEXT NOT NULL, updated INTEGER NOT NULL, claimed TEXT, reason TEXT);
CREATE TABLE IF NOT EXISTS snapshot_stages(order_id TEXT NOT NULL, stage TEXT NOT NULL, state TEXT NOT NULL, model TEXT NOT NULL, started INTEGER NOT NULL, finished INTEGER, PRIMARY KEY(order_id,stage));
CREATE TABLE IF NOT EXISTS snapshot_budget(day TEXT PRIMARY KEY, reserved INTEGER NOT NULL DEFAULT 0);
CREATE TABLE IF NOT EXISTS snapshot_events(id TEXT PRIMARY KEY, created INTEGER NOT NULL);
CREATE TABLE IF NOT EXISTS snapshot_revocations(payment_intent TEXT PRIMARY KEY, state TEXT NOT NULL);
