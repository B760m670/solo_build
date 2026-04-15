# Unisouq — The Universal Digital Marketplace Inside Telegram

## Concept
Unisouq is a peer-to-peer marketplace that lives entirely inside Telegram.
Anyone can sell skills, services, or digital goods to other users and get paid
in Telegram Stars. Brands post paid missions — users complete them and earn
Stars. Brands pay the platform in TON for placement. No external apps, no
custom token, no speculation.

**Name meaning:** "Souq" (سوق) = marketplace in Arabic. "Uni" = universal.
One universal marketplace for the digital era, built halal-first.

## Currencies
- **Telegram Stars** — the only payment rail between users. Used for
  marketplace purchases, task rewards, featured boosts, premium badges.
  Stars are Telegram's official virtual currency; users already own and
  understand them.
- **TON** — used only for (a) brand payments to post tasks, and
  (b) optional withdrawal of seller earnings to an external wallet.
  Regular buyers never need to touch TON.
- **No custom token.** BRB is removed. Unisouq never issues a token.
  Nothing to speculate on, nothing to pump, nothing haram.

## Tech Stack
- Frontend: React + Vite + TypeScript + Tailwind CSS
- Backend: NestJS + TypeScript
- Database: PostgreSQL (Supabase) + Prisma ORM
- Cache/queue: Upstash Redis
- Bot: Grammy.js (notifications + Mini App launch)
- Blockchain: @ton/ton (brand payments + seller withdrawals only)
- Payments: Telegram Stars API (escrow-style holding via platform balance)
- Deploy: Vercel (frontend) + Render (backend + bot)
- Shared types: /shared workspace package

## Design System (unchanged from previous build)
- Background: `#000000` (pure black)
- Surface: `#0D0D0D`
- Surface 2: `#111111`
- Border: `rgba(255, 255, 255, 0.06)`
- Accent primary: `#6C63FF` (purple)
- Accent secondary: `#00D4AA` (teal)
- Accent gold: `#F5C842` (Stars)
- Text: `#FFFFFF` / muted `rgba(255,255,255,0.25)`
- Dark theme default, light theme toggle available
- SVG icons only — no emoji anywhere in UI
- Minimal buttons, no fills unless primary action
- Bottom navigation: 4 tabs (Market, Tasks, Wallet, Profile)
- Mobile-first, min tap target 44×44px
- `rounded-card` (16px) and `rounded-btn` (10px) radii

## Modules

### 1. Marketplace
P2P listings for services and digital goods.
- Categories: Design, Writing, Development, Marketing, Video, Other
- Listing card: cover image, title, seller name, reputation tier badge,
  average rating, review count, price in Stars
- Listing detail: full description, seller profile, delivery time, reviews,
  "Order" button
- Create listing: multi-step form (category → title/desc → price → delivery
  time → cover image)
- Featured listings: paid placement in Stars, shown at top of feed
- Filters: category, price range, delivery time, reputation tier

### 2. Tasks
Brand missions with Stars rewards.
- Task card: brand name, brand logo, description, reward in Stars,
  remaining slots, proof type (screenshot | link | text)
- Flow: user starts task → completes action → submits proof → brand approves
  → Stars credited instantly to user's Stars balance
- "My Tasks" tab: ACTIVE, DELIVERED, APPROVED, REJECTED statuses

### 3. Wallet
Two balances shown separately.
- **Stars balance:** earned from sales, task rewards, referral bonuses.
  Spendable on Unisouq (buy listings, boost, premium badge). Not withdrawable
  (Telegram limitation — surface this clearly in UI).
- **TON balance:** only for sellers who received explicit TON payouts or
  brands topping up task budgets. Withdrawable to external TON wallet.
- Full transaction history with typed entries:
  `SALE_INCOME`, `PURCHASE`, `TASK_REWARD`, `COMMISSION`,
  `REFERRAL_BONUS`, `FEATURED_BOOST`, `PREMIUM_BADGE`,
  `BRAND_TASK_FUNDING`, `TON_WITHDRAWAL`.

### 4. Profile
- Telegram avatar + name pulled from initData
- Reputation tier badge + score progress bar (0–1000)
- Stats: completed deals, average rating, total earned in Stars
- My Listings (as seller)
- My Orders (both buying and selling, filterable)
- Settings: language (en/ru), theme, TON wallet address, referral link
- **Disclaimer (always visible at bottom):**
  "Telegram Stars are Telegram's virtual currency. TON is a cryptocurrency.
  Platform does not guarantee income. This is not financial advice."

