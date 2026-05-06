import { useLocation, useNavigate } from "react-router-dom";
import { logoutSession } from "../services/auth.service";
import { useEffect, useRef, useState } from "react";
import "./Sidebar.css";

const menuItems = [
  {
    path: "/perfil",
    label: "Perfil",
    icon: (
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <path d="M12 12a5 5 0 1 0-5-5 5 5 0 0 0 5 5zm0 2c-4.42 0-8 2.24-8 5v1h16v-1c0-2.76-3.58-5-8-5z" />
      </svg>
    ),
  },
  {
    path: "/notificaciones",
    label: "Notificaciones",
    icon: (
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <path d="M12 22a2.5 2.5 0 0 0 2.45-2H9.55A2.5 2.5 0 0 0 12 22zm6-6V11a6 6 0 1 0-12 0v5L4 18v1h16v-1l-2-2zm-2 1H8v-6a4 4 0 1 1 8 0z" />
      </svg>
    ),
  },
  {
    path: "/crear-proyecto",
    label: "Inicio",
    icon: (
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <path d="M12 3 2 11h3v10h6v-6h2v6h6V11h3z" />
      </svg>
    ),
  },
  {
    path: "/proyectos",
    label: "Proyectos",
    icon: (
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <path d="M10 4 8 6H4a2 2 0 0 0-2 2v9a3 3 0 0 0 3 3h14a3 3 0 0 0 3-3V9a3 3 0 0 0-3-3H10z" />
      </svg>
    ),
  },
  {
    path: "/backlog",
    label: "Backlog",
    icon: (
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <path d="M4 5h16v14H4zm2 2v10h12V7zM7 9h6v2H7zm0 4h10v2H7z" />
      </svg>
    ),
  },
  {
    path: "/epicas",
    label: "Epicas",
    icon: (
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <path d="M5 4h14a1 1 0 0 1 1 1v14a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V5a1 1 0 0 1 1-1zm2 3v3h3V7H7zm0 5v3h3v-3H7zm5 0v3h5v-3h-5zm0-5v3h5V7h-5z" />
      </svg>
    ),
  },
  {
    path: "/sprints",
    label: "Sprints",
    icon: (
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <path d="M4 6h16v3H4zm0 5h16v3H4zm0 5h10v3H4z" />
      </svg>
    ),
  },
  {
    path: "/kanban",
    label: "Tablero Kanban",
    icon: (
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <path d="M4 4h16v4H4zM4 10h10v4H4zM4 16h7v4H4zM16 10h4v10h-4z" />
      </svg>
    ),
  },
];

