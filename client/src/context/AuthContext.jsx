
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

import { authApi } from "../services/authApi";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [session, setSession] = useState(null);

  const login = useCallback(async ({
    email,
    password,
  }) => {
    const data = await authApi.login({
      email,
      password,
    });

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

    setSession({
      token: data.token,
      user: data.user,
      expiresAt:
        Date.now() +
        data.expiresIn * 1000,
    });

    return data.user;
  }, []);

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

  // If expectedToken is supplied, only end
  // the session that owns that token.
  const logout = useCallback(
    (expectedToken) => {
      setSession((previous) => {
        if (
          expectedToken &&
          previous?.token !== expectedToken
        ) {
          return previous;
        }

        return null;
      });
    },
    []
  );

  useEffect(() => {
    if (!session) return;

    const remainingTime =
      session.expiresAt - Date.now();

    if (remainingTime <= 0) {
      logout(session.token);
      return;
    }

    const timeoutId = setTimeout(() => {
      logout(session.token);
    }, remainingTime);

    return () => clearTimeout(timeoutId);
  }, [session, logout]);

  const value = useMemo(
    () => ({
      user: session?.user ?? null,
      token: session?.token ?? null,
      isAuthenticated: Boolean(session),
      login,
      register,
      logout,
    }),
    [session, login, register, logout]
  );

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error(
      "useAuth must be used within AuthProvider"
    );
  }

  return context;
}
