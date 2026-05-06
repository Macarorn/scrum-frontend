import { Outlet } from "react-router-dom";
import { useState, useEffect } from "react";
import Sidebar from "./Sidebar";

export default function AppShell() {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // toggle a body class to avoid background scroll when menu open
  useEffect(() => {
    if (sidebarOpen) {
      document.body.classList.add("sidebar-open");
    } else {
      document.body.classList.remove("sidebar-open");
    }
    return () => document.body.classList.remove("sidebar-open");
  }, [sidebarOpen]);

  return (
    <div className={`app-shell ${sidebarOpen ? "sidebar-open" : ""}`}>
      <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      {/* overlay for off-canvas (visible on small screens) */}
      <div
        className="sidebar-overlay"
        role="button"
        tabIndex={sidebarOpen ? 0 : -1}
        aria-hidden={!sidebarOpen}
        aria-label="Cerrar menú"
        onClick={() => setSidebarOpen(false)}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") setSidebarOpen(false);
        }}
      />

      <main className="app-main">
        <button
          type="button"
          aria-label="Abrir menú"
          aria-controls="app-sidebar"
          aria-expanded={sidebarOpen}
          className="hamburger sidebar-toggle"
          id="sidebar-toggle"
          onClick={() => setSidebarOpen((s) => !s)}
        >
          <svg width="20" height="20" viewBox="0 0 24 24" aria-hidden="true">
            <path
              d="M3 6h18M3 12h18M3 18h18"
              stroke="currentColor"
              strokeWidth="1.6"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </button>
        <Outlet />
      </main>
    </div>
  );
}
