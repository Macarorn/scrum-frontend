import { useEffect, useMemo, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import AutoDismissAlert from "../../components/AutoDismissAlert";
import { clearSessionTokens, getAccessToken } from "../../services/auth.service";
import { getActiveProjectId, setActiveProjectId } from "../../services/project-context.service";
import {
  actualizarHistoria,
  crearHistoria,
  eliminarHistoria,
  listarCriteriosHistoria,
  listarHistoriasPorEpica,
} from "../../services/historias.service";
import { listarProyectos } from "../../services/proyectos.service";
import "../../styles/Backlog.css";

const PRIORIDADES = [1, 2, 3, 4, 5];

const normalizeId = (item, keys) => {
  for (const key of keys) {
    if (item?.[key] !== undefined && item?.[key] !== null) {
      return item[key];
    }
  }

  return "";
};

const normalizeHistoria = (item) => ({
  ...item,
  id: normalizeId(item, ["id", "id_historia"]),
  epicaId: normalizeId(item, ["epicaId", "id_epica"]),
  storyPoints: normalizeId(item, ["storyPoints", "story_points"]) || 3,
  prioridad: normalizeId(item, ["prioridad"]) || 3,
});

const normalizeEpica = (item) => ({
  ...item,
  id: normalizeId(item, ["id", "id_epica"]),
  proyectoId: normalizeId(item, ["proyectoId", "id_proyecto"]),
});

export default function Backlog() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  const [proyectos, setProyectos] = useState([]);
  const [epicas, setEpicas] = useState([]);
  const [historias, setHistorias] = useState([]);
  const [criteriaCounts, setCriteriaCounts] = useState({});
  const [epicaCounts, setEpicaCounts] = useState({});

  const [selectedProyecto, setSelectedProyecto] = useState(
    searchParams.get("id_proyecto") || getActiveProjectId() || "",
  );
  const [selectedEpica, setSelectedEpica] = useState(searchParams.get("id_epica") || "");
  const [searchTerm, setSearchTerm] = useState("");

  const [loading, setLoading] = useState(true);
  const [projectMenuOpen, setProjectMenuOpen] = useState(false);
  const [projectMenuRight, setProjectMenuRight] = useState(false);
  const [loadingEpicas, setLoadingEpicas] = useState(false);
  const [loadingHistorias, setLoadingHistorias] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [openMenuId, setOpenMenuId] = useState(null);
  const [menuCoords, setMenuCoords] = useState(null);
  const [epicaMenuOpen, setEpicaMenuOpen] = useState(false);
  const [editingHistoriaId, setEditingHistoriaId] = useState(null);
  const [isEditingHistoria, setIsEditingHistoria] = useState(false);
  const [formOpen, setFormOpen] = useState(false);
  const [form, setForm] = useState({
    nombre: "",
    descripcion: "",
    prioridad: 3,
    storyPoints: 3,
  });

  const handleAuthError = () => {
    clearSessionTokens();
    navigate("/login", { replace: true });
  };

  const syncQuery = (nextProyecto, nextEpica) => {
    const nextQuery = {};

    if (nextProyecto) nextQuery.id_proyecto = nextProyecto;
    if (nextEpica) nextQuery.id_epica = nextEpica;

    setSearchParams(nextQuery, { replace: true });
  };

  useEffect(() => {
    const loadProjects = async () => {
      setLoading(true);
      setError("");
      setSuccess("");

      try {
        const response = await listarProyectos();
        const items = response.data || [];
        setProyectos(items);

        if (items.length === 0) {
          setSelectedProyecto("");
          setActiveProjectId("");
          setSelectedEpica("");
          setEpicas([]);
          setHistorias([]);
          return;
        }

        const currentProject = items.some((item) => String(item.id_proyecto) === String(selectedProyecto))
          ? selectedProyecto
          : String(items[0].id_proyecto);

        setSelectedProyecto(currentProject);
        setActiveProjectId(currentProject);
      } catch (err) {
        if (err.code === "UNAUTHENTICATED") {
          handleAuthError();
          return;
        }

        setError(err.message || "No se pudieron cargar los proyectos");
      } finally {
        setLoading(false);
      }
    };

    loadProjects();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!selectedProyecto) {
      setActiveProjectId("");
      setEpicas([]);
      setSelectedEpica("");
      setHistorias([]);
      syncQuery("", "");
      return;
    }

    setActiveProjectId(selectedProyecto);
    setEpicas([]);
    setSelectedEpica("");
    setHistorias([]);
    setCriteriaCounts({});
    setOpenMenuId(null);

    const loadEpicas = async () => {
      setLoadingEpicas(true);
      setError("");
      setSuccess("");

      try {
        const token = getAccessToken();
        if (!token) {
          throw { code: "UNAUTHENTICATED" };
        }

        const response = await fetch(`http://localhost:3000/api/epicas?proyectoId=${selectedProyecto}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (!response.ok) {
          if (response.status === 401) {
            throw { code: "UNAUTHENTICATED" };
          }

          const body = await response.json().catch(() => ({}));
          throw new Error(body.message || "No se pudieron cargar las epicas");
        }

        const payload = await response.json();
        const items = (payload.data || []).map(normalizeEpica);
        setEpicas(items);

        if (items.length === 0) {
          setSelectedEpica("");
          setHistorias([]);
          syncQuery(selectedProyecto, "");
          return;
        }

        const exists = items.some((item) => String(item.id) === String(selectedEpica));
        const nextEpica = exists ? selectedEpica : String(items[0].id);
        setSelectedEpica(nextEpica);
        syncQuery(selectedProyecto, nextEpica);
      } catch (err) {
        if (err.code === "UNAUTHENTICATED") {
          handleAuthError();
          return;
        }

        setError(err.message || "No se pudieron cargar las epicas");
      } finally {
        setLoadingEpicas(false);
      }
    };

    loadEpicas();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedProyecto]);

  useEffect(() => {
    if (!selectedProyecto || epicas.length === 0) {
      setEpicaCounts({});
      return;
    }

    const loadCounts = async () => {
      const pairs = await Promise.all(
        epicas.map(async (epica) => {
          try {
            const items = (await listarHistoriasPorEpica(epica.id)) || [];
            return [epica.id, items.length];
          } catch {
            return [epica.id, 0];
          }
        }),
      );

      setEpicaCounts(Object.fromEntries(pairs));
    };

    loadCounts();
  }, [epicas, selectedProyecto]);

  useEffect(() => {
    if (!selectedEpica) {
      setHistorias([]);
      setCriteriaCounts({});
      return;
    }

    setHistorias([]);
    setCriteriaCounts({});
    setOpenMenuId(null);

    const loadHistorias = async () => {
      setLoadingHistorias(true);
      setError("");
      setSuccess("");

      try {
        const items = (await listarHistoriasPorEpica(selectedEpica)) || [];
        const normalized = items.map(normalizeHistoria);
        setHistorias(normalized);

        const counts = await Promise.all(
          normalized.map(async (historia) => {
            try {
              const criterios = await listarCriteriosHistoria(historia.id);
              return [historia.id, Array.isArray(criterios) ? criterios.length : 0];
            } catch {
              return [historia.id, 0];
            }
          }),
        );

        setCriteriaCounts(Object.fromEntries(counts));
      } catch (err) {
        if (err.code === "UNAUTHENTICATED") {
          handleAuthError();
          return;
        }

        setError(err.message || "No se pudieron cargar las historias");
      } finally {
        setLoadingHistorias(false);
      }
    };

    loadHistorias();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedEpica]);

  useEffect(() => {
    if (!openMenuId) return;

    const closeMenu = () => {
      setOpenMenuId(null);
      setMenuCoords(null);
    };

    const handleOutsideClick = (event) => {
      if (event.target.closest(".backlog-floating-menu")) return;
      if (event.target.closest(".backlog-menu-trigger")) return;
      closeMenu();
    };

    const handleEscape = (event) => {
      if (event.key !== "Escape") return;
      closeMenu();
    };

    document.addEventListener("mousedown", handleOutsideClick);
    document.addEventListener("keydown", handleEscape);
    window.addEventListener("scroll", closeMenu, true);
    window.addEventListener("resize", closeMenu);

    return () => {
      document.removeEventListener("mousedown", handleOutsideClick);
      document.removeEventListener("keydown", handleEscape);
      window.removeEventListener("scroll", closeMenu, true);
      window.removeEventListener("resize", closeMenu);
    };
  }, [openMenuId]);

  // close project/epica pickers when clicking outside or pressing Escape
  useEffect(() => {
    if (!projectMenuOpen && !epicaMenuOpen) return undefined;

    const handleOutside = (event) => {
      if (event.target.closest && event.target.closest('.backlog-epica-picker')) return;
      setProjectMenuOpen(false);
      setEpicaMenuOpen(false);
    };

    const handleEsc = (event) => {
      if (event.key === 'Escape') {
        setProjectMenuOpen(false);
        setEpicaMenuOpen(false);
      }
    };

    document.addEventListener('mousedown', handleOutside);
    document.addEventListener('keydown', handleEsc);
    return () => {
      document.removeEventListener('mousedown', handleOutside);
      document.removeEventListener('keydown', handleEsc);
    };
  }, [projectMenuOpen, epicaMenuOpen]);

  const selectedEpicaData = useMemo(
    () => epicas.find((item) => String(item.id) === String(selectedEpica)) || null,
    [epicas, selectedEpica],
  );

  const selectedProyectoData = useMemo(
    () => proyectos.find((item) => String(item.id_proyecto) === String(selectedProyecto)) || null,
    [proyectos, selectedProyecto],
  );

  const epicaLabel = selectedEpicaData?.nombre || "Épica";

  const historiasFiltradas = useMemo(() => {
    const query = searchTerm.trim().toLowerCase();
    if (!query) return historias;

    return historias.filter((historia) => {
      const nombre = (historia.nombre || "").toLowerCase();
      const descripcion = (historia.descripcion || "").toLowerCase();
      const id = String(historia.id || "");
      return nombre.includes(query) || descripcion.includes(query) || id.includes(query);
    });
  }, [historias, searchTerm]);

  const historiaDisplayIds = useMemo(() => {
    const ordered = [...historias].sort((a, b) => Number(a.id || 0) - Number(b.id || 0));
    return ordered.reduce((acc, item, index) => {
      acc[String(item.id)] = index + 1;
      return acc;
    }, {});
  }, [historias]);

  const openHistoriaMenu = useMemo(
    () => historias.find((item) => String(item.id) === String(openMenuId)) || null,
    [historias, openMenuId],
  );

  const handleToggleHistoriaMenu = (event, historiaId) => {
    event.stopPropagation();

    if (openMenuId === historiaId) {
      setOpenMenuId(null);
      setMenuCoords(null);
      return;
    }

    const rect = event.currentTarget.getBoundingClientRect();
    const estimatedHeight = 170;
    const openDown = rect.bottom + estimatedHeight + 8 < window.innerHeight;

    setMenuCoords({
      left: rect.right,
      top: openDown ? rect.bottom + 8 : rect.top - 8,
      direction: openDown ? "down" : "up",
    });
    setOpenMenuId(historiaId);
  };

  const openNewHistoria = () => {
    setEditingHistoriaId(null);
    setIsEditingHistoria(true);
    setForm({
      nombre: "",
      descripcion: "",
      prioridad: 3,
      storyPoints: 3,
    });
    setFormOpen(true);
  };

  const openEditHistoria = (historia) => {
    setEditingHistoriaId(historia.id);
    // abrir el modal ya en modo edición para evitar un click extra
    setIsEditingHistoria(true);
    setForm({
      nombre: historia.nombre || "",
      descripcion: historia.descripcion || "",
      prioridad: historia.prioridad || 3,
      storyPoints: historia.storyPoints || 3,
    });
    setFormOpen(true);
  };

  const closeForm = () => {
    setFormOpen(false);
    setEditingHistoriaId(null);
    setIsEditingHistoria(false);
  };

  const startEditHistoria = () => {
    setIsEditingHistoria(true);
  };

  const cancelEditHistoria = () => {
    if (editingHistoriaId) {
      const historia = historias.find((item) => String(item.id) === String(editingHistoriaId));
      if (historia) {
        setForm({
          nombre: historia.nombre || "",
          descripcion: historia.descripcion || "",
          prioridad: historia.prioridad || 3,
          storyPoints: historia.storyPoints || 3,
        });
      }
      setIsEditingHistoria(false);
      return;
    }

    closeForm();
  };

  const reloadHistorias = async () => {
    if (!selectedEpica) return;

    const items = (await listarHistoriasPorEpica(selectedEpica)) || [];
    const normalized = items.map(normalizeHistoria);
    setHistorias(normalized);

    const counts = await Promise.all(
      normalized.map(async (historia) => {
        try {
          const criterios = await listarCriteriosHistoria(historia.id);
          return [historia.id, Array.isArray(criterios) ? criterios.length : 0];
        } catch {
          return [historia.id, 0];
        }
      }),
    );

    setCriteriaCounts(Object.fromEntries(counts));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!selectedEpica || !form.nombre.trim()) return;

    setSaving(true);
    setError("");
    setSuccess("");

    try {
      const payload = {
        nombre: form.nombre.trim(),
        epicaId: Number(selectedEpica),
        descripcion: form.descripcion.trim(),
        prioridad: Number(form.prioridad),
        storyPoints: Number(form.storyPoints),
      };

      if (editingHistoriaId) {
        await actualizarHistoria(editingHistoriaId, payload);
      } else {
        await crearHistoria(payload);
      }

      await reloadHistorias();
      setSuccess(editingHistoriaId ? "Guardado correctamente" : "Creado correctamente");
      closeForm();
    } catch (err) {
      if (err.code === "UNAUTHENTICATED") {
        handleAuthError();
        return;
      }

      setError(err.message || "No se pudo guardar la historia");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (historia) => {
    const confirmed = window.confirm(`Quieres borrar la historia "${historia.nombre}"?`);
    if (!confirmed) return;

    setSaving(true);
    setError("");
    setSuccess("");

    try {
      await eliminarHistoria(historia.id);
      await reloadHistorias();
      if (editingHistoriaId === historia.id) {
        closeForm();
      }
      setSuccess("Eliminado correctamente");
    } catch (err) {
      if (err.code === "UNAUTHENTICATED") {
        handleAuthError();
        return;
      }

      setError(err.message || "No se pudo eliminar la historia");
    } finally {
      setSaving(false);
    }
  };

  const handleOpenDetail = (historia) => {
    navigate(`/historias/${historia.id}?id_epica=${selectedEpica}&id_proyecto=${selectedProyecto}`);
  };

  return (
    <section className="backlog-page">
      <header className="backlog-topbar">
        <div>
          <p className="backlog-tag">Backlog</p>
          <div className="backlog-title-row">
            <h1 className="backlog-title">Gestor de Backlog</h1>
            <span className="backlog-epica-badge">{epicaLabel}</span>
          </div>
          <p className="backlog-project-current">{selectedProyectoData?.nombre || "Sin proyecto"}</p>
        </div>

        <div className="backlog-actions">
          <div className="backlog-selector">
            <label>Proyecto</label>
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
              >
                <span>{proyectos.find((p) => String(p.id_proyecto) === String(selectedProyecto))?.nombre || "Sin proyecto"}</span>
                <span className="backlog-epica-caret">▾</span>
              </button>

              {projectMenuOpen && (
                <div className={`backlog-epica-menu ${projectMenuRight ? "menu-right" : ""}`} role="menu">
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
                        <span className="backlog-epica-item-name">{proyecto.nombre}</span>
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="backlog-epica-picker">
            <button
              type="button"
              className="backlog-epica-toggle"
              onClick={() => setEpicaMenuOpen((prev) => !prev)}
              disabled={loadingEpicas || epicas.length === 0}
            >
              <span>{epicaLabel}</span>
              <span className="backlog-epica-caret">▾</span>
            </button>

            {epicaMenuOpen && (
              <div className="backlog-epica-menu" role="menu">
                <div className="backlog-epica-menu-list">
                  {epicas.map((epica) => {
                    const isSelected = String(epica.id) === String(selectedEpica);

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
                        <span className="backlog-epica-item-name">{epica.nombre}</span>
                        <span className="backlog-epica-item-count">H. Usuario {epicaCounts[epica.id] ?? 0}</span>
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

          <button type="button" className="btn-new-backlog" onClick={openNewHistoria} disabled={!selectedEpica}>
            + Nueva Historia
          </button>

          <div className="search-box backlog-search">
            <i className="bx bx-search" aria-hidden="true"></i>
            <input
              type="text"
              placeholder="Buscar"
              value={searchTerm}
              onChange={(event) => setSearchTerm(event.target.value)}
            />
          </div>

          <button
            type="button"
            className="btn-sprints-link"
            onClick={() => navigate(`/sprints?id_proyecto=${selectedProyecto}`)}
            disabled={!selectedProyecto}
          >
            Sprints
          </button>
        </div>
      </header>

      <AutoDismissAlert show={Boolean(error)} variant="danger" className="shadow-sm mb-3" onClose={() => setError("")}>{error}</AutoDismissAlert>

      <AutoDismissAlert show={Boolean(success)} variant="success" className="shadow-sm mb-3" onClose={() => setSuccess("")}>{success}</AutoDismissAlert>

      {!error && !loading && proyectos.length === 0 && (
        <p className="backlog-feedback">No hay proyectos disponibles.</p>
      )}

      {!error && !loadingEpicas && selectedProyecto && epicas.length === 0 && (
        <p className="backlog-feedback">Este proyecto no tiene epicas creadas.</p>
      )}

      <section className="backlog-panel">
        <div className="backlog-table-head">
          <span>Historias de usuario</span>
          <span>Prioridad</span>
          <span>Story points</span>
          <span />
        </div>

        <div className="backlog-table-body">
          {loadingHistorias ? (
            <div className="backlog-empty-state">Cargando historias...</div>
          ) : historiasFiltradas.length === 0 ? (
            <div className="backlog-empty-state">No hay historias para mostrar.</div>
          ) : (
            historiasFiltradas.map((historia) => (
              <article key={historia.id} className="backlog-row">
                <button type="button" className="backlog-cell backlog-cell-title" onClick={() => handleOpenDetail(historia)}>
                  <span className="backlog-title-text">{historia.nombre}</span>
                  <span className="backlog-title-meta">
                    ID {historiaDisplayIds[String(historia.id)] ?? historia.id} · {criteriaCounts[historia.id] ?? 0} criterios
                  </span>
                </button>
                <span className="backlog-pill backlog-pill-priority">{historia.prioridad}</span>
                <span className="backlog-pill backlog-pill-points">{historia.storyPoints}</span>

                <div className="backlog-menu-wrap">
                  <button
                    type="button"
                    className="backlog-menu-trigger"
                    onClick={(event) => {
                      handleToggleHistoriaMenu(event, historia.id);
                    }}
                    onMouseDown={(event) => event.stopPropagation()}
                  >
                    ...
                  </button>
                </div>
              </article>
            ))
          )}
        </div>
      </section>

      {openHistoriaMenu && menuCoords && (
        <div
          className={`backlog-menu backlog-floating-menu ${menuCoords.direction === "up" ? "backlog-menu-up" : ""}`}
          role="menu"
          style={{ top: menuCoords.top, left: menuCoords.left }}
        >
          <button
            type="button"
            onClick={() => {
              setOpenMenuId(null);
              setMenuCoords(null);
              openEditHistoria(openHistoriaMenu);
            }}
          >
            Editar
          </button>
          <button
            type="button"
            className="danger"
            onClick={() => {
              setOpenMenuId(null);
              setMenuCoords(null);
              handleDelete(openHistoriaMenu);
            }}
          >
            Eliminar
          </button>
        </div>
      )}

      {formOpen && (
        <div className="backlog-modal-backdrop" onClick={closeForm}>
          <div className="backlog-modal" onClick={(event) => event.stopPropagation()}>
            <div className="backlog-modal-header">
              <h2>{editingHistoriaId ? "Editar historia" : "Nueva historia"}</h2>
              <button type="button" onClick={closeForm} aria-label="Cerrar modal">
                ×
              </button>
            </div>

            <form className="backlog-form" onSubmit={handleSubmit}>
              {editingHistoriaId && (
                <div className="backlog-edit-actions">
                  {!isEditingHistoria ? (
                    <button type="button" className="btn-main" onClick={startEditHistoria}>
                      Editar
                    </button>
                  ) : (
                    <>
                      <button type="submit" className="btn-main" disabled={saving || !form.nombre.trim()}>
                        {saving ? "Guardando..." : "Guardar cambios"}
                      </button>
                      <button type="button" className="btn-soft" onClick={cancelEditHistoria} disabled={saving}>
                        Cancelar
                      </button>
                    </>
                  )}
                </div>
              )}

              <label htmlFor="historia-nombre">Nombre</label>
              <input
                id="historia-nombre"
                value={form.nombre}
                onChange={(event) => setForm((prev) => ({ ...prev, nombre: event.target.value }))}
                disabled={editingHistoriaId ? !isEditingHistoria : false}
              />

              <label htmlFor="historia-descripcion">Descripcion</label>
              <textarea
                id="historia-descripcion"
                value={form.descripcion}
                onChange={(event) => setForm((prev) => ({ ...prev, descripcion: event.target.value }))}
                disabled={editingHistoriaId ? !isEditingHistoria : false}
              />

              <div className="backlog-form-grid">
                <div>
                  <label htmlFor="historia-prioridad">Prioridad</label>
                  <select
                    id="historia-prioridad"
                    value={form.prioridad}
                    onChange={(event) => setForm((prev) => ({ ...prev, prioridad: event.target.value }))}
                    disabled={editingHistoriaId ? !isEditingHistoria : false}
                  >
                    {PRIORIDADES.map((value) => (
                      <option key={value} value={value}>
                        {value}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label htmlFor="historia-story-points">Story points</label>
                  <input
                    id="historia-story-points"
                    type="number"
                    min="1"
                    step="1"
                    value={form.storyPoints}
                    onChange={(event) => setForm((prev) => ({ ...prev, storyPoints: event.target.value }))}
                    disabled={editingHistoriaId ? !isEditingHistoria : false}
                  />
                </div>
              </div>

              {!editingHistoriaId && (
                <div className="backlog-form-actions">
                  <button type="submit" className="btn-main" disabled={saving || !form.nombre.trim()}>
                    {saving ? "Guardando..." : "Guardar"}
                  </button>
                </div>
              )}
            </form>
          </div>
        </div>
      )}

      {epicaMenuOpen && (
        <div
          className="backlog-menu-overlay"
          onClick={() => {
            setEpicaMenuOpen(false);
          }}
        />
      )}
    </section>
  );
}