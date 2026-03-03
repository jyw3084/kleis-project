CREATE TABLE IF NOT EXISTS orders_inventory (
  id           INTEGER PRIMARY KEY AUTOINCREMENT,
  shop_domain  TEXT NOT NULL,
  variant_id   INTEGER NOT NULL,
  quantity     INTEGER NOT NULL DEFAULT 0,
  updated_at   TEXT NOT NULL DEFAULT (datetime('now')),
  UNIQUE(shop_domain, variant_id)
);

CREATE INDEX IF NOT EXISTS idx_orders_inventory_shop_variant
  ON orders_inventory(shop_domain, variant_id);
