import { useQuery } from '@tanstack/react-query';
import { api, getAuthToken } from '../lib/api';

interface DashboardData {
  users: { total: number; premium: number; recentSignups: number };
  tasks: {
    total: number;
    completed: number;
    topTasks: { id: string; title: string; brand: string; filledSlots: number; totalSlots: number; reward: number }[];
  };
  marketplace: { activeListings: number; totalOrders: number; commissionRevenue: number };
  economy: { totalBrbInCirculation: number; totalBrbEarned: number; totalTransactions: number };
}

interface AdminUser {
  id: string;
  telegramId: number;
  username: string | null;
  firstName: string;
  brbBalance: number;
  isPremium: boolean;
  createdAt: string;
  _count: { tasks: number; listings: number };
}

export function useAdminDashboard() {
  return useQuery({
    queryKey: ['admin', 'dashboard'],
    queryFn: () => api.get<DashboardData>('/admin/dashboard'),
    enabled: !!getAuthToken(),
    retry: false,
  });
}

export function useAdminUsers(limit = 20) {
  return useQuery({
    queryKey: ['admin', 'users', limit],
    queryFn: () => api.get<AdminUser[]>(`/admin/users?limit=${limit}`),
    enabled: !!getAuthToken(),
    retry: false,
  });
}
