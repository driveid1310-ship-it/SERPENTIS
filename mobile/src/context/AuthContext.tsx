import React, {
  createContext,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as authService from '../services/authService';
import { saveToken, getToken, clearToken } from '../utils/storage';
import { setUnauthorizedHandler } from '../config/axios';
import { disconnectSocket } from '../services/socket';
import type { User } from '../types/user';
import type {
  AuthContextValue,
  LoginCredentials,
  RegisterCredentials,
} from '../types/auth';

const CACHED_USER_KEY = '@serpentis/cached_user_v1';

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
    disconnectSocket();
    await clearToken();
    await AsyncStorage.removeItem(CACHED_USER_KEY).catch(() => undefined);
    setUser(null);
    setToken(null);
  }, []);

  const persistUserCache = useCallback(async (userData: User) => {
    await AsyncStorage.setItem(CACHED_USER_KEY, JSON.stringify(userData)).catch(
      () => undefined,
    );
  }, []);

  const login = useCallback(async (credentials: LoginCredentials) => {
    setLoading(true);
    try {
      const authData = await authService.login(credentials);
      await saveToken(authData.token);
      await persistUserCache(authData.user);
      setToken(authData.token);
      setUser(authData.user);
    } finally {
      setLoading(false);
    }
  }, [persistUserCache]);

  const register = useCallback(async (credentials: RegisterCredentials) => {
    setLoading(true);
    try {
      const authData = await authService.register(credentials);
      await saveToken(authData.token);
      await persistUserCache(authData.user);
      setToken(authData.token);
      setUser(authData.user);
    } finally {
      setLoading(false);
    }
  }, [persistUserCache]);

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
      await persistUserCache(currentUser);
    } catch {
      // Intentionally silent — leave existing user state untouched.
    }
  }, [persistUserCache]);

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
        await persistUserCache(currentUser);
      } catch (err: unknown) {
        const status = (err as { response?: { status?: number } })?.response?.status;
        if (status === 401 || status === 403) {
          await clearSession();
        } else {
          // Preserve token across transient offline/network failures on startup.
          const cachedRaw = await AsyncStorage.getItem(CACHED_USER_KEY).catch(
            () => null,
          );
          if (cachedRaw && isMounted) {
            try {
              setUser(JSON.parse(cachedRaw) as User);
            } catch {
              await clearSession();
            }
          } else {
            await clearSession();
          }
        }
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
  }, [clearSession, persistUserCache]);

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
