
import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

import { authApi } from "../services/authApi";
import { AuthContext } from "./AuthContext";

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
  // Email/password login
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
  // Registration
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

            // Prevent an obsolete request from
            // restoring a session after logout.
            if (
              version !==
              sessionVersionRef.current
            ) {
              return null;
            }

            setInitializationError(null);

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
  // Proactive access-token renewal
  // ==========================================

  useEffect(() => {
    if (!session) return;

    let active = true;
    let timeoutId;

    const renew = async () => {
      try {
        await refreshSession();
      } catch (error) {
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
    await authApi.logout();

    clearSession();
  }, [clearSession]);

  // ==========================================
  // Context value
  // ==========================================

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
