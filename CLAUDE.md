# Unisouq — The Creative Web3 Studio Inside Telegram

## Concept
Unisouq is a multi-purpose Web3 creative studio that lives entirely inside
Telegram. One Mini App gathers everything a modern Telegram user wants in one
place: a non-custodial crypto hub, AI tools and automations, games and
entertainment, a social space to build reputation, and an NFT gift shop with
original items issued only by Unisouq. The whole experience is wrapped in a
minimalist dark design, SVG icons, and halal-first monetization.

**Name meaning:** "Souq" (سوق) = marketplace in Arabic. "Uni" = universal.
Not a freelancer marketplace — a universal creative hub for the Telegram era.

## Currencies
- **Telegram Stars** — primary in-app currency. Users pay Stars for NFT
  gifts, Unisouq Plus, premium themes, boosts inside social feed.
- **TON** — optional alternative for users who prefer holding/spending
  crypto. Accepts TON for NFT gifts and Unisouq Plus. Also the withdrawal
  rail for users who want to cash out to an external wallet.
- **Fiat** — optional rail for Unisouq Plus via Telegram payment providers
  (when/if enabled by admin).
- **No custom token.** Unisouq never issues anything tradable on an
  exchange. Stars, TON, and fiat are external assets we only route.

## Tech Stack
- Frontend: React + Vite + TypeScript + Tailwind CSS
- Backend: NestJS + TypeScript
- Database: PostgreSQL (Supabase) + Prisma ORM
- Cache/queue: Upstash Redis
- Bot: raw Telegram Bot API via fetch (notifications + Mini App launch)
- Blockchain: @ton/ton (gift purchases + user withdrawals)
- Payments: Telegram Stars API (`createInvoiceLink`, `successful_payment`)
- Deploy: Vercel (frontend) + Render (backend + bot)
- Shared types: `/shared` workspace package

## Design System
- Background: `#000000` (pure black)
- Surface: `#0D0D0D`
- Surface 2: `#111111`
- Border: `rgba(255, 255, 255, 0.06)`
- Accent primary: `#6C63FF` (purple)
- Accent secondary: `#00D4AA` (teal)
- Accent gold: `#F5C842` (Stars)
- Text: `#FFFFFF` / muted `rgba(255,255,255,0.25)`
- Dark theme default, light theme toggle, purchasable themes override vars
- **SVG icons only** — no emoji anywhere in UI
- Minimalist: every section renders as a clean icon grid, no heavy chrome,
  no gradient spam. One primary action per screen.
- `rounded-card` (16px) and `rounded-btn` (10px) radii
- Mobile-first, min tap target 44×44px
- Bottom navigation: 3 tabs only — **Studio · Wallet · Profile**
- Inside Studio: icon grid of sections (Crypto, AI, Games, Social, Gifts, Plus)

## Modules

### 1. Studio (hub)
Landing page after auth. A single icon grid linking to every section. No
prose, no banners — just cards, each with an SVG icon, name, and one-line
description. Adding a new section = adding one card.

### 2. Crypto
User's on-chain presence inside Telegram.
- View Stars and TON balances side-by-side
- Send/receive TON via deeplink to TON wallets or internal transfer
- Transaction history (typed entries)
- Optional: import TON wallet address for withdrawals
Stars stays spend-only (Telegram limitation), TON is fully withdrawable.

### 3. AI Tools
Curated set of assistant-style tools powered by an LLM (Anthropic or other
via backend proxy). Examples:
- Text rewriter / translator
- Idea generator
- Short-form content drafts for posts
- Meme caption generator
Each tool call costs Stars (metered) or is unlimited for Unisouq Plus.
Admin configures tool list, prompts, and Star prices.

### 4. Games
Casual, **non-gambling**, skill or puzzle mini-games. Hard rules:
- No randomized reward pools funded by user deposits
- No lootboxes, no lotteries, no wagering
- No "pay to spin" mechanics
- Leaderboards with fixed admin-funded Stars prizes are allowed
- Practice mode always free
Initial set: minimalist arcade (tap, reaction, logic puzzles).

### 5. Social
Lightweight post feed where users build a public persona.
- Post: text + optional image, up to N chars
- Like, comment, follow
- Author profile with follower count and reputation
- Boost a post to the top of the feed for Stars (time-limited)
- Admin can pin, feature, and moderate
No private DMs inside Unisouq — Telegram itself is the DM layer.

### 6. Gifts (NFT shop)
Official Unisouq-issued NFT gifts. Each gift is a unique digital collectible
with artwork, rarity tier, edition size, and a price set by admin. Users buy
with Stars or TON, gifts land in the user's inventory, can be displayed on
their Social profile. Admin mints new gifts, adjusts prices, retires editions.
Gifts are cosmetic/collectible only — they grant no financial yield.

