import { useEffect, useMemo, useState } from "react";
import { ChevronDown } from "lucide-react";
import { listarProyectos } from "../services/proyectos.service";
import {
  ACTIVE_PROJECT_CHANGED_EVENT,
  getActiveProjectId,
  setActiveProjectId,
} from "../services/project-context.service";

export function ProjectSelector({ value, onChange }) {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedProjectId, setSelectedProjectId] = useState(value || getActiveProjectId() || "");

  useEffect(() => {
    let isMounted = true;

    const loadProjects = async () => {
      try {
        setLoading(true);
        setError("");
        const response = await listarProyectos();
        const projectList = Array.isArray(response?.data) ? response.data : [];

        if (!isMounted) return;

        setProjects(projectList);

        const storedProjectId = getActiveProjectId();
        const initialProjectId = storedProjectId || projectList[0]?.id_proyecto || projectList[0]?.id || "";

        if (initialProjectId) {
          console.log("[metricas][ProjectSelector] Proyecto seleccionado:", initialProjectId);
          console.log("[metricas][ProjectSelector] ID enviado:", initialProjectId);
          setSelectedProjectId(initialProjectId);
          setActiveProjectId(initialProjectId);
          onChange?.(initialProjectId);
        }
      } catch (err) {
        if (!isMounted) return;
        setError(err.message || "No se pudieron cargar los proyectos");
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    loadProjects();

    const handleProjectChanged = (event) => {
      const nextProjectId = event.detail?.projectId || getActiveProjectId();
      setSelectedProjectId(nextProjectId || "");
    };

    window.addEventListener(ACTIVE_PROJECT_CHANGED_EVENT, handleProjectChanged);

    return () => {
      isMounted = false;
      window.removeEventListener(ACTIVE_PROJECT_CHANGED_EVENT, handleProjectChanged);
    };
  }, [onChange]);

  const selectedProject = useMemo(
    () => projects.find((project) => String(project.id_proyecto ?? project.id) === String(selectedProjectId)) || projects[0] || null,
    [projects, selectedProjectId],
  );

  const handleSelectChange = (event) => {
    const nextProjectId = event.target.value;
    console.log("[metricas][ProjectSelector] Proyecto seleccionado:", nextProjectId);
    console.log("[metricas][ProjectSelector] ID enviado:", nextProjectId);
    setSelectedProjectId(nextProjectId);
    setActiveProjectId(nextProjectId);
    onChange?.(nextProjectId);
  };

  const handleApplyProject = () => {
    if (!selectedProjectId) return;
    console.log("[metricas][ProjectSelector] Proyecto seleccionado:", selectedProjectId);
    console.log("[metricas][ProjectSelector] ID enviado:", selectedProjectId);
    setActiveProjectId(selectedProjectId);
    onChange?.(selectedProjectId);
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 6, minWidth: 220 }}>
      <label style={{ fontSize: 12, fontWeight: 700, color: "#374151" }}>Proyecto</label>
      <div style={{ position: "relative" }}>
        <select
          value={selectedProjectId}
          onChange={handleSelectChange}
          disabled={loading || projects.length === 0}
          style={{
            width: "100%",
            appearance: "none",
            padding: "10px 34px 10px 12px",
            borderRadius: 10,
            border: "1.5px solid #E5E7EB",
            background: "#ffffff",
            fontSize: 13,
            color: "#111827",
            fontWeight: 600,
            fontFamily: "inherit",
            cursor: loading ? "wait" : "pointer",
          }}
        >
          {!selectedProject && !loading && <option value="">Selecciona un proyecto</option>}
          {projects.map((project) => {
            const projectId = project.id_proyecto ?? project.id;
            const projectName = project.nombre || project.name || `Proyecto ${projectId}`;
            return (
              <option key={projectId} value={projectId}>
                {projectName}
              </option>
            );
          })}
        </select>
        <ChevronDown size={14} color="#9CA3AF" style={{ position: "absolute", right: 10, top: "50%", transform: "translateY(-50%)", pointerEvents: "none" }} />
      </div>
      <button
        type="button"
        onClick={handleApplyProject}
        disabled={!selectedProjectId || loading}
        style={{
          alignSelf: "flex-start",
          border: "none",
          borderRadius: 8,
          background: selectedProjectId ? "#7C4DFF" : "#E5E7EB",
          color: selectedProjectId ? "#ffffff" : "#6B7280",
          padding: "7px 10px",
          fontSize: 12,
          fontWeight: 700,
          cursor: selectedProjectId && !loading ? "pointer" : "not-allowed",
          fontFamily: "inherit",
        }}
      >
        Cambiar proyecto
      </button>
      {error ? <span style={{ fontSize: 11, color: "#B4233C" }}>{error}</span> : null}
      {loading ? <span style={{ fontSize: 11, color: "#6B7280" }}>Cargando proyectos...</span> : null}
    </div>
  );
}
