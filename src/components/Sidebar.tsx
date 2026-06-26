import {
  Home,
  FolderKanban,
  ListTodo,
  LayoutDashboard,
  BarChart2,
  Users,
  TrendingUp,
  Bell,
  Settings,
} from "lucide-react";

const navItems = [
  { icon: Home, label: "Home" },
  { icon: FolderKanban, label: "Proyectos" },
  { icon: ListTodo, label: "Backlog" },
  { icon: LayoutDashboard, label: "Dashboard", active: true },
  { icon: BarChart2, label: "Reportes" },
  { icon: Users, label: "Equipo" },
  { icon: TrendingUp, label: "Métricas" },
  { icon: Bell, label: "Notificaciones" },
];

export function Sidebar() {
  return (
    <aside
      style={{
        width: 64,
        minWidth: 64,
        background: "#ffffff",
        borderRight: "1px solid #F3F4F6",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        padding: "16px 0",
        gap: 4,
        minHeight: "100vh",
        position: "sticky",
        top: 0,
        zIndex: 10,
      }}
    >
      {/* Logo */}
      <div
        style={{
          width: 36,
          height: 36,
          borderRadius: 10,
          background: "#EAF7E1",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          marginBottom: 12,
        }}
      >
        <svg width="20" height="20" viewBox="0 0 26 26" fill="none">
          <path d="M13 2L3 8v10l10 6 10-6V8L13 2z" fill="#39A900" opacity="0.2" />
          <path d="M13 2L3 8v10l10 6 10-6V8L13 2z" stroke="#39A900" strokeWidth="1.8" fill="none" />
          <circle cx="13" cy="14" r="3" fill="#39A900" />
        </svg>
      </div>

      {/* Nav */}
      <nav style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 2, flex: 1 }}>
        {navItems.map(({ icon: Icon, label, active }) => (
          <button
            key={label}
            title={label}
            style={{
              width: 40,
              height: 40,
              borderRadius: 10,
              background: active ? "#39A900" : "transparent",
              color: active ? "#ffffff" : "#9CA3AF",
              border: "none",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              transition: "all 0.15s",
            }}
            onMouseEnter={(e) => {
              if (!active) {
                (e.currentTarget as HTMLButtonElement).style.background = "#EAF7E1";
                (e.currentTarget as HTMLButtonElement).style.color = "#39A900";
              }
            }}
            onMouseLeave={(e) => {
              if (!active) {
                (e.currentTarget as HTMLButtonElement).style.background = "transparent";
                (e.currentTarget as HTMLButtonElement).style.color = "#9CA3AF";
              }
            }}
          >
            <Icon size={17} />
          </button>
        ))}
      </nav>

      {/* Settings */}
      <button
        title="Configuración"
        style={{
          width: 40,
          height: 40,
          borderRadius: 10,
          background: "transparent",
          color: "#9CA3AF",
          border: "none",
          cursor: "pointer",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
        onMouseEnter={(e) => {
          (e.currentTarget as HTMLButtonElement).style.background = "#EAF7E1";
          (e.currentTarget as HTMLButtonElement).style.color = "#39A900";
        }}
        onMouseLeave={(e) => {
          (e.currentTarget as HTMLButtonElement).style.background = "transparent";
          (e.currentTarget as HTMLButtonElement).style.color = "#9CA3AF";
        }}
      >
        <Settings size={17} />
      </button>
    </aside>
  );
}
