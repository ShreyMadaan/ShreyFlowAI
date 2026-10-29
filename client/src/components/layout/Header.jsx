
import {
  Bell,
  LogOut,
  Menu,
  Moon,
  Plus,
  Search,
  Sun,
} from "lucide-react";

import { useTheme } from "../../context/ThemeContext";
import { useAuth } from "../../context/AuthContext";

function Header({
  onOpenMobileMenu,
  onNewTask,
}) {
  const { theme, toggleTheme } = useTheme();
  const { user, logout } = useAuth();

  const displayName =
    user?.name || "User";

  const initial =
    displayName.charAt(0).toUpperCase();

  return (
    <header className="sticky top-0 z-30 flex min-h-16 shrink-0 items-center justify-between gap-2 border-b border-app-border bg-surface px-3 sm:min-h-20 sm:gap-4 sm:px-6">
      {/* Left Section */}
      <div className="flex min-w-0 items-center gap-2 sm:gap-3">
        <button
          type="button"
          onClick={onOpenMobileMenu}
          aria-label="Open navigation menu"
          aria-controls="shreyflow-sidebar"
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl transition-colors hover:bg-surface-secondary focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-violet-500 lg:hidden"
        >
          <Menu size={21} />
        </button>

        <div className="min-w-0">
          <h2 className="truncate text-base font-bold tracking-tight sm:text-lg">
            Dashboard
          </h2>

          <p className="hidden text-xs text-muted sm:block">
            Manage your workflow efficiently
          </p>
        </div>
      </div>

      {/* Right Section */}
      <div className="flex shrink-0 items-center gap-2 sm:gap-3">
        {/* Search - Upcoming Feature */}
        <div className="hidden items-center gap-2 rounded-xl border border-app-border bg-surface-secondary px-3 py-2 md:flex">
          <Search
            size={17}
            className="shrink-0 text-muted"
          />

          <input
            type="search"
            placeholder="Search tasks..."
            aria-label="Search tasks - coming soon"
            disabled
            title="Task search coming soon"
            className="w-28 bg-transparent text-sm text-primary outline-none placeholder:text-muted disabled:cursor-not-allowed lg:w-48"
          />
        </div>

        {/* Theme Toggle */}
        <button
          type="button"
          onClick={toggleTheme}
          aria-label={
            theme === "dark"
              ? "Switch to light mode"
              : "Switch to dark mode"
          }
          title={
            theme === "dark"
              ? "Light mode"
              : "Dark mode"
          }
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-app-border transition-colors hover:bg-surface-secondary focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-violet-500"
        >
          {theme === "dark" ? (
            <Sun size={19} />
          ) : (
            <Moon size={19} />
          )}
        </button>

        {/* Notifications - Upcoming Feature */}
        <button
          type="button"
          disabled
          title="Notifications coming soon"
          aria-label="Notifications coming soon"
          className="hidden h-10 w-10 cursor-not-allowed items-center justify-center rounded-xl border border-app-border text-muted opacity-50 sm:flex"
        >
          <Bell size={19} />
        </button>

        {/* New Task */}
        <button
          type="button"
          onClick={onNewTask}
          aria-label="Create new task"
          title="Create new task"
          className="flex h-10 shrink-0 items-center justify-center gap-2 rounded-xl bg-violet-600 px-3 text-sm font-semibold text-white transition-colors hover:bg-violet-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-violet-500 sm:px-4"
        >
          <Plus size={18} />

          <span className="hidden sm:inline">
            New Task
          </span>
        </button>

        {/* User Profile */}
        <div className="hidden min-w-0 items-center gap-2 border-l border-app-border pl-3 xl:flex">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-violet-500/10 text-sm font-bold text-violet-500">
            {initial}
          </div>

          <div className="min-w-0">
            <p className="max-w-28 truncate text-sm font-semibold">
              {displayName}
            </p>

            <p className="max-w-28 truncate text-xs text-muted">
              {user?.email}
            </p>
          </div>
        </div>

        {/* Logout */}
        <button
          type="button"
          onClick={() => logout()}
          aria-label="Log out"
          title="Log out"
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-app-border text-muted transition-colors hover:bg-red-500/10 hover:text-red-500 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-violet-500"
        >
          <LogOut size={18} />
        </button>
      </div>
    </header>
  );
}

export default Header;
