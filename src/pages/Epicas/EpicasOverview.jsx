import { useEffect, useMemo, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Alert } from "react-bootstrap";
import "../../styles/Epicas.css";
import "../../styles/SprintBoard.css";
import { clearSessionTokens } from "../../services/auth.service";
import { getActiveProjectId, setActiveProjectId } from "../../services/project-context.service";
import {
  editarEpica,
  eliminarEpica,
  listarEpicasPorProyecto,
} from "../../services/epicas.service";
import { listarProyectos } from "../../services/proyectos.service";

const ESTADOS_EPICA = ["por_hacer", "en_progreso", "completada", "cancelada"];


const normalizeId = (item, keys) => {
  for (const key of keys) {
    if (item?.[key] !== undefined && item?.[key] !== null) {
      return item[key];
    }
  }

  return "";
};

const normalizeEpica = (item) => ({
  ...item,
  id: normalizeId(item, ["id", "id_epica"]),
  proyectoId: normalizeId(item, ["proyectoId", "id_proyecto"]),
  prioridad: normalizeId(item, ["prioridad"]) || 3,
  estado: item?.estado || "por_hacer",
});

const getEpicaId = (epica) => epica?.id ?? epica?.id_epica ?? "";

export default function EpicasOverview() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  const [proyectos, setProyectos] = useState([]);
  const [projectMenuOpen, setProjectMenuOpen] = useState(false);
  const [projectMenuRight, setProjectMenuRight] = useState(false);
  const [epicas, setEpicas] = useState([]);
  const [selectedProyecto, setSelectedProyecto] = useState(
    searchParams.get("id_proyecto") || getActiveProjectId() || "",
  );

  const [loading, setLoading] = useState(true);
  const [loadingEpicas, setLoadingEpicas] = useState(false);
  const [saving, setSaving] = useState(false);
  const [openMenuId, setOpenMenuId] = useState(null);
  const [menuCoords, setMenuCoords] = useState(null);
  const [editingEpicaId, setEditingEpicaId] = useState(null);
  const [editingSource, setEditingSource] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [form, setForm] = useState({
    nombre: "",
    descripcion: "",
    categoria: "",
    prioridad: 3,
    estado: "por_hacer",
  });

  const handleAuthError = () => {
    clearSessionTokens();
    navigate("/login", { replace: true });
  };

  const syncQuery = (idProyecto) => {
    if (idProyecto) {
      setSearchParams({ id_proyecto: idProyecto }, { replace: true });
      return;
    }

    setSearchParams({}, { replace: true });
  };

  useEffect(() => {
    const loadInitial = async () => {
      setLoading(true);
      setError("");

      try {
        const response = await listarProyectos();
        const items = response.data || [];
        setProyectos(items);

        if (items.length === 0) {
          setSelectedProyecto("");
          setActiveProjectId("");
          setEpicas([]);
          setOpenMenuId(null);
          resetForm();
          return;
        }

        const exists = items.some((p) => String(p.id_proyecto) === String(selectedProyecto));
        const firstId = exists ? selectedProyecto : String(items[0].id_proyecto);
        setSelectedProyecto(firstId);
        setActiveProjectId(firstId);
        syncQuery(firstId);
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

    loadInitial();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!selectedProyecto) {
      setActiveProjectId("");
      setEpicas([]);
      setOpenMenuId(null);
      setMenuCoords(null);
      resetForm();
      return;
    }

    setActiveProjectId(selectedProyecto);
    setEpicas([]);
    setOpenMenuId(null);
    setMenuCoords(null);
    resetForm();

    let active = true;

    const loadEpicas = async () => {
      setLoadingEpicas(true);
      setError("");

      try {
        const data = (await listarEpicasPorProyecto(selectedProyecto)) || [];
        if (!active) return;
        setEpicas(data.map(normalizeEpica));
      } catch (err) {
        if (!active) return;
        if (err.code === "UNAUTHENTICATED") {
          handleAuthError();
          return;
        }

        setError(err.message || "No se pudieron cargar las epicas");
      } finally {
        if (active) {
          setLoadingEpicas(false);
        }
      }
    };

    loadEpicas();
    syncQuery(selectedProyecto);
    return () => {
      active = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedProyecto]);

  useEffect(() => {
    if (!openMenuId) return;

    const closeMenu = () => {
      setOpenMenuId(null);
      setMenuCoords(null);
    };

    const handleOutsideClick = (event) => {
      if (event.target.closest(".epica-floating-menu")) return;
      if (event.target.closest(".epica-menu-trigger")) return;
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

  // close project picker when clicking outside or pressing Escape
  useEffect(() => {
    if (!projectMenuOpen) return undefined;

    const handleOutside = (event) => {
      if (event.target.closest && event.target.closest('.backlog-epica-picker')) return;
      setProjectMenuOpen(false);
    };

    const handleEsc = (event) => {
      if (event.key === 'Escape') setProjectMenuOpen(false);
    };

    document.addEventListener('mousedown', handleOutside);
    document.addEventListener('keydown', handleEsc);
    return () => {
      document.removeEventListener('mousedown', handleOutside);
      document.removeEventListener('keydown', handleEsc);
    };
  }, [projectMenuOpen]);

  const projectName = useMemo(() => {
    const selected = proyectos.find((p) => String(p.id_proyecto) === String(selectedProyecto));
    return selected?.nombre || "";
  }, [proyectos, selectedProyecto]);

  const resetForm = () => {
    setForm({
      nombre: "",
      descripcion: "",
      categoria: "",
      prioridad: 3,
      estado: "por_hacer",
    });
    setEditingEpicaId(null);
    setEditingSource(null);
    setIsEditing(false);
  };

  const handleGuardarCambios = async () => {
    if (!editingEpicaId || !form.nombre.trim()) return;

    setSaving(true);
    setError("");
    setSuccess("");
    try {
      const payload = {
        proyectoId: Number(selectedProyecto),
        nombre: form.nombre.trim(),
        descripcion: form.descripcion.trim() || null,
        categoria: form.categoria.trim() || null,
        prioridad: Number(form.prioridad) || 3,
        estado: form.estado,
      };

      const result = await editarEpica(editingEpicaId, payload);
      const normalizedResult = normalizeEpica(result);

      setEpicas((prev) =>
        prev.map((item) =>
          String(getEpicaId(item)) === String(getEpicaId(normalizedResult))
            ? normalizedResult
            : item,
        ),
      );

      setEditingSource(normalizedResult);
      setForm({
        nombre: normalizedResult.nombre || "",
        descripcion: normalizedResult.descripcion || "",
        categoria: normalizedResult.categoria || "",
        prioridad: normalizedResult.prioridad || 3,
        estado: normalizedResult.estado || "por_hacer",
      });
      setIsEditing(false);
      setSuccess("Guardado correctamente");
    } catch (err) {
      if (err.code === "UNAUTHENTICATED") {
        handleAuthError();
        return;
      }
      setError(err.message || "No se pudo guardar la epica");
    } finally {
      setSaving(false);
    }
  };

  const startEdit = (epica) => {
    setOpenMenuId(null);
    const normalized = normalizeEpica(epica);
    setEditingEpicaId(getEpicaId(normalized));
    setEditingSource(normalized);
    setForm({
      nombre: normalized.nombre || "",
      descripcion: normalized.descripcion || "",
      categoria: normalized.categoria || "",
      prioridad: normalized.prioridad || 3,
      estado: normalized.estado || "por_hacer",
    });
    setIsEditing(false);
    setSuccess("");
    setError("");
  };

  const handleToggleEdit = () => {
    if (!editingEpicaId) return;
    setError("");
    setSuccess("");
    setIsEditing((prev) => !prev);
  };

  const handleCancelarEdicion = () => {
    if (!editingSource) {
      resetForm();
      return;
    }

    setForm({
      nombre: editingSource.nombre || "",
      descripcion: editingSource.descripcion || "",
      categoria: editingSource.categoria || "",
      prioridad: editingSource.prioridad || 3,
      estado: editingSource.estado || "por_hacer",
    });
    setError("");
    setSuccess("");
    setIsEditing(false);
  };

  const handleDelete = async (epica) => {
    setOpenMenuId(null);
    setMenuCoords(null);
    const confirmDelete = window.confirm(`Quieres borrar la epica \"${epica.nombre}\"?`);
    if (!confirmDelete) return;

    try {
      const epicaId = getEpicaId(epica);
      await eliminarEpica(epicaId);
      setEpicas((prev) => prev.filter((item) => String(getEpicaId(item)) !== String(epicaId)));
      if (String(editingEpicaId) === String(epicaId)) {
        resetForm();
      }
      setSuccess("Eliminado correctamente");
    } catch (err) {
      if (err.code === "UNAUTHENTICATED") {
        handleAuthError();
        return;
      }
      setError(err.message || "No se pudo borrar la epica");
    }
  };

  const openEpicaMenu = useMemo(
    () => epicas.find((item) => String(getEpicaId(item)) === String(openMenuId)) || null,
    [epicas, openMenuId],
  );

  const handleToggleEpicaMenu = (event, epicaId) => {
    event.stopPropagation();

    if (openMenuId === epicaId) {
      setOpenMenuId(null);
      setMenuCoords(null);
      return;
    }

    const rect = event.currentTarget.getBoundingClientRect();
    const estimatedHeight = 135;
    const openDown = rect.bottom + estimatedHeight + 8 < window.innerHeight;

    setMenuCoords({
      left: rect.right,
      top: openDown ? rect.bottom + 8 : rect.top - 8,
      direction: openDown ? "down" : "up",
    });
    setOpenMenuId(epicaId);
  };

  return (
    <section className="epicas-page">
      <div className="sprint-topbar">
        <div>
          <p className="sprint-tag">Epicas</p>
          <h1 className="sprint-title">Creacion de Epicas</h1>
          <p className="sprint-project-current">{projectName || "Sin proyecto"}</p>
        </div>

        <div className="sprint-actions">
          <div className="selector-box">
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
                          const nextProyecto = String(proyecto.id_proyecto);
                          setSelectedProyecto(nextProyecto);
                          setActiveProjectId(nextProyecto);
                          setEpicas([]);
                          setOpenMenuId(null);
                          resetForm();
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
        </div>
      </div>

      {error && (
        <Alert variant="danger" className="shadow-sm mb-3" dismissible onClose={() => setError("")}>
          {error}
        </Alert>
      )}

      {success && (
        <Alert variant="success" className="shadow-sm mb-3" dismissible onClose={() => setSuccess("")}>
          {success}
        </Alert>
      )}

      <div className={`epicas-layout${editingEpicaId ? "" : " epicas-layout--full"}`}>
        {editingEpicaId && (
        <aside className={`epicas-form-card${isEditing ? " edit-mode-on" : ""}`}>
          <h2>Editar epica</h2>

            <>
              <div className="epicas-form-buttons">
                {!isEditing ? (
                  <button type="button" className="btn-main" onClick={handleToggleEdit}>
                    Editar
                  </button>
                ) : (
                  <>
                    <button
                      type="button"
                      className="btn-main"
                      onClick={handleGuardarCambios}
                      disabled={saving || !form.nombre.trim()}
                    >
                      {saving ? "Guardando..." : "Guardar cambios"}
                    </button>
                    <button type="button" className="btn-soft" onClick={handleCancelarEdicion} disabled={saving}>
                      Cancelar
                    </button>
                  </>
                )}
              </div>

              <label htmlFor="epica-nombre">Nombre</label>
              <input
                className="editable-control"
                id="epica-nombre"
                value={form.nombre}
                onChange={(event) => setForm((prev) => ({ ...prev, nombre: event.target.value }))}
                disabled={!isEditing}
              />

              <label htmlFor="epica-descripcion">Descripcion</label>
              <textarea
                className="editable-control"
                id="epica-descripcion"
                value={form.descripcion}
                onChange={(event) => setForm((prev) => ({ ...prev, descripcion: event.target.value }))}
                disabled={!isEditing}
              />

              <label htmlFor="epica-categoria">Categoria</label>
              <input
                className="editable-control"
                id="epica-categoria"
                value={form.categoria}
                onChange={(event) => setForm((prev) => ({ ...prev, categoria: event.target.value }))}
                disabled={!isEditing}
              />

              <label htmlFor="epica-prioridad">Prioridad (1-5)</label>
              <input
                className="editable-control"
                id="epica-prioridad"
                type="number"
                min="1"
                max="5"
                value={form.prioridad}
                onChange={(event) => setForm((prev) => ({ ...prev, prioridad: event.target.value }))}
                disabled={!isEditing}
              />

              <label htmlFor="epica-estado">Estado</label>
              <select
                className="editable-control"
                id="epica-estado"
                value={form.estado}
                onChange={(event) => setForm((prev) => ({ ...prev, estado: event.target.value }))}
                disabled={!isEditing}
              >
                {ESTADOS_EPICA.map((estado) => (
                  <option key={estado} value={estado}>{estado}</option>
                ))}
              </select>
            </>
        </aside>
        )}

        <section className="epicas-grid-wrap">
          {loadingEpicas ? (
            <p className="epicas-placeholder">Cargando epicas...</p>
          ) : (
            <div className="epicas-grid">
              <button
                type="button"
                className="epicas-create-tile"
                onClick={() => navigate(`/epicas/nueva?id_proyecto=${selectedProyecto}`)}
                disabled={!selectedProyecto}
                aria-label="Crear épica"
              >
                <span className="epicas-create-badge" aria-hidden="true">
                  +
                </span>
                <span className="epicas-create-text">Crear epica</span>
              </button>

              {epicas.length === 0 && (
                <p className="epicas-placeholder epicas-placeholder-inline">No hay epicas para este proyecto.</p>
              )}

              {epicas.map((epica) => (
                <article key={getEpicaId(epica)} className="epica-card">
                  <button
                    type="button"
                    className="epica-card-title"
                    onClick={() => navigate(`/epicas/${getEpicaId(epica)}?id_proyecto=${selectedProyecto}`)}
                  >
                    {epica.nombre}
                  </button>

                  <div className="epica-meta">H. Usuario {epica.total_historias || 0}</div>

                  <div className="epica-card-bottom">
                    <span className={`epica-status status-${epica.estado || "por_hacer"}`}>
                      {epica.estado || "por_hacer"}
                    </span>
                    <div className="epica-menu-wrap">
                      <button
                        type="button"
                        className="epica-menu-trigger"
                        onClick={(event) => handleToggleEpicaMenu(event, getEpicaId(epica))}
                        onMouseDown={(event) => event.stopPropagation()}
                      >
                        ...
                      </button>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          )}
        </section>
      </div>

      {openEpicaMenu && menuCoords && (
        <div
          className={`epica-menu epica-floating-menu ${menuCoords.direction === "up" ? "epica-menu-up" : ""}`}
          style={{ top: menuCoords.top, left: menuCoords.left }}
        >
          <button
            type="button"
            onClick={() => {
              setOpenMenuId(null);
              setMenuCoords(null);
              startEdit(openEpicaMenu);
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
              handleDelete(openEpicaMenu);
            }}
          >
            Borrar
          </button>
        </div>
      )}
    </section>
  );
}
