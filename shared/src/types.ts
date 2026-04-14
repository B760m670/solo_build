// ─── User ────────────────────────────────────────────
export interface User {
  id: string;
  telegramId: number;
  username: string | null;
  firstName: string;
  lastName: string | null;
  avatarUrl: string | null;
  isPremium: boolean;
  premiumExpiry: string | null;
  role?: 'USER' | 'ADMIN' | 'MODERATOR';
  isAdmin?: boolean;
  brbBalance: number;
  totalEarned: number;
  tonWallet: string | null;
  referralCode: string;
  referredBy: string | null;
  referralCount: number;
  referralEarned: number;
  language: string;
  theme: string;
  createdAt: string;
  updatedAt: string;
}

// ─── Task ────────────────────────────────────────────
export interface Task {
  id: string;
  title: string;
  description: string;
  category: TaskCategory;
  verificationType?: 'MANUAL' | 'AUTO_CONNECT_WALLET' | 'AUTO_FIRST_LISTING' | 'AUTO_FIRST_PURCHASE';
  verificationPolicy: VerificationPolicy | null;
  reward: number;
  timeMinutes: number;
  brand: string;
  sponsorName: string | null;
  sponsorType: string | null;
  sponsorBudgetCurrency: 'TON' | 'STARS' | null;
  sponsorBudgetAmount: number | null;
  sponsorBudgetSpent: number;
  kpiName: string | null;
  kpiTarget: number | null;
  kpiUnit: string | null;
  audienceRules: Record<string, unknown> | null;
  cooldownSeconds: number;
  minReputation: number;
  minAccountAgeDays: number;
  brandLogo: string | null;
  isActive: boolean;
  totalSlots: number;
  filledSlots: number;
  expiresAt: string | null;
  createdAt: string;
}

export interface VerificationPolicy {
  proofType: 'TEXT' | 'LINK' | 'SCREENSHOT_URL' | 'JSON';
  requiredFields: string[];
  autoCheckRules: string[];
  minTextLength?: number;
}

export type TaskCategory = 'survey' | 'review' | 'test' | 'subscribe';

export interface UserTask {
  id: string;
  userId: string;
  taskId: string;
  status: UserTaskStatus;
  proof: string | null;
  proofData: TaskProofData | null;
  deviceFingerprint?: string | null;
  riskScore?: number;
  riskFlags?: string[];
  submittedAt?: string | null;
  reviewedAt?: string | null;
  reviewNote?: string | null;
  completedAt: string | null;
  createdAt: string;
  task?: Task;
}

export interface TaskProofData {
  text?: string;
  link?: string;
  screenshotUrl?: string;
  metadata?: Record<string, unknown>;
}

export type UserTaskStatus =
  | 'PENDING'
  | 'ACTIVE'
  | 'SUBMITTED'
  | 'COMPLETED'
  | 'REJECTED';

// ─── Marketplace ─────────────────────────────────────
export interface Listing {
  id: string;
  sellerId: string;
  title: string;
  description: string;
  price: number;
  category: string;
  images: string[];
  isActive: boolean;
  createdAt: string;
  seller?: Pick<User, 'id' | 'username' | 'firstName' | 'avatarUrl'>;
}

export interface Order {
  id: string;
  buyerId: string;
  listingId: string;
  amount: number;
  commission: number;
  status: OrderStatus;
  createdAt: string;
  listing?: Listing;
}

export type OrderStatus = 'PENDING' | 'COMPLETED' | 'CANCELLED' | 'DISPUTED';

// ─── Wallet ──────────────────────────────────────────
export interface Transaction {
  id: string;
  userId: string;
  type: TransactionType;
  amount: number;
  balanceBefore: number;
  balanceAfter: number;
  meta: Record<string, unknown> | null;
  createdAt: string;
}

export type TransactionType =
  | 'TASK_REWARD'
  | 'MARKETPLACE_PURCHASE'
  | 'MARKETPLACE_SALE'
  | 'MARKETPLACE_COMMISSION'
  | 'REFERRAL_BONUS'
  | 'WITHDRAWAL'
  | 'WITHDRAWAL_FEE'
  | 'BRB_TRANSFER_OUT'
  | 'BRB_TRANSFER_IN'
  | 'PREMIUM_PURCHASE'
  | 'DEPOSIT';

export interface WalletInfo {
  balance: number;
  totalEarned: number;
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

// ─── Subscription ────────────────────────────────────
export interface Subscription {
  id: string;
  userId: string;
  plan: 'PREMIUM';
  startsAt: string;
  expiresAt: string;
  isActive: boolean;
}

// ─── Referral ────────────────────────────────────────
export interface ReferralInfo {
  code: string;
  link: string;
  count: number;
  earned: number;
}

// ─── API Response ────────────────────────────────────
export interface ApiSuccess<T> {
  data: T;
}

export interface ApiError {
  error: string;
  code: string;
  statusCode: number;
}

export type ApiResponse<T> = ApiSuccess<T> | ApiError;

// ─── Auth ────────────────────────────────────────────
export interface LoginRequest {
  initData: string;
  referralCode?: string;
}

export interface LoginResponse {
  accessToken: string;
  user: User;
}

// ─── Pagination ──────────────────────────────────────
export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  hasMore: boolean;
}