## Reputation System
Score: 0–1000, cannot be purchased, only earned through real activity.
- +10 per completed deal (as seller or buyer)
- +5 per 5-star review received
- +2 per 4-star review received
- −15 per cancellation caused by user
- −30 per dispute lost

**Tiers and commission rates:**
| Tier    | Score     | Commission |
|---------|-----------|------------|
| New     | 0–99      | 7%         |
| Trusted | 100–299   | 5%         |
| Expert  | 300–699   | 4%         |
| Elite   | 700–1000  | 3%         |

Higher tier = lower commission = strong incentive for good behavior.
Tier badge is displayed next to every seller name across the app.

## Order Flow (Escrow State Machine)
```
PENDING      → buyer placed order, awaiting Stars payment
PAID         → Stars held in platform escrow, seller notified via bot
IN_PROGRESS  → seller accepted and is working
DELIVERED    → seller submitted deliverable (file/link/text)
COMPLETED    → buyer confirmed → Stars released to seller minus commission
                → reviews unlocked for both parties
DISPUTED     → either party opened dispute → manual admin review
CANCELLED    → mutual cancel before PAID, or before IN_PROGRESS
REFUNDED     → admin or mutual agreement → Stars returned to buyer
```

## Bot Notifications (Grammy.js)
- New order received → seller
- Payment confirmed → both
- Order delivered → buyer
- Order completed → seller (with Stars credited amount)
- New review received → both
- Task approved + Stars credited → user
- Dispute opened → admins + counterparty

## Monetization
- **Commission** on every completed marketplace deal (3–7% by tier)
- **Brand task placement** — brands pay TON to fund task pools + platform fee
- **Featured listing boost** — sellers pay Stars for top placement
- **Premium seller badge** — monthly fee in Stars, grants verified mark
- No subscriptions for buyers, no paywalls on core features

## Referral Program
- Every user has a unique referral link (`t.me/unisouq_bot?start=ref_<id>`)
- When a referred friend completes their first deal (buy or sell),
  referrer receives a flat Stars bonus
- **One level only.** No multi-level, no pyramid. Halal-compliant.

## Halal Compliance
- **No gambling**, no prize pools funded by user deposits
- **No speculative token** — Stars and TON are existing external assets,
  Unisouq does not issue anything tradable
- **No interest (riba)** — no lending, no staking with yield
- **No gharar** — every deal has clear terms, deliverables, and escrow
- **No maysir** — no randomness, no lotteries, no loot boxes
- Trade of real labor and digital goods is explicitly permissible (bay')
- Disclaimer required on every payment screen and in profile footer

## Anti-Patterns (never do these)
- No emoji anywhere in UI — SVG icons only
- No gambling, prize pools, lotteries, or clicker mechanics
- No promises of profit in UI text
- No dark patterns in monetization
- No aggressive popups or forced notifications
- No custom token, ever
- No `window.location.reload()` in auth flow
- No `initData` validation that blocks page load for BotFather preview
- No fallback/mock data in production — show empty state instead

## Code Quality Rules
- TypeScript `strict: true` everywhere
- NestJS: DTOs + `class-validator` on every input
- Shared types live in `/shared` workspace package
- API response format: `{ data: T }` or `{ error, code, statusCode }`
- React Query for all data fetching — no raw `fetch` in components
- Mobile-first CSS, min tap target 44×44px
- Error boundaries on every top-level route

## Project Structure
```
/unisouq (solo_build/)
  /frontend          ← React + Vite (Mini App)
  /backend           ← NestJS API
  /bot               ← Grammy.js notification bot
  /shared            ← shared TS types + DTOs
  package.json       ← npm workspaces root
  CLAUDE.md
```

## Current Phase
**Phase 1 — Foundation reset:** CLAUDE.md rewritten, obsolete files removed.
Next phases (awaiting approval):
- Phase 2 — Database schema rewrite (Prisma) + shared types
- Phase 3 — Backend API rebuild (auth, marketplace, tasks, wallet, orders)
- Phase 4 — Frontend screens rebuild on existing design system
- Phase 5 — Bot integration + Stars payment flow
- Phase 6 — TON brand funding + seller withdrawal

## Key Commands
```
npm run dev:frontend
npm run dev:backend
npm run db:migrate
npm run db:seed
npm run deploy:frontend
npm run deploy:backend
```
