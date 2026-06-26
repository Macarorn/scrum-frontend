import { Folder, Trophy, ClipboardList, User, Clock } from "lucide-react";

const defaultKpis = {
  backlogProgress: 0,
  totalBacklog: 0,
  completedBacklog: 0,
  completedEpics: 0,
  pendingEpics: 0,
  totalEpics: 0,
  completedEpicsPercent: 0,
  pendingEpicsPercent: 0,
  totalStories: 0,
  completedStories: 0,
  inProgressStories: 0,
  completedTasks: 0,
  pendingTasks: 0,
  todoTasks: 0,
  inProgressTasks: 0,
};

function KPICard({ icon, iconBg, value, valueColor, label, line1, line2, progress }) {
  return (
    <div
      style={{
        background: "#ffffff",
        borderRadius: 16,
        padding: "14px 16px",
        boxShadow: "0 2px 8px rgba(0,0,0,0.05)",
        display: "flex",
        flexDirection: "column",
        gap: 8,
        flex: 1,
        minWidth: 0,
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
        <div
          style={{
            width: 32,
            height: 32,
            borderRadius: 8,
            background: iconBg,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            flexShrink: 0,
          }}
        >
          {icon}
        </div>
        <span style={{ fontSize: 11, color: "#6B7280", fontWeight: 600, lineHeight: 1.3 }}>
          {label}
        </span>
      </div>

      <div style={{ fontSize: 36, fontWeight: 800, color: valueColor, lineHeight: 1 }}>
        {value}
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 1 }}>
        <span style={{ fontSize: 11, color: "#9CA3AF" }}>{line1}</span>
        <span style={{ fontSize: 11, color: "#9CA3AF" }}>{line2}</span>
      </div>

      {progress !== undefined && (
        <div style={{ height: 4, borderRadius: 999, background: "#F3F4F6", overflow: "hidden", marginTop: 1 }}>
          <div
            style={{
              width: `${progress}%`,
              height: "100%",
              borderRadius: 999,
              background: valueColor,
            }}
          />
        </div>
      )}
    </div>
  );
}

export function KPICards({ kpis, loading = false }) {
  const data = kpis || defaultKpis;
  const displayValue = (value) => (loading ? "..." : value);

  return (
    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))", gap: 12 }}>
      <KPICard
        icon={<Folder size={17} color="#39A900" />}
        iconBg="#EAF7E1"
        value={displayValue(`${data.backlogProgress}%`)}
        valueColor="#39A900"
        label="Progreso del Backlog"
        line1={`${data.completedBacklog} de ${data.totalBacklog}`}
        line2="Elementos completados"
        progress={data.backlogProgress}
      />
      <KPICard
        icon={<Trophy size={17} color="#7C4DFF" />}
        iconBg="#F3EEFF"
        value={displayValue(data.completedEpics)}
        valueColor="#7C4DFF"
        label="Epicas Completadas"
        line1={`de ${data.totalEpics} epicas`}
        line2={`${data.completedEpicsPercent}% del total`}
      />
      <KPICard
        icon={<ClipboardList size={17} color="#FF8A26" />}
        iconBg="#FFF3E8"
        value={displayValue(data.pendingEpics)}
        valueColor="#FF8A26"
        label="Epicas Pendientes"
        line1="por completar"
        line2={`${data.pendingEpicsPercent}% del total`}
      />
      <KPICard
        icon={<User size={17} color="#2F80ED" />}
        iconBg="#EAF4FF"
        value={displayValue(data.totalStories)}
        valueColor="#2F80ED"
        label="Historias de Usuario"
        line1={`${data.completedStories} completadas`}
        line2={`${data.inProgressStories} en proceso`}
      />
      <KPICard
        icon={<Clock size={17} color="#E54861" />}
        iconBg="#FFF0F3"
        value={displayValue(data.pendingTasks)}
        valueColor="#E54861"
        label="Tareas Pendientes"
        line1={`${data.todoTasks} por hacer`}
        line2={`${data.inProgressTasks} en progreso`}
      />
    </div>
  );
}
