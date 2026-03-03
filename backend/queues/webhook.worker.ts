import { Worker, type Job } from 'bullmq';
import { getRedisConfig } from './connection.js';
import { getDb } from '../db/connection.js';
import {
  markEventStatus,
  incrementAttempts,
  insertOrderIfNotExists,
  deductOrderInventory,
  orderExists,
  writeWebhookError,
} from '../services/webhook.service.js';
import type {
  WebhookEventRow,
  ShopifyOrderPayload,
} from '../types/shopify.js';

export async function processWebhook(job: Job<{ eventId: string; }>): Promise<void> {
  const { eventId } = job.data;

  const db = getDb();
  const event = db
    .prepare('SELECT * FROM webhook_events WHERE event_id = ?')
    .get(eventId) as WebhookEventRow | undefined;

  if (!event) {
    throw new Error(`Webhook event not found: ${eventId}`);
  }

  markEventStatus(eventId, 'processing');
  incrementAttempts(eventId);
  
  const orderPayload: ShopifyOrderPayload = JSON.parse(event.payload);

  if (!orderPayload) {
    throw new Error(`Order payload not found for event ${eventId}`);
  }

  if (event.topic === 'orders/create') {
    db.transaction(() => {
      insertOrderIfNotExists(event.shop_domain, orderPayload);
      deductOrderInventory(event.shop_domain, orderPayload.line_items);
      markEventStatus(eventId, 'processed');
    })();
    return;
  }

  // As an example, if we received an orders/updated webhook, we need to check if the order exists in our database.
  if (event.topic === 'orders/updated') {
    if (orderExists(orderPayload.id)) {
      db.transaction(() => {
        // Decide if we wish to update existing order or drop this event
        markEventStatus(eventId, 'processed');
      })();
      return;
    }

    // If orders/updated arrives before an order is created, we can decide if we wish to reconcile the order via Shopify API.
  }

  // Unknown topic -- still mark as processed to avoid infinite retries
  console.warn(`Unknown webhook topic: ${event.topic}`);
  markEventStatus(eventId, 'processed');
}

export function startWebhookWorker(): Worker {
  const worker = new Worker('webhook.process', processWebhook, {
    connection: getRedisConfig(),
    concurrency: 5,
  });

  worker.on('completed', (job) => {
    console.log(`Webhook job ${job.id} completed`);
  });

  worker.on('failed', (job, err) => {
    if (!job) return;

    const isFinalFailure = job.attemptsMade >= (job.opts.attempts ?? 5);
    if (isFinalFailure) {
      const { eventId } = job.data as { eventId: string };
      const db = getDb();
      const event = db
        .prepare('SELECT * FROM webhook_events WHERE event_id = ?')
        .get(eventId) as WebhookEventRow | undefined;

      if (event) {
        writeWebhookError(
          event.event_id,
          event.topic,
          event.shop_domain,
          event.payload,
          err.message,
          err.stack,
          job.attemptsMade,
        );
        markEventStatus(eventId, 'failed');
      }

      console.error(
        `Webhook job ${job.id} permanently failed: ${err.message}`,
      );
    } else {
      console.warn(
        `Webhook job ${job.id} failed (attempt ${job.attemptsMade}), retrying: ${err.message}`,
      );
    }
  });

  console.log('Webhook worker started');
  return worker;
}
