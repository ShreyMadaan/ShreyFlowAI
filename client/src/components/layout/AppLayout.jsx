
import { useState } from "react";

import Sidebar from "./Sidebar";
import Header from "./Header";

function AppLayout({ children, onNewTask }) {
  const [sidebarCollapsed, setSidebarCollapsed] =
    useState(false);

  const [mobileMenuOpen, setMobileMenuOpen] =
    useState(false);

  return (
    <div className="flex h-screen overflow-hidden bg-app text-primary">
      <Sidebar
        collapsed={sidebarCollapsed}
        onToggleCollapse={() =>
          setSidebarCollapsed((previous) => !previous)
        }
        mobileOpen={mobileMenuOpen}
        onCloseMobile={() =>
          setMobileMenuOpen(false)
        }
      />

      <div className="flex min-w-0 flex-1 flex-col">
        <Header
          onOpenMobileMenu={() =>
            setMobileMenuOpen(true)
          }
          onNewTask={onNewTask}
        />

        <main className="min-h-0 flex-1 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  );
}

export default AppLayout;
