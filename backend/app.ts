import express from 'express';
import { webhookRouter } from './routes/webhooks.js';

const app = express();

app.use('/webhooks', webhookRouter);

app.get('/health', (_req, res) => {
  res.status(200).json({
    success: true,
    data: { status: 'ok' }
  });
});

export default app;
