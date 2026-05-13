import { useEffect, useMemo, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { clearSessionTokens } from "../../services/auth.service";
import { getActiveProjectId, setActiveProjectId } from "../../services/project-context.service";
import { listarProyectos } from "../../services/proyectos.service";
import { crearSprint, eliminarSprint, listarSprintsPorProyecto } from "../../services/sprint.service";
import "../../styles/SprintList.css";
import { showError, showSuccess, showWarning } from "../../utils/alerts";

const ESTADOS = ["planeado", "en_curso", "completado", "cancelado"];

const formatDate = (value) => {
  if (!value) return "-";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return String(value);
  return date.toLocaleDateString("es-ES");
};

export default function SprintList() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  const [proyectos, setProyectos] = useState([]);
  const [sprints, setSprints] = useState([]);
  const [selectedProyecto, setSelectedProyecto] = useState(
    searchParams.get("id_proyecto") || getActiveProjectId() || "",
  );

  const [loading, setLoading] = useState(true);
  const [loadingSprints, setLoadingSprints] = useState(false);
  const [saving, setSaving] = useState(false);
  const [openMenuSprintId, setOpenMenuSprintId] = useState(null);
  const [menuCoords, setMenuCoords] = useState(null);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [form, setForm] = useState({
    nombre: "",
    fecha_inicio: "",
    fecha_fin: "",
    meta: "",
    estado: "planeado",
  });

  const syncQuery = (idProyecto) => {
    if (!idProyecto) {
      setSearchParams({}, { replace: true });
      return;
    }

    setSearchParams({ id_proyecto: idProyecto }, { replace: true });
  };

  const handleAuthError = () => {
    clearSessionTokens();
    navigate("/login", { replace: true });
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
          setSprints([]);
          return;
        }

        const exists = items.some((item) => String(item.id_proyecto) === String(selectedProyecto));
        const nextProject = exists ? selectedProyecto : String(items[0].id_proyecto);
        setSelectedProyecto(nextProject);
        setActiveProjectId(nextProject);
        syncQuery(nextProject);
      } catch (err) {
        if (err.code === "UNAUTHENTICATED") {
          handleAuthError();
          return;
        }

        setError(err.message || "No se pudieron cargar los proyectos");
        showError(err.message || "Ocurrió un error");
      } finally {
        setLoading(false);
      }
    };

    loadProjects();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!selectedProyecto) {
      setSprints([]);
      setOpenMenuSprintId(null);
      setMenuCoords(null);
      setActiveProjectId("");
      syncQuery("");
      return;
    }

    setActiveProjectId(selectedProyecto);
    syncQuery(selectedProyecto);

    let active = true;
    const loadSprints = async () => {
      setLoadingSprints(true);
      setError("");

      try {
        const items = (await listarSprintsPorProyecto(selectedProyecto)) || [];
        if (!active) return;
        setSprints(items);
      } catch (err) {
        if (!active) return;
        if (err.code === "UNAUTHENTICATED") {
          handleAuthError();
          return;
        }

        setError(err.message || "No se pudieron cargar los sprints");
        showError(err.message || "Ocurrió un error");
      } finally {
        if (active) {
          setLoadingSprints(false);
        }
      }
    };

    loadSprints();
    return () => {
      active = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedProyecto]);

  useEffect(() => {
    if (!openMenuSprintId) return;

    const handleOutsideClick = (event) => {
      if (event.target.closest(".sprint-list-floating-menu")) return;
      if (event.target.closest(".sprint-list-menu-trigger")) return;
      setOpenMenuSprintId(null);
      setMenuCoords(null);
    };

    const handleEscape = (event) => {
      if (event.key !== "Escape") return;
      setOpenMenuSprintId(null);
      setMenuCoords(null);
    };

    const closeOnViewportChange = () => {
      setOpenMenuSprintId(null);
      setMenuCoords(null);
    };

    document.addEventListener("mousedown", handleOutsideClick);
    document.addEventListener("keydown", handleEscape);
    window.addEventListener("scroll", closeOnViewportChange, true);
    window.addEventListener("resize", closeOnViewportChange);

    return () => {
      document.removeEventListener("mousedown", handleOutsideClick);
      document.removeEventListener("keydown", handleEscape);
      window.removeEventListener("scroll", closeOnViewportChange, true);
      window.removeEventListener("resize", closeOnViewportChange);
    };
  }, [openMenuSprintId]);

  const handleToggleMenu = (event, sprintId) => {
    if (openMenuSprintId === sprintId) {
      setOpenMenuSprintId(null);
      setMenuCoords(null);
      return;
    }

    const rect = event.currentTarget.getBoundingClientRect();
    const estimatedHeight = 180;
    const openDown = rect.bottom + estimatedHeight + 8 < window.innerHeight;

    setMenuCoords({
      left: rect.right,
      top: openDown ? rect.bottom + 8 : rect.top - 8,
      direction: openDown ? "down" : "up",
    });
    setOpenMenuSprintId(sprintId);
  };

  const proyectoActual = useMemo(
    () => proyectos.find((proyecto) => String(proyecto.id_proyecto) === String(selectedProyecto)) || null,
    [proyectos, selectedProyecto],
  );

  const handleCreateSprint = async (event) => {
    event.preventDefault();
    const faltaFecha = !form.fecha_inicio || !form.fecha_fin;
    const faltaOtro = !selectedProyecto || !form.nombre.trim();
    if (faltaFecha && faltaOtro) {
      showWarning("Todos los campos son obligatorios");
      return;
    }

    if (faltaFecha) {
      showError("La fecha es obligatoria");
      return;
    }

    if (form.fecha_inicio > form.fecha_fin) {
      showError("La fecha de fin debe ser posterior a la fecha de inicio");
      return;
    }

    setSaving(true);
    setError("");
    setSuccess("");

    try {
      await crearSprint({
        id_proyecto: Number(selectedProyecto),
        nombre: form.nombre.trim(),
        meta: form.meta.trim() || null,
        fecha_inicio: form.fecha_inicio,
        fecha_fin: form.fecha_fin,
        estado: form.estado,
      });

      const refreshed = (await listarSprintsPorProyecto(selectedProyecto)) || [];
      setSprints(refreshed);
      setForm({
        nombre: "",
        fecha_inicio: "",
        fecha_fin: "",
        meta: "",
        estado: "planeado",
      });
      showSuccess("Creado correctamente");
      
    } catch (err) {
      if (err.code === "UNAUTHENTICATED") {
        handleAuthError();
        return;
      }

      setError(err.message || "No se pudo crear el sprint");
      showError(err.message || "Ocurrió un error");
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteSprint = async (sprint) => {
    const confirmed = window.confirm(`Quieres eliminar el sprint "${sprint.nombre}"?`);
    if (!confirmed) return;

    setError("");
    setSuccess("");
    try {
      await eliminarSprint(sprint.id_sprint);
      setSprints((prev) => prev.filter((item) => item.id_sprint !== sprint.id_sprint));
      showSuccess("Eliminado correctamente");
    } catch (err) {
      if (err.code === "UNAUTHENTICATED") {
        handleAuthError();
        return;
      }

      setError(err.message || "No se pudo eliminar el sprint");
      showError(err.message || "Ocurrió un error");
    }
  };

  return (
    <section className="sprint-list-page">
      <header className="sprint-list-header">
        <div>
          <p className="sprint-list-tag">Sprints</p>
          <h1 className="sprint-list-title">Gestor de Sprints</h1>
          <p className="sprint-list-project-current">{proyectoActual?.nombre || "Sin proyecto"}</p>
        </div>

        <div className="sprint-list-actions">
          <div className="selector-box">
            <label htmlFor="sprint-list-proyecto">Proyecto</label>
            <select
              id="sprint-list-proyecto"
              value={selectedProyecto}
              onChange={(event) => {
                const nextProject = event.target.value;
                setSelectedProyecto(nextProject);
                setActiveProjectId(nextProject);
                setSprints([]);
                setOpenMenuSprintId(null);
                setMenuCoords(null);
                setError("");
                setSuccess("");
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

          <button
            type="button"
            className="btn-backlog"
            onClick={() => navigate(`/kanban?id_proyecto=${selectedProyecto}`)}
            disabled={!selectedProyecto}
          >
            Ir a Tablero Kanban
          </button>
        </div>
      </header>



      <div className="sprint-list-layout">
        <article className="sprint-list-form-card">
          <h2>Nuevo sprint</h2>
          <form className="sprint-list-form" onSubmit={handleCreateSprint} noValidate>
            <label htmlFor="sprint-list-nombre">Nombre</label>
            <input
              id="sprint-list-nombre"
              value={form.nombre}
              onChange={(event) => setForm((prev) => ({ ...prev, nombre: event.target.value }))}
            />

            <label htmlFor="sprint-list-fecha-inicio">Fecha inicio</label>
            <input
              id="sprint-list-fecha-inicio"
              type="date"
              value={form.fecha_inicio}
              onChange={(event) => setForm((prev) => ({ ...prev, fecha_inicio: event.target.value }))}
            />

            <label htmlFor="sprint-list-fecha-fin">Fecha fin</label>
            <input
              id="sprint-list-fecha-fin"
              type="date"
              value={form.fecha_fin}
              onChange={(event) => setForm((prev) => ({ ...prev, fecha_fin: event.target.value }))}
            />

            <label htmlFor="sprint-list-estado">Estado</label>
            <select
              id="sprint-list-estado"
              value={form.estado}
              onChange={(event) => setForm((prev) => ({ ...prev, estado: event.target.value }))}
            >
              {ESTADOS.map((estado) => (
                <option key={estado} value={estado}>
                  {estado}
                </option>
              ))}
            </select>

            <label htmlFor="sprint-list-meta">Meta (opcional)</label>
            <textarea
              id="sprint-list-meta"
              value={form.meta}
              onChange={(event) => setForm((prev) => ({ ...prev, meta: event.target.value }))}
            />

            <button
              type="submit"
              className="btn-main"
              disabled={saving}
            >
              {saving ? "Creando..." : "Crear sprint"}
            </button>
          </form>
        </article>

        <section className="sprint-list-table-card">
          <h2>Lista de sprints</h2>

          <div className="sprint-list-panel">
            <div className="sprint-list-head">
              <span>Nombre</span>
              <span>Estado</span>
              <span>Inicio</span>
              <span>Fin</span>
              <span aria-hidden="true" />
            </div>

            <div className="sprint-list-body">
              {loadingSprints ? (
                <div className="sprint-list-placeholder">Cargando sprints...</div>
              ) : sprints.length === 0 ? (
                <div className="sprint-list-placeholder">No hay sprints para este proyecto.</div>
              ) : (
                sprints.map((sprint) => (
                  <article
                    key={sprint.id_sprint}
                    className="sprint-list-row"
                    onClick={() =>
                      navigate(`/sprints/${sprint.id_sprint}?id_proyecto=${selectedProyecto}&view=1`)
                    }
                    role="button"
                    tabIndex={0}
                    onKeyDown={(event) => {
                      if (event.key === "Enter" || event.key === " ") {
                        event.preventDefault();
                        navigate(
                          `/sprints/${sprint.id_sprint}?id_proyecto=${selectedProyecto}&view=1`,
                        );
                      }
                    }}
                  >
                    <span className="sprint-list-name">{sprint.nombre}</span>
                    <span className="sprint-list-cell">{sprint.estado || "planeado"}</span>
                    <span className="sprint-list-cell">{formatDate(sprint.fecha_inicio)}</span>
                    <span className="sprint-list-cell">{formatDate(sprint.fecha_fin)}</span>
                    <div className="sprint-list-row-actions">
                      <button
                        type="button"
                        className="sprint-list-menu-trigger"
                        onClick={(event) => {
                          event.stopPropagation();
                          handleToggleMenu(event, sprint.id_sprint);
                        }}
                        onMouseDown={(event) => event.stopPropagation()}
                        aria-label="Opciones del sprint"
                      >
                        ...
                      </button>
                    </div>
                  </article>
                ))
              )}
            </div>
          </div>

          {openMenuSprintId && menuCoords && (
            <div
              className={`sprint-list-menu sprint-list-floating-menu ${menuCoords.direction === "up" ? "sprint-list-menu-up" : ""}`}
              style={{ top: menuCoords.top, left: menuCoords.left }}
            >
              <button
                type="button"
                onClick={() => {
                  const sprint = sprints.find((item) => item.id_sprint === openMenuSprintId);
                  if (!sprint) return;
                  setOpenMenuSprintId(null);
                  setMenuCoords(null);
                  navigate(`/sprints/${sprint.id_sprint}?id_proyecto=${selectedProyecto}`);
                }}
              >
                Editar
              </button>
              <button
                type="button"
                onClick={() => {
                  const sprint = sprints.find((item) => item.id_sprint === openMenuSprintId);
                  if (!sprint) return;
                  setOpenMenuSprintId(null);
                  setMenuCoords(null);
                  navigate(`/kanban?id_proyecto=${selectedProyecto}&id_sprint=${sprint.id_sprint}`);
                }}
              >
                Kanban
              </button>
              <button
                type="button"
                className="sprint-list-menu-danger"
                onClick={() => {
                  const sprint = sprints.find((item) => item.id_sprint === openMenuSprintId);
                  if (!sprint) return;
                  setOpenMenuSprintId(null);
                  setMenuCoords(null);
                  handleDeleteSprint(sprint);
                }}
              >
                Eliminar
              </button>
            </div>
          )}
        </section>
      </div>
    </section>
  );
}
