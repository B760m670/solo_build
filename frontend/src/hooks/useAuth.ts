import { useState, useEffect } from 'react';
import { api, setAuthToken, getAuthToken } from '../lib/api';
import { getInitData, getStartParam } from '../lib/telegram';
import type { User, LoginResponse } from '@brabble/shared';

interface AuthState {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  error: string | null;
}

export function useAuth(): AuthState {
  const [state, setState] = useState<AuthState>({
    user: null,
    isLoading: true,
    isAuthenticated: false,
    error: null,
  });

  useEffect(() => {
    async function authenticate() {
      // If we already have a token, try to fetch user
      const existingToken = getAuthToken();
      if (existingToken) {
        try {
          const user = await api.get<User>('/auth/me');
          setState({ user, isLoading: false, isAuthenticated: true, error: null });
          return;
        } catch {
          // Token expired — fall through to re-login
        }
      }

      // Login with Telegram initData
      const initData = getInitData();
      if (!initData) {
        setState({
          user: null,
          isLoading: false,
          isAuthenticated: false,
          error: null,
        });
        return;
      }

      try {
        const referralCode = getStartParam();
        const result = await api.post<LoginResponse>('/auth/login', {
          initData,
          referralCode,
        });
        setAuthToken(result.accessToken);
        setState({
          user: result.user,
          isLoading: false,
          isAuthenticated: true,
          error: null,
        });
      } catch (err) {
        setState({
          user: null,
          isLoading: false,
          isAuthenticated: false,
          error: err instanceof Error ? err.message : 'Login failed',
        });
      }
    }

    authenticate();
  }, []);

  return state;
}
