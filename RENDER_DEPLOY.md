# Render Backend Deploy

Use these commands in your Render web service to avoid schema/code drift:

- Build Command: `cd backend && npm install && npm run build:render`
- Start Command: `cd backend && npm run start:render`

`start:render` runs `prisma migrate deploy` before booting the API, so new columns/tables are applied before the app serves traffic.

Required environment variables:

- `DATABASE_URL`
- `DIRECT_URL`
- `JWT_SECRET`
- `TELEGRAM_BOT_TOKEN`
- `BOT_WEBHOOK_SECRET` — random string; also passed to `register-webhook`
- `WEBAPP_URL` — public URL of the Mini App (frontend)
- `TON_ENDPOINT` — toncenter endpoint
- `TON_API_KEY` — optional toncenter key
- `PLATFORM_TON_MNEMONIC` — 24-word mnemonic for the platform TON wallet

After first deploy, run `npm run register-webhook` from the `bot/` workspace
(with the same `TELEGRAM_BOT_TOKEN` + `BOT_WEBHOOK_SECRET` and
`TELEGRAM_WEBHOOK_URL=<backend-url>/telegram/webhook`) to start receiving
Telegram updates on the backend.

Recommended deploy behavior:

- Auto deploy from `main`
- Restart on every push
- Check logs for successful migration output on each deploy
