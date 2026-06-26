import { useEffect, useMemo, useRef, useState } from "react";
import { Calendar, RefreshCw, ChevronDown, Download } from "lucide-react";
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
import { listarSprintsPorProyecto } from "../../services/sprint.service";
import { exportMetricsExcel, exportMetricsPdf } from "../../utils/metricas-export";

export default function Metricas() {
  const [searchParams] = useSearchParams();
  const [sprints, setSprints] = useState([]);
  const [selectedSprintId, setSelectedSprintId] = useState("");
  const [sprintsLoaded, setSprintsLoaded] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const [showExportDropdown, setShowExportDropdown] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [activeProjectId, setActiveProjectIdState] = useState(searchParams.get("id_proyecto") || getActiveProjectId() || "");
  const dashboardRef = useRef(null);
  const selectedProyecto = activeProjectId || searchParams.get("id_proyecto") || getActiveProjectId() || "";
  const selectedSprint = useMemo(
    () => sprints.find((item) => String(item.id_sprint) === String(selectedSprintId)) || null,
    [sprints, selectedSprintId],
  );
  const sprintLabel = selectedSprint?.nombre || "Selecciona un sprint";
  const {
    kpis,
    projectProgress,
    taskStatus,
    teamMembers = [],
    backlogStatus,
    epicStatus,
    epicas,
    historias,
    tareas,
    usuarios,
    loading,
    error,
    refreshing: metricasRefreshing,
    refresh,
  } = useMetricasDashboard(selectedProyecto, selectedSprintId);

  useEffect(() => {
    const handleProjectChanged = (event) => {
      const nextProjectId = event.detail?.projectId || getActiveProjectId();
      setActiveProjectIdState(nextProjectId || "");
    };

    window.addEventListener(ACTIVE_PROJECT_CHANGED_EVENT, handleProjectChanged);
    return () => window.removeEventListener(ACTIVE_PROJECT_CHANGED_EVENT, handleProjectChanged);
  }, []);

  // Effect 1: Load sprints when project changes
  useEffect(() => {
    let isMounted = true;

    const loadSprints = async () => {
      if (!selectedProyecto) {
        setSprints([]);
        setSelectedSprintId("");
        setSprintsLoaded(false);
        return;
      }

      setSprintsLoaded(false);
      setSprints([]);
      setSelectedSprintId("");

      try {
        const sprintOptions = await listarSprintsPorProyecto(selectedProyecto);
        if (!isMounted) return;
        const items = Array.isArray(sprintOptions) ? sprintOptions : [];
        setSprints(items);
        if (items.length > 0) {
          setSelectedSprintId(items[0].id_sprint);
        }
        setSprintsLoaded(true);
      } catch (err) {
        if (!isMounted) return;
        setSprints([]);
        setSelectedSprintId("");
        setSprintsLoaded(true);
      }
    };

    loadSprints();

    return () => {
      isMounted = false;
    };
  }, [selectedProyecto]);

  // Effect 2: Load metrics when sprint changes
  useEffect(() => {
    if (!selectedProyecto || !sprintsLoaded) return;
    refresh();
  }, [selectedSprintId, sprintsLoaded]);

  const handleRefresh = () => {
    setRefreshing(true);
    refresh().finally(() => setRefreshing(false));
  };

  const handleExport = async (type) => {
    setShowExportDropdown(false);

    const exportData = {
      kpis,
      projectProgress,
      taskStatus,
      teamMembers,
      backlogStatus,
      epicStatus,
      epicas,
      historias,
      tareas,
      usuarios,
    };

    if (type === "pdf") {
      await exportMetricsPdf({
        dashboardElement: dashboardRef.current,
        projectName: "",
        sprintName: sprintLabel,
        data: exportData,
      });
      return;
    }

    exportMetricsExcel({
      data: exportData,
      projectName: "",
      sprintName: sprintLabel,
    });
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
                <span style={{ fontWeight: 700, color: "#1F2937" }}>{sprintLabel}</span>
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
                  {sprints.map((item) => (
                    <button
                      key={item.id_sprint}
                      onClick={() => {
                        setSelectedSprintId(item.id_sprint);
                        setShowDropdown(false);
                      }}
                      style={{
                        display: "block",
                        width: "100%",
                        padding: "8px 14px",
                        textAlign: "left",
                        border: "none",
                        background:
                          String(selectedSprintId) === String(item.id_sprint)
                            ? "#EAF7E1"
                            : "transparent",
                        color:
                          String(selectedSprintId) === String(item.id_sprint)
                            ? "#39A900"
                            : "#374151",
                        fontWeight: String(selectedSprintId) === String(item.id_sprint) ? 700 : 400,
                        fontSize: 12,
                        cursor: "pointer",
                        fontFamily: "inherit",
                      }}
                    >
                      {item.nombre || `Sprint ${item.id_sprint}`}
                    </button>
                  ))}
                </div>
              )}
            </div>

            <div style={{ position: "relative" }}>
              <button
                onClick={() => setShowExportDropdown((value) => !value)}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 6,
                  height: 38,
                  padding: "0 14px",
                  background: "#ffffff",
                  border: "1.5px solid #E5E7EB",
                  borderRadius: 10,
                  color: "#374151",
                  fontSize: 12,
                  fontWeight: 600,
                  cursor: "pointer",
                  fontFamily: "inherit",
                  boxShadow: "0 1px 3px rgba(0,0,0,0.05)",
                }}
              >
                <Download size={13} color="#39A900" />
                Exportar
                <ChevronDown size={12} color="#9CA3AF" />
              </button>

              {showExportDropdown && (
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
                    minWidth: 120,
                  }}
                >
                  <button
                    onClick={() => handleExport("pdf")}
                    style={{
                      display: "block",
                      width: "100%",
                      padding: "8px 12px",
                      border: "none",
                      background: "#ffffff",
                      textAlign: "left",
                      color: "#374151",
                      fontSize: 12,
                      cursor: "pointer",
                      fontFamily: "inherit",
                    }}
                  >
                    PDF
                  </button>
                  <button
                    onClick={() => handleExport("excel")}
                    style={{
                      display: "block",
                      width: "100%",
                      padding: "8px 12px",
                      border: "none",
                      background: "#ffffff",
                      textAlign: "left",
                      color: "#374151",
                      fontSize: 12,
                      cursor: "pointer",
                      fontFamily: "inherit",
                    }}
                  >
                    Excel
                  </button>
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

        <div ref={dashboardRef}>
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

            <div style={{ display: "grid", gridTemplateColumns: "repeat(3, minmax(0, 1fr))", gridAutoRows: "minmax(320px, auto)", gap: 16, alignItems: "stretch" }}>
              <ProjectProgressPanel progress={projectProgress} loading={loading} />
              <TaskStatusPanel status={taskStatus} loading={loading} />
              <TeamMemberPanel members={teamMembers || []} projectId={selectedProyecto} />
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "repeat(2, minmax(0, 1fr))", gridAutoRows: "minmax(320px, auto)", gap: 16, alignItems: "stretch" }}>
              <BacklogPanel backlog={backlogStatus} loading={loading} />
              <EpicStatusPanel epicStatus={epicStatus} loading={loading} />
            </div>
          </>
        )}
        </div>
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
