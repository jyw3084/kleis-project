import { config } from '../config.js';
import type { ShopifyOrderPayload } from '../types/shopify.js';

const BASE_URL = `https://${config.SHOPIFY_SHOP_DOMAIN}/admin/api/2024-01`;

const headers = {
  'X-Shopify-Access-Token': config.SHOPIFY_ACCESS_TOKEN,
  'Content-Type': 'application/json',
};

export async function fetchOrder(
  orderId: number,
): Promise<ShopifyOrderPayload> {
  const res = await fetch(`${BASE_URL}/orders/${orderId}.json`, { headers });

  if (!res.ok) {
    throw new Error(
      `Shopify API error fetching order ${orderId}: ${res.status} ${res.statusText}`,
    );
  }

  const data = (await res.json()) as { order: ShopifyOrderPayload };
  return data.order;
}
