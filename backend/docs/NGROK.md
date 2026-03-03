# Testing with ngrok

Use ngrok to expose your local backend so Shopify (or other services) can send webhooks to it over HTTPS.

## 1. Install ngrok

- **macOS (Homebrew):** `brew install ngrok`
- Or download from [ngrok.com](https://ngrok.com/download).

Optional: sign up at [ngrok.com](https://ngrok.com) and add an auth token so your tunnel URL can be stable and avoid session limits.

## 2. Start the backend

In one terminal:

```bash
cd backend
npm run dev
```

Or with an explicit port: `PORT=3000 npm run dev`. The server listens on the port given by `PORT` (default 3000).

## 3. Start the tunnel

In a second terminal:

```bash
cd backend
npm run tunnel
```

Or run ngrok directly: `ngrok http 3000` (use the same port as the backend).

Copy the **HTTPS** URL ngrok shows (e.g. `https://abc123.ngrok-free.app`).

## 4. Webhook URL for Shopify

Your webhook endpoint is:

```
https://<your-ngrok-host>/webhooks/shopify
```

Example: `https://abc123.ngrok-free.app/webhooks/shopify`. Replace `<your-ngrok-host>` with the host from the ngrok terminal.

## 5. Configure in Shopify

In the Shopify admin, go to **Settings → Notifications → Webhooks** (or your app’s webhook settings) and set the webhook URL to the URL above.

Ensure `SHOPIFY_WEBHOOK_SECRET` in your `.env` matches the secret Shopify displays for that webhook.

## Note

With the free ngrok tier, the URL changes each time you start ngrok unless you use an auth token or a reserved domain.
