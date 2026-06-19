import { Outlet, useLocation } from "react-router-dom";
import { useState, useEffect } from "react";
import { Joyride } from "react-joyride";
import Sidebar from "./Sidebar";
import { useTour } from "../hooks/useTour";

export default function AppShell() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();

  const { steps, run, startTour, handleEvent } =
    useTour(location.pathname);

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
      <Sidebar 
        open={sidebarOpen} 
        onClose={() => setSidebarOpen(false)} 
        onStartTour={steps.length > 0 ? startTour : null}
      />
      {/* overlay for off-canvas (visible on small screens) */}
      <div
        className="sidebar-overlay"
        onClick={() => setSidebarOpen(false)}
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

        {/* ── React Joyride v3 Tour ── */}
        <Joyride
          steps={steps}
          run={run}
          continuous
          debug
          scrollToFirstStep
          onEvent={handleEvent}
          options={{
            primaryColor: "#4caf50",
            backgroundColor: "#1a1a2e",
            textColor: "#e8e8ef",
            arrowColor: "#1a1a2e",
            overlayColor: "rgba(0, 0, 0, 0.55)",
            overlayClickAction: false,
            showProgress: true,
            skipBeacon: true,
            zIndex: 10000,
            buttons: ["back", "close", "primary", "skip"],
          }}
          locale={{
            back: "Anterior",
            close: "Cerrar",
            last: "Finalizar",
            next: "Siguiente",
            skip: "Omitir",
          }}
          styles={{
            tooltip: {
              borderRadius: 14,
              padding: "20px 22px",
              fontSize: 14,
              lineHeight: 1.6,
            },
            tooltipContainer: {
              textAlign: "left",
            },
            tooltipContent: {
              fontSize: 14,
              padding: "8px 0 4px",
            },
            buttonPrimary: {
              borderRadius: 8,
              fontWeight: 600,
              fontSize: 13,
              padding: "8px 18px",
            },
            buttonBack: {
              color: "#aaa",
              fontSize: 13,
              marginRight: 8,
            },
            buttonSkip: {
              color: "#888",
              fontSize: 12,
            },
            buttonClose: {
              color: "#888",
            },
          }}
        />

        <Outlet />
      </main>
    </div>
  );
}
