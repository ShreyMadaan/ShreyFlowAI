
import { useState } from "react";
import {
  ArrowRight,
  CheckCircle2,
  Eye,
  EyeOff,
  KanbanSquare,
  LockKeyhole,
  Mail,
  Moon,
  ShieldCheck,
  Sparkles,
  Sun,
  UserRound,
} from "lucide-react";

import { useAuth } from "../../context/AuthContext";
import { useTheme } from "../../context/ThemeContext";

function AuthPage() {
  const { login, register } = useAuth();
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
        "Please enter your email and password."
      );
      return;
    }

    if (isSignup) {
      const name = form.name.trim();

      if (name.length < 2) {
        setError(
          "Name must contain at least 2 characters."
        );
        return;
      }

      const passwordBytes =
        new TextEncoder().encode(
          password
        ).length;

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
        await login({
          email,
          password,
        });
      }

      // AuthContext updates the session.
      // App.jsx will display the dashboard.
    } catch (err) {
      setError(
        err.message ||
          "Authentication failed. Please try again."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-app text-primary">
      <div className="grid min-h-screen lg:grid-cols-2">
        {/* Branding Panel */}
        <section className="relative hidden overflow-hidden bg-slate-950 px-12 py-12 text-white lg:flex lg:flex-col lg:justify-between xl:px-20">
          <div className="pointer-events-none absolute -right-40 -top-40 h-[500px] w-[500px] rounded-full bg-violet-600/20 blur-3xl" />

          <div className="pointer-events-none absolute -bottom-40 -left-40 h-[500px] w-[500px] rounded-full bg-indigo-600/20 blur-3xl" />

          <div className="relative z-10 flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-violet-600">
              <KanbanSquare size={25} />
            </div>

            <div>
              <h1 className="text-xl font-bold tracking-tight">
                ShreyFlowAI
              </h1>

              <p className="text-xs text-slate-400">
                Intelligent workflow management
              </p>
            </div>
          </div>

          <div className="relative z-10 max-w-xl">
            <div className="mb-8 inline-flex items-center gap-2 rounded-full border border-violet-400/20 bg-violet-500/10 px-4 py-2 text-xs font-semibold text-violet-300">
              <Sparkles size={15} />
              Your workspace, reimagined
            </div>

            <h2 className="text-5xl font-bold leading-tight tracking-tight xl:text-6xl">
              Organize work.
              <br />
              <span className="text-violet-400">
                Build momentum.
              </span>
            </h2>

            <p className="mt-6 max-w-md text-base leading-8 text-slate-400">
              Turn your ideas into action with
              a focused Kanban workspace.
              Plan, prioritize, and track
              what matters.
            </p>

            <div className="mt-12 space-y-5">
              {[
                "Organize tasks across workflow stages",
                "Keep your projects and priorities in focus",
                "Access your personal task workspace",
              ].map((feature) => (
                <div
                  key={feature}
                  className="flex items-center gap-3 text-sm text-slate-300"
                >
                  <CheckCircle2
                    size={19}
                    className="shrink-0 text-violet-400"
                  />
                  {feature}
                </div>
              ))}
            </div>
          </div>

          <p className="relative z-10 text-xs text-slate-500">
            ShreyFlowAI — Built for better workflows.
          </p>
        </section>

        {/* Authentication Form */}
        <section className="flex min-h-screen flex-col px-5 py-6 sm:px-10 lg:px-12 xl:px-20">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-2 lg:hidden">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-violet-600 text-white">
                <KanbanSquare size={21} />
              </div>

              <span className="text-lg font-bold">
                ShreyFlowAI
              </span>
            </div>

            <div className="hidden lg:block" />

            <button
              type="button"
              onClick={toggleTheme}
              aria-label={
                theme === "dark"
                  ? "Switch to light mode"
                  : "Switch to dark mode"
              }
              className="ml-auto flex h-10 w-10 items-center justify-center rounded-xl border border-app-border bg-surface transition-colors hover:bg-surface-secondary"
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

              <p className="mt-3 text-sm leading-6 text-muted">
                {isSignup
                  ? "Get started with your personal Kanban workspace."
                  : "Sign in to continue managing your tasks."}
              </p>
            </div>

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
                      placeholder="Enter your name"
                      className="h-12 w-full rounded-xl border border-app-border bg-surface pl-12 pr-4 text-sm text-primary outline-none transition-colors placeholder:text-muted focus:border-violet-500 disabled:opacity-60"
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
                    required
                    disabled={isSubmitting}
                    value={form.email}
                    onChange={(event) =>
                      updateField(
                        "email",
                        event.target.value
                      )
                    }
                    placeholder="you@example.com"
                    className="h-12 w-full rounded-xl border border-app-border bg-surface pl-12 pr-4 text-sm text-primary outline-none transition-colors placeholder:text-muted focus:border-violet-500 disabled:opacity-60"
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
                    required
                    disabled={isSubmitting}
                    value={form.password}
                    onChange={(event) =>
                      updateField(
                        "password",
                        event.target.value
                      )
                    }
                    placeholder="Enter your password"
                    className="h-12 w-full rounded-xl border border-app-border bg-surface pl-12 pr-12 text-sm text-primary outline-none transition-colors placeholder:text-muted focus:border-violet-500 disabled:opacity-60"
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
                    className="absolute right-3 top-1/2 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-lg text-muted hover:text-primary"
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
                    Use at least 8 characters.
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
                className="flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-violet-600 px-4 text-sm font-semibold text-white transition-colors hover:bg-violet-700 disabled:cursor-not-allowed disabled:opacity-60"
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
                className="font-semibold text-violet-500 hover:underline disabled:opacity-60"
              >
                {isSignup
                  ? "Sign in"
                  : "Create an account"}
              </button>
            </p>

            <div className="mt-10 flex items-center justify-center gap-2 text-xs text-muted">
              <ShieldCheck size={15} />
              Passwords are protected with bcrypt.
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}

export default AuthPage;
