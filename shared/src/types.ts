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
  reward: number;
  timeMinutes: number;
  brand: string;
  brandLogo: string | null;
  isActive: boolean;
  totalSlots: number;
  filledSlots: number;
  expiresAt: string | null;
  createdAt: string;
}

export type TaskCategory = 'survey' | 'review' | 'test' | 'subscribe';

export interface UserTask {
  id: string;
  userId: string;
  taskId: string;
  status: UserTaskStatus;
  proof: string | null;
  completedAt: string | null;
  createdAt: string;
  task?: Task;
}

export type UserTaskStatus = 'PENDING' | 'ACTIVE' | 'COMPLETED' | 'REJECTED';

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
  | 'PREMIUM_PURCHASE'
  | 'DEPOSIT';

export interface WalletInfo {
  balance: number;
  totalEarned: number;
  recentTransactions: Transaction[];
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
