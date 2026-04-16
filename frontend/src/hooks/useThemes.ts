import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { api } from '../lib/api';
import type { Currency, Theme } from '@unisouq/shared';

export interface UserThemeEntry {
  id: string;
  themeId: string;
  acquiredAt: string;
  theme: Theme;
}

export function useThemeCatalog() {
  return useQuery<Theme[]>({
    queryKey: ['themes', 'catalog'],
    queryFn: () => api.get<Theme[]>('/themes'),
  });
}

export function useMyThemes() {
  return useQuery<UserThemeEntry[]>({
    queryKey: ['themes', 'mine'],
    queryFn: () => api.get<UserThemeEntry[]>('/themes/mine'),
  });
}

export function useBuyTheme() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ themeId, currency }: { themeId: string; currency: Currency }) =>
      api.post<UserThemeEntry>(`/themes/${themeId}/buy`, { currency }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['themes'] });
      qc.invalidateQueries({ queryKey: ['wallet'] });
    },
  });
}

export function useActivateTheme() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (themeId: string | null) =>
      api.post<{ activeThemeId: string | null }>('/themes/activate', { themeId }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['themes'] });
      qc.invalidateQueries({ queryKey: ['user'] });
    },
  });
}
