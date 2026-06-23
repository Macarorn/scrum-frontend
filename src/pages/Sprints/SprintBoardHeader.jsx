import React, { useState, useEffect } from "react";

export default function SprintBoardHeader({
  sprintActual,
  proyectoActual,
  proyectos,
  selectedProyecto,
  setSelectedProyecto,
  setActiveProjectId,
  sprints,
  selectedSprint,
  setSelectedSprint,
  loading,
  loadingSprints,
  setTareas,
  setOpenMenuTaskId,
  setSelectedTaskDetail,
  syncQuery,
  navigate
}) {
  const [projectMenuOpen, setProjectMenuOpen] = useState(false);
  const [projectMenuRight, setProjectMenuRight] = useState(false);
  const [sprintMenuOpen, setSprintMenuOpen] = useState(false);
  const [sprintMenuRight, setSprintMenuRight] = useState(false);

  // close project/sprint pickers when clicking outside or pressing Escape
  useEffect(() => {
    if (!projectMenuOpen && !sprintMenuOpen) return undefined;

    const handleOutside = (event) => {
      if (event.target.closest && event.target.closest(".backlog-epica-picker"))
        return;
      setProjectMenuOpen(false);
      setSprintMenuOpen(false);
    };

    const handleEsc = (event) => {
      if (event.key === "Escape") {
        setProjectMenuOpen(false);
        setSprintMenuOpen(false);
      }
    };

    document.addEventListener("mousedown", handleOutside);
    document.addEventListener("keydown", handleEsc);
    return () => {
      document.removeEventListener("mousedown", handleOutside);
      document.removeEventListener("keydown", handleEsc);
    };
  }, [projectMenuOpen, sprintMenuOpen]);

  return (
    <div className="sprint-topbar">
      <div>
        <h1 className="sprint-title">
          {sprintActual ? sprintActual.nombre : "Sprint"}
        </h1>
        <div
          className="backlog-project-selector backlog-epica-picker"
          style={{ marginTop: 4 }}
        >
          <button
            type="button"
            className="backlog-epica-toggle"
            onClick={(e) => {
              const rect = e.currentTarget.getBoundingClientRect();
              const shouldRight = window.innerWidth - rect.right < 360;
              setProjectMenuRight(shouldRight);
              setProjectMenuOpen((prev) => !prev);
            }}
            disabled={loading || proyectos.length === 0}
            aria-haspopup="menu"
            aria-expanded={projectMenuOpen}
          >
            <span>{proyectoActual?.nombre || "Sin proyecto"}</span>
            <span className="backlog-epica-caret">▾</span>
          </button>

          {projectMenuOpen && (
            <div
              className={`backlog-epica-menu ${projectMenuRight ? "menu-right" : ""}`}
              role="menu"
            >
              <div className="backlog-epica-menu-list">
                {proyectos.map((proyecto) => (
                  <button
                    key={proyecto.id_proyecto}
                    type="button"
                    className={`backlog-epica-item ${String(proyecto.id_proyecto) === String(selectedProyecto) ? "selected" : ""}`}
                    onClick={() => {
                      const nextProyecto = String(proyecto.id_proyecto);
                      setSelectedProyecto(nextProyecto);
                      setActiveProjectId(nextProyecto);
                      setSelectedSprint("");
                      setSprints([]);
                      setTareas([]);
                      setOpenMenuTaskId(null);
                      setSelectedTaskDetail(null);
                      syncQuery(nextProyecto, "");
                      setProjectMenuOpen(false);
                    }}
                  >
                    <span className="backlog-epica-item-name">
                      {proyecto.nombre}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="sprint-actions">
        <div className="selector-box">
          <label>Sprint</label>
          <div className="backlog-epica-picker">
            <button
              type="button"
              className="backlog-epica-toggle"
              onClick={(e) => {
                const rect = e.currentTarget.getBoundingClientRect();
                const shouldRight = window.innerWidth - rect.right < 360;
                setSprintMenuRight(shouldRight);
                setSprintMenuOpen((prev) => !prev);
              }}
              disabled={loadingSprints || sprints.length === 0}
            >
              <span>
                {sprints.find(
                  (s) => String(s.id_sprint) === String(selectedSprint),
                )?.nombre || "Sin sprint"}
              </span>
              <span className="backlog-epica-caret">▾</span>
            </button>

            {sprintMenuOpen && (
              <div
                className={`backlog-epica-menu ${sprintMenuRight ? "menu-right" : ""}`}
                role="menu"
              >
                <div className="backlog-epica-menu-list">
                  {sprints.map((sprint) => (
                    <button
                      key={sprint.id_sprint}
                      type="button"
                      className={`backlog-epica-item ${String(sprint.id_sprint) === String(selectedSprint) ? "selected" : ""}`}
                      onClick={() => {
                        const nextSprint = String(sprint.id_sprint);
                        setSelectedSprint(nextSprint);
                        syncQuery(selectedProyecto, nextSprint);
                        setSprintMenuOpen(false);
                      }}
                    >
                      <span className="backlog-epica-item-name">
                        {sprint.nombre}
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="sprint-nav-buttons">
          <button
            type="button"
            className="btn-backlog"
            onClick={() => navigate(`/sprints?id_proyecto=${selectedProyecto}`)}
            disabled={!selectedProyecto}
          >
            Ver Sprints
          </button>

          <button
            type="button"
            className="btn-backlog"
            onClick={() => navigate(`/backlog?id_proyecto=${selectedProyecto}`)}
            disabled={!selectedProyecto}
          >
            Backlog
          </button>
        </div>
      </div>
    </div>
  );
}
