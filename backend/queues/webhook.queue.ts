import { Queue } from 'bullmq';
import { getRedisConfig } from './connection.js';

let queue: Queue | null = null;

export function getWebhookQueue(): Queue {
  if (queue) return queue;

  queue = new Queue('webhook.process', {
    connection: getRedisConfig(),
    defaultJobOptions: {
      attempts: 5,
      backoff: {
        type: 'exponential',
        delay: 2000,
      },
      removeOnComplete: { count: 1000 },
      removeOnFail: { age: 86400000 }, // 24 hours
    },
  });

  return queue;
}
