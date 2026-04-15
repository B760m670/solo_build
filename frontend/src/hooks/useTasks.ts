import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../lib/api';
import type { Task, UserTask, UserTaskStatus } from '@unisouq/shared';

export function useAvailableTasks() {
  return useQuery<Task[]>({
    queryKey: ['tasks', 'available'],
    queryFn: () => api.get<Task[]>('/tasks'),
  });
}

export function useMyTasks(status?: UserTaskStatus) {
  return useQuery<UserTask[]>({
    queryKey: ['tasks', 'mine', status],
    queryFn: () => api.get<UserTask[]>(`/tasks/mine${status ? `?status=${status}` : ''}`),
  });
}

export function useStartTask() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (taskId: string) => api.post<UserTask>(`/tasks/${taskId}/start`),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['tasks'] });
    },
  });
}

export function useSubmitTaskProof() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ userTaskId, proof }: { userTaskId: string; proof: string }) =>
      api.post<UserTask>(`/tasks/mine/${userTaskId}/submit`, { proof }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['tasks'] });
    },
  });
}
