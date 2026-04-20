# Unisouq — TON Tipping for Telegram

## Concept
Unisouq is a single-purpose Telegram Mini App for **sending TON tips** to
other Telegram users. One user taps "send tip", picks a recipient (by
reply, @username, or chat mention), signs a small TON transaction with
their connected wallet, and the recipient gets notified in Telegram. If
the recipient hasn't linked a TON address yet, the tip waits in escrow
and can be claimed when they do; unclaimed tips auto-refund after a fixed
window. The app ships with a `/tip` bot command so the same flow works
directly from any Telegram chat without opening the Mini App.

**Name meaning:** "Souq" (سوق) = marketplace in Arabic. "Uni" = universal.
Positioned as the universal tipping layer for Telegram — not a wallet, not
a marketplace, not a studio.

## Why single-purpose
An earlier iteration framed Unisouq as a multi-module "creative studio"
(AI tools, games, social, gifts, themes, plus). Every module was empty
because the one shared primitive — "user has funds on-chain and can move
them inside Telegram" — was never actually connected. The pivot collapses
the app to that one primitive done end-to-end: connect wallet, send tip,
claim tip, withdraw. Everything else is removed from navigation but files
are kept on disk so modules can be revived later if the tipping core gains
traction.

## Currencies
- **TON** — the only value rail. Tips are on-chain TON transfers signed
  via TonConnect. Escrow for unclaimed tips is held by a Unisouq-owned
  TON account and auto-refunded on expiry.
- **Telegram Stars** — optional, only for Plus if/when re-enabled. Not
  used for tips.
- **No custom token.** Unisouq never issues anything tradable.

## Tech Stack
- Frontend: React + Vite + TypeScript + Tailwind CSS
- Backend: NestJS + TypeScript
- Database: PostgreSQL (Supabase) + Prisma ORM
- Cache/queue: Upstash Redis
- Bot: raw Telegram Bot API via fetch (notifications, `/tip` command,
  Mini App launch)
- Blockchain: @ton/ton + `@tonconnect/ui-react` (wallet connect + tip
  signing + escrow payout)
- Deploy: Vercel (frontend) + Render (backend + bot)
- Shared types: `/shared` workspace package

## Design System
- Background: `#000000` (pure black)
- Surface: `#0D0D0D`
- Surface 2: `#111111`
- Border: `rgba(255, 255, 255, 0.06)`
- Accent primary: `#6C63FF` (purple)
- Accent secondary: `#00D4AA` (teal)
- Accent gold: `#F5C842`
- Text: `#FFFFFF` / muted `rgba(255,255,255,0.25)`
- Dark theme default, light theme toggle
- **SVG icons only** — no emoji anywhere in UI
- Minimalist: every screen is one primary action, one supporting list
- `rounded-card` (16px) and `rounded-btn` (10px) radii
- Mobile-first, min tap target 44×44px
- Bottom navigation: **2 tabs only — Wallet · Profile**

## Core Flow

### Wallet (default tab)
- TonConnect status: connect / disconnect
- TON balance of the connected wallet (read from chain)
- Primary action: **Send tip**
- Received tips list with inline **Claim** action (for pending tips)
- Transaction history (sent + claimed + refunded)

### Send tip
- Recipient selector: Telegram `@username` input, reply-to-message target,
  or a Unisouq user from recent-interaction list
- Amount in TON, with a quick-pick row (0.1 / 0.5 / 1 / 5)
- Optional note (short text, off-chain, stored by backend)
- Signs a single TonConnect transaction; backend records the tip row and
  watches the chain for confirmation
- If the recipient has a linked TON address → tip goes directly to them
- If not → tip is held in Unisouq's escrow TON account; a claim row is
  created; recipient is notified via bot

### Claim tip
- Recipient opens Mini App (deeplink from bot notification)
- Connects a TON wallet if not already connected
- Taps **Claim** on the pending tip; backend dispatches the escrow payout
  transaction

### Escrow + refund
- Escrow window: **7 days**. After that, unclaimed tips auto-refund to
  sender's connected address via a scheduled job
- Tip states: `PENDING` → `CLAIMED` | `EXPIRED` → `REFUNDED`
- All state transitions are idempotent and logged

