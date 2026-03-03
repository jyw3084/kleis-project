CREATE TABLE IF NOT EXISTS webhook_errors (
  id              INTEGER PRIMARY KEY AUTOINCREMENT,
  event_id        TEXT NOT NULL,
  topic           TEXT NOT NULL,
  shop_domain     TEXT NOT NULL,
  payload         TEXT NOT NULL,
  error_message   TEXT,
  error_stack     TEXT,
  attempts        INTEGER NOT NULL DEFAULT 0,
  resolved        INTEGER NOT NULL DEFAULT 0,
  created_at      TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_webhook_errors_resolved
  ON webhook_errors(resolved);
