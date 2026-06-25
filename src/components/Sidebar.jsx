import { useLocation, useNavigate } from "react-router-dom";
import { getAccessToken, logoutSession, isCoordinador } from "../services/auth.service";
import { listarNotificaciones } from "../services/notificaciones.service";
import { useEffect, useMemo, useRef, useState } from "react";
import "./Sidebar.css";

const menuItems = [
  {
    path: "/proyectos",
    label: "Dashboard",
    icon: (
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <path d="M12 3 2 11h3v10h6v-6h2v6h6V11h3z" />
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
    label: "Épicas",
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
  {
    path: "/calendario",
    label: "Calendario",
    icon: (
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <path d="M7 10h10v2H7zM5 4h1V2h2v2h8V2h2v2h1a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2zm0 4v12h14V8H5z" />
      </svg>
    ),
  },
];

/** Extract user info from JWT for mobile profile header */
const getUserFromToken = () => {
  const token = getAccessToken();
  if (!token) return null;
  try {
    const base64Url = token.split(".")[1];
    const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split("")
        .map((c) => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2))
        .join(""),
    );

    const payload = JSON.parse(jsonPayload);
    const email = payload.email || payload.correo || "";
    const nameFromEmail = email ? email.split("@")[0] : "";
    const displayName = payload.nombre || payload.name || nameFromEmail || "Usuario";

    return {
      name: displayName,
      email: email,
      initials: displayName
        .trim()
        .split(/\s+/)
        .map((n) => n[0])
        .join("")
        .slice(0, 2)
        .toUpperCase(),
    };
  } catch (error) {
    console.error("Error decoding token:", error);
    return null;
  }
};

