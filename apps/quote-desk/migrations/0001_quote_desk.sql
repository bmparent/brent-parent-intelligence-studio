PRAGMA foreign_keys = ON;
CREATE TABLE quote_accounts (
  id TEXT PRIMARY KEY,
  email TEXT NOT NULL UNIQUE,
  stripe_customer_id TEXT UNIQUE,
  created_at INTEGER NOT NULL
);
CREATE TABLE quote_login_links (
  token_hash TEXT PRIMARY KEY,
  email TEXT NOT NULL,
  expires_at INTEGER NOT NULL,
  used_at INTEGER
);
CREATE TABLE quote_sessions (
  token_hash TEXT PRIMARY KEY,
  account_id TEXT NOT NULL REFERENCES quote_accounts(id),
  expires_at INTEGER NOT NULL
);
CREATE TABLE quote_subscriptions (
  id TEXT PRIMARY KEY,
  account_id TEXT NOT NULL REFERENCES quote_accounts(id),
  customer_id TEXT NOT NULL,
  status TEXT NOT NULL,
  paid_through INTEGER NOT NULL DEFAULT 0,
  access_blocked INTEGER NOT NULL DEFAULT 0,
  checked_at INTEGER NOT NULL
);
CREATE TABLE quote_records (
  id TEXT PRIMARY KEY,
  account_id TEXT NOT NULL REFERENCES quote_accounts(id),
  kind TEXT NOT NULL CHECK(kind IN ('quote','preset')),
  name TEXT NOT NULL,
  payload TEXT NOT NULL,
  revision INTEGER NOT NULL DEFAULT 1,
  created_at INTEGER NOT NULL,
  updated_at INTEGER NOT NULL
);
CREATE INDEX quote_records_owner ON quote_records(account_id,updated_at);
CREATE INDEX quote_subscriptions_owner ON quote_subscriptions(account_id);
CREATE TABLE quote_checkout_attempts (
  id TEXT PRIMARY KEY,
  account_id TEXT NOT NULL REFERENCES quote_accounts(id),
  session_id TEXT UNIQUE,
  url TEXT,
  integration_tag TEXT NOT NULL,
  created_at INTEGER NOT NULL,
  expires_at INTEGER NOT NULL
);
CREATE TABLE quote_webhook_events (
  id TEXT PRIMARY KEY,
  type TEXT NOT NULL,
  received_at INTEGER NOT NULL,
  processed_at INTEGER
);
CREATE TABLE quote_checkout_locks (
  account_id TEXT PRIMARY KEY REFERENCES quote_accounts(id),
  attempt_id TEXT NOT NULL,
  expires_at INTEGER NOT NULL
);
CREATE TABLE quote_deleted_customers (
  customer_id TEXT PRIMARY KEY,
  requested_at INTEGER NOT NULL
);
CREATE TABLE quote_quotas (
  bucket TEXT NOT NULL,
  period INTEGER NOT NULL,
  used INTEGER NOT NULL,
  expires_at INTEGER NOT NULL,
  PRIMARY KEY(bucket,period)
);
