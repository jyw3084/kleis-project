CREATE TABLE IF NOT EXISTS orders (
  id                  INTEGER PRIMARY KEY AUTOINCREMENT,
  shopify_order_id    INTEGER NOT NULL UNIQUE,
  order_number        TEXT,
  shop_domain         TEXT NOT NULL,

  email               TEXT,
  phone               TEXT,
  customer_id         INTEGER,
  customer_first_name TEXT,
  customer_last_name  TEXT,

  financial_status    TEXT,
  fulfillment_status  TEXT,
  cancelled_at        TEXT,
  cancel_reason       TEXT,
  closed_at           TEXT,

  currency            TEXT,
  total_price         TEXT,
  subtotal_price      TEXT,
  total_tax           TEXT,
  total_discounts     TEXT,

  source_name         TEXT,
  gateway             TEXT,
  tags                TEXT,

  line_items          TEXT,
  shipping_address    TEXT,
  shipping_lines      TEXT,
  note                TEXT,
  note_attributes     TEXT,

  created_at_shopify  TEXT,
  updated_at_shopify  TEXT,
  created_at          TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at          TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_orders_shop_domain
  ON orders(shop_domain);

CREATE INDEX IF NOT EXISTS idx_orders_financial_status
  ON orders(financial_status);
