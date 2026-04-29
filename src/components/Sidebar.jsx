import { useLocation, useNavigate } from "react-router-dom";
import { logoutSession } from "../services/auth.service";
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

export default function Sidebar() {
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = async () => {
    navigate("/", { replace: true });
    void logoutSession();
  };

  return (
    <aside className="app-sidebar" aria-label="Navegacion principal">
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
              onClick={() => navigate(item.path)}
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
        onClick={handleLogout}
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
