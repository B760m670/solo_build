// ─── User ────────────────────────────────────────────

export type UserRole = 'USER' | 'ADMIN' | 'MODERATOR';

export type ReputationTier = 'NEW' | 'TRUSTED' | 'EXPERT' | 'ELITE';

export const TIER_COMMISSION_RATE: Record<ReputationTier, number> = {
  NEW: 0.07,
  TRUSTED: 0.05,
  EXPERT: 0.04,
  ELITE: 0.03,
};

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
  completedDeals: number;
  averageRating: number;
  reviewCount: number;

  premiumBadgeUntil: string | null;
  tonAddress: string | null;
  language: string;
  theme: string;

  referralCode: string;
  referredById: string | null;

  createdAt: string;
  updatedAt: string;
}

// ─── Marketplace ─────────────────────────────────────

export type ListingCategory =
  | 'DESIGN'
  | 'WRITING'
  | 'DEVELOPMENT'
  | 'MARKETING'
  | 'VIDEO'
  | 'OTHER';

export interface Listing {
  id: string;
  sellerId: string;
  title: string;
  description: string;
  category: ListingCategory;
  priceStars: number;
  deliveryDays: number;
  coverImage: string | null;
  images: string[];
  isActive: boolean;
  featuredUntil: string | null;
  orderCount: number;
  averageRating: number;
  reviewCount: number;
  createdAt: string;
  updatedAt: string;
  seller?: Pick<
    User,
    'id' | 'username' | 'firstName' | 'avatarUrl' | 'reputationTier' | 'reputationScore' | 'averageRating' | 'reviewCount'
  >;
}

export type OrderStatus =
  | 'PENDING'
  | 'PAID'
  | 'IN_PROGRESS'
  | 'DELIVERED'
  | 'COMPLETED'
  | 'DISPUTED'
  | 'CANCELLED'
  | 'REFUNDED';

export interface Order {
  id: string;
  listingId: string;
  buyerId: string;
  sellerId: string;
  priceStars: number;
  commissionStars: number;
  payoutStars: number;
  commissionRate: number;
  status: OrderStatus;
  deliverable: string | null;
  deliveredAt: string | null;
  completedAt: string | null;
  cancelledAt: string | null;
  disputeReason: string | null;
  invoicePayload: string | null;
  telegramChargeId: string | null;
  paidAt: string | null;
  refundedAt: string | null;
  createdAt: string;
  updatedAt: string;
  listing?: Listing;
  buyer?: Pick<User, 'id' | 'username' | 'firstName' | 'avatarUrl'>;
  seller?: Pick<User, 'id' | 'username' | 'firstName' | 'avatarUrl' | 'reputationTier'>;
}

export interface Review {
  id: string;
  orderId: string;
  authorId: string;
  targetId: string;
  rating: number; // 1..5
  comment: string | null;
  createdAt: string;
  author?: Pick<User, 'id' | 'username' | 'firstName' | 'avatarUrl'>;
}

// ─── Tasks ───────────────────────────────────────────

export type TaskProofType = 'SCREENSHOT' | 'LINK' | 'TEXT';

export interface Task {
  id: string;
  brandName: string;
  brandLogo: string | null;
  title: string;
  description: string;
  proofType: TaskProofType;
  rewardStars: number;
  totalSlots: number;
  filledSlots: number;
  isActive: boolean;
  expiresAt: string | null;
  createdAt: string;
}

export type UserTaskStatus = 'ACTIVE' | 'DELIVERED' | 'APPROVED' | 'REJECTED';

export interface UserTask {
  id: string;
  userId: string;
  taskId: string;
  status: UserTaskStatus;
  proof: string | null;
  rejectReason: string | null;
  deliveredAt: string | null;
  approvedAt: string | null;
  createdAt: string;
  task?: Task;
}

// ─── Wallet ──────────────────────────────────────────

export type Currency = 'STARS' | 'TON';

export type TransactionType =
  | 'SALE_INCOME'
  | 'PURCHASE'
  | 'TASK_REWARD'
  | 'COMMISSION'
  | 'REFERRAL_BONUS'
  | 'FEATURED_BOOST'
  | 'PREMIUM_BADGE'
  | 'BRAND_TASK_FUNDING'
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

// ─── Order placement (Telegram Stars invoice) ───────

export interface PlaceOrderResponse {
  order: Order;
  invoiceLink: string;
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
