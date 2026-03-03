ALTER TABLE webhook_events ADD COLUMN order_id INTEGER;

CREATE INDEX IF NOT EXISTS idx_webhook_events_order_id
  ON webhook_events(order_id);
