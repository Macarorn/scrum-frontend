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

export function KPICards() {
  return (
    <div style={{ display: "grid", gridTemplateColumns: "repeat(6, 1fr)", gap: 12 }}>
      <KPICard
        icon={<Folder size={17} color="#39A900" />}
        iconBg="#EAF7E1"
        value="74%"
        valueColor="#39A900"
        label="Progreso del Backlog"
        line1="89 de 120"
        line2="Elementos completados"
        progress={74}
      />
      <KPICard
        icon={<Trophy size={17} color="#7C4DFF" />}
        iconBg="#F3EEFF"
        value={8}
        valueColor="#7C4DFF"
        label="Épicas Completadas"
        line1="de 11 épicas"
        line2="73% del total"
      />
      <KPICard
        icon={<ClipboardList size={17} color="#FF8A26" />}
        iconBg="#FFF3E8"
        value={3}
        valueColor="#FF8A26"
        label="Épicas Pendientes"
        line1="por completar"
        line2="27% del total"
      />
      <KPICard
        icon={<User size={17} color="#2F80ED" />}
        iconBg="#EAF4FF"
        value={45}
        valueColor="#2F80ED"
        label="Historias de Usuario"
        line1="29 completadas"
        line2="10 en proceso"
      />
      <KPICard
        icon={<CheckCircle size={17} color="#39A900" />}
        iconBg="#EAF7E1"
        value={89}
        valueColor="#39A900"
        label="Tareas Completadas"
        line1="de 120 tareas"
        line2="74% del sprint"
      />
      <KPICard
        icon={<Clock size={17} color="#E54861" />}
        iconBg="#FFF0F3"
        value={31}
        valueColor="#E54861"
        label="Tareas Pendientes"
        line1="10 por hacer"
        line2="8 en progreso"
      />
    </div>
  );
}
