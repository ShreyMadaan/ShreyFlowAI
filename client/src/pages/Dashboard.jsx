
import {
  ArrowUpRight,
  CheckCircle2,
  Clock3,
  ListTodo,
  Sparkles,
} from "lucide-react";

const stats = [
  {
    label: "Total Tasks",
    value: "0",
    icon: ListTodo,
    iconColor: "text-violet-500",
    iconBg: "bg-violet-500/10",
  },
  {
    label: "In Progress",
    value: "0",
    icon: Clock3,
    iconColor: "text-amber-500",
    iconBg: "bg-amber-500/10",
  },
  {
    label: "Completed",
    value: "0",
    icon: CheckCircle2,
    iconColor: "text-emerald-500",
    iconBg: "bg-emerald-500/10",
  },
];

function Dashboard() {
  return (
    <div className="mx-auto max-w-[1600px] space-y-8 p-4 sm:p-6 lg:p-8">
      {/* Welcome */}
      <section className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <p className="mb-2 text-xs font-semibold uppercase tracking-widest text-accent">
            Workspace Overview
          </p>

          <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
            Your Workspace
          </h1>

          <p className="mt-2 text-sm text-muted">
            Stay organized and keep your projects
            moving forward.
          </p>
        </div>

        <div className="flex items-center gap-2 self-start rounded-full border border-app-border bg-surface px-4 py-2 text-xs text-muted">
          <span className="h-2 w-2 rounded-full bg-emerald-500" />
          Workspace ready
        </div>
      </section>

      {/* Stats */}
      <section className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        {stats.map((stat) => {
          const Icon = stat.icon;

          return (
            <article
              key={stat.label}
              className="rounded-2xl border border-app-border bg-surface p-5"
            >
              <div className="flex items-center justify-between">
                <div
                  className={`rounded-xl p-3 ${stat.iconBg} ${stat.iconColor}`}
                >
                  <Icon size={22} />
                </div>

                <ArrowUpRight
                  size={17}
                  className="text-muted"
                />
              </div>

              <p className="mt-5 text-3xl font-bold">
                {stat.value}
              </p>

              <p className="mt-1 text-sm text-muted">
                {stat.label}
              </p>
            </article>
          );
        })}
      </section>

      {/* Board */}
      <section className="rounded-2xl border border-app-border bg-surface">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-app-border p-5">
          <div>
            <h2 className="text-lg font-semibold">
              My Workspace
            </h2>

            <p className="mt-1 text-xs text-muted">
              Your Kanban board
            </p>
          </div>

          <span className="rounded-lg bg-violet-500/10 px-3 py-1.5 text-xs font-medium text-accent">
            Board View
          </span>
        </div>

        <div className="flex min-h-72 flex-col items-center justify-center px-5 py-12 text-center">
          <div className="mb-5 rounded-2xl bg-violet-500/10 p-5 text-accent">
            <ListTodo size={34} />
          </div>

          <h3 className="text-lg font-semibold">
            Your board is ready
          </h3>

          <p className="mt-2 max-w-md text-sm leading-6 text-muted">
            We'll add interactive Kanban columns,
            task cards, and workflow management in
            the next milestone.
          </p>
        </div>
      </section>

      {/* AI preview */}
      <section className="flex flex-col justify-between gap-5 rounded-2xl border border-violet-500/20 bg-gradient-to-r from-violet-500/10 to-fuchsia-500/5 p-6 sm:flex-row sm:items-center">
        <div className="flex items-start gap-4">
          <div className="rounded-xl bg-violet-500/15 p-3 text-accent">
            <Sparkles size={24} />
          </div>

          <div>
            <h3 className="font-semibold">
              Meet your AI workflow assistant
            </h3>

            <p className="mt-2 max-w-lg text-sm leading-6 text-muted">
              Coming soon: intelligent task
              breakdowns, priority suggestions,
              and productivity insights.
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
