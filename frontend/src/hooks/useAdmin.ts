import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../lib/api';
import type { Order, ReputationTier, Task, TaskProofType, UserTask } from '@unisouq/shared';

export interface CreateBrandTaskInput {
  brandName: string;
  brandLogo?: string;
  title: string;
  description: string;
  proofType: TaskProofType;
  rewardStars: number;
  totalSlots: number;
  fundedTon: number;
}

export interface AdminDashboard {
  users: { total: number; recentSignups: number; tiers: Record<ReputationTier, number> };
  listings: { total: number; active: number };
  orders: { total: number; completed: number };
  economy: { gmvStars: number; commissionStars: number };
  tasks: { total: number; active: number; pendingReview: number };
}

export function useAdminDashboard() {
  return useQuery<AdminDashboard>({
    queryKey: ['admin', 'dashboard'],
    queryFn: () => api.get<AdminDashboard>('/admin/dashboard'),
  });
}

export function useAdminPendingTasks() {
  return useQuery<UserTask[]>({
    queryKey: ['admin', 'tasks', 'pending'],
    queryFn: () => api.get<UserTask[]>('/admin/tasks/pending'),
  });
}

export function useAdminDisputes() {
  return useQuery<Order[]>({
    queryKey: ['admin', 'disputes'],
    queryFn: () => api.get<Order[]>('/admin/disputes'),
  });
}

export function useAdminApproveTask() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (userTaskId: string) => api.post<UserTask>(`/admin/tasks/${userTaskId}/approve`),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin'] });
    },
  });
}

export function useAdminCreateBrandTask() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: CreateBrandTaskInput) => api.post<Task>('/admin/tasks', input),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin'] });
      qc.invalidateQueries({ queryKey: ['tasks'] });
    },
  });
}

export function useAdminRejectTask() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ userTaskId, reason }: { userTaskId: string; reason?: string }) =>
      api.post<UserTask>(`/admin/tasks/${userTaskId}/reject`, { reason }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin'] });
    },
  });
}
