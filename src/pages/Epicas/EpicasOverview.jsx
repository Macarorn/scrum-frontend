import { showError, showSuccess, showWarning, showInfo } from "../../utils/alerts";
import { useEffect, useMemo, useState } from "react";
import { Alert, Modal } from "react-bootstrap";
import { useNavigate, useSearchParams } from "react-router-dom";
import { clearSessionTokens, canEditBacklog, isCoordinador } from "../../services/auth.service";
import {
  editarEpica,
  eliminarEpica,
  listarEpicasPorProyecto,
} from "../../services/epicas.service";
import {
  getActiveProjectId,
  setActiveProjectId,
} from "../../services/project-context.service";
import { listarProyectos, listarTodosProyectos } from "../../services/proyectos.service";
import "../../styles/Backlog.css";
import "../../styles/Epicas.css";
import "../../styles/SprintBoard.css";

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

const formatEstado = (estado) => {
  if (!estado) return "Por hacer";
  const conEspacios = estado.replace(/_/g, " ");
  return conEspacios.charAt(0).toUpperCase() + conEspacios.slice(1).toLowerCase();
};

const getPrioridadInfo = (nivel) => {
  const prio = Number(nivel);
  if (!prio || prio === 3) return { label: "Media", colorClass: "priority-media" };
  if (prio < 3) return { label: "Alta", colorClass: "priority-alta" };
  return { label: "Baja", colorClass: "priority-baja" };
};

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

  const [canEdit, setCanEdit] = useState(false);

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

  // Cargar permisos del usuario en el proyecto
  useEffect(() => {
    const loadPermissions = async () => {
      if (selectedProyecto) {
        const hasPermission = await canEditBacklog(selectedProyecto);
        setCanEdit(hasPermission);
      }
    };
    loadPermissions();
  }, [selectedProyecto]);

  useEffect(() => {
    const loadInitial = async () => {
      setLoading(true);
      setError("");

      try {
        const response = isCoordinador() ? await listarTodosProyectos() : await listarProyectos();
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

        const exists = items.some(
          (p) => String(p.id_proyecto) === String(selectedProyecto),
        );
        const firstId = exists
          ? selectedProyecto
          : String(items[0].id_proyecto);
        setSelectedProyecto(firstId);
        setActiveProjectId(firstId);
        syncQuery(firstId);
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

        showError(err.message || "No se pudieron cargar las epicas");
        setError("");
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

  const projectName = useMemo(() => {
    const selected = proyectos.find(
      (p) => String(p.id_proyecto) === String(selectedProyecto),
    );
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
      showSuccess("Épica guardada correctamente");
      setSuccess("");
    } catch (err) {
      if (err.code === "UNAUTHENTICATED") {
        handleAuthError();
        return;
      }
      showError(err.message || "No se pudo guardar la epica");
      setError("");
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
    setSuccess("");
    setError("");
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
    setEditingEpicaId(null);
    setEditingSource(null);
  };

  const closeConfirmModal = () => {
    setConfirmModal((prev) => ({ ...prev, show: false, onConfirm: null }));
  };

  const confirmDelete = async (epica) => {
    if (!epica) return;

    setConfirmModal((prev) => ({ ...prev, show: false, onConfirm: null }));
    setProcessingConfirm(true);

    try {
      const epicaId = getEpicaId(epica);
      await eliminarEpica(epicaId);
      setEpicas((prev) =>
        prev.filter((item) => String(getEpicaId(item)) !== String(epicaId)),
      );
      if (String(editingEpicaId) === String(epicaId)) {
        resetForm();
      }
      showSuccess("Épica eliminada correctamente");
      setSuccess("");
    } catch (err) {
      if (err.code === "UNAUTHENTICATED") {
        handleAuthError();
        return;
      }
      showError(err.message || "No se pudo borrar la epica");
      setError("");
    } finally {
      setProcessingConfirm(false);
    }
  };

  const handleDelete = (epica) => {
    setOpenMenuId(null);
    setMenuCoords(null);
    if (!epica) return;

    setConfirmModal({
      show: true,
      title: "Eliminar epica",
      body: `Esta acción no es recomendada. ¿Deseas continuar y eliminar la epica "${epica.nombre}"?`,
      confirmLabel: "Eliminar",
      cancelLabel: "Cancelar",
      onConfirm: () => confirmDelete(epica),
    });
  };

  const openEpicaMenu = useMemo(
    () =>
      epicas.find((item) => String(getEpicaId(item)) === String(openMenuId)) ||
      null,
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
          <h1 className="sprint-title">Épicas</h1>
          <div className="backlog-project-selector backlog-epica-picker">
            {isCoordinador() ? (
              <span className="backlog-epica-toggle-static">{projectName || "Sin proyecto"}</span>
            ) : (
              <>
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
              <span>{projectName || "Sin proyecto"}</span>
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
                        setEpicas([]);
                        setOpenMenuId(null);
                        resetForm();
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
            </>
            )}
          </div>
        </div>
        {isCoordinador() && (
          <div className="sprint-actions">
            <button
              type="button"
              className="btn-soft"
              onClick={() => navigate(`/detalles_de_proyecto/${selectedProyecto}`)}
            >
              Volver
            </button>
          </div>
        )}
      </div>





      <div className="epicas-layout epicas-layout--full">
        <section className="epicas-grid-wrap">
          {loadingEpicas ? (
            <p className="epicas-placeholder">Cargando epicas...</p>
          ) : (
            <div className="epicas-grid">
              {canEdit && (
                <button
                  type="button"
                  className="epicas-create-tile"
                  onClick={() =>
                    navigate(`/epicas/nueva?id_proyecto=${selectedProyecto}`)
                  }
                  disabled={!selectedProyecto}
                  aria-label="Crear épica"
                >
                  <span className="epicas-create-badge" aria-hidden="true">
                    +
                  </span>
                  <span className="epicas-create-text">Crear epica</span>
                </button>
              )}

              {epicas.length === 0 && (
                <p className="epicas-placeholder epicas-placeholder-inline">
                  No hay epicas para este proyecto.
                </p>
              )}

              {epicas.map((epica) => (
                <article key={getEpicaId(epica)} className="epica-card">
                  <div className="epica-card-content">
                    <div className="epica-card-top">
                      <button
                        type="button"
                        className="epica-card-title"
                        onClick={() =>
                          navigate(
                            `/epicas/${getEpicaId(epica)}?id_proyecto=${selectedProyecto}`,
                          )
                        }
                      >
                        {epica.nombre}
                      </button>

                      {canEdit && (
                        <div className="epica-menu-wrap">
                          <button
                            type="button"
                            className="epica-menu-trigger"
                            onClick={(event) =>
                              handleToggleEpicaMenu(event, getEpicaId(epica))
                            }
                            onMouseDown={(event) => event.stopPropagation()}
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="1"></circle><circle cx="19" cy="12" r="1"></circle><circle cx="5" cy="12" r="1"></circle></svg>
                          </button>
                        </div>
                      )}
                    </div>

                    <div className="epica-meta-container">
                      <div className="epica-meta" title="Historias de Usuario">
                        <svg className="epica-meta-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line><polyline points="10 9 9 9 8 9"></polyline></svg>
                        <span><strong>{epica.total_historias || 0}</strong> Historias</span>
                      </div>
                      {epica.prioridad && (() => {
                        const prioInfo = getPrioridadInfo(epica.prioridad);
                        return (
                          <div className={`epica-meta epica-meta-prio ${prioInfo.colorClass}`} title="Prioridad">
                            <svg className="epica-meta-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z"></path><line x1="4" y1="22" x2="4" y2="15"></line></svg>
                            <span>Prioridad <strong>{prioInfo.label}</strong></span>
                          </div>
                        );
                      })()}
                    </div>
                  </div>

                  <div className="epica-card-bottom">
                    <span
                      className={`epica-status status-${epica.estado || "por_hacer"}`}
                    >
                      {formatEstado(epica.estado)}
                    </span>
                    <button
                      type="button"
                      className="epica-view-btn"
                      onClick={() => navigate(`/epicas/${getEpicaId(epica)}?id_proyecto=${selectedProyecto}`)}
                    >
                      Ver detalles →
                    </button>
                  </div>
                </article>
              ))}
            </div>
          )}
        </section>
      </div>

      <Modal
        show={Boolean(editingEpicaId)}
        onHide={handleCancelarEdicion}
        centered
        backdrop="static"
        keyboard={false}
        className="epica-edit-modal"
      >
        <Modal.Header closeButton>
          <Modal.Title>Editar epica</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <div className="epicas-form-card epicas-form-card--modal edit-mode-on">
            <label htmlFor="epica-nombre">Nombre</label>
            <input
              className="editable-control"
              id="epica-nombre"
              value={form.nombre}
              onChange={(event) =>
                setForm((prev) => ({ ...prev, nombre: event.target.value }))
              }
            />

            <label htmlFor="epica-descripcion">Descripcion</label>
            <textarea
              className="editable-control"
              id="epica-descripcion"
              value={form.descripcion}
              onChange={(event) =>
                setForm((prev) => ({
                  ...prev,
                  descripcion: event.target.value,
                }))
              }
            />

            <label htmlFor="epica-categoria">Categoria</label>
            <input
              className="editable-control"
              id="epica-categoria"
              value={form.categoria}
              onChange={(event) =>
                setForm((prev) => ({
                  ...prev,
                  categoria: event.target.value,
                }))
              }
            />

            <label htmlFor="epica-prioridad">Prioridad (1-5)</label>
            <input
              className="editable-control"
              id="epica-prioridad"
              type="number"
              min="1"
              max="5"
              value={form.prioridad}
              onChange={(event) =>
                setForm((prev) => ({
                  ...prev,
                  prioridad: event.target.value,
                }))
              }
            />

            <label htmlFor="epica-estado">Estado</label>
            <select
              className="editable-control"
              id="epica-estado"
              value={form.estado}
              onChange={(event) =>
                setForm((prev) => ({ ...prev, estado: event.target.value }))
              }
            >
              {ESTADOS_EPICA.map((estado) => (
                <option key={estado} value={estado}>
                  {formatEstado(estado)}
                </option>
              ))}
            </select>
          </div>
        </Modal.Body>
        <Modal.Footer>
          <button
            type="button"
            className="btn-main"
            onClick={handleGuardarCambios}
            disabled={saving || !form.nombre.trim()}
          >
            {saving ? "Guardando..." : "Guardar cambios"}
          </button>
          <button
            type="button"
            className="btn-cerrar-modal"
            onClick={handleCancelarEdicion}
            disabled={saving}
          >
            Cancelar
          </button>
        </Modal.Footer>
      </Modal>

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
      <Modal show={confirmModal.show} onHide={closeConfirmModal} centered>
        <Modal.Header>
          <Modal.Title>{confirmModal.title}</Modal.Title>
        </Modal.Header>
        <Modal.Body>{confirmModal.body}</Modal.Body>
        <Modal.Footer>
          <button
            type="button"
            className="btn-soft"
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