### Profile (second tab)
- Telegram identity (name, avatar, @username)
- Linked TON address (shared single source of truth with Wallet)
- Learn (entry point into the crypto/Stars/TON lessons that survived the
  pivot — useful for first-time TON users)
- Referral link
- Settings (language, theme, admin panel for privileged users)

## Bot

### `/tip` command
- Direct form: `/tip @username <amount>` sent in any chat — bot replies
  with a Mini App button to confirm & sign
- Reply form: reply to a message with `/tip <amount>` — target is the
  replied-to user
- Bot never holds private keys. It just resolves the recipient, creates
  a pending tip row, and hands the user a Mini App confirm link

### Notifications
- Recipient gets a Telegram message when a tip is pending
- Sender gets a Telegram message on claim and on auto-refund

## Admin
A single panel visible only to users with `role = ADMIN`. Full CRUD over:
- Users: view, grant role, refund manually, ban
- Tips: view all, force-refund, inspect on-chain tx hash
- Platform-wide announcements (broadcast notifications via bot)
- Financial snapshot (total TON tipped, escrow balance, pending count)

## Monetization
- **Protocol fee** — small fixed percentage skimmed on each tip, taken
  inside the same on-chain transaction. Exact rate is admin-configurable.
- No subscriptions. No ads. No custom token.

Everything else in earlier docs (Plus, AI metering, gift shop, theme
store, social boosts) is out of scope for this phase.

## Referral Program
- Every user gets `t.me/unisouq_bot?start=ref_<id>`
- When a referred user sends their first tip, the referrer gets a
  one-time TON rebate equal to the protocol fee on that tip
- One level only. No MLM, no pyramid.

## Halal Compliance
- No gambling, no lotteries, no randomized prize pools
- No custom token, no speculation layer
- No interest (riba), no lending, no yield
- Tips are explicit peer-to-peer gifts — no gharar, no maysir
- Protocol fee is disclosed before the user signs
- Disclaimer visible in Profile footer

## Anti-Patterns (never do these)
- No emoji anywhere in UI — SVG icons only
- No freelancer marketplace, no escrow deals for services, no P2P listings
- No brand-task missions, no "complete X for Stars" grind
- No gambling, lootboxes, randomized prize pools from user deposits
- No promises of profit in UI text
- No dark patterns, no forced popups
- No custom token, ever
- No `window.location.reload()` in auth flow
- No `initData` validation that blocks page load for BotFather preview
- No fallback/mock data in production — show empty state instead
- No dead navigation entries: if a section isn't shipped, it isn't in
  the nav. Files for retired modules stay on disk but are unreachable
  from the UI

## Code Quality Rules
- TypeScript `strict: true` everywhere
- NestJS: DTOs + `class-validator` on every input
- Shared types live in `/shared`
- API response format: `{ data: T }` or `{ error, code, statusCode }`
- React Query for all data fetching — no raw `fetch` in components
- Mobile-first CSS, min tap target 44×44px
- Error boundaries on every top-level route
- On-chain state transitions are idempotent, keyed by tx hash

## Project Structure
```
/unisouq (solo_build/)
  /frontend          ← React + Vite (Mini App)
  /backend           ← NestJS API
  /bot               ← Telegram Bot API + /tip command handler
  /shared            ← shared TS types + DTOs
  package.json       ← npm workspaces root
  CLAUDE.md
```

## Current Phase
**Phase 1 — Repositioning (in progress).** Navigation collapsed to
Wallet + Profile. Studio hub removed from nav. Module files kept on disk
for reversibility.

Upcoming phases:
- Phase 2 — Tip backend: `Tip` Prisma model with state machine, `tips`
  NestJS module (send, claim, list, expire), scheduled refund worker
- Phase 3 — Bot `/tip` command + notifications
- Phase 4 — Tip UI in Wallet (send screen, pending list, history)
- Phase 5 — Protocol fee + admin panel for tip oversight
- Phase 6 — Seed.ts cleanup (remove dead marketplace references that
  currently break `npm run db:seed`)

## Key Commands
```
npm run dev:frontend
npm run dev:backend
npm run db:migrate
npm run db:seed
npm run deploy:frontend
npm run deploy:backend
```

## Language
UI ships in English and Russian. When iterating, new UI strings do NOT
need Russian translations by default — English-only keys are acceptable
and will fall back. Russian translations are batched at the end of a
feature.
