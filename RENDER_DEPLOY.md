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

Recommended deploy behavior:

- Auto deploy from `main`
- Restart on every push
- Check logs for successful migration output on each deploy
