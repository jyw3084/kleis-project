import { config } from './config.js';
import { runMigrations } from './db/migrate.js';
import { closeDb } from './db/connection.js';
import { startWebhookWorker } from './queues/webhook.worker.js';
import { startReconciliationScheduler } from './queues/reconciliation.worker.js';
import app from './app.js';

runMigrations();

const webhookWorker = startWebhookWorker();
const { queue: reconciliationQueue, worker: reconciliationWorker } =
  await startReconciliationScheduler();

const server = app.listen(config.PORT, () => {
  console.log(`Server listening on port ${config.PORT}`);
});

async function shutdown(): Promise<void> {
  console.log('Shutting down...');

  server.close();
  await webhookWorker.close();
  await reconciliationWorker.close();
  await reconciliationQueue.close();
  closeDb();

  console.log('Shutdown complete');
  process.exit(0);
}

process.on('SIGINT', shutdown);
process.on('SIGTERM', shutdown);
