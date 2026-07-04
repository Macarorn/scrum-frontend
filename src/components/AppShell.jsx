import { Outlet, useLocation } from "react-router-dom";
import { useState, useEffect } from "react";
import { Joyride, STATUS, ACTIONS } from "react-joyride";
import Sidebar from "./Sidebar";
import { useTour } from "../hooks/useTour";
import WelcomeModal from "./WelcomeModal";
import { getUserIdFromToken } from "../services/auth.service";
import AIStudioChat from "./AIStudioChat";

export default function AppShell() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();

  const { steps, run, startTour, handleEvent } = useTour(location.pathname);

  // Global Tour logic — per-user key
  const userId = getUserIdFromToken();
  const tourKey = `tour_done_${userId}`;

  const [showWelcome, setShowWelcome] = useState(false);
  const [runGlobalTour, setRunGlobalTour] = useState(false);

  useEffect(() => {
    try {
      const isNew = localStorage.getItem("scrum_just_registered") === "true";
      const val = (tourKey ? localStorage.getItem(tourKey) : null) || 
                  localStorage.getItem("scrum.global_tour_done") || 
                  localStorage.getItem("global_tour_done");
      
      if (isNew && val !== "1") {
        setShowWelcome(true);
      } else {
        setShowWelcome(false);
      }
    } catch (_) {}
  }, [tourKey]);

  const handleGlobalJoyrideCallback = (data) => {
    const { action, status } = data;
    if (status === STATUS.FINISHED || status === STATUS.SKIPPED || action === ACTIONS.CLOSE) {
      handleFinishGlobalTour();
    }
  };

  const handleSkipWelcome = () => {
    try { 
      if (tourKey) localStorage.setItem(tourKey, "1");
      localStorage.setItem("global_tour_done", "1"); 
      localStorage.removeItem("scrum_just_registered");
    } catch (_) {}
    setShowWelcome(false);
  };

  const handleStartWelcome = () => {
    setShowWelcome(false);
    setRunGlobalTour(true);
  };

  const handleFinishGlobalTour = () => {
    setRunGlobalTour(false);
    try { 
      if (tourKey) localStorage.setItem(tourKey, "1");
      localStorage.setItem("global_tour_done", "1"); 
      localStorage.removeItem("scrum_just_registered");
    } catch (_) {}
    setShowWelcome(false);
    if (steps.length > 0) {
      setTimeout(() => startTour(), 150);
    }
  };

  // Safe global steps that work on both desktop and mobile without breaking
  const isMobile = window.innerWidth <= 992;
  const globalSteps = isMobile ? [
    {
      target: "#sidebar-toggle",
      content: "Usa este botón para abrir el menú lateral. Desde allí podrás acceder a tus Proyectos, Backlog, Sprints, Kanban y el Calendario.",
      placement: "bottom",
      skipBeacon: true,
      disableOverlayClose: true,
    }
  ] : [
    {
      target: "#app-sidebar",
      content: "Este es el menú lateral principal. Desde aquí tienes acceso a todas las herramientas de ScrumTrack.",
      placement: "right",
      skipBeacon: true,
      disableOverlayClose: true,
    },
    {
      target: ".sidebar-nav",
      content: "Aquí encontrarás accesos directos a tus Proyectos, Backlog, Épicas, Sprints y tu Tablero Kanban. ¡Todo en un solo lugar!",
      placement: "right",
      skipBeacon: true,
      disableOverlayClose: true,
    },
    {
      target: ".sidebar-help-center",
      content: "¡Estás listo! Si en algún momento necesitas ayuda específica sobre la pantalla en la que te encuentras, haz clic en este botón y te daremos un recorrido individual.",
      placement: "right",
      skipBeacon: true,
      disableOverlayClose: true,
    }
  ];


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
        onStartTour={steps.length > 0 ? () => startTour() : null}
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

        {/* ── Welcome Modal ── */}
        {showWelcome && (
          <WelcomeModal onStart={handleStartWelcome} onSkip={handleSkipWelcome} />
        )}

        {/* ── React Joyride (Individual Page Tour) ── */}
        {!runGlobalTour && (
          <Joyride
            steps={steps}
            run={run}
            continuous
            scrollToFirstStep
            onEvent={handleEvent}
            showProgress={true}
            showSkipButton={true}
            disableOverlayClose={true}
            locale={{
              back: "Anterior",
              close: "Cerrar",
              last: "Finalizar",
              next: "Siguiente",
              skip: "Omitir",
            }}
            styles={{
              options: {
                primaryColor: "#39a900",
                backgroundColor: "#ffffff",
                textColor: "#162027",
                arrowColor: "#ffffff",
                overlayColor: "rgba(0, 0, 0, 0.65)",
                zIndex: 10000,
              },
              tooltip: {
                borderRadius: 16,
                padding: "20px",
                fontSize: 15,
                lineHeight: 1.6,
                boxShadow: "0 10px 30px rgba(0, 0, 0, 0.15)",
              },
              tooltipContainer: {
                textAlign: "left",
              },
              tooltipContent: {
                fontSize: 14,
                padding: "12px 0 8px",
              },
              buttonPrimary: {
                borderRadius: 8,
                fontWeight: 600,
                fontSize: 14,
                padding: "10px 20px",
                backgroundColor: "#39a900",
                color: "#ffffff",
                border: "none",
              },
              buttonBack: {
                color: "#5e6d76",
                fontSize: 14,
                marginRight: 12,
                backgroundColor: "transparent",
                border: "none",
              },
              buttonSkip: {
                color: "#5e6d76",
                fontSize: 14,
                backgroundColor: "transparent",
                border: "none",
              },
              buttonClose: {
                color: "#5e6d76",
                backgroundColor: "transparent",
                border: "none",
              },
            }}
          />
        )}

        {/* ── React Joyride (Global Welcome Tour) ── */}
        {runGlobalTour && (
          <Joyride
            steps={globalSteps}
            run={runGlobalTour}
            continuous
            scrollToFirstStep
            onEvent={handleGlobalJoyrideCallback}
            showProgress={true}
            showSkipButton={true}
            disableOverlayClose={true}
            locale={{
              back: "Anterior",
              close: "Cerrar",
              last: "Empezar a trabajar",
              next: "Siguiente",
              skip: "Omitir",
            }}
            styles={{
              options: {
                primaryColor: "#39a900",
                backgroundColor: "#ffffff",
                textColor: "#162027",
                arrowColor: "#ffffff",
                overlayColor: "rgba(0, 0, 0, 0.65)",
                zIndex: 10000,
              },
              tooltip: {
                borderRadius: 16,
                padding: "20px",
                fontSize: 15,
                lineHeight: 1.6,
                boxShadow: "0 10px 30px rgba(0, 0, 0, 0.15)",
              },
              tooltipContainer: { textAlign: "left" },
              tooltipContent: { fontSize: 14, padding: "12px 0 8px" },
              buttonPrimary: {
                borderRadius: 8,
                fontWeight: 600,
                fontSize: 14,
                padding: "10px 20px",
                backgroundColor: "#39a900",
                color: "#ffffff",
                border: "none",
              },
              buttonBack: { color: "#5e6d76", fontSize: 14, marginRight: 12, backgroundColor: "transparent", border: "none" },
              buttonSkip: { color: "#5e6d76", fontSize: 14, backgroundColor: "transparent", border: "none" },
              buttonClose: { color: "#5e6d76", backgroundColor: "transparent", border: "none" },
            }}
          />
        )}
        <Outlet />
        <AIStudioChat />
      </main>
    </div>
  );
}
