CREATE TABLE IF NOT EXISTS webhook_events (
  id              INTEGER PRIMARY KEY AUTOINCREMENT,
  event_id        TEXT NOT NULL UNIQUE,
  topic           TEXT NOT NULL,
  shop_domain     TEXT NOT NULL,
  api_version     TEXT,
  payload         TEXT NOT NULL,
  status          TEXT NOT NULL DEFAULT 'pending',
  attempts        INTEGER NOT NULL DEFAULT 0,
  created_at      TEXT NOT NULL DEFAULT (datetime('now')),
  processed_at    TEXT
);

CREATE INDEX IF NOT EXISTS idx_webhook_events_status
  ON webhook_events(status);

CREATE INDEX IF NOT EXISTS idx_webhook_events_topic
  ON webhook_events(topic);
