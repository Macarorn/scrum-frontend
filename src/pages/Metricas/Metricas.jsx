import { useEffect, useState } from "react";
import { Calendar, RefreshCw, ChevronDown } from "lucide-react";
import { useSearchParams } from "react-router-dom";
import { KPICards } from "../../components/KPICards";
import { ProjectProgressPanel } from "../../components/ProjectProgressPanel";
import { TaskStatusPanel } from "../../components/TaskStatusPanel";
import { TeamMemberPanel } from "../../components/TeamMemberPanel";
import { BacklogPanel } from "../../components/BacklogPanel";
import { EpicStatusPanel } from "../../components/EpicStatusPanel";
import { ProjectSelector } from "../../components/ProjectSelector";
import { useMetricasDashboard } from "../../hooks/useMetricasDashboard";
import { ACTIVE_PROJECT_CHANGED_EVENT, getActiveProjectId } from "../../services/project-context.service";

const sprints = ["Sprint 8", "Sprint 9", "Sprint 10", "Sprint 11"];

export default function Metricas() {
  const [searchParams] = useSearchParams();
  const [sprint, setSprint] = useState("Sprint 10");
  const [showDropdown, setShowDropdown] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [activeProjectId, setActiveProjectIdState] = useState(searchParams.get("id_proyecto") || getActiveProjectId() || "");
  const selectedProyecto = activeProjectId || searchParams.get("id_proyecto") || getActiveProjectId() || "";
  const {
    kpis,
    projectProgress,
    taskStatus,
    teamMembers = [],
    backlogStatus,
    epicStatus,
    loading,
    error,
    refreshing: metricasRefreshing,
    refresh,
  } = useMetricasDashboard(selectedProyecto);

  useEffect(() => {
    const handleProjectChanged = (event) => {
      const nextProjectId = event.detail?.projectId || getActiveProjectId();
      setActiveProjectIdState(nextProjectId || "");
    };

    window.addEventListener(ACTIVE_PROJECT_CHANGED_EVENT, handleProjectChanged);
    return () => window.removeEventListener(ACTIVE_PROJECT_CHANGED_EVENT, handleProjectChanged);
  }, []);

  const handleRefresh = () => {
    setRefreshing(true);
    refresh().finally(() => setRefreshing(false));
  };
  const isRefreshing = refreshing || metricasRefreshing;

  return (
    <div
      style={{
        background: "#F7F8FA",
        minHeight: "100vh",
        fontFamily: "'Inter', sans-serif",
      }}
    >
      <div
        style={{
          maxWidth: 1400,
          margin: "0 auto",
          padding: "20px 24px 32px",
          display: "flex",
          flexDirection: "column",
          gap: 14,
        }}
      >
        {/* Header */}
        <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 16 }}>
          <div>
            <h1
              style={{
                fontSize: 26,
                fontWeight: 800,
                color: "#111827",
                margin: 0,
                lineHeight: 1.2,
                letterSpacing: "-0.3px",
              }}
            >
              Dashboard del Proyecto
            </h1>
            <p style={{ fontSize: 13, color: "#6B7280", margin: "4px 0 0", fontWeight: 400 }}>
              Resumen general del estado del proyecto y progreso del equipo Scrum
            </p>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: 8, flexShrink: 0 }}>
            <div style={{ position: "relative" }}>
              <button
                onClick={() => setShowDropdown(!showDropdown)}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 6,
                  height: 38,
                  padding: "0 14px",
                  border: "1.5px solid #E5E7EB",
                  borderRadius: 10,
                  background: "#ffffff",
                  cursor: "pointer",
                  fontSize: 12,
                  color: "#374151",
                  fontWeight: 500,
                  fontFamily: "inherit",
                  boxShadow: "0 1px 3px rgba(0,0,0,0.05)",
                }}
              >
                <Calendar size={13} color="#9CA3AF" />
                <span style={{ color: "#9CA3AF", fontSize: 11 }}>Periodo:</span>
                <span style={{ fontWeight: 700, color: "#1F2937" }}>{sprint}</span>
                <ChevronDown
                  size={12}
                  color="#9CA3AF"
                  style={{
                    transform: showDropdown ? "rotate(180deg)" : "rotate(0deg)",
                    transition: "transform 0.2s",
                  }}
                />
              </button>

              {showDropdown && (
                <div
                  style={{
                    position: "absolute",
                    top: "calc(100% + 5px)",
                    right: 0,
                    background: "#ffffff",
                    border: "1.5px solid #E5E7EB",
                    borderRadius: 10,
                    boxShadow: "0 6px 20px rgba(0,0,0,0.08)",
                    zIndex: 200,
                    overflow: "hidden",
                    minWidth: 140,
                  }}
                >
                  {sprints.map((s) => (
                    <button
                      key={s}
                      onClick={() => {
                        setSprint(s);
                        setShowDropdown(false);
                      }}
                      style={{
                        display: "block",
                        width: "100%",
                        padding: "8px 14px",
                        textAlign: "left",
                        border: "none",
                        background: sprint === s ? "#EAF7E1" : "transparent",
                        color: sprint === s ? "#39A900" : "#374151",
                        fontWeight: sprint === s ? 700 : 400,
                        fontSize: 12,
                        cursor: "pointer",
                        fontFamily: "inherit",
                      }}
                    >
                      {s}
                    </button>
                  ))}
                </div>
              )}
            </div>

            <button
              onClick={handleRefresh}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 6,
                height: 38,
                padding: "0 16px",
                background: "#39A900",
                border: "none",
                borderRadius: 10,
                color: "#ffffff",
                fontSize: 12,
                fontWeight: 600,
                cursor: "pointer",
                fontFamily: "inherit",
                boxShadow: "0 2px 6px rgba(57,169,0,0.28)",
                transition: "background 0.15s",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = "#2E8B00";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = "#39A900";
              }}
            >
              <RefreshCw
                size={13}
                style={{ animation: isRefreshing ? "spin 0.7s linear infinite" : "none" }}
              />
              Actualizar
            </button>
          </div>
        </div>

        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12, flexWrap: "wrap" }}>
          <ProjectSelector value={selectedProyecto} onChange={setActiveProjectIdState} />
          <div style={{ fontSize: 12, color: "#6B7280" }}>
            {selectedProyecto ? `Mostrando datos del proyecto activo` : "Selecciona un proyecto para ver sus métricas"}
          </div>
        </div>

        {error && (
          <div style={{ background: "#FFF0F3", color: "#B4233C", borderRadius: 10, padding: "10px 14px", fontSize: 13, fontWeight: 600 }}>
            {error}
          </div>
        )}

        {loading ? (
          <div style={{ background: "#ffffff", borderRadius: 12, padding: "20px 16px", textAlign: "center", color: "#6B7280", fontSize: 13 }}>
            Cargando métricas del proyecto...
          </div>
        ) : !selectedProyecto ? (
          <div style={{ background: "#ffffff", borderRadius: 12, padding: "20px 16px", textAlign: "center", color: "#6B7280", fontSize: 13 }}>
            No hay un proyecto seleccionado. Elige uno desde el selector para ver sus métricas.
          </div>
        ) : !kpis && !projectProgress && !taskStatus && !backlogStatus && !epicStatus && !teamMembers?.length ? (
          <div style={{ background: "#ffffff", borderRadius: 12, padding: "20px 16px", textAlign: "center", color: "#6B7280", fontSize: 13 }}>
            No hay datos disponibles para este proyecto todavía.
          </div>
        ) : (
          <>
            <KPICards kpis={kpis} loading={loading} />

            <div style={{ display: "grid", gridTemplateColumns: "44% 1fr 1fr", gap: 12, alignItems: "stretch" }}>
              <ProjectProgressPanel progress={projectProgress} loading={loading} />
              <TaskStatusPanel status={taskStatus} loading={loading} />
              <TeamMemberPanel members={teamMembers || []} />
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, alignItems: "stretch" }}>
              <BacklogPanel backlog={backlogStatus} loading={loading} />
              <EpicStatusPanel epicStatus={epicStatus} loading={loading} />
            </div>
          </>
        )}
      </div>

      <style>{`
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        ::-webkit-scrollbar { width: 4px; }
        ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { background: #E5E7EB; border-radius: 999px; }
      `}</style>
    </div>
  );
}
