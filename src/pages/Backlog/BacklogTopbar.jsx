import React, { useState, useEffect } from "react";
import SearchBox from "../../components/SearchBox/SearchBox";

export default function BacklogTopbar({
  proyectos,
  selectedProyecto,
  epicas,
  selectedEpica,
  loading,
  loadingEpicas,
  epicaCounts,
  searchTerm,
  setSearchTerm,
  setSelectedProyecto,
  setActiveProjectId,
  setSelectedEpica,
  setEpicas,
  setHistorias,
  setCriteriaCounts,
  syncQuery,
  navigate,
  openNewHistoria,
  epicaLabel,
  canEdit
}) {
  const [projectMenuOpen, setProjectMenuOpen] = useState(false);
  const [projectMenuRight, setProjectMenuRight] = useState(false);
  const [epicaMenuOpen, setEpicaMenuOpen] = useState(false);

  // close project/epica pickers when clicking outside or pressing Escape
  useEffect(() => {
    if (!projectMenuOpen && !epicaMenuOpen) return undefined;

    const handleOutside = (event) => {
      if (event.target.closest && event.target.closest(".backlog-epica-picker"))
        return;
      setProjectMenuOpen(false);
      setEpicaMenuOpen(false);
    };

    const handleEsc = (event) => {
      if (event.key === "Escape") {
        setProjectMenuOpen(false);
        setEpicaMenuOpen(false);
      }
    };

    document.addEventListener("mousedown", handleOutside);
    document.addEventListener("keydown", handleEsc);
    return () => {
      document.removeEventListener("mousedown", handleOutside);
      document.removeEventListener("keydown", handleEsc);
    };
  }, [projectMenuOpen, epicaMenuOpen]);

  return (
    <>
      <header className="backlog-topbar">
        <div className="backlog-topbar-left">
          <div className="backlog-title-row">
            <h1 className="backlog-title">Gestor de Backlog</h1>
            <div className="backlog-selector backlog-project-selector">
              <div className="backlog-epica-picker">
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
                  <span>
                    {proyectos.find(
                      (p) => String(p.id_proyecto) === String(selectedProyecto),
                    )?.nombre || "Sin proyecto"}
                  </span>
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
                            const nextProject = String(proyecto.id_proyecto);
                            setSelectedProyecto(nextProject);
                            setActiveProjectId(nextProject);
                            setSelectedEpica("");
                            setEpicas([]);
                            setHistorias([]);
                            setCriteriaCounts({});
                            setEpicaMenuOpen(false);
                            syncQuery(nextProject, "");
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
          </div>
          <div className="backlog-epica-picker backlog-epica-picker-inline">
            <div className="backlog-epica-inline-wrap">
              <label className="backlog-epica-label">Épica:</label>
              <button
                type="button"
                className="backlog-epica-toggle backlog-epica-toggle-inline"
                onClick={() => setEpicaMenuOpen((prev) => !prev)}
                disabled={loadingEpicas || epicas.length === 0}
                aria-haspopup="menu"
                aria-expanded={epicaMenuOpen}
              >
                <span className="backlog-epica-button-label">{epicaLabel}</span>
                <span className="backlog-epica-caret">▾</span>
              </button>
            </div>

            {epicaMenuOpen && (
              <div className="backlog-epica-menu" role="menu">
                <div className="backlog-epica-menu-list">
                  {epicas.map((epica) => {
                    const isSelected =
                      String(epica.id) === String(selectedEpica);

                    return (
                      <button
                        key={epica.id}
                        type="button"
                        className={`backlog-epica-item ${isSelected ? "selected" : ""}`}
                        onClick={() => {
                          setSelectedEpica(String(epica.id));
                          setEpicaMenuOpen(false);
                          syncQuery(selectedProyecto, String(epica.id));
                        }}
                      >
                        <span className="backlog-epica-item-name">
                          {epica.nombre}
                        </span>
                        <span className="backlog-epica-item-count">
                          H. Usuario {epicaCounts[epica.id] ?? 0}
                        </span>
                      </button>
                    );
                  })}
                </div>

                <button
                  type="button"
                  className="backlog-epica-all"
                  onClick={() => {
                    setEpicaMenuOpen(false);
                    navigate(`/epicas?id_proyecto=${selectedProyecto}`);
                  }}
                >
                  Ver todas las Epicas
                </button>
              </div>
            )}
          </div>
        </div>

        <div className="backlog-actions">
          {canEdit && (
            <button
              type="button"
              className="btn-new-backlog"
              onClick={openNewHistoria}
              disabled={!selectedEpica}
            >
              + Nueva Historia
            </button>
          )}

          <SearchBox
            value={searchTerm}
            onChange={(event) => setSearchTerm(event.target.value)}
            placeholder="Buscar"
            className="backlog-search"
          />
        </div>
      </header>
      {epicaMenuOpen && (
        <div
          className="backlog-menu-overlay"
          onClick={() => {
            setEpicaMenuOpen(false);
          }}
        />
      )}
    </>
  );
}
