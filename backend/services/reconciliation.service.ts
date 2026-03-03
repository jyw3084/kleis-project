import { getDb } from '../db/connection.js';
import {
  insertOrderIfNotExists,
  markEventStatus,
  writeWebhookError,
} from './webhook.service.js';
import { fetchOrder } from './shopify-api.service.js';
import type { WebhookEventRow } from '../types/shopify.js';

const FAILED_ORDER_TOPICS = ['orders/create', 'orders/updated'];

export async function reconcileFailedOrders(
  shopDomain: string,
): Promise<{ processed: number; failed: number }> {
  const db = getDb();
  const rows = db
    .prepare(
      `SELECT * FROM webhook_events
       WHERE status = 'failed'
         AND topic IN (${FAILED_ORDER_TOPICS.map(() => '?').join(',')})
         AND order_id IS NOT NULL`,
    )
    .all(...FAILED_ORDER_TOPICS) as WebhookEventRow[];

  let processed = 0;
  let failed = 0;

  for (const event of rows) {
    const orderId = event.order_id!;
    try {
      const fullOrder = await fetchOrder(orderId);
      db.transaction(() => {
        insertOrderIfNotExists(shopDomain, fullOrder);
        markEventStatus(event.event_id, 'processed');
      })();
      processed++;
    } catch (err) {
      failed++;
      const message = err instanceof Error ? err.message : String(err);
      const stack = err instanceof Error ? err.stack : undefined;
      writeWebhookError(
        event.event_id,
        event.topic,
        event.shop_domain,
        event.payload,
        message,
        stack,
        event.attempts,
      );
    }
  }

  return { processed, failed };
}
