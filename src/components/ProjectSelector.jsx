import { useEffect, useMemo, useState } from "react";
import { ChevronDown, Folder } from "lucide-react";
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
  const [showDropdown, setShowDropdown] = useState(false);

  useEffect(() => {
    if (value !== undefined && value !== null && value !== "") {
      setSelectedProjectId(String(value));
    }
  }, [value]);

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

  const handleSelectChange = (projectId) => {
    setSelectedProjectId(projectId);
    setActiveProjectId(projectId);
    onChange?.(projectId);
    setShowDropdown(false);
  };

  const projectLabel = selectedProject
    ? selectedProject.nombre || selectedProject.name || `Proyecto ${selectedProject.id_proyecto ?? selectedProject.id}`
    : "Selecciona un proyecto";

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 6, minWidth: 220 }}>
      <div style={{ position: "relative" }}>
        <button
          type="button"
          onClick={() => !loading && setShowDropdown((current) => !current)}
          style={{
            display: "flex",
            alignItems: "center",
            gap: 8,
            height: 40,
            padding: "0 16px",
            border: "1px solid #E5E7EB",
            borderRadius: 8,
            background: "#ffffff",
            cursor: loading ? "wait" : "pointer",
            fontSize: 12,
            color: "#111827",
            fontWeight: 500,
            fontFamily: "inherit",
            boxShadow: "0 1px 3px rgba(0,0,0,0.05)",
            width: "100%",
            textAlign: "left",
            outline: "none",
          }}
        >
          <Folder size={14} color="#9CA3AF" strokeWidth={2} />
          <span style={{ color: "#9CA3AF", fontFamily: "DM Sans, Arial, sans-serif", fontSize: 11, fontWeight: 500, lineHeight: "16px", display: "inline-flex", alignItems: "center" }}>
            Proyecto:
          </span>
          <span style={{ fontWeight: 700, color: "#111827", flex: 1, minWidth: 0, textAlign: "left" }}>{projectLabel}</span>
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
              border: "1px solid #E5E7EB",
              borderRadius: 10,
              boxShadow: "0 6px 20px rgba(0,0,0,0.08)",
              zIndex: 200,
              overflow: "hidden",
              minWidth: 140,
            }}
          >
            {projects.map((project) => {
              const projectId = project.id_proyecto ?? project.id;
              const projectName = project.nombre || project.name || `Proyecto ${projectId}`;
              const selected = String(projectId) === String(selectedProjectId);
              return (
                <button
                  key={projectId}
                  type="button"
                  onClick={() => handleSelectChange(String(projectId))}
                  style={{
                    display: "block",
                    width: "100%",
                    padding: "8px 14px",
                    textAlign: "left",
                    border: "none",
                    background: selected ? "#EAF7E1" : "transparent",
                    color: selected ? "#39A900" : "#374151",
                    fontWeight: selected ? 700 : 400,
                    fontSize: 12,
                    cursor: "pointer",
                    fontFamily: "inherit",
                  }}
                >
                  {projectName}
                </button>
              );
            })}
          </div>
        )}
      </div>
      {error ? <span style={{ fontSize: 11, color: "#B4233C" }}>{error}</span> : null}
      {loading ? <span style={{ fontSize: 11, color: "#6B7280" }}>Cargando proyectos...</span> : null}
    </div>
  );
}