### 7. Unisouq Plus
Premium subscription unlocking:
- Verified Plus badge on Social and Profile
- Unlimited AI tool calls
- Access to premium themes (cosmetic)
- Discounted gift prices
- Reduced commission on social boosts
Price in Stars, TON, or fiat. Admin sets all three price tracks and
duration tiers (weekly, monthly, yearly).

### 8. Themes (cosmetic store)
Original visual themes that override the CSS variable palette app-wide.
Each theme is a named palette (bg/surface/accent). Themes are purchased
(Stars/TON/fiat) or bundled with Plus. Admin creates themes and sets prices.
Users switch between purchased themes in Profile.

### 9. Admin
A single panel visible only to users with `role = ADMIN`. Full CRUD over:
- Gifts (mint, price, retire)
- Themes (create, price, retire)
- Plus subscription prices and durations
- AI tool catalog and per-call Star costs
- Social: pin, feature, moderate, ban
- Games: set prize pools, configure game list
- Users: view, grant role, grant Plus manually, refund, ban
- Platform-wide announcements (broadcast notifications)
- Financial snapshot (Stars collected by source, TON funding balance)

## Reputation
Reputation is earned from Social activity and Gift ownership, not from
escrow deals. Score range 0–1000. Tiers: New / Trusted / Expert / Elite.
- +1 per like received (capped per post)
- +3 per comment received
- +5 per follower milestone
- +10 per rare gift owned, +25 per legendary
- −20 per moderation strike
Higher tiers unlock visual flair in Social and discounted Plus.

## Monetization
- **Unisouq Plus** — recurring Stars/TON/fiat, set by admin
- **NFT Gifts** — Stars/TON per item, set by admin
- **Premium Themes** — Stars/TON/fiat per theme, set by admin
- **AI tool usage** — per-call Stars, set by admin
- **Social Boost** — Stars to push a post to the top
- **Games** — Stars entry for ranked rounds with fixed prize pools (admin-funded)
No subscriptions for core access. Core Studio, Wallet, and Profile are free.

## Referral Program
- Every user gets `t.me/unisouq_bot?start=ref_<id>`
- When a referred friend spends their first Stars anywhere in Unisouq,
  referrer gets a flat Stars bonus
- One level only. No MLM, no pyramid.

## Halal Compliance
- No gambling, no lotteries, no randomized deposit pools
- No custom token, no speculation layer
- No interest (riba) — no lending, no yield products
- No gharar — gift prices, Plus prices, and AI costs are all explicit
- No maysir — no randomness tied to user deposits
- Games with fixed admin-funded prizes and skill-based ranking are allowed
- Collectible NFT gifts are cosmetic, not investment vehicles
- Disclaimer visible in Profile footer

## Anti-Patterns (never do these)
- No emoji anywhere in UI — SVG icons only
- No freelancer marketplace, no escrow deals, no P2P service listings
- No brand-task missions, no "complete X for Stars" grind
- No gambling, lootboxes, randomized prize pools from user deposits
- No promises of profit in UI text
- No dark patterns, no forced popups
- No custom token, ever
- No `window.location.reload()` in auth flow
- No `initData` validation that blocks page load for BotFather preview
- No fallback/mock data in production — show empty state instead
- No clutter in Profile or Studio — each section stays a clean icon card

## Code Quality Rules
- TypeScript `strict: true` everywhere
- NestJS: DTOs + `class-validator` on every input
- Shared types live in `/shared`
- API response format: `{ data: T }` or `{ error, code, statusCode }`
- React Query for all data fetching — no raw `fetch` in components
- Mobile-first CSS, min tap target 44×44px
- Error boundaries on every top-level route

## Project Structure
```
/unisouq (solo_build/)
  /frontend          ← React + Vite (Mini App)
  /backend           ← NestJS API
  /bot               ← Telegram Bot API notifications
  /shared            ← shared TS types + DTOs
  package.json       ← npm workspaces root
  CLAUDE.md
```

## Current Phase
**Phase 1 — Concept pivot:** marketplace/tasks/orders modules are being
retired. Frontend is rebuilding around the Studio hub + 3-tab navigation.
Backend cleanup of obsolete modules follows in the next pass so the API
doesn't break mid-deploy.

Upcoming phases:
- Phase 2 — Prisma schema rewrite (remove listings/orders/reviews/tasks,
  add Gift/UserGift/Theme/PlusSubscription/Post/Like/Comment)
- Phase 3 — New backend modules (gifts, plus, themes, ai, social, games)
- Phase 4 — Studio sections wired to real data, admin CRUD panel
- Phase 5 — Bot notifications for purchases + social interactions

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
UI ships in English and Russian. When iterating, new UI strings do NOT need
Russian translations by default — English-only keys are acceptable and will
fall back. Russian translations are batched at the end of a feature.
