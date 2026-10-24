
import { Moon, Sun, Workflow } from "lucide-react";
import { useTheme } from "./context/ThemeContext";

function App() {
  const { theme, toggleTheme } = useTheme();

  return (
    <div className="min-h-screen bg-app text-primary">
      <header className="flex items-center justify-between border-b border-app-border bg-surface px-6 py-4">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-violet-600 text-white">
            <Workflow size={24} />
          </div>

          <div>
            <h1 className="text-xl font-bold tracking-tight">
              ShreyFlowAI
            </h1>

            <p className="text-xs text-muted">
              Plan smarter. Flow faster.
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={toggleTheme}
          aria-label={`Switch to ${
            theme === "dark" ? "light" : "dark"
          } mode`}
          className="flex h-11 w-11 items-center justify-center rounded-xl border border-app-border bg-surface-secondary transition-colors hover:border-violet-500"
        >
          {theme === "dark" ? (
            <Sun size={20} />
          ) : (
            <Moon size={20} />
          )}
        </button>
      </header>

      <main className="mx-auto max-w-7xl px-6 py-12">
        <div className="mb-8">
          <p className="mb-2 text-sm font-medium text-accent">
            WORKSPACE OVERVIEW
          </p>

          <h2 className="text-3xl font-bold tracking-tight">
            Your productivity workspace
          </h2>

          <p className="mt-2 text-muted">
            Organize projects, manage tasks, and
            keep your workflow moving.
          </p>
        </div>

        <section className="rounded-2xl border border-app-border bg-surface p-8">
          <div className="mb-4 inline-flex rounded-xl bg-violet-500/10 p-4 text-accent">
            <Workflow size={32} />
          </div>

          <h3 className="text-xl font-semibold">
            Your Kanban workspace is ready
          </h3>

          <p className="mt-2 max-w-xl text-muted">
            Next, we'll add the navigation sidebar,
            dashboard header, and task management
            board.
          </p>

          <div className="mt-6 flex items-center gap-3">
            <span className="h-2.5 w-2.5 rounded-full bg-emerald-500" />
            <span className="text-sm text-muted">
              Theme system initialized
            </span>
          </div>
        </section>
      </main>
    </div>
  );
}

export default App;
