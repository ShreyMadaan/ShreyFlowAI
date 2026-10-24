
import { useState } from "react";
import {
    Bell,
    Menu,
    Moon,
    Plus,
    Search,
    Sun,
} from "lucide-react";

import { useTheme } from "../../context/ThemeContext";

function Header({ onOpenMobileMenu, onNewTask }) {
    const { theme, toggleTheme } = useTheme();
    const [search, setSearch] = useState("");

    return (
        <header className="sticky top-0 z-30 flex min-h-20 items-center justify-between gap-4 border-b border-app-border bg-surface px-4 sm:px-6">
            {/* Left */}
            <div className="flex min-w-0 items-center gap-3">
                <button
                    type="button"
                    onClick={onOpenMobileMenu}
                    aria-label="Open navigation"
                    className="rounded-xl p-2 hover:bg-surface-secondary lg:hidden"
                >
                    <Menu size={22} />
                </button>

                <div className="min-w-0">
                    <h2 className="truncate text-lg font-bold">
                        Dashboard
                    </h2>

                    <p className="hidden text-xs text-muted sm:block">
                        Manage your workflow efficiently
                    </p>
                </div>
            </div>

            {/* Right */}
            <div className="flex items-center gap-2 sm:gap-3">
                {/* Search UI */}
                <div className="hidden items-center gap-2 rounded-xl border border-app-border bg-surface-secondary px-3 py-2 md:flex">
                    <Search size={17} className="text-muted" />

                    <input
                        type="search"
                        value={search}
                        onChange={(event) =>
                            setSearch(event.target.value)
                        }
                        placeholder="Search tasks..."
                        aria-label="Search tasks"
                        disabled
                        title="Task search coming soon"
                        className="w-32 bg-transparent text-sm outline-none placeholder:text-muted disabled:cursor-not-allowed lg:w-48"
                    />
                </div>

                {/* Theme */}
                <button
                    type="button"
                    onClick={toggleTheme}
                    aria-label={`Switch to ${theme === "dark" ? "light" : "dark"
                        } mode`}
                    className="flex h-10 w-10 items-center justify-center rounded-xl border border-app-border hover:bg-surface-secondary"
                >
                    {theme === "dark" ? (
                        <Sun size={19} />
                    ) : (
                        <Moon size={19} />
                    )}
                </button>

                {/* Notifications */}
                <button
                    type="button"
                    disabled
                    title="Notifications coming soon"
                    aria-label="Notifications coming soon"
                    className="hidden h-10 w-10 cursor-not-allowed items-center justify-center rounded-xl border border-app-border text-muted opacity-50 sm:flex"
                >
                    <Bell size={19} />
                </button>

                {/* New task */}

                <button
                    type="button"
                    onClick={onNewTask}
                    className="flex items-center gap-2 rounded-xl bg-violet-600 px-3 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-violet-700 sm:px-4"
                >
                    <Plus size={18} />
                    <span className="hidden sm:inline">New Task</span>
                </button>

            </div>
        </header>
    );
}

export default Header;
