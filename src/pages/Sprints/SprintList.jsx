import { showError, showSuccess, showWarning, showInfo } from "../../utils/alerts";
import { useEffect, useMemo, useState } from "react";
import { Alert, Modal } from "react-bootstrap";
import { useNavigate, useSearchParams } from "react-router-dom";
import { clearSessionTokens, canManageSprints, isCoordinador } from "../../services/auth.service";
import {
  getActiveProjectId,
  setActiveProjectId,
} from "../../services/project-context.service";
import { listarProyectos, listarTodosProyectos } from "../../services/proyectos.service";
import {
  crearSprint,
  eliminarSprint,
  listarSprintsPorProyecto,
  obtenerEpicasSprint,
} from "../../services/sprint.service";
import "../../styles/SprintList.css";

const ESTADOS = ["planeado", "en_curso", "completado", "cancelado"];

const formatEstado = (value) => {
  if (!value) return "";
  const text = String(value).replace(/_/g, " ").toLowerCase();
  return text.charAt(0).toUpperCase() + text.slice(1);
};
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
  const [epicaCounts, setEpicaCounts] = useState({});
  const [selectedProyecto, setSelectedProyecto] = useState(
    searchParams.get("id_proyecto") || getActiveProjectId() || "",
  );
  const [projectMenuOpen, setProjectMenuOpen] = useState(false);
  const [projectMenuRight, setProjectMenuRight] = useState(false);

  const [loading, setLoading] = useState(true);
  const [loadingSprints, setLoadingSprints] = useState(false);
  const [showSprintModal, setShowSprintModal] = useState(false);
  const [saving, setSaving] = useState(false);
  const [openMenuSprintId, setOpenMenuSprintId] = useState(null);
  const [menuCoords, setMenuCoords] = useState(null);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [processingConfirm, setProcessingConfirm] = useState(false);
  const [confirmModal, setConfirmModal] = useState({
    show: false,
    title: "",
    body: "",
    confirmLabel: "Aceptar",
    cancelLabel: "Cancelar",
    onConfirm: null,
  });

  const [canManage, setCanManage] = useState(false);

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

  // Cargar permisos del usuario en el proyecto
  useEffect(() => {
    const loadPermissions = async () => {
      if (selectedProyecto) {
        const hasPermission = await canManageSprints(selectedProyecto);
        setCanManage(hasPermission);
      }
    };
    loadPermissions();
  }, [selectedProyecto]);

  useEffect(() => {
    const loadProjects = async () => {
      setLoading(true);
      setError("");

      try {
        const response = isCoordinador() ? await listarTodosProyectos() : await listarProyectos();
        const items = response.data || [];
        setProyectos(items);

        if (items.length === 0) {
          setSelectedProyecto("");
          setActiveProjectId("");
          setSprints([]);
          return;
        }

        const exists = items.some(
          (item) => String(item.id_proyecto) === String(selectedProyecto),
        );
        const nextProject = exists
          ? selectedProyecto
          : String(items[0].id_proyecto);
        setSelectedProyecto(nextProject);
        setActiveProjectId(nextProject);
        syncQuery(nextProject);
      } catch (err) {
        if (err.code === "UNAUTHENTICATED") {
          handleAuthError();
          return;
        }

        showError(err.message || "No se pudieron cargar los proyectos");
        setError("");
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
      setEpicaCounts({});
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

        const epicaCountPromises = items.map(async (sprint) => {
          try {
            const epicas = await obtenerEpicasSprint(sprint.id_sprint);
            return [sprint.id_sprint, Array.isArray(epicas) ? epicas.length : 0];
          } catch {
            return [sprint.id_sprint, 0];
          }
        });

        setEpicaCounts(Object.fromEntries(await Promise.all(epicaCountPromises)));
      } catch (err) {
        if (!active) return;
        if (err.code === "UNAUTHENTICATED") {
          handleAuthError();
          return;
        }

        showError(err.message || "No se pudieron cargar los sprints");
        setError("");
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

  // close project picker when clicking outside or pressing Escape
  useEffect(() => {
    if (!projectMenuOpen) return undefined;

    const handleOutside = (event) => {
      if (event.target.closest && event.target.closest(".backlog-epica-picker"))
        return;
      setProjectMenuOpen(false);
    };

    const handleEsc = (event) => {
      if (event.key === "Escape") setProjectMenuOpen(false);
    };

    document.addEventListener("mousedown", handleOutside);
    document.addEventListener("keydown", handleEsc);
    return () => {
      document.removeEventListener("mousedown", handleOutside);
      document.removeEventListener("keydown", handleEsc);
    };
  }, [projectMenuOpen]);

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
    () =>
      proyectos.find(
        (proyecto) => String(proyecto.id_proyecto) === String(selectedProyecto),
      ) || null,
    [proyectos, selectedProyecto],
  );

  useEffect(() => {
    if (!projectMenuOpen) return undefined;

    const handleOutside = (event) => {
      if (event.target.closest && event.target.closest(".backlog-epica-picker"))
        return;
      setProjectMenuOpen(false);
    };

    const handleEsc = (event) => {
      if (event.key === "Escape") setProjectMenuOpen(false);
    };

    document.addEventListener("mousedown", handleOutside);
    document.addEventListener("keydown", handleEsc);
    return () => {
      document.removeEventListener("mousedown", handleOutside);
      document.removeEventListener("keydown", handleEsc);
    };
  }, [projectMenuOpen]);

  const handleCreateSprint = async (event) => {
    event.preventDefault();
    if (
      !selectedProyecto ||
      !form.nombre.trim() ||
      !form.fecha_inicio ||
      !form.fecha_fin
    )
      return;

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

      const refreshed =
        (await listarSprintsPorProyecto(selectedProyecto)) || [];
      setSprints(refreshed);
      setForm({
        nombre: "",
        fecha_inicio: "",
        fecha_fin: "",
        meta: "",
        estado: "planeado",
      });
      showSuccess("Creado correctamente");
      setSuccess("");
      setShowSprintModal(false);
    } catch (err) {
      if (err.code === "UNAUTHENTICATED") {
        handleAuthError();
        return;
      }

      showError(err.message || "No se pudo crear el sprint");
      setError("");
    } finally {
      setSaving(false);
    }
  };

  const openSprintModal = () => {
    setForm({
      nombre: "",
      fecha_inicio: "",
      fecha_fin: "",
      meta: "",
      estado: "planeado",
    });
    setError("");
    setSuccess("");
    setShowSprintModal(true);
  };

  const closeSprintModal = () => {
    if (saving) return;
    setShowSprintModal(false);
  };

  const closeConfirmModal = () => {
    setConfirmModal((prev) => ({ ...prev, show: false, onConfirm: null }));
  };

  const confirmDeleteSprint = async (sprint) => {
    if (!sprint?.id_sprint) return;

    setConfirmModal((prev) => ({ ...prev, show: false, onConfirm: null }));
    setProcessingConfirm(true);
    setError("");

    try {
      await eliminarSprint(sprint.id_sprint);
      setSprints((prev) =>
        prev.filter((item) => item.id_sprint !== sprint.id_sprint),
      );
      showSuccess("Eliminado correctamente");
      setSuccess("");
    } catch (err) {
      if (err.code === "UNAUTHENTICATED") {
        handleAuthError();
        return;
      }

      showError(err.message || "No se pudo eliminar el sprint");
      setError("");
    } finally {
      setProcessingConfirm(false);
    }
  };

  const handleDeleteSprint = (sprint) => {
    if (!sprint?.id_sprint) return;

    setConfirmModal({
      show: true,
      title: "Eliminar sprint",
      body: `Esta acción no es recomendada. ¿Deseas continuar y eliminar el sprint "${sprint.nombre}"?`,
      confirmLabel: "Eliminar",
      cancelLabel: "Cancelar",
      onConfirm: () => confirmDeleteSprint(sprint),
    });
  };

  return (
    <section className="sprint-list-page">
      <header className="sprint-list-header sprint-topbar-responsive">
        <div>
          <h1 className="sprint-list-title">Gestor de Sprints</h1>
          <div className="backlog-project-selector backlog-epica-picker">
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
                        setSprints([]);
                        setOpenMenuSprintId(null);
                        setMenuCoords(null);
                        setProjectMenuOpen(false);
                        syncQuery(nextProyecto);
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

        <div className="sprint-list-actions">
          {canManage && (
            <button
              type="button"
              className="btn-backlog btn-new-sprint-inline"
              onClick={openSprintModal}
              disabled={!selectedProyecto}
            >
              <i className="bx bx-plus" aria-hidden="true"></i>
              <span>Nuevo Sprint</span>
            </button>
          )}

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





      {showSprintModal && (
        <div className="sprint-list-modal-backdrop" onClick={closeSprintModal}>
          <div
            className="sprint-list-modal"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="sprint-list-modal-header">
              <h2>
                <strong> Nuevo sprint</strong>
              </h2>
            </div>

            <form
              className="sprint-list-form sprint-list-modal-form"
              onSubmit={handleCreateSprint}
            >
              <label htmlFor="sprint-list-modal-nombre">Nombre</label>
              <input
                id="sprint-list-modal-nombre"
                value={form.nombre}
                onChange={(event) =>
                  setForm((prev) => ({ ...prev, nombre: event.target.value }))
                }
              />

              <label htmlFor="sprint-list-modal-fecha-inicio">
                Fecha inicio
              </label>
              <input
                id="sprint-list-modal-fecha-inicio"
                type="date"
                value={form.fecha_inicio}
                onChange={(event) =>
                  setForm((prev) => ({
                    ...prev,
                    fecha_inicio: event.target.value,
                  }))
                }
              />

              <label htmlFor="sprint-list-modal-fecha-fin">Fecha fin</label>
              <input
                id="sprint-list-modal-fecha-fin"
                type="date"
                value={form.fecha_fin}
                onChange={(event) =>
                  setForm((prev) => ({
                    ...prev,
                    fecha_fin: event.target.value,
                  }))
                }
              />

              <label htmlFor="sprint-list-modal-estado">Estado</label>
              <select
                id="sprint-list-modal-estado"
                value={form.estado}
                onChange={(event) =>
                  setForm((prev) => ({ ...prev, estado: event.target.value }))
                }
              >
                {ESTADOS.map((estado) => (
                  <option key={estado} value={estado}>
                    {formatEstado(estado)}
                  </option>
                ))}
              </select>

              <label htmlFor="sprint-list-modal-meta">Meta (opcional)</label>
              <textarea
                id="sprint-list-modal-meta"
                value={form.meta}
                onChange={(event) =>
                  setForm((prev) => ({ ...prev, meta: event.target.value }))
                }
              />

              <div className="sprint-list-modal-actions">
                <button
                  type="button"
                  className="btn-cerrar-modal"
                  onClick={closeSprintModal}
                  disabled={saving}
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="btn-main"
                  disabled={
                    saving ||
                    !selectedProyecto ||
                    !form.nombre.trim() ||
                    !form.fecha_inicio ||
                    !form.fecha_fin
                  }
                >
                  {saving ? "Creando..." : "Crear sprint"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <div className="sprint-list-layout">
        <section className="sprint-list-table-card">
          <div className="sprint-list-panel">
            <div className="sprint-list-head">
              <span>Nombre</span>
              <span>Estado</span>
              <span>Epicas</span>
              <span>Inicio</span>
              <span>Fin</span>
              <span aria-hidden="true" />
            </div>

            <div className="sprint-list-body">
              {loadingSprints ? (
                <div className="sprint-list-placeholder">
                  Cargando sprints...
                </div>
              ) : sprints.length === 0 ? (
                <div className="sprint-list-placeholder">
                  No hay sprints para este proyecto.
                </div>
              ) : (
                sprints.map((sprint) => (
                  <article
                    key={sprint.id_sprint}
                    className="sprint-list-row"
                    onClick={() =>
                      navigate(
                        `/sprints/${sprint.id_sprint}?id_proyecto=${selectedProyecto}&view=1`,
                      )
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
                    <span className="sprint-list-cell" data-label="Estado">
                      <span className={`sprint-status-badge ${(sprint.estado || "planeado").toLowerCase()}`}>
                        {formatEstado(sprint.estado || "planeado")}
                      </span>
                    </span>
                    <span className="sprint-list-cell" data-label="Epicas">
                      <span className="sprint-epicas-badge">
                        {epicaCounts[sprint.id_sprint] ?? 0} épica{epicaCounts[sprint.id_sprint] !== 1 ? "s" : ""}
                      </span>
                    </span>
                    <span className="sprint-list-cell" data-label="Inicio">
                      {formatDate(sprint.fecha_inicio)}
                    </span>
                    <span className="sprint-list-cell" data-label="Fin">
                      {formatDate(sprint.fecha_fin)}
                    </span>
                    <div className="sprint-list-row-actions">
                      {canManage && (
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
                      )}
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
              {canManage && (
                <button
                  type="button"
                  onClick={() => {
                    const sprint = sprints.find(
                      (item) => item.id_sprint === openMenuSprintId,
                    );
                    if (!sprint) return;
                    setOpenMenuSprintId(null);
                    setMenuCoords(null);
                    navigate(
                      `/sprints/${sprint.id_sprint}?id_proyecto=${selectedProyecto}`,
                    );
                  }}
                >
                  Editar
                </button>
              )}
              <button
                type="button"
                onClick={() => {
                  const sprint = sprints.find(
                    (item) => item.id_sprint === openMenuSprintId,
                  );
                  if (!sprint) return;
                  setOpenMenuSprintId(null);
                  setMenuCoords(null);
                  navigate(
                    `/kanban?id_proyecto=${selectedProyecto}&id_sprint=${sprint.id_sprint}`,
                  );
                }}
              >
                Kanban
              </button>
              {canManage && (
                <button
                  type="button"
                  className="sprint-list-menu-danger"
                  onClick={() => {
                    const sprint = sprints.find(
                      (item) => item.id_sprint === openMenuSprintId,
                    );
                    if (!sprint) return;
                    setOpenMenuSprintId(null);
                    setMenuCoords(null);
                    handleDeleteSprint(sprint);
                  }}
                >
                  Eliminar
                </button>
              )}
            </div>
          )}
        </section>
      </div>
      <Modal show={confirmModal.show} onHide={closeConfirmModal} centered>
        <Modal.Header>
          <Modal.Title>{confirmModal.title}</Modal.Title>
        </Modal.Header>
        <Modal.Body>{confirmModal.body}</Modal.Body>
        <Modal.Footer>
          <button
            type="button"
            className="btn-cerrar-modal"
            onClick={closeConfirmModal}
            disabled={processingConfirm}
          >
            {confirmModal.cancelLabel}
          </button>
          <button
            type="button"
            className={
              confirmModal.confirmLabel === "Eliminar"
                ? "btn-danger"
                : "btn-main"
            }
            onClick={confirmModal.onConfirm}
            disabled={processingConfirm || !confirmModal.onConfirm}
          >
            {processingConfirm ? "Procesando..." : confirmModal.confirmLabel}
          </button>
        </Modal.Footer>
      </Modal>
    </section>
  );
}
