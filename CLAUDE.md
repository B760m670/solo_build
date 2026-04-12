# Brabble — Modular Web3 Ecosystem

## Concept
Brabble is a modular platform inside Telegram with real utility.
Each module is an independent functional system sharing one core.
Own utility token BRB — access to platform features, NOT an investment asset.
TON blockchain integration. Halal-compliant. No gambling mechanics.
Disclaimer required everywhere: BRB is not a financial instrument.

**→ See [BRB_ISLAMIC_ANALYSIS.md](./BRB_ISLAMIC_ANALYSIS.md) for full Sharia compliance assessment**

## Tech Stack
- Frontend: React + Vite + TypeScript
- Styling: Tailwind CSS + custom CSS variables
- Animations: Framer Motion
- Backend: NestJS + TypeScript
- Database: PostgreSQL + Prisma ORM
- Cache: Redis
- Bot: Grammy.js
- Blockchain: @ton/ton
- Payments: Telegram Stars + TON
- Deploy: Vercel (frontend) + Railway (backend + DB + Redis)

## Design System
- Primary background: #000000 (pure black)
- Surface: #0D0D0D
- Surface 2: #111111
- Border: rgba(255,255,255,0.06)
- Accent purple: #6C63FF
- Accent teal: #00D4AA
- Accent gold: #F5C842
- Text primary: #FFFFFF
- Text muted: rgba(255,255,255,0.25)
- NO emoji in UI — SVG icons only
- Minimal buttons — no fills unless primary action
- Both dark and light themes with toggle
- Bottom navigation: 4 SVG icon tabs

## Modules (launch order)
1. Identity + Wallet (MVP)
2. Tasks
3. Marketplace
4. Knowledge (later)
5. Services (later)

## Monetization
- 3% commission from Marketplace deals
- Brands pay TON for task placements
- Premium subscription via Stars or TON
- Initial BRB token distribution

## Current Phase
Phase 1 — Foundation

## Key Commands
```
npm run dev:frontend
npm run dev:backend
npm run db:migrate
npm run db:seed
npm run deploy:frontend
npm run deploy:backend
```

## Project Structure
```
/brabble (solo_build/)
  /frontend          ← React + Vite
  /backend           ← NestJS
  /bot               ← Grammy.js (separate service)
  /shared            ← shared TypeScript types
  package.json       ← npm workspaces root
  CLAUDE.md
```

## Anti-Patterns (never do these)
- No emoji anywhere in UI
- No gambling or prize pool mechanics
- No promises of profit in UI text
- No dark patterns in monetization
- No clicker mechanics
- No aggressive popups
- Disclaimer must always be accessible
- No window.location.reload() in auth flow
- No initData check that blocks page load for BotFather validator

## Code Quality Rules
- TypeScript strict: true everywhere
- NestJS: use DTOs with class-validator for all inputs
- Shared types imported from /shared package
- API response format: { data: T } | { error: string, code: string, statusCode: number }
- React Query for all data fetching — no raw fetch in components
- Mobile-first CSS, min tap target 44x44px
