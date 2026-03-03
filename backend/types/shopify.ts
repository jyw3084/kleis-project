export interface ShopifyOrderPayload {
  id: number;
  order_number: number;
  email: string | null;
  phone: string | null;
  financial_status: string;
  fulfillment_status: string | null;
  cancelled_at: string | null;
  cancel_reason: string | null;
  closed_at: string | null;
  currency: string;
  total_price: string;
  subtotal_price: string;
  total_tax: string;
  total_discounts: string;
  source_name: string;
  gateway: string;
  tags: string;
  note: string | null;
  note_attributes: Array<{ name: string; value: string }>;
  customer: {
    id: number;
    first_name: string;
    last_name: string;
    email: string;
  } | null;
  line_items: Array<{
    id: number;
    title: string;
    quantity: number;
    price: string;
    sku: string;
    variant_id: number | null;
    product_id: number | null;
  }>;
  shipping_address: {
    address1: string;
    address2: string | null;
    city: string;
    province: string;
    country: string;
    zip: string;
  } | null;
  shipping_lines: Array<{
    title: string;
    price: string;
    code: string;
  }>;
  created_at: string;
  updated_at: string;
}

export interface WebhookHeaders {
  eventId: string;
  topic: string;
  shopDomain: string;
  apiVersion: string;
}

export interface WebhookEventRow {
  id: number;
  event_id: string;
  topic: string;
  shop_domain: string;
  api_version: string | null;
  payload: string;
  status: string;
  attempts: number;
  created_at: string;
  processed_at: string | null;
  order_id: number | null;
}
