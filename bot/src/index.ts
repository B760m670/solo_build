/**
 * Unisouq webhook registration script.
 *
 * In production, all Telegram updates go straight to the backend
 * `/telegram/webhook` endpoint. This script just (re-)registers the
 * webhook URL with Telegram so updates start flowing.
 *
 * Run: `npm run register-webhook` (from bot/) or `node dist/index.js`.
 */
import 'dotenv/config';

const token = process.env.TELEGRAM_BOT_TOKEN;
const webhookUrl = process.env.TELEGRAM_WEBHOOK_URL; // e.g. https://api.unisouq.app/telegram/webhook
const secret = process.env.BOT_WEBHOOK_SECRET;

if (!token) throw new Error('TELEGRAM_BOT_TOKEN is required');
if (!webhookUrl) throw new Error('TELEGRAM_WEBHOOK_URL is required');
if (!secret) throw new Error('BOT_WEBHOOK_SECRET is required');

async function main() {
  const res = await fetch(`https://api.telegram.org/bot${token}/setWebhook`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      url: webhookUrl,
      secret_token: secret,
      allowed_updates: ['message', 'pre_checkout_query'],
      drop_pending_updates: true,
    }),
  });
  const json = (await res.json()) as { ok: boolean; description?: string };
  if (!json.ok) {
    console.error('setWebhook failed:', json.description);
    process.exit(1);
  }
  console.log(`Webhook registered: ${webhookUrl}`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