export default function Sidebar({ open = false, onClose = () => {} }) {
  const navigate = useNavigate();
  const location = useLocation();
  const refSidebar = useRef(null);
  const [isMobile, setIsMobile] = useState(() => window.innerWidth <= 992);

  // close when route changes (mobile behaviour)
  useEffect(() => {
    if (open) onClose();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location.pathname]);

  // handle ESC to close when open
  useEffect(() => {
    function onKey(e) {
      if (e.key === "Escape" && open) onClose();
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  // keep track of responsive breakpoint
  useEffect(() => {
    const query = window.matchMedia("(max-width: 992px)");
    const update = (event) => setIsMobile(event.matches);

    setIsMobile(query.matches);
    if (query.addEventListener) {
      query.addEventListener("change", update);
    } else {
      query.addListener(update);
    }

    return () => {
      if (query.removeEventListener) {
        query.removeEventListener("change", update);
      } else {
        query.removeListener(update);
      }
    };
  }, []);

  // transfer focus to first interactive element when opened (accessibility)
  useEffect(() => {
    if (open && refSidebar.current) {
      const first = refSidebar.current.querySelector('.sidebar-item');
      if (first && typeof first.focus === 'function') {
        // small delay to ensure element is visible
        setTimeout(() => first.focus(), 80);
      }
    }
  }, [open]);

  // return focus to the toggle when the sidebar closes (mobile)
  useEffect(() => {
    if (!open && isMobile && refSidebar.current) {
      const active = document.activeElement;
      if (active && refSidebar.current.contains(active)) {
        const toggle = document.getElementById("sidebar-toggle");
        if (toggle && typeof toggle.focus === "function") {
          toggle.focus();
        } else if (typeof active.blur === "function") {
          active.blur();
        }
      }
    }
  }, [open, isMobile]);

  const handleLogout = async () => {
    navigate("/", { replace: true });
    void logoutSession();
  };

  return (
    <aside
      id="app-sidebar"
      ref={refSidebar}
      className={`app-sidebar ${open ? "is-open" : ""}`}
      aria-label="Navegacion principal"
      aria-hidden={!open && isMobile}
      inert={!open && isMobile}
    >
      {/* overlay is rendered by AppShell via .sidebar-overlay element */}
      <button
        type="button"
        className="sidebar-item sidebar-top"
        title="Menu"
        onClick={() => navigate("/perfil")}
      ></button>

      <nav className="sidebar-nav">
        {menuItems.map((item) => {
          const isActive =
            location.pathname === item.path ||
            location.pathname.startsWith(`${item.path}/`);

          return (
              <button
                key={item.path}
                type="button"
                className={`sidebar-item ${isActive ? "active" : ""}`}
                onClick={() => {
                  navigate(item.path);
                  if (window.innerWidth <= 992) onClose();
                }}
                title={item.label}
                aria-label={item.label}
              >
              <span className="sidebar-icon" aria-hidden="true">
                {item.icon}
              </span>
              <span className="sidebar-tooltip" aria-hidden="true">
                {item.label}
              </span>
            </button>
          );
        })}
      </nav>

      {/* <button
        type="button"
        className="sidebar-item sidebar-settings"
        onClick={() => navigate("/perfil")}
        title="Configuracion"
      >
        <span className="sidebar-icon" aria-hidden="true">
          <svg viewBox="0 0 24 24">
            <path d="M19.14 12.94a7.07 7.07 0 0 0 .05-.94 7.07 7.07 0 0 0-.05-.94l2.03-1.58a.5.5 0 0 0 .12-.64l-1.92-3.32a.5.5 0 0 0-.6-.22l-2.39.96a7.28 7.28 0 0 0-1.63-.94L14.4 2.8a.5.5 0 0 0-.5-.4h-3.8a.5.5 0 0 0-.5.4L9.25 5.32a7.28 7.28 0 0 0-1.63.94l-2.39-.96a.5.5 0 0 0-.6.22L2.71 8.84a.5.5 0 0 0 .12.64l2.03 1.58a7.07 7.07 0 0 0-.05.94 7.07 7.07 0 0 0 .05.94l-2.03 1.58a.5.5 0 0 0-.12.64l1.92 3.32a.5.5 0 0 0 .6.22l2.39-.96c.5.39 1.05.72 1.63.94l.35 2.52a.5.5 0 0 0 .5.4h3.8a.5.5 0 0 0 .5-.4l.35-2.52c.58-.22 1.13-.55 1.63-.94l2.39.96a.5.5 0 0 0 .6-.22l1.92-3.32a.5.5 0 0 0-.12-.64zM12 15.5A3.5 3.5 0 1 1 15.5 12 3.5 3.5 0 0 1 12 15.5z" />
          </svg>
        </span>
        <span className="sidebar-label">Config</span>
      </button> */}

      <button
        type="button"
        className="sidebar-item sidebar-settings"
        onClick={() => {
          handleLogout();
          if (window.innerWidth <= 992) onClose();
        }}
        title="Cerrar sesion"
        aria-label="Cerrar sesion"
      >
        <span className="sidebar-icon" aria-hidden="true">
          <svg viewBox="0 0 24 24">
            <path d="M10 17v-3h7v-4h-7V7l-5 5zM19 3H8a2 2 0 0 0-2 2v3h2V5h11v14H8v-3H6v3a2 2 0 0 0 2 2h11a2 2 0 0 0 2-2V5a2 2 0 0 0-2-2z" />
          </svg>
        </span>
        <span className="sidebar-tooltip" aria-hidden="true">
          Logout
        </span>
      </button>
    </aside>
  );
}
