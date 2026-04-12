import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api, getAuthToken } from '../lib/api';
import type { Task, UserTask } from '@brabble/shared';

export function useTasks(category?: string) {
  return useQuery({
    queryKey: ['tasks', category],
    queryFn: () =>
      api.get<Task[]>(`/tasks${category ? `?category=${category}` : ''}`),
    enabled: !!getAuthToken(),
  });
}

export function useTask(id: string) {
  return useQuery({
    queryKey: ['tasks', id],
    queryFn: () => api.get<Task>(`/tasks/${id}`),
    enabled: !!id,
  });
}

export function useUserTasks(status?: string) {
  return useQuery({
    queryKey: ['userTasks', status],
    queryFn: () =>
      api.get<UserTask[]>(
        `/tasks/history${status ? `?status=${status}` : ''}`,
      ),
    enabled: !!getAuthToken(),
  });
}

export function useStartTask() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (taskId: string) =>
      api.post<UserTask>(`/tasks/${taskId}/start`),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['tasks'] });
      qc.invalidateQueries({ queryKey: ['userTasks'] });
    },
  });
}

export function useCompleteTask() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ taskId, proof }: { taskId: string; proof: string }) =>
      api.post<{ status: string }>(`/tasks/${taskId}/complete`, { proof }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['tasks'] });
      qc.invalidateQueries({ queryKey: ['userTasks'] });
      qc.invalidateQueries({ queryKey: ['wallet'] });
      qc.invalidateQueries({ queryKey: ['user'] });
    },
  });
}
