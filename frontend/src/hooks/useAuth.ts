import { useCallback, useEffect, useRef, useState } from 'react';
import { api, setAuthToken, clearAuthToken, getAuthToken } from '../lib/api';
import { getInitData } from '../lib/telegram';
import type { User, LoginResponse } from '@unisouq/shared';

export function useAuth() {
  const [isAuthenticated, setIsAuthenticated] = useState(!!getAuthToken());
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const cancelledRef = useRef(false);

  const login = useCallback(async () => {
    setError(null);
    setIsLoading(true);
    try {
      const initData = getInitData();
      if (!initData) {
        if (!cancelledRef.current) setIsLoading(false);
        return;
      }

      const referralCode = new URLSearchParams(window.location.search).get('ref') || undefined;
      const res = await api.post<LoginResponse>('/auth/login', { initData, referralCode });
      if (cancelledRef.current) return;

      setAuthToken(res.accessToken);
      setUser(res.user);
      setIsAuthenticated(true);
    } catch (e) {
      if (cancelledRef.current) return;
      clearAuthToken();
      setIsAuthenticated(false);
      setError(e instanceof Error ? e.message : 'Login failed');
    } finally {
      if (!cancelledRef.current) setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    cancelledRef.current = false;
    login();
    return () => {
      cancelledRef.current = true;
    };
  }, [login]);

  return { isAuthenticated, isLoading, error, user, retry: login };
}
