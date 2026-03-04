import { Router, raw } from 'express';
import { verifyShopifyHmac } from '../middleware/verify-shopify-hmac.js';
import { storeWebhookEvent } from '../services/webhook.service.js';
import { getWebhookQueue } from '../queues/webhook.queue.js';
import { config } from '../config.js';

export const webhookRouter = Router();

webhookRouter.post(
  '/shopify',
  raw({ type: 'application/json' }),
  verifyShopifyHmac,
  async (req, res) => {
    const eventId = req.get('X-Shopify-Event-Id') ?? '';
    const topic = req.get('X-Shopify-Topic') ?? '';
    const shopDomain = req.get('X-Shopify-Shop-Domain') ?? '';
    const triggeredAt = new Date(req.get('X-Shopify-Triggered-At') ?? '');
    const apiVersion = req.get('X-Shopify-API-Version') ?? '';

    if (!eventId || !topic || !shopDomain || !triggeredAt || Number.isNaN(triggeredAt.getTime())) {
      res.status(400).json({ success: false, error: 'Missing required Shopify headers' });
      return;
    }

    if (shopDomain !== config.SHOPIFY_SHOP_DOMAIN) {
      res.status(400).json({ success: false, error: 'Invalid shop domain' });
      return;
    }

    const payload =
      req.body != null
        ? (req.body as Buffer).toString('utf8')
        : '';

    if (typeof payload !== 'string' || payload.trim() === '') {
      res.status(400).json({ success: false, error: 'Missing or empty webhook payload' });
      return;
    }

    try {
      const { success } = storeWebhookEvent(eventId, topic, shopDomain, apiVersion, payload);
      if (!success) {
        res.status(500).json({ success: false, error: 'Failed to store webhook event' });
        return;
      }

      const queue = getWebhookQueue();
      const jobId = `webhook-${eventId}`;
      const existing = await queue.getJob(jobId);
      if (existing) {
        const state = await existing.getState();
        if (state === 'active' || state === 'completed') {
          console.warn(`Duplicate webhook eventId ${eventId}, job already ${state}`);
          res.status(200).json({ success: true });
          return;
        }
        if (state === 'delayed' || state === 'waiting') {
          await existing.remove();
        }
      }

      const now = Date.now();
      const triggeredAtMs = triggeredAt.getTime();
      const delayMs = Math.max(0, triggeredAtMs - now);
      const baseTime = now - 86400000; // 24h ago
      const priority = Math.min(
        2_097_152,
        Math.max(0, Math.floor((triggeredAtMs - baseTime) / 1000)),
      );

      await queue.add(
        'process-webhook',
        { eventId },
        {
          jobId,
          delay: delayMs,
          priority,
        },
      );

      res.status(200).json({ success: true });
    } catch (err) {
      console.error('Webhook store or queue failed:', err);
      res.status(500).json({ success: false, error: 'Internal server error' });
    }
  },
);
