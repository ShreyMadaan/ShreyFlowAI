
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

import { authApi } from "../services/authApi";

const AuthContext = createContext(null);

const REFRESH_EARLY_MS = 60 * 1000;
const RETRY_DELAY_MS = 30 * 1000;

export function AuthProvider({ children }) {
  const [session, setSession] =
    useState(null);

  const [isInitializing, setIsInitializing] =
    useState(true);

  const [
    initializationError,
    setInitializationError,
  ] = useState(null);

  const refreshPromiseRef = useRef(null);
  const sessionVersionRef = useRef(0);

  // ==========================================
  // Store authenticated session in memory
  // ==========================================

  const saveSession = useCallback((data) => {
    if (
      !data?.token ||
      !data?.user ||
      !Number.isFinite(data.expiresIn) ||
      data.expiresIn <= 0
    ) {
      throw new Error(
        "Invalid authentication response"
      );
    }

    const nextSession = {
      token: data.token,
      user: data.user,
      expiresAt:
        Date.now() + data.expiresIn * 1000,
    };

    setSession(nextSession);

    return nextSession;
  }, []);

  const clearSession = useCallback(() => {
    sessionVersionRef.current += 1;
    setSession(null);
  }, []);

  // ==========================================
  // Login with email/password
  // ==========================================

  const login = useCallback(
    async ({ email, password }) => {
      const data = await authApi.login({
        email,
        password,
      });

      sessionVersionRef.current += 1;

      return saveSession(data).user;
    },
    [saveSession]
  );

  // ==========================================
  // Register and then login
  // ==========================================

  const register = useCallback(
    async ({ name, email, password }) => {
      await authApi.register({
        name,
        email,
        password,
      });

      return login({
        email,
        password,
      });
    },
    [login]
  );

  // ==========================================
  // Google login/signup
  // ==========================================

  const googleLogin = useCallback(
    async (credential) => {
      const data =
        await authApi.googleLogin(
          credential
        );

      sessionVersionRef.current += 1;

      return saveSession(data).user;
    },
    [saveSession]
  );

  // ==========================================
  // Restore or refresh session
  // ==========================================

  const refreshSession = useCallback(
    async () => {
      // Multiple requests must share one
      // refresh operation to prevent
      // concurrent token rotation.
      if (refreshPromiseRef.current) {
        return refreshPromiseRef.current;
      }

      const version =
        sessionVersionRef.current;

      const refreshPromise = (
        async () => {
          try {
            const data =
              await authApi.refresh();

            // Ignore results from an obsolete
            // session (e.g. after logout).
            if (
              version !==
              sessionVersionRef.current
            ) {
              return null;
            }

            return saveSession(data);
          } catch (error) {
            if (
              error.status === 401 &&
              version ===
                sessionVersionRef.current
            ) {
              clearSession();
            }

            throw error;
          }
        }
      )();

      refreshPromiseRef.current =
        refreshPromise;

      try {
        return await refreshPromise;
      } finally {
        if (
          refreshPromiseRef.current ===
          refreshPromise
        ) {
          refreshPromiseRef.current = null;
        }
      }
    },
    [saveSession, clearSession]
  );

  // ==========================================
  // Restore session on application startup
  // ==========================================

  useEffect(() => {
    let active = true;

    const restoreSession = async () => {
      try {
        await refreshSession();

        if (active) {
          setInitializationError(null);
        }
      } catch (error) {
        if (
          active &&
          error.status !== 401
        ) {
          setInitializationError(
            error.message
          );
        }
      } finally {
        if (active) {
          setIsInitializing(false);
        }
      }
    };

    restoreSession();

    return () => {
      active = false;
    };
  }, [refreshSession]);

  // ==========================================
  // Automatically renew access token
  // ==========================================

  useEffect(() => {
    if (!session) return;

    let active = true;
    let timeoutId;

    const renew = async () => {
      try {
        await refreshSession();
      } catch (error) {
        // A 401 clears the session.
        // Temporary network failures are
        // retried instead of logging out.
        if (
          active &&
          error.status !== 401
        ) {
          timeoutId = setTimeout(
            renew,
            RETRY_DELAY_MS
          );
        }
      }
    };

    const delay = Math.max(
      0,
      session.expiresAt -
        Date.now() -
        REFRESH_EARLY_MS
    );

    timeoutId = setTimeout(
      renew,
      delay
    );

    return () => {
      active = false;
      clearTimeout(timeoutId);
    };
  }, [session, refreshSession]);

  // ==========================================
  // Server-side logout
  // ==========================================

  const logout = useCallback(async () => {
    // Only clear the local session after
    // the server confirms revocation.
    await authApi.logout();

    clearSession();
  }, [clearSession]);

  const value = useMemo(
    () => ({
      user: session?.user ?? null,
      token: session?.token ?? null,

      isAuthenticated:
        Boolean(session),

      isInitializing,
      initializationError,

      login,
      register,
      googleLogin,
      refreshSession,
      logout,
    }),
    [
      session,
      isInitializing,
      initializationError,
      login,
      register,
      googleLogin,
      refreshSession,
      logout,
    ]
  );

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(
    AuthContext
  );

  if (!context) {
    throw new Error(
      "useAuth must be used within AuthProvider"
    );
  }

  return context;
}
