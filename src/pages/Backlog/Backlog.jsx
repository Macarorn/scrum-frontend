import { useEffect, useMemo, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Alert } from "react-bootstrap";
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

const STORY_POINTS = [1, 2, 3, 5, 8, 13, 21, 34];
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
  const [loadingEpicas, setLoadingEpicas] = useState(false);
  const [loadingHistorias, setLoadingHistorias] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [openMenuId, setOpenMenuId] = useState(null);
  const [epicaMenuOpen, setEpicaMenuOpen] = useState(false);
  const [editingHistoriaId, setEditingHistoriaId] = useState(null);
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

  const openNewHistoria = () => {
    setEditingHistoriaId(null);
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

    try {
      await eliminarHistoria(historia.id);
      await reloadHistorias();
      if (editingHistoriaId === historia.id) {
        closeForm();
      }
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
            <label htmlFor="backlog-proyecto-select">Proyecto</label>
            <select
              id="backlog-proyecto-select"
              value={selectedProyecto}
              onChange={(event) => {
                const nextProject = event.target.value;
                setSelectedProyecto(nextProject);
                setActiveProjectId(nextProject);
                setSelectedEpica("");
                setEpicas([]);
                setHistorias([]);
                setCriteriaCounts({});
                setEpicaMenuOpen(false);
                syncQuery(nextProject, "");
              }}
              disabled={loading || proyectos.length === 0}
            >
              {proyectos.length === 0 && <option value="">Sin proyectos</option>}
              {proyectos.map((proyecto) => (
                <option key={proyecto.id_proyecto} value={proyecto.id_proyecto}>
                  {proyecto.nombre}
                </option>
              ))}
            </select>
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
            <span aria-hidden="true">Q</span>
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

      {error && (
        <Alert variant="danger" className="shadow-sm mb-3" dismissible onClose={() => setError("")}> 
          {error}
        </Alert>
      )}

      {!error && !loading && proyectos.length === 0 && (
        <p className="backlog-feedback">No hay proyectos disponibles.</p>
      )}

      {!error && !loadingEpicas && selectedProyecto && epicas.length === 0 && (
        <p className="backlog-feedback">Este proyecto no tiene epicas creadas.</p>
      )}

      <section className="backlog-panel">
        <div className="backlog-table-head">
          <span>Historias de usuario</span>
          <span>ID</span>
          <span>C. aceptación</span>
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
                <button type="button" className="backlog-name" onClick={() => handleOpenDetail(historia)}>
                  {historia.nombre}
                </button>
                <span className="backlog-cell">{historia.id}</span>
                <span className="backlog-cell">{criteriaCounts[historia.id] ?? 0}</span>
                <span className="backlog-pill backlog-pill-priority">{historia.prioridad}</span>
                <span className="backlog-cell">{historia.storyPoints}</span>

                <div className="backlog-menu-wrap">
                  <button
                    type="button"
                    className="backlog-menu-trigger"
                    onClick={() => setOpenMenuId((prev) => (prev === historia.id ? null : historia.id))}
                  >
                    ...
                  </button>

                  {openMenuId === historia.id && (
                    <div className="backlog-menu">
                      <button type="button" onClick={() => handleOpenDetail(historia)}>
                        Ver detalle
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setOpenMenuId(null);
                          openEditHistoria(historia);
                        }}
                      >
                        Editar
                      </button>
                      <button type="button" className="danger" onClick={() => handleDelete(historia)}>
                        Eliminar
                      </button>
                    </div>
                  )}
                </div>
              </article>
            ))
          )}
        </div>
      </section>

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
              <label htmlFor="historia-nombre">Nombre</label>
              <input
                id="historia-nombre"
                value={form.nombre}
                onChange={(event) => setForm((prev) => ({ ...prev, nombre: event.target.value }))}
              />

              <label htmlFor="historia-descripcion">Descripcion</label>
              <textarea
                id="historia-descripcion"
                value={form.descripcion}
                onChange={(event) => setForm((prev) => ({ ...prev, descripcion: event.target.value }))}
              />

              <div className="backlog-form-grid">
                <div>
                  <label htmlFor="historia-prioridad">Prioridad</label>
                  <select
                    id="historia-prioridad"
                    value={form.prioridad}
                    onChange={(event) => setForm((prev) => ({ ...prev, prioridad: event.target.value }))}
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
                  <select
                    id="historia-story-points"
                    value={form.storyPoints}
                    onChange={(event) => setForm((prev) => ({ ...prev, storyPoints: event.target.value }))}
                  >
                    {STORY_POINTS.map((value) => (
                      <option key={value} value={value}>
                        {value}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="backlog-form-actions">
                <button type="button" className="btn-soft" onClick={closeForm} aria-label="Cerrar formulario">
                  ×
                </button>
                <button type="submit" className="btn-main" disabled={saving || !form.nombre.trim()}>
                  {saving ? "Guardando..." : "Guardar"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {epicaMenuOpen && <div className="backlog-menu-overlay" onClick={() => setEpicaMenuOpen(false)} />}
    </section>
  );
}