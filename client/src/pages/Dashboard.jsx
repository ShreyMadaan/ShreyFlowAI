
import {
  CheckCircle2,
  Clock3,
  Database,
  ListTodo,
  RefreshCw,
  RotateCcw,
  Sparkles,
} from "lucide-react";

import Board from "../features/board/Board";

function Dashboard({
  tasks,
  loading,
  error,
  onRefresh,
  onEditTask,
  onDeleteTask,
  onStatusChange,
  onToggleSubtask,
  onReorder,
}) {
  // Dashboard statistics
  const totalTasks = tasks.length;

  const inProgressTasks = tasks.filter(
    (task) => task.status === "in-progress"
  ).length;

  const completedTasks = tasks.filter(
    (task) => task.status === "done"
  ).length;

  const stats = [
    {
      label: "Total Tasks",
      value: totalTasks,
      icon: ListTodo,
      color: "text-violet-500",
      bg: "bg-violet-500/10",
    },
    {
      label: "In Progress",
      value: inProgressTasks,
      icon: Clock3,
      color: "text-amber-500",
      bg: "bg-amber-500/10",
    },
    {
      label: "Completed",
      value: completedTasks,
      icon: CheckCircle2,
      color: "text-emerald-500",
      bg: "bg-emerald-500/10",
    },
  ];

  return (
    <div className="mx-auto max-w-[1800px] space-y-8 p-4 sm:p-6 lg:p-8">
      {/* Workspace Overview */}
      <section>
        <p className="mb-2 text-xs font-semibold uppercase tracking-widest text-accent">
          Workspace Overview
        </p>

        <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
          Your Workspace
        </h1>

        <p className="mt-2 text-sm text-muted">
          Organize tasks, track progress, and keep
          your workflow moving.
        </p>
      </section>

      {/* MongoDB Connection Status — Development Only */}
      {import.meta.env.DEV && (
        <section className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-app-border bg-surface p-4">
          <div className="flex items-center gap-3">
            <Database
              size={20}
              className={
                error
                  ? "text-red-500"
                  : loading
                    ? "text-amber-500"
                    : "text-emerald-500"
              }
            />

            <div>
              <p className="text-sm font-semibold">
                MongoDB Atlas Connection
              </p>

              <p className="mt-1 text-xs text-muted">
                {loading
                  ? "Fetching tasks from backend..."
                  : error
                    ? error
                    : `Connected — ${tasks.length} tasks in MongoDB`}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onRefresh}
            disabled={loading}
            className="flex items-center gap-2 rounded-xl border border-app-border px-3 py-2 text-xs font-medium transition-colors hover:bg-surface-secondary disabled:cursor-not-allowed disabled:opacity-50"
          >
            <RefreshCw
              size={15}
              className={
                loading ? "animate-spin" : ""
              }
            />

            Refresh
          </button>
        </section>
      )}

      {/* Statistics */}
      <section className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        {stats.map((stat) => {
          const Icon = stat.icon;

          return (
            <article
              key={stat.label}
              className="rounded-2xl border border-app-border bg-surface p-5"
            >
              <div
                className={`mb-4 inline-flex rounded-xl p-3 ${stat.bg} ${stat.color}`}
              >
                <Icon size={22} />
              </div>

              <p className="text-3xl font-bold">
                {stat.value}
              </p>

              <p className="mt-1 text-sm text-muted">
                {stat.label}
              </p>
            </article>
          );
        })}
      </section>

      {/* Kanban Workspace */}
      <section className="rounded-2xl border border-app-border bg-surface p-4 sm:p-5">
        <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="text-lg font-semibold">
              My Workspace
            </h2>

            <p className="mt-1 text-xs text-muted">
              Manage tasks across five workflow stages.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <span className="rounded-lg bg-violet-500/10 px-3 py-1.5 text-xs font-medium text-accent">
              Kanban View
            </span>

            {/* Disabled until database reset is implemented */}
            <button
              type="button"
              disabled
              title="Database-backed reset is not implemented yet"
              className="flex items-center gap-2 rounded-xl border border-app-border px-3 py-2 text-xs font-medium text-muted opacity-50 cursor-not-allowed"
            >
              <RotateCcw size={15} />
              Reset Demo Board
            </button>
          </div>
        </div>

        {/* Board Content */}
        {loading ? (
          <div
            role="status"
            className="flex min-h-64 flex-col items-center justify-center gap-3"
          >
            <RefreshCw
              size={28}
              className="animate-spin text-violet-500"
            />

            <p className="text-sm text-muted">
              Loading your tasks from MongoDB...
            </p>
          </div>
        ) : error ? (
          <div
            role="alert"
            className="flex min-h-64 flex-col items-center justify-center gap-4 text-center"
          >
            <Database
              size={30}
              className="text-red-500"
            />

            <div>
              <p className="font-semibold text-red-500">
                Unable to load tasks
              </p>

              <p className="mt-2 max-w-md text-sm text-muted">
                {error}
              </p>
            </div>

            <button
              type="button"
              onClick={onRefresh}
              className="flex items-center gap-2 rounded-xl bg-violet-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-violet-700"
            >
              <RefreshCw size={15} />
              Try Again
            </button>
          </div>
        ) : (
          <Board
            tasks={tasks}
            onEditTask={onEditTask}
            onDeleteTask={onDeleteTask}
            onStatusChange={onStatusChange}
            onToggleSubtask={onToggleSubtask}
            onReorder={onReorder}
          />
        )}
      </section>

      {/* AI Assistant Preview */}
      <section className="flex flex-col gap-4 rounded-2xl border border-violet-500/20 bg-gradient-to-r from-violet-500/10 to-fuchsia-500/5 p-6 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-start gap-4">
          <div className="rounded-xl bg-violet-500/15 p-3 text-accent">
            <Sparkles size={24} />
          </div>

          <div>
            <h3 className="font-semibold">
              ShreyFlowAI Assistant
            </h3>

            <p className="mt-2 max-w-lg text-sm leading-6 text-muted">
              Intelligent task breakdowns, priority
              recommendations, and workflow insights
              are coming soon.
            </p>
          </div>
        </div>

        <span className="self-start whitespace-nowrap rounded-full border border-violet-500/20 px-3 py-1.5 text-xs font-medium text-accent">
          Coming Soon
        </span>
      </section>
    </div>
  );
}

export default Dashboard;
