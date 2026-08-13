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
    }),
    [user, token, loading, isAuthenticated, login, register, logout],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
