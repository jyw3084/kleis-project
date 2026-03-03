import { getDb } from '../db/connection.js';
import type { ShopifyOrderPayload } from '../types/shopify.js';

export function parseOrderIdFromPayload(topic: string, payload: string): number | null {
  if (topic !== 'orders/create' && topic !== 'orders/updated') return null;
  try {
    const data = JSON.parse(payload) as { id?: number };
    return data.id ?? null;
  } catch {
    return null;
  }
}

export function storeWebhookEvent(
  eventId: string,
  topic: string,
  shopDomain: string,
  apiVersion: string,
  payload: string,
): { success: boolean } {
  const db = getDb();
  const orderId = parseOrderIdFromPayload(topic, payload);
  const result = db
    .prepare(
      `INSERT OR IGNORE INTO webhook_events (event_id, topic, shop_domain, api_version, payload, order_id) VALUES (?, ?, ?, ?, ?, ?)`,
    )
    .run(eventId, topic, shopDomain, apiVersion, payload, orderId);

  return { success: result.changes > 0 };
}

export function markEventStatus(
  eventId: string,
  status: 'processing' | 'processed' | 'failed',
): void {
  const db = getDb();
  const processedAt = status === 'processed' ? new Date().toISOString() : null;
  db.prepare(
    `UPDATE webhook_events SET status = ?, processed_at = COALESCE(?, processed_at)
     WHERE event_id = ?`,
  ).run(status, processedAt, eventId);
}

export function incrementAttempts(eventId: string): void {
  const db = getDb();
  db.prepare(
    'UPDATE webhook_events SET attempts = attempts + 1 WHERE event_id = ?',
  ).run(eventId);
}

export function insertOrderIfNotExists(
  shopDomain: string,
  order: ShopifyOrderPayload,
): void {
  const db = getDb();
  db.prepare(
    `INSERT INTO orders (
       shopify_order_id, order_number, shop_domain,
       email, phone, customer_id, customer_first_name, customer_last_name,
       financial_status, fulfillment_status, cancelled_at, cancel_reason, closed_at,
       currency, total_price, subtotal_price, total_tax, total_discounts,
       source_name, gateway, tags,
       line_items, shipping_address, shipping_lines, note, note_attributes,
       created_at_shopify, updated_at_shopify, updated_at
     ) VALUES (
       ?, ?, ?,
       ?, ?, ?, ?, ?,
       ?, ?, ?, ?, ?,
       ?, ?, ?, ?, ?,
       ?, ?, ?,
       ?, ?, ?, ?, ?,
       ?, ?, datetime('now')
     )
     ON CONFLICT(shopify_order_id) DO NOTHING`,
  ).run(
    order.id,
    String(order.order_number),
    shopDomain,
    order.email,
    order.phone,
    order.customer?.id ?? null,
    order.customer?.first_name ?? null,
    order.customer?.last_name ?? null,
    order.financial_status,
    order.fulfillment_status,
    order.cancelled_at,
    order.cancel_reason,
    order.closed_at,
    order.currency,
    order.total_price,
    order.subtotal_price,
    order.total_tax,
    order.total_discounts,
    order.source_name,
    order.gateway,
    order.tags,
    JSON.stringify(order.line_items),
    order.shipping_address ? JSON.stringify(order.shipping_address) : null,
    JSON.stringify(order.shipping_lines),
    order.note,
    JSON.stringify(order.note_attributes),
    order.created_at,
    order.updated_at,
  );
}

export function deductOrderInventory(
  shopDomain: string,
  lineItems: ShopifyOrderPayload['line_items'],
): void {
  const db = getDb();
  const stmt = db.prepare(
    `UPDATE orders_inventory
     SET quantity = quantity - ?, updated_at = datetime('now')
     WHERE shop_domain = ? AND variant_id = ?`,
  );
  for (const item of lineItems) {
    if (item.variant_id != null && item.quantity > 0) {
      stmt.run(item.quantity, shopDomain, item.variant_id);
    }
  }
}

export function orderExists(shopifyOrderId: number): boolean {
  const db = getDb();
  const row = db
    .prepare('SELECT 1 FROM orders WHERE shopify_order_id = ?')
    .get(shopifyOrderId);
  return row !== undefined;
}

export function writeWebhookError(
  eventId: string,
  topic: string,
  shopDomain: string,
  payload: string,
  errorMessage: string,
  errorStack: string | undefined,
  attempts: number,
): void {
  const db = getDb();
  db.prepare(
    `INSERT INTO webhook_errors (event_id, topic, shop_domain, payload, error_message, error_stack, attempts)
     VALUES (?, ?, ?, ?, ?, ?, ?)`,
  ).run(eventId, topic, shopDomain, payload, errorMessage, errorStack ?? null, attempts);
}