export default function Sidebar({ open = false, onClose = () => {} }) {
  const navigate = useNavigate();
  const location = useLocation();
  const refSidebar = useRef(null);
  const [isMobile, setIsMobile] = useState(() => window.innerWidth <= 992);
  const [isExpanded, setIsExpanded] = useState(() => {
    const saved = localStorage.getItem("sidebar_expanded");
    return saved !== null ? JSON.parse(saved) : true;
  });
  const [unreadCount, setUnreadCount] = useState(0);

  const user = useMemo(() => getUserFromToken(), [open]);
  const coordinador = isCoordinador();

  const visibleMenuItems = useMemo(() => {
    if (!coordinador) return menuItems;
    // Coordinador: solo proyectos (acceso al perfil por el avatar)
    return menuItems.filter((item) =>
      ["/proyectos"].includes(item.path)
    );
  }, [coordinador]);

  // close when route changes (mobile behaviour)
  useEffect(() => {
    if (open) onClose();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location.pathname]);

  // Fetch unread notifications
  useEffect(() => {
    if (user) {
      const fetchUnread = async () => {
        try {
          const notifs = await listarNotificaciones();
          // The API returns { data: [...] } for sendSuccess
          const list = Array.isArray(notifs) ? notifs : (notifs.data || notifs.notificaciones || []);
          const unread = list.filter((n) => n.leida === 0 || n.leida === false).length;
          setUnreadCount(unread);
        } catch (err) {
          console.error("Error fetching unread notifications for sidebar", err);
        }
      };

      fetchUnread();
      const intervalId = setInterval(fetchUnread, 60000); // Poll every minute
      return () => clearInterval(intervalId);
    }
  }, [user, location.pathname]);

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
        setTimeout(() => first.focus(), 80);
      }
    }
  }, [open]);

  const handleLogout = async () => {
    navigate("/", { replace: true });
    void logoutSession();
  };

  const toggleExpand = () => {
    const next = !isExpanded;
    setIsExpanded(next);
    localStorage.setItem("sidebar_expanded", JSON.stringify(next));
  };

  return (
    <aside
      id="app-sidebar"
      ref={refSidebar}
      className={`app-sidebar ${open ? "is-open" : ""} ${isExpanded ? "is-expanded" : "is-collapsed"}`}
      aria-label="Navegacion principal"
      inert={!open && isMobile ? "" : undefined}
    >
      {/* ── Mobile: Close button ── */}
      {isMobile && (
        <button
          type="button"
          className="sidebar-close-btn"
          onClick={onClose}
          aria-label="Cerrar menú"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="18" y1="6" x2="6" y2="18" />
            <line x1="6" y1="6" x2="18" y2="18" />
          </svg>
        </button>
      )}

      {/* ── Mobile: User profile header ── */}
      {isMobile && user && (
        <button
          type="button"
          className="sidebar-profile"
          onClick={() => {
            navigate("/perfil");
            onClose();
          }}
        >
          <div className="sidebar-avatar">{user.initials}</div>
          <div className="sidebar-profile-info">
            <span className="sidebar-profile-name">{user.name}</span>
            {user.email && <span className="sidebar-profile-email">{user.email}</span>}
          </div>
        </button>
      )}

      {/* ── Desktop Top Header (Profile & Expand Toggle) ── */}
      {!isMobile && (
        <div className="sidebar-header">
          {user ? (
            <div 
              className={`sidebar-logo sidebar-profile-desktop ${!isExpanded ? "hidden" : ""}`} 
              onClick={() => navigate("/perfil")}
              style={{ cursor: "pointer" }}
            >
              <div className="sidebar-avatar-small">{user.initials}</div>
              {isExpanded && (
                <div className="sidebar-profile-info-desktop">
                  <span className="sidebar-profile-name-desktop">{user.name}</span>
                </div>
              )}
            </div>
          ) : (
            <div className={`sidebar-logo ${!isExpanded ? "hidden" : ""}`}>
              <div className="sidebar-logo-icon"></div>
              {isExpanded && <span className="sidebar-logo-text">ScrumTrack</span>}
            </div>
          )}
          <button 
            className="sidebar-toggle-btn" 
            onClick={toggleExpand}
            aria-label={isExpanded ? "Colapsar menú" : "Expandir menú"}
          >
            <i className={`bx ${isExpanded ? "bx-chevron-left" : "bx-chevron-right"}`}></i>
          </button>
        </div>
      )}

      <nav className="sidebar-nav">
        {visibleMenuItems.map((item) => {
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
              <span className="sidebar-label">{item.label}</span>
            </button>
          );
        })}
      </nav>

      {/* ── Desktop Bottom Actions (Logout) ── */}
      <div className="sidebar-bottom-actions">

        {/* Notifications */}
        <button
          type="button"
          className={`sidebar-item ${location.pathname.startsWith("/notificaciones") ? "active" : ""}`}
          onClick={() => {
            navigate("/notificaciones");
            if (window.innerWidth <= 992) onClose();
          }}
          title="Notificaciones"
          aria-label="Notificaciones"
        >
          <span className="sidebar-icon" aria-hidden="true" style={{ position: "relative" }}>
            <svg viewBox="0 0 24 24">
              <path d="M12 22a2.5 2.5 0 0 0 2.45-2H9.55A2.5 2.5 0 0 0 12 22zm6-6V11a6 6 0 1 0-12 0v5L4 18v1h16v-1l-2-2zm-2 1H8v-6a4 4 0 1 1 8 0z" />
            </svg>
            {unreadCount > 0 && (
              <span 
                className="position-absolute translate-middle badge rounded-pill bg-danger" 
                style={{ top: "0px", left: "20px", fontSize: "0.6rem", padding: "0.25em 0.4em" }}
              >
                {unreadCount > 99 ? "99+" : unreadCount}
                <span className="visually-hidden">notificaciones no leídas</span>
              </span>
            )}
          </span>
          <span className="sidebar-label">
            Notificaciones
            {unreadCount > 0 && isExpanded && (
              <span className="badge bg-danger ms-2" style={{ fontSize: "0.75rem" }}>{unreadCount}</span>
            )}
          </span>
        </button>

        {/* Logout */}
        <button
          type="button"
          className="sidebar-item sidebar-settings"
          onClick={() => {
            handleLogout();
            if (window.innerWidth <= 992) onClose();
          }}
          title="Cerrar sesión"
          aria-label="Cerrar sesión"
        >
          <span className="sidebar-icon" aria-hidden="true">
            <svg viewBox="0 0 24 24">
              <path d="M10 17v-3h7v-4h-7V7l-5 5zM19 3H8a2 2 0 0 0-2 2v3h2V5h11v14H8v-3H6v3a2 2 0 0 0 2 2h11a2 2 0 0 0 2-2V5a2 2 0 0 0-2-2z" />
            </svg>
          </span>
          <span className="sidebar-label">Cerrar sesión</span>
        </button>
      </div>
    </aside>
  );
}
