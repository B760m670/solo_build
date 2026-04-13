import { useQuery } from '@tanstack/react-query';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { api, getAuthToken } from '../lib/api';
import type { Task } from '@brabble/shared';

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

interface AdminTaskSubmission {
  id: string;
  userId: string;
  taskId: string;
  status: string;
  proof: string | null;
  completedAt: string | null;
  createdAt: string;
  task: { id: string; title: string; brand: string; reward: number; category: string };
  user: { id: string; telegramId: number; username: string | null; firstName: string; avatarUrl: string | null; brbBalance: number };
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

export function useAdminTasks(limit = 50) {
  return useQuery({
    queryKey: ['admin', 'tasks', limit],
    queryFn: () => api.get<Task[]>(`/admin/tasks?limit=${limit}`),
    enabled: !!getAuthToken(),
    retry: false,
  });
}

export function useAdminCreateTask() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: {
      title: string;
      description: string;
      category: string;
      reward: number;
      timeMinutes: number;
      brand: string;
      totalSlots?: number;
      expiresAt?: string;
      isActive?: boolean;
    }) => api.post<Task>('/admin/tasks', data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin', 'tasks'] });
      qc.invalidateQueries({ queryKey: ['admin', 'dashboard'] });
    },
  });
}

export function useAdminToggleTask() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (taskId: string) => api.post<Task>(`/admin/tasks/${taskId}/toggle`, {}),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin', 'tasks'] });
      qc.invalidateQueries({ queryKey: ['admin', 'dashboard'] });
    },
  });
}

export function useAdminTaskSubmissions(limit = 50) {
  return useQuery({
    queryKey: ['admin', 'taskSubmissions', limit],
    queryFn: () => api.get<AdminTaskSubmission[]>(`/admin/tasks/submissions?limit=${limit}`),
    enabled: !!getAuthToken(),
    retry: false,
  });
}

export function useAdminApproveSubmission() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (userTaskId: string) => api.post(`/admin/tasks/submissions/${userTaskId}/approve`),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin', 'taskSubmissions'] });
      qc.invalidateQueries({ queryKey: ['admin', 'dashboard'] });
    },
  });
}

export function useAdminRejectSubmission() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ userTaskId, reason }: { userTaskId: string; reason?: string }) =>
      api.post(`/admin/tasks/submissions/${userTaskId}/reject`, { reason }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin', 'taskSubmissions'] });
      qc.invalidateQueries({ queryKey: ['admin', 'dashboard'] });
    },
  });
}
