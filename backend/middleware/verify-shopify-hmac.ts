import { createHmac, timingSafeEqual } from 'node:crypto';
import type { Request, Response, NextFunction } from 'express';
import { config } from '../config.js';

export function verifyShopifyHmac(
  req: Request,
  res: Response,
  next: NextFunction,
): void {
  const hmacHeader = req.get('X-Shopify-Hmac-Sha256');
  if (!hmacHeader) {
    res.status(401).json({ success: false, error: 'Missing HMAC header' });
    return;
  }

  const rawBody = req.body as Buffer;
  if (!Buffer.isBuffer(rawBody) || rawBody.length === 0) {
    res.status(400).json({ success: false, error: 'Missing request body' });
    return;
  }

  const computed = createHmac('sha256', config.SHOPIFY_WEBHOOK_SECRET)
    .update(rawBody)
    .digest('base64');

  const computedBuf = Buffer.from(computed, 'base64');
  const headerBuf = Buffer.from(hmacHeader, 'base64');

  if (
    computedBuf.length !== headerBuf.length ||
    !timingSafeEqual(computedBuf, headerBuf)
  ) {
    res.status(401).json({ success: false, error: 'Invalid HMAC' });
    return;
  }

  next();
}
