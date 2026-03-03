import 'dotenv/config';

function required(key: string): string {
  const value = process.env[key];
  if (!value) {
    throw new Error(`Missing required environment variable: ${key}`);
  }
  return value;
}

export const config = {
  SHOPIFY_WEBHOOK_SECRET: required('SHOPIFY_WEBHOOK_SECRET'),
  SHOPIFY_ACCESS_TOKEN: required('SHOPIFY_ACCESS_TOKEN'),
  SHOPIFY_SHOP_DOMAIN: required('SHOPIFY_SHOP_DOMAIN'),
  REDIS_URL: process.env.REDIS_URL ?? 'redis://localhost:6379',
  DB_PATH: process.env.DB_PATH ?? './data/kleis.db',
  PORT: parseInt(process.env.PORT ?? '3000', 10),
  RECONCILIATION_INTERVAL_MS: parseInt(
    process.env.RECONCILIATION_INTERVAL_MS ?? '3600000',
    10,
  ),
} as const;
