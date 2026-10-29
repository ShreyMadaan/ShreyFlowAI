
import { useState } from "react";
import { GoogleLogin } from "@react-oauth/google";
import {
  ArrowRight,
  Eye,
  EyeOff,
  KanbanSquare,
  LockKeyhole,
  Mail,
  Moon,
  Sparkles,
  Sun,
  UserRound,
} from "lucide-react";

import { useAuth } from "../../context/AuthContext";
import { useTheme } from "../../context/ThemeContext";

function AuthPage() {
  const {
    login,
    register,
    googleLogin,
  } = useAuth();

  const { theme, toggleTheme } = useTheme();

  const [mode, setMode] = useState("login");
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
  });
  const [showPassword, setShowPassword] =
    useState(false);
  const [isSubmitting, setIsSubmitting] =
    useState(false);
  const [error, setError] = useState("");

  const isSignup = mode === "signup";
  const googleConfigured = Boolean(
    import.meta.env.VITE_GOOGLE_CLIENT_ID
  );

  const updateField = (field, value) => {
    setForm((previous) => ({
      ...previous,
      [field]: value,
    }));
    setError("");
  };

  const switchMode = () => {
    setMode((previous) =>
      previous === "login"
        ? "signup"
        : "login"
    );
    setError("");
    setShowPassword(false);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (isSubmitting) return;

    const email = form.email.trim();
    const password = form.password;

    if (!email || !password) {
      setError(
        "Email and password are required."
      );
      return;
    }

    if (isSignup) {
      const name = form.name.trim();
      const passwordBytes =
        new TextEncoder().encode(
          password
        ).length;

      if (
        name.length < 2 ||
        name.length > 80
      ) {
        setError(
          "Name must contain between 2 and 80 characters."
        );
        return;
      }

      if (
        passwordBytes < 8 ||
        passwordBytes > 72
      ) {
        setError(
          "Password must contain between 8 and 72 UTF-8 bytes."
        );
        return;
      }
    }

    setIsSubmitting(true);
    setError("");

    try {
      if (isSignup) {
        await register({
          name: form.name.trim(),
          email,
          password,
        });
      } else {
        await login({ email, password });
      }
    } catch (err) {
      setError(
        err.message ||
          "Authentication failed."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleGoogleSuccess = async (
    credentialResponse
  ) => {
    if (isSubmitting) return;

    const credential =
      credentialResponse?.credential;

    if (!credential) {
      setError(
        "Google did not return a valid credential."
      );
      return;
    }

    setIsSubmitting(true);
    setError("");

    try {
      await googleLogin(credential);
    } catch (err) {
      setError(
        err.message ||
          "Google sign-in failed."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const inputClass =
    "h-12 w-full rounded-xl border border-app-border " +
    "bg-surface pl-11 pr-4 text-sm text-primary " +
    "outline-none transition-colors " +
    "placeholder:text-muted focus:border-violet-500 " +
    "disabled:opacity-60";

  return (
    <div className="min-h-screen bg-app text-primary">
      <div className="grid min-h-screen lg:grid-cols-2">
        {/* Brand Panel */}
        <aside className="relative hidden overflow-hidden bg-slate-950 p-12 text-white lg:flex lg:flex-col lg:justify-between xl:p-20">
          <div className="pointer-events-none absolute -right-32 -top-32 h-96 w-96 rounded-full bg-violet-600/20 blur-3xl" />
          <div className="pointer-events-none absolute -bottom-32 -left-32 h-96 w-96 rounded-full bg-indigo-600/20 blur-3xl" />

          <div className="relative z-10 flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-violet-600">
              <KanbanSquare size={24} />
            </div>

            <div>
              <h1 className="text-xl font-bold">
                ShreyFlowAI
              </h1>
              <p className="text-xs text-slate-400">
                Intelligent workflow management
              </p>
            </div>
          </div>

          <div className="relative z-10 max-w-lg">
            <div className="mb-8 inline-flex items-center gap-2 rounded-full border border-violet-400/20 bg-violet-500/10 px-4 py-2 text-xs font-medium text-violet-300">
              <Sparkles size={15} />
              Your personal workspace
            </div>

            <h2 className="text-5xl font-bold leading-tight tracking-tight">
              Organize work.
              <br />
              <span className="text-violet-400">
                Build momentum.
              </span>
            </h2>

            <p className="mt-6 max-w-md text-base leading-8 text-slate-400">
              Plan your tasks, track progress,
              and stay focused with a modern
              Kanban workspace built around you.
            </p>
          </div>

          <p className="relative z-10 text-xs text-slate-500">
            ShreyFlowAI — Work smarter, every day.
          </p>
        </aside>

        {/* Authentication Panel */}
        <main className="flex min-h-screen flex-col px-5 py-6 sm:px-10 lg:px-12 xl:px-20">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 lg:hidden">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-violet-600 text-white">
                <KanbanSquare size={21} />
              </div>
              <span className="font-bold">
                ShreyFlowAI
              </span>
            </div>

            <button
              type="button"
              onClick={toggleTheme}
              aria-label="Toggle color theme"
              className="ml-auto flex h-10 w-10 items-center justify-center rounded-xl border border-app-border bg-surface hover:bg-surface-secondary"
            >
              {theme === "dark" ? (
                <Sun size={19} />
              ) : (
                <Moon size={19} />
              )}
            </button>
          </div>

          <div className="mx-auto flex w-full max-w-md flex-1 flex-col justify-center py-12">
            <div className="mb-8">
              <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-2xl bg-violet-500/10 text-violet-500">
                <LockKeyhole size={23} />
              </div>

              <h2 className="text-3xl font-bold tracking-tight">
                {isSignup
                  ? "Create your account"
                  : "Welcome back"}
              </h2>

              <p className="mt-3 text-sm text-muted">
                {isSignup
                  ? "Start organizing your workflow."
                  : "Sign in to access your workspace."}
              </p>
            </div>

            {/* Google Sign-in */}
            {googleConfigured && (
              <div
                className={
                  "flex min-h-11 justify-center " +
                  (isSubmitting
                    ? "pointer-events-none opacity-50"
                    : "")
                }
                aria-label="Google authentication"
              >
                <GoogleLogin
                  key={theme}
                  onSuccess={handleGoogleSuccess}
                  onError={() =>
                    setError(
                      "Google sign-in failed. Please try again."
                    )
                  }
                  theme={
                    theme === "dark"
                      ? "filled_black"
                      : "outline"
                  }
                  size="large"
                  shape="rectangular"
                  text="continue_with"
                  width="320"
                />
              </div>
            )}

            {googleConfigured && (
              <div className="my-7 flex items-center gap-3">
                <div className="h-px flex-1 bg-app-border" />
                <span className="text-xs text-muted">
                  or continue with email
                </span>
                <div className="h-px flex-1 bg-app-border" />
              </div>
            )}

            <form
              onSubmit={handleSubmit}
              className="space-y-5"
              aria-busy={isSubmitting}
            >
              {isSignup && (
                <div>
                  <label
                    htmlFor="auth-name"
                    className="mb-2 block text-sm font-medium"
                  >
                    Full name
                  </label>
                  <div className="relative">
                    <UserRound
                      size={18}
                      className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-muted"
                    />
                    <input
                      id="auth-name"
                      type="text"
                      autoComplete="name"
                      placeholder="Your name"
                      required
                      minLength={2}
                      maxLength={80}
                      disabled={isSubmitting}
                      value={form.name}
                      onChange={(event) =>
                        updateField(
                          "name",
                          event.target.value
                        )
                      }
                      className={inputClass}
                    />
                  </div>
                </div>
              )}

              <div>
                <label
                  htmlFor="auth-email"
                  className="mb-2 block text-sm font-medium"
                >
                  Email address
                </label>
                <div className="relative">
                  <Mail
                    size={18}
                    className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-muted"
                  />
                  <input
                    id="auth-email"
                    type="email"
                    autoComplete="email"
                    placeholder="you@example.com"
                    required
                    disabled={isSubmitting}
                    value={form.email}
                    onChange={(event) =>
                      updateField(
                        "email",
                        event.target.value
                      )
                    }
                    className={inputClass}
                  />
                </div>
              </div>

              <div>
                <label
                  htmlFor="auth-password"
                  className="mb-2 block text-sm font-medium"
                >
                  Password
                </label>
                <div className="relative">
                  <LockKeyhole
                    size={18}
                    className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-muted"
                  />
                  <input
                    id="auth-password"
                    type={
                      showPassword
                        ? "text"
                        : "password"
                    }
                    autoComplete={
                      isSignup
                        ? "new-password"
                        : "current-password"
                    }
                    placeholder="Enter password"
                    required
                    disabled={isSubmitting}
                    value={form.password}
                    onChange={(event) =>
                      updateField(
                        "password",
                        event.target.value
                      )
                    }
                    className={
                      inputClass + " pr-12"
                    }
                  />
                  <button
                    type="button"
                    onClick={() =>
                      setShowPassword(
                        (previous) => !previous
                      )
                    }
                    aria-label={
                      showPassword
                        ? "Hide password"
                        : "Show password"
                    }
                    className="absolute right-3 top-1/2 flex h-9 w-9 -translate-y-1/2 items-center justify-center text-muted hover:text-primary"
                  >
                    {showPassword ? (
                      <EyeOff size={18} />
                    ) : (
                      <Eye size={18} />
                    )}
                  </button>
                </div>

                {isSignup && (
                  <p className="mt-2 text-xs text-muted">
                    Minimum 8 characters.
                  </p>
                )}
              </div>

              {error && (
                <div
                  role="alert"
                  className="rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-500"
                >
                  {error}
                </div>
              )}

              <button
                type="submit"
                disabled={isSubmitting}
                className="flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-violet-600 font-semibold text-white transition-colors hover:bg-violet-700 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {isSubmitting
                  ? "Please wait..."
                  : isSignup
                    ? "Create account"
                    : "Sign in"}
                {!isSubmitting && (
                  <ArrowRight size={18} />
                )}
              </button>
            </form>

            <p className="mt-7 text-center text-sm text-muted">
              {isSignup
                ? "Already have an account?"
                : "Don't have an account?"}
              {" "}
              <button
                type="button"
                onClick={switchMode}
                disabled={isSubmitting}
                className="font-semibold text-violet-500 hover:underline"
              >
                {isSignup
                  ? "Sign in"
                  : "Create an account"}
              </button>
            </p>
          </div>
        </main>
      </div>
    </div>
  );
}

export default AuthPage;
