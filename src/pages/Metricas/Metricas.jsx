import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { Folder, RefreshCw, ChevronDown } from "lucide-react";
import { KPICards } from "../../components/KPICards";
import { ProjectProgressPanel } from "../../components/ProjectProgressPanel";
import { TaskStatusPanel } from "../../components/TaskStatusPanel";
import { TeamMemberPanel } from "../../components/TeamMemberPanel";
import { BacklogPanel } from "../../components/BacklogPanel";
import { EpicStatusPanel } from "../../components/EpicStatusPanel";
import { getActiveProjectId, setActiveProjectId } from "../../services/project-context.service";
import { listarProyectos } from "../../services/proyectos.service";
import { obtenerMetricasProyecto } from "../../services/metricas.service";
import ScrumTrackLoader from "../../components/ScrumTrackLoader";

export default function Metricas() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [proyectos, setProyectos] = useState([]);
  const [selectedProyecto, setSelectedProyecto] = useState("");
  const [metricas, setMetricas] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showDropdown, setShowDropdown] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  // Cargar proyectos en el montaje
  useEffect(() => {
    const loadProjects = async () => {
      try {
        const response = await listarProyectos();
        const items = response.data || [];
        setProyectos(items);

        if (items.length > 0) {
          const queryProj = searchParams.get("id_proyecto");
          const activeProj = getActiveProjectId();

          const currentProject = items.some(
            (item) => String(item.id_proyecto) === String(queryProj)
          )
            ? queryProj
            : items.some(
                (item) => String(item.id_proyecto) === String(activeProj)
              )
              ? activeProj
              : String(items[0].id_proyecto);

          setSelectedProyecto(currentProject);
          setActiveProjectId(currentProject);
          setSearchParams({ id_proyecto: currentProject }, { replace: true });
        } else {
          setSelectedProyecto("");
          setActiveProjectId("");
          setSearchParams({}, { replace: true });
          setLoading(false);
        }
      } catch (err) {
        console.error("Error al cargar proyectos:", err);
        setLoading(false);
      }
    };
    loadProjects();
  }, []);

  // Cargar métricas cuando cambie el proyecto seleccionado
  const fetchMetricas = async (projId) => {
    if (!projId) {
      setMetricas(null);
      setLoading(false);
      return;
    }
    setLoading(true);
    try {
      const data = await obtenerMetricasProyecto(projId);
      setMetricas(data);
    } catch (err) {
      console.error("Error al obtener métricas:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (selectedProyecto) {
      fetchMetricas(selectedProyecto);
    }
  }, [selectedProyecto]);

  const handleRefresh = async () => {
    if (!selectedProyecto) return;
    setRefreshing(true);
    try {
      await fetchMetricas(selectedProyecto);
    } catch (err) {
      console.error(err);
    } finally {
      setRefreshing(false);
    }
  };

  const activeProjObj = proyectos.find((p) => String(p.id_proyecto) === String(selectedProyecto));
  const activeProjName = activeProjObj ? activeProjObj.nombre : "Sin proyecto";

  return (
    <div
      style={{
        background: "#F7F8FA",
        minHeight: "100vh",
        fontFamily: "'Inter', sans-serif",
      }}
    >
      <ScrumTrackLoader show={loading && !refreshing} />

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
                disabled={proyectos.length === 0}
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
                <Folder size={13} color="#9CA3AF" />
                <span style={{ color: "#9CA3AF", fontSize: 11 }}>Proyecto:</span>
                <span style={{ fontWeight: 700, color: "#1F2937" }}>{activeProjName}</span>
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
                    minWidth: 200,
                  }}
                >
                  {proyectos.map((p) => (
                    <button
                      key={p.id_proyecto}
                      onClick={() => {
                        const pid = String(p.id_proyecto);
                        setSelectedProyecto(pid);
                        setActiveProjectId(pid);
                        setSearchParams({ id_proyecto: pid }, { replace: true });
                        setShowDropdown(false);
                      }}
                      style={{
                        display: "block",
                        width: "100%",
                        padding: "8px 14px",
                        textAlign: "left",
                        border: "none",
                        background: selectedProyecto === String(p.id_proyecto) ? "#EAF7E1" : "transparent",
                        color: selectedProyecto === String(p.id_proyecto) ? "#39A900" : "#374151",
                        fontWeight: selectedProyecto === String(p.id_proyecto) ? 700 : 400,
                        fontSize: 12,
                        cursor: "pointer",
                        fontFamily: "inherit",
                        whiteSpace: "nowrap",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                      }}
                    >
                      {p.nombre}
                    </button>
                  ))}
                </div>
              )}
            </div>

            <button
              onClick={handleRefresh}
              disabled={!selectedProyecto}
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
                if (selectedProyecto) e.currentTarget.style.background = "#2E8B00";
              }}
              onMouseLeave={(e) => {
                if (selectedProyecto) e.currentTarget.style.background = "#39A900";
              }}
            >
              <RefreshCw
                size={13}
                style={{ animation: refreshing ? "spin 0.7s linear infinite" : "none" }}
              />
              Actualizar
            </button>
          </div>
        </div>

        {proyectos.length === 0 && !loading ? (
          <div style={{ textAlign: "center", padding: "40px 20px", background: "#fff", borderRadius: 16, boxShadow: "0 2px 8px rgba(0,0,0,0.05)" }}>
            <p style={{ color: "#6B7280", margin: 0 }}>No hay proyectos creados o asociados a este usuario.</p>
          </div>
        ) : (
          <>
            <KPICards data={metricas?.kpis} />

            <div style={{ display: "grid", gridTemplateColumns: "44% 1fr 1fr", gap: 12, alignItems: "stretch" }}>
              <ProjectProgressPanel data={metricas?.projectProgress} />
              <TaskStatusPanel data={metricas?.taskStatus} />
              <TeamMemberPanel data={metricas?.teamMembers} />
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, alignItems: "stretch" }}>
              <BacklogPanel data={metricas?.backlogStatus} />
              <EpicStatusPanel data={metricas?.epicStatus} />
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
