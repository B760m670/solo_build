// ─── User ────────────────────────────────────────────

export type UserRole = 'USER' | 'ADMIN' | 'MODERATOR';

export type ReputationTier = 'NEW' | 'TRUSTED' | 'EXPERT' | 'ELITE';

export const TIER_THRESHOLDS: Record<ReputationTier, { min: number; max: number }> = {
  NEW: { min: 0, max: 99 },
  TRUSTED: { min: 100, max: 299 },
  EXPERT: { min: 300, max: 699 },
  ELITE: { min: 700, max: 1000 },
};

export interface User {
  id: string;
  telegramId: number;
  username: string | null;
  firstName: string;
  lastName: string | null;
  avatarUrl: string | null;
  role: UserRole;

  starsBalance: number;
  tonBalance: number;
  totalEarnedStars: number;

  reputationScore: number;
  reputationTier: ReputationTier;

  premiumBadgeUntil: string | null;
  activeThemeId: string | null;
  tonAddress: string | null;
  language: string;
  theme: string;

  referralCode: string;
  referredById: string | null;

  createdAt: string;
  updatedAt: string;

  // Flag populated by auth response (`ADMIN | MODERATOR`)
  isAdmin?: boolean;
}

// ─── Gifts ───────────────────────────────────────────

export type GiftRarity = 'COMMON' | 'RARE' | 'EPIC' | 'LEGENDARY';

export interface Gift {
  id: string;
  name: string;
  description: string;
  imageUrl: string;
  rarity: GiftRarity;
  priceStars: number | null;
  priceTon: number | null;
  editionSize: number | null;
  editionMinted: number;
  isActive: boolean;
  createdAt: string;
}

export interface UserGift {
  id: string;
  userId: string;
  giftId: string;
  serialNo: number;
  acquiredAt: string;
  gift?: Gift;
}

// ─── Themes ──────────────────────────────────────────

export interface ThemePalette {
  bg: string;
  surface: string;
  surface2: string;
  border: string;
  accent: string;
  teal: string;
  gold: string;
  text: string;
  textMuted: string;
}

export interface Theme {
  id: string;
  name: string;
  description: string | null;
  previewUrl: string | null;
  palette: ThemePalette;
  priceStars: number | null;
  priceTon: number | null;
  plusOnly: boolean;
  isActive: boolean;
}

// ─── Plus subscription ──────────────────────────────

export interface PlusPlan {
  id: string;
  name: string;
  durationDays: number;
  priceStars: number | null;
  priceTon: number | null;
  priceFiat: number | null;
  isActive: boolean;
}

export interface PlusSubscription {
  id: string;
  userId: string;
  planId: string;
  startsAt: string;
  endsAt: string;
  createdAt: string;
}

// ─── Social ──────────────────────────────────────────

export type PostStatus = 'PUBLISHED' | 'HIDDEN' | 'REMOVED';

export interface Post {
  id: string;
  authorId: string;
  body: string;
  imageUrl: string | null;
  status: PostStatus;
  likeCount: number;
  commentCount: number;
  boostedUntil: string | null;
  createdAt: string;
  updatedAt: string;
  author?: Pick<User, 'id' | 'username' | 'firstName' | 'avatarUrl' | 'reputationTier'>;
  likedByMe?: boolean;
}

export interface PostComment {
  id: string;
  postId: string;
  userId: string;
  body: string;
  createdAt: string;
  user?: Pick<User, 'id' | 'username' | 'firstName' | 'avatarUrl'>;
}

// ─── Wallet ──────────────────────────────────────────

export type Currency = 'STARS' | 'TON';

export type TransactionType =
  | 'GIFT_PURCHASE'
  | 'PLUS_SUBSCRIPTION'
  | 'THEME_PURCHASE'
  | 'SOCIAL_BOOST'
  | 'AI_USAGE'
  | 'REFERRAL_BONUS'
  | 'TON_WITHDRAWAL'
  | 'TON_DEPOSIT';

export interface Transaction {
  id: string;
  userId: string;
  type: TransactionType;
  currency: Currency;
  amount: number;
  balanceAfter: number;
  meta: Record<string, unknown> | null;
  createdAt: string;
}

export interface WalletInfo {
  starsBalance: number;
  tonBalance: number;
  totalEarnedStars: number;
  recentTransactions: Transaction[];
}

export type WithdrawalStatus = 'PENDING' | 'APPROVED' | 'SENT' | 'FAILED';

export interface WithdrawalRequest {
  id: string;
  userId: string;
  tonAddress: string;
  grossAmount: number;
  feeAmount: number;
  netAmount: number;
  status: WithdrawalStatus;
  idempotencyKey: string;
  externalTxId: string | null;
  failureReason: string | null;
  approvedAt: string | null;
  sentAt: string | null;
  failedAt: string | null;
  createdAt: string;
  updatedAt: string;
}

// ─── Referral ────────────────────────────────────────

export interface ReferralInfo {
  code: string;
  link: string;
  count: number;
  earnedStars: number;
}

// ─── Auth ────────────────────────────────────────────

export interface LoginRequest {
  initData: string;
  referralCode?: string;
}

export interface LoginResponse {
  accessToken: string;
  user: User;
}

// ─── API envelope ────────────────────────────────────

export interface ApiSuccess<T> {
  data: T;
}

export interface ApiError {
  error: string;
  code: string;
  statusCode: number;
}

export type ApiResponse<T> = ApiSuccess<T> | ApiError;

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  hasMore: boolean;
}
