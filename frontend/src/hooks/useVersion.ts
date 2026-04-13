import { useQuery } from '@tanstack/react-query';
import { api } from '../lib/api';

interface VersionInfo {
  service: string;
  commit: string;
  nodeEnv: string;
  now: string;
}

export function useVersion() {
  return useQuery({
    queryKey: ['version'],
    queryFn: () => api.get<VersionInfo>('/version'),
    retry: false,
  });
}

