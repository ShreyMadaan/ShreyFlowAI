
import {
  BarChart3,
  CheckSquare2,
  ChevronLeft,
  ChevronRight,
  CircleHelp,
  LayoutDashboard,
  LayoutGrid,
  Settings,
  Sparkles,
  Workflow,
  X,
} from "lucide-react";

const navigation = [
  {
    label: "Dashboard",
    icon: LayoutDashboard,
    active: true,
    available: true,
  },
  {
    label: "My Tasks",
    icon: CheckSquare2,
    available: false,
  },
  {
    label: "Analytics",
    icon: BarChart3,
    available: false,
  },
  {
    label: "AI Assistant",
    icon: Sparkles,
    available: false,
  },
];

const boards = [
  {
    name: "My Workspace",
    color: "bg-violet-500",
    active: true,
  },
];

function Sidebar({
  collapsed,
  onToggleCollapse,
  mobileOpen,
  onCloseMobile,
}) {
  return (
    <>
      {mobileOpen && (
        <button
          type="button"
          aria-label="Close navigation"
          onClick={onCloseMobile}
          className="fixed inset-0 z-40 bg-black/60 lg:hidden"
        />
      )}

      <aside
        aria-label="Main navigation"
        className={`
          fixed inset-y-0 left-0 z-50 flex flex-col
          border-r border-app-border bg-surface
          transition-all duration-300
          lg:static lg:shrink-0
          ${collapsed ? "lg:w-20" : "lg:w-64"}
          w-64
          ${
            mobileOpen
              ? "translate-x-0"
              : "-translate-x-full lg:translate-x-0"
          }
        `}
      >
        {/* Branding */}
        <div className="flex h-20 items-center justify-between border-b border-app-border px-4">
          <div className="flex min-w-0 items-center gap-3">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-violet-600 text-white">
              <Workflow size={24} />
            </div>

            {!collapsed && (
              <div className="hidden lg:block">
                <h1 className="font-bold tracking-tight">
                  ShreyFlowAI
                </h1>
                <p className="text-[10px] text-muted">
                  Plan smarter. Flow faster.
                </p>
              </div>
            )}

            <div className="lg:hidden">
              <h1 className="font-bold">
                ShreyFlowAI
              </h1>
              <p className="text-[10px] text-muted">
                Plan smarter. Flow faster.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onCloseMobile}
            aria-label="Close sidebar"
            className="rounded-lg p-2 hover:bg-surface-secondary lg:hidden"
          >
            <X size={20} />
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto px-3 py-6">
          <p
            className={`mb-3 px-3 text-xs font-semibold uppercase tracking-wider text-muted ${
              collapsed ? "lg:hidden" : ""
            }`}
          >
            Workspace
          </p>

          <div className="space-y-1">
            {navigation.map((item) => {
              const Icon = item.icon;

              return (
                <button
                  key={item.label}
                  type="button"
                  disabled={!item.available}
                  aria-current={
                    item.active ? "page" : undefined
                  }
                  title={item.label}
                  className={`
                    flex w-full items-center gap-3
                    rounded-xl px-3 py-3 text-sm
                    transition-colors
                    ${
                      item.active
                        ? "bg-violet-500/10 font-semibold text-accent"
                        : "text-muted"
                    }
                    ${
                      item.available
                        ? "hover:bg-surface-secondary"
                        : "cursor-not-allowed opacity-55"
                    }
                  `}
                >
                  <Icon size={20} className="shrink-0" />

                  <span
                    className={
                      collapsed ? "lg:hidden" : ""
                    }
                  >
                    {item.label}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Boards */}
          <div className="mt-10">
            <p
              className={`mb-3 px-3 text-xs font-semibold uppercase tracking-wider text-muted ${
                collapsed ? "lg:hidden" : ""
              }`}
            >
              Your Boards
            </p>

            {boards.map((board) => (
              <div
                key={board.name}
                className="flex items-center gap-3 rounded-xl bg-surface-secondary px-3 py-3 text-sm"
                title={board.name}
              >
                <span
                  className={`h-3 w-3 shrink-0 rounded ${board.color}`}
                />

                <span
                  className={`truncate font-medium ${
                    collapsed ? "lg:hidden" : ""
                  }`}
                >
                  {board.name}
                </span>
              </div>
            ))}
          </div>
        </nav>

        {/* Bottom section */}
        <div className="space-y-1 border-t border-app-border p-3">
          {[
            { label: "Settings", icon: Settings },
            { label: "Help", icon: CircleHelp },
          ].map((item) => {
            const Icon = item.icon;

            return (
              <button
                key={item.label}
                type="button"
                disabled
                title={`${item.label} — coming soon`}
                className="flex w-full cursor-not-allowed items-center gap-3 rounded-xl px-3 py-3 text-sm text-muted opacity-55"
              >
                <Icon size={20} />

                <span
                  className={
                    collapsed ? "lg:hidden" : ""
                  }
                >
                  {item.label}
                </span>
              </button>
            );
          })}

          <button
            type="button"
            onClick={onToggleCollapse}
            aria-label={
              collapsed
                ? "Expand sidebar"
                : "Collapse sidebar"
            }
            className="hidden w-full items-center gap-3 rounded-xl px-3 py-3 text-sm text-muted hover:bg-surface-secondary lg:flex"
          >
            {collapsed ? (
              <ChevronRight size={20} />
            ) : (
              <>
                <ChevronLeft size={20} />
                Collapse Sidebar
              </>
            )}
          </button>
        </div>
      </aside>
    </>
  );
}

export default Sidebar;
