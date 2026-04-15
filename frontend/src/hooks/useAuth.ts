import { useEffect, useState } from 'react';
import { api, setAuthToken, clearAuthToken, getAuthToken } from '../lib/api';
import { getInitData } from '../lib/telegram';
import type { User, LoginResponse } from '@unisouq/shared';

export function useAuth() {
  const [isAuthenticated, setIsAuthenticated] = useState(!!getAuthToken());
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function run() {
      try {
        const initData = getInitData();
        if (!initData) {
          if (!cancelled) setIsLoading(false);
          return;
        }

        const referralCode = new URLSearchParams(window.location.search).get('ref') || undefined;
        const res = await api.post<LoginResponse>('/auth/login', { initData, referralCode });
        if (cancelled) return;

        setAuthToken(res.accessToken);
        setUser(res.user);
        setIsAuthenticated(true);
      } catch (e) {
        if (cancelled) return;
        clearAuthToken();
        setIsAuthenticated(false);
        setError(e instanceof Error ? e.message : 'Login failed');
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    }

    run();
    return () => {
      cancelled = true;
    };
  }, []);

  return { isAuthenticated, isLoading, error, user };
}
