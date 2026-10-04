import React, {
  createContext,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from 'react';
import * as authService from '../services/authService';
import { saveToken, getToken, clearToken } from '../utils/storage';
import { setUnauthorizedHandler } from '../config/axios';
import type { User } from '../types/user';
import type {
  AuthContextValue,
  LoginCredentials,
  RegisterCredentials,
} from '../types/auth';

export const AuthContext = createContext<AuthContextValue | undefined>(
  undefined,
);

interface AuthProviderProps {
  children: React.ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  const clearSession = useCallback(async () => {
    await clearToken();
    setUser(null);
    setToken(null);
  }, []);

  const login = useCallback(async (credentials: LoginCredentials) => {
    setLoading(true);
    try {
      const authData = await authService.login(credentials);
      await saveToken(authData.token);
      setToken(authData.token);
      setUser(authData.user);
    } finally {
      setLoading(false);
    }
  }, []);

  const register = useCallback(async (credentials: RegisterCredentials) => {
    setLoading(true);
    try {
      const authData = await authService.register(credentials);
      await saveToken(authData.token);
      setToken(authData.token);
      setUser(authData.user);
    } finally {
      setLoading(false);
    }
  }, []);

  const logout = useCallback(async () => {
    setLoading(true);
    try {
      await clearSession();
    } finally {
      setLoading(false);
    }
  }, [clearSession]);

  // Re-fetches the current user via the same GET /auth/me path already
  // used during session restore, so screens can pick up server-side
  // changes (e.g. trustScore updates) without a full logout/login cycle.
  // Failures are silently ignored — this is a background refresh, not a
  // session-validity check, so it must not trigger a logout on failure.
  const refreshUser = useCallback(async () => {
    try {
      const currentUser = await authService.getCurrentUser();
      setUser(currentUser);
    } catch {
      // Intentionally silent — leave existing user state untouched.
    }
  }, []);

  // Register the 401 handler exactly once so the Axios interceptor can
  // trigger a logout without config/axios.ts importing this context.
  useEffect(() => {
    setUnauthorizedHandler(() => {
  clearSession().catch(console.error);
});

    return () => setUnauthorizedHandler(null);
  }, [clearSession]);

  // Restore the session on app start: read the stored token, then
  // validate it against GET /auth/me. If it's missing or invalid,
  // fall back to a logged-out state.
  useEffect(() => {
    let isMounted = true;

    async function restoreSession() {
      try {
        const storedToken = await getToken();

        if (!storedToken) {
          return;
        }

        if (isMounted) {
          setToken(storedToken);
        }

        const currentUser = await authService.getCurrentUser();

        if (isMounted) {
          setUser(currentUser);
        }
        } catch {
        await clearSession();
        } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    }
restoreSession().catch(console.error);

    return () => {
      isMounted = false;
    };
  }, [clearSession]);

  const isAuthenticated = useMemo(
    () => Boolean(user && token),
    [user, token],
  );

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      token,
      loading,
      isAuthenticated,
      login,
      register,
      logout,
      refreshUser,
    }),
    [user, token, loading, isAuthenticated, login, register, logout, refreshUser],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
