import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { api } from '../lib/api';
import type { Flow, FlowTriggerType } from '@unisouq/shared';

export function useFlows() {
  return useQuery<Flow[]>({
    queryKey: ['flows'],
    queryFn: () => api.get<Flow[]>('/flows'),
  });
}

export function useCreateFlow() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: { name: string; triggerType: FlowTriggerType; triggerConfig?: Record<string, unknown> }) =>
      api.post<Flow>('/flows', input),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['flows'] });
    },
  });
}

export function usePublishFlow() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (flowId: string) => api.post<Flow>(`/flows/${flowId}/publish`),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['flows'] });
    },
  });
}

export function useArchiveFlow() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (flowId: string) => api.post<Flow>(`/flows/${flowId}/archive`),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['flows'] });
    },
  });
}

