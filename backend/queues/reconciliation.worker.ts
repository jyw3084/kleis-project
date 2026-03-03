import { Worker, Queue } from 'bullmq';
import { getRedisConfig } from './connection.js';
import { config } from '../config.js';
import { reconcileFailedOrders } from '../services/reconciliation.service.js';
import { writeWebhookError } from '../services/webhook.service.js';

export async function startReconciliationScheduler(): Promise<{
  queue: Queue;
  worker: Worker;
}> {
  const connection = getRedisConfig();

  const queue = new Queue('reconciliation', {
    connection,
    defaultJobOptions: {
      attempts: 3,
      backoff: {
        type: 'exponential',
        delay: 10_000,
      },
      removeOnComplete: { count: 50 },
      removeOnFail: false,
    },
  });

  await queue.upsertJobScheduler(
    'reconciliation-sync',
    { every: config.RECONCILIATION_INTERVAL_MS },
    { name: 'reconciliation-sync' },
  );

  const worker = new Worker(
    'reconciliation',
    async () => {
      console.log('Starting reconciliation (failed orders only)...');
      const result = await reconcileFailedOrders(config.SHOPIFY_SHOP_DOMAIN);
      console.log(
        `Reconciliation complete: ${result.processed} processed, ${result.failed} failed (stored in webhook_errors)`,
      );
    },
    {
      connection,
      concurrency: 1,
    },
  );

  worker.on('failed', (job, err) => {
    const isFinal = job && job.attemptsMade >= (job.opts.attempts ?? 3);
    if (isFinal) {
      writeWebhookError(
        `reconciliation-${Date.now()}`,
        'reconciliation/failed',
        config.SHOPIFY_SHOP_DOMAIN,
        '{}',
        err.message,
        err.stack,
        job!.attemptsMade,
      );
      console.error(`Reconciliation permanently failed: ${err.message}`);
    } else {
      console.warn(
        `Reconciliation failed (attempt ${job?.attemptsMade}), retrying: ${err.message}`,
      );
    }
  });

  console.log(
    `Reconciliation scheduler started (every ${config.RECONCILIATION_INTERVAL_MS}ms)`,
  );

  return { queue, worker };
}
