import { Folder, Trophy, ClipboardList, User, CheckCircle, Clock } from "lucide-react";

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
      {/* Icon + label */}
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

      {/* Big value */}
      <div style={{ fontSize: 36, fontWeight: 800, color: valueColor, lineHeight: 1 }}>
        {value}
      </div>

      {/* Sub lines */}
      <div style={{ display: "flex", flexDirection: "column", gap: 1 }}>
        <span style={{ fontSize: 11, color: "#9CA3AF" }}>{line1}</span>
        <span style={{ fontSize: 11, color: "#9CA3AF" }}>{line2}</span>
      </div>

      {/* Progress bar */}
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

export function KPICards({ data = {} }) {
  const {
    backlogProgress = 0,
    totalBacklog = 0,
    completedBacklog = 0,
    completedEpics = 0,
    pendingEpics = 0,
    totalEpics = 0,
    completedEpicsPercent = 0,
    totalStories = 0,
    completedStories = 0,
    inProgressStories = 0,
    completedTasks = 0,
    pendingTasks = 0,
    todoTasks = 0,
    inProgressTasks = 0,
  } = data;

  return (
    <div style={{ display: "grid", gridTemplateColumns: "repeat(6, 1fr)", gap: 12 }}>
      <KPICard
        icon={<Folder size={17} color="#39A900" />}
        iconBg="#EAF7E1"
        value={`${backlogProgress}%`}
        valueColor="#39A900"
        label="Progreso del Backlog"
        line1={`${completedBacklog} de ${totalBacklog}`}
        line2="Elementos completados"
        progress={backlogProgress}
      />
      <KPICard
        icon={<Trophy size={17} color="#7C4DFF" />}
        iconBg="#F3EEFF"
        value={completedEpics}
        valueColor="#7C4DFF"
        label="Épicas Completadas"
        line1={`de ${totalEpics} épicas`}
        line2={`${completedEpicsPercent}% del total`}
      />
      <KPICard
        icon={<ClipboardList size={17} color="#FF8A26" />}
        iconBg="#FFF3E8"
        value={pendingEpics}
        valueColor="#FF8A26"
        label="Épicas Pendientes"
        line1="por completar"
        line2={`${totalEpics ? Math.max(0, 100 - completedEpicsPercent) : 0}% del total`}
      />
      <KPICard
        icon={<User size={17} color="#2F80ED" />}
        iconBg="#EAF4FF"
        value={totalStories}
        valueColor="#2F80ED"
        label="Historias de Usuario"
        line1={`${completedStories} completadas`}
        line2={`${inProgressStories} en proceso`}
      />
      <KPICard
        icon={<CheckCircle size={17} color="#39A900" />}
        iconBg="#EAF7E1"
        value={completedTasks}
        valueColor="#39A900"
        label="Tareas Completadas"
        line1={`de ${totalBacklog} tareas`}
        line2={`${backlogProgress}% del sprint`}
      />
      <KPICard
        icon={<Clock size={17} color="#E54861" />}
        iconBg="#FFF0F3"
        value={pendingTasks}
        valueColor="#E54861"
        label="Tareas Pendientes"
        line1={`${todoTasks} por hacer`}
        line2={`${inProgressTasks} en progreso`}
      />
    </div>
  );
}
