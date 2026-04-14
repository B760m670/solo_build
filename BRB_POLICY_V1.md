# BRB Policy v1 (Off-chain Utility Model)

## Model

BRB is an internal utility credit in Brabble.
It is not positioned as an investment asset and not marketed with return promises.

External settlement rails:

- TON
- Telegram Stars

## Allowed Uses

- Internal marketplace payments
- Access utility and feature utility
- Verified task rewards
- Seller fee-tier discounts based on BRB balance
- Task payouts backed by sponsor budgets in TON or Stars (off-chain accounting)

## Disallowed Uses

- Profit promises tied to BRB holding
- Speculative trading messaging
- Gambling-like reward mechanics

## Marketplace Seller Fee Tiers

- `>= 0 BRB`: 3.0%
- `>= 300 BRB`: 2.5%
- `>= 1000 BRB`: 2.0%
- `>= 3000 BRB`: 1.5%

## Withdrawal

- Minimum withdrawal: 100 BRB
- Fee: 5%
- Queue statuses: PENDING -> APPROVED -> SENT / FAILED

## Task Sponsor Budgets

- Sponsors define a task budget currency: `TON` or `STARS`
- Sponsors define a max task budget amount
- Each approved reward consumes budget based on configured BRB conversion rates
- Rewards are blocked when sponsor budget is exhausted
