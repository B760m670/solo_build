import { ReputationTier } from '@prisma/client';

export const TIER_COMMISSION_RATE: Record<ReputationTier, number> = {
  NEW: 0.07,
  TRUSTED: 0.05,
  EXPERT: 0.04,
  ELITE: 0.03,
};

export function tierForScore(score: number): ReputationTier {
  if (score >= 700) return 'ELITE';
  if (score >= 300) return 'EXPERT';
  if (score >= 100) return 'TRUSTED';
  return 'NEW';
}

export function commissionRateFor(tier: ReputationTier): number {
  return TIER_COMMISSION_RATE[tier];
}

export function computeCommission(priceStars: number, tier: ReputationTier) {
  const rate = commissionRateFor(tier);
  const commissionStars = Math.floor(priceStars * rate);
  const payoutStars = priceStars - commissionStars;
  return { commissionStars, payoutStars, commissionRate: rate };
}
