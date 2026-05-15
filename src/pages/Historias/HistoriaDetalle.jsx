import { useEffect, useMemo, useState } from "react";
import { Alert, Modal, Button, Form } from "react-bootstrap";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import { clearSessionTokens } from "../../services/auth.service";
import { obtenerEpica } from "../../services/epicas.service";
import {
  actualizarHistoria,
  crearCriterioHistoria,
  editarCriterioHistoria,
  eliminarCriterioHistoria,
  eliminarHistoria,
  listarCriteriosHistoria,
  listarHistoriasPorEpica,
  obtenerHistoria,
} from "../../services/historias.service";
import { crearTarea } from "../../services/sprint.service";
import { contarTareasPorHistoria } from "../../services/tareas.service";
import "../../styles/Epicas.css";
export default function HistoriaDetalle() {
  const navigate = useNavigate();
  const { idHistoria } = useParams();
  const [searchParams] = useSearchParams();

  const [historia, setHistoria] = useState(null);
  const [epica, setEpica] = useState(null);
  const [criterios, setCriterios] = useState([]);
  const [displayHistoriaId, setDisplayHistoriaId] = useState("");
  const [draft, setDraft] = useState({
    nombre: "",
    descripcion: "",
    prioridad: 3,
    storyPoints: 3,
  });
  const [originalDraft, setOriginalDraft] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [nuevoCriterio, setNuevoCriterio] = useState("");
  const [showNewCriterioForm, setShowNewCriterioForm] = useState(false);
  const [openCriterioMenuId, setOpenCriterioMenuId] = useState(null);
  const [editingCriterioId, setEditingCriterioId] = useState(null);
  const [editingCriterioText, setEditingCriterioText] = useState("");

  const [loading, setLoading] = useState(true);
  const [savingHistoria, setSavingHistoria] = useState(false);
  const [savingCriterio, setSavingCriterio] = useState(false);
  const [creatingTask, setCreatingTask] = useState(false);
  const [nextTaskNumber, setNextTaskNumber] = useState(null);
  const [error, setError] = useState("");
  const [info, setInfo] = useState("");
  const [openMenu, setOpenMenu] = useState(false);
  const [processingConfirm, setProcessingConfirm] = useState(false);
  const [confirmModal, setConfirmModal] = useState({
    show: false,
    title: "",
    body: "",
    confirmLabel: "Aceptar",
    cancelLabel: "Cancelar",
    onConfirm: null,
  });

  const clearMessages = () => {
    setError("");
    setInfo("");
  };

  const idEpicaParam = searchParams.get("id_epica") || "";
  const idProyecto = searchParams.get("id_proyecto") || "";

  const handleAuthError = () => {
    clearSessionTokens();
    navigate("/login", { replace: true });
  };

  const epicaLabel = useMemo(() => {
    if (epica?.nombre) {
      return epica.nombre;
    }

    if (historia?.epicaId) {
      return `Epica ${historia.epicaId}`;
    }

    return "Epica";
  }, [epica, historia]);

  useEffect(() => {
    const handleOutsideClick = (event) => {
      const target = event.target;
      const clickedStoryMenu =
        target.closest(".historia-menu") ||
        target.closest(".historia-menu-trigger");
      const clickedCriterioMenu =
        target.closest(".criterio-menu") ||
        target.closest(".criterio-menu-trigger");

      if (openMenu && !clickedStoryMenu) {
        setOpenMenu(false);
      }
      if (openCriterioMenuId && !clickedCriterioMenu) {
        setOpenCriterioMenuId(null);
      }
    };

    document.addEventListener("click", handleOutsideClick);
    return () => {
      document.removeEventListener("click", handleOutsideClick);
    };
  }, [openMenu, openCriterioMenuId]);

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      setError("");

      try {
        const historiaData = await obtenerHistoria(idHistoria);
        setHistoria(historiaData);
        const nextDraft = {
          nombre: historiaData.nombre || "",
          descripcion: historiaData.descripcion || "",
          prioridad: historiaData.prioridad || 3,
          storyPoints: historiaData.storyPoints || 3,
        };
        setDraft(nextDraft);
        setOriginalDraft(nextDraft);
        setIsEditing(false);

        const epicaId = idEpicaParam || historiaData.epicaId;
        if (epicaId) {
          const epicaData = await obtenerEpica(epicaId);
          setEpica(epicaData);

          const historiasEpica = (await listarHistoriasPorEpica(epicaId)) || [];
          const ordered = [...historiasEpica].sort(
            (a, b) => Number(a.id || 0) - Number(b.id || 0),
          );
          const index = ordered.findIndex(
            (item) => String(item.id) === String(historiaData.id),
          );
          setDisplayHistoriaId(
            index >= 0 ? String(index + 1) : String(historiaData.id),
          );
        } else {
          setDisplayHistoriaId(String(historiaData.id));
        }

        const criteriosData = await listarCriteriosHistoria(idHistoria);
        setCriterios(criteriosData || []);

        // Obtener el próximo número de tarea para esta historia
        const count = await contarTareasPorHistoria(idHistoria);
        setNextTaskNumber(count + 1);
      } catch (err) {
        if (err.code === "UNAUTHENTICATED") {
          handleAuthError();
          return;
        }

        setError(err.message || "No se pudo cargar la historia");
      } finally {
        setLoading(false);
      }
    };

    loadData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [idHistoria]);

  const handleSaveHistoria = async () => {
    if (!historia?.id || !draft.nombre.trim()) return;

    setSavingHistoria(true);
    setError("");

    try {
      const updated = await actualizarHistoria(historia.id, {
        nombre: draft.nombre.trim(),
        epicaId: historia.epicaId,
        descripcion: draft.descripcion.trim(),
        prioridad: Number(draft.prioridad),
        storyPoints: Number(draft.storyPoints),
      });

      setHistoria(updated);
      const nextDraft = {
        nombre: updated.nombre || "",
        descripcion: updated.descripcion || "",
        prioridad: updated.prioridad || 3,
        storyPoints: updated.storyPoints || 3,
      };
      setDraft(nextDraft);
      setOriginalDraft(nextDraft);
      setIsEditing(false);
    } catch (err) {
      if (err.code === "UNAUTHENTICATED") {
        handleAuthError();
        return;
      }

      setError(err.message || "No se pudo guardar la historia");
    } finally {
      setSavingHistoria(false);
    }
  };

  const handleStartEdit = () => {
    clearMessages();
    setOpenMenu(false);
    setIsEditing(true);
  };

  const handleCancelEdit = () => {
    if (originalDraft) {
      setDraft(originalDraft);
    }
    clearMessages();
    setIsEditing(false);
  };

  const handleAddCriterio = async () => {
    if (!historia?.id || !nuevoCriterio.trim()) return;

    setSavingCriterio(true);
    setError("");

    try {
      await crearCriterioHistoria(historia.id, nuevoCriterio.trim());
      const criteriosData = await listarCriteriosHistoria(historia.id);
      setCriterios(criteriosData || []);
      setNuevoCriterio("");
    } catch (err) {
      if (err.code === "UNAUTHENTICATED") {
        handleAuthError();
        return;
      }

      setError(err.message || "No se pudo crear el criterio");
    } finally {
      setSavingCriterio(false);
    }
  };

  const handleStartEditCriterio = (criterio) => {
    setOpenCriterioMenuId(null);
    setEditingCriterioId(criterio.id);
    setEditingCriterioText(criterio.descripcion || "");
  };

  const handleCancelEditCriterio = () => {
    setEditingCriterioId(null);
    setEditingCriterioText("");
  };

  const handleSaveCriterio = async () => {
    if (!editingCriterioId || !editingCriterioText.trim()) return;

    setSavingCriterio(true);
    setError("");

    try {
      await editarCriterioHistoria(
        editingCriterioId,
        editingCriterioText.trim(),
      );
      const criteriosData = await listarCriteriosHistoria(historia.id);
      setCriterios(criteriosData || []);
      handleCancelEditCriterio();
    } catch (err) {
      if (err.code === "UNAUTHENTICATED") {
        handleAuthError();
        return;
      }

      setError(err.message || "No se pudo editar el criterio");
    } finally {
      setSavingCriterio(false);
    }
  };

  const closeConfirmModal = () => {
    setConfirmModal((prev) => ({
      ...prev,
      show: false,
      onConfirm: null,
    }));
  };

  const confirmDeleteCriterio = async (criterio) => {
    if (!criterio?.id) return;

    setConfirmModal((prev) => ({ ...prev, show: false, onConfirm: null }));
    setProcessingConfirm(true);
    setSavingCriterio(true);
    setError("");

    try {
      await eliminarCriterioHistoria(criterio.id);
      const criteriosData = await listarCriteriosHistoria(historia.id);
      setCriterios(criteriosData || []);
    } catch (err) {
      if (err.code === "UNAUTHENTICATED") {
        handleAuthError();
        return;
      }

      setError(err.message || "No se pudo eliminar el criterio");
    } finally {
      setSavingCriterio(false);
      setProcessingConfirm(false);
    }
  };

  const handleDeleteCriterio = (criterio) => {
    if (!criterio?.id) return;

    setConfirmModal({
      show: true,
      title: "Eliminar criterio",
      body: `¿Deseas eliminar el criterio "${criterio.descripcion}"?`,
      confirmLabel: "Eliminar",
      cancelLabel: "Cancelar",
      onConfirm: () => confirmDeleteCriterio(criterio),
    });
  };

  const confirmDeleteHistoria = async () => {
    if (!historia?.id) return;

    setConfirmModal((prev) => ({ ...prev, show: false, onConfirm: null }));
    setProcessingConfirm(true);

    try {
      await eliminarHistoria(historia.id);
      navigate(
        `/backlog?id_proyecto=${idProyecto}&id_epica=${historia.epicaId || idEpicaParam}`,
      );
    } catch (err) {
      if (err.code === "UNAUTHENTICATED") {
        handleAuthError();
        return;
      }

      setError(err.message || "No se pudo eliminar la historia");
    } finally {
      setProcessingConfirm(false);
    }
  };

  const handleDeleteHistoria = () => {
    if (!historia?.id) return;

    setConfirmModal({
      show: true,
      title: "Eliminar historia",
      body: `Esta acción no es recomendada. ¿Deseas continuar y eliminar la historia "${historia.nombre}"?`,
      confirmLabel: "Eliminar",
      cancelLabel: "Cancelar",
      onConfirm: confirmDeleteHistoria,
    });
  };

  const handleOpenTaskModal = () => {
    setTaskName(`Tarea de ${draft.nombre || `Historia ${historia?.id}`}`);
    setShowTaskModal(true);
  };

  const handleCloseTaskModal = () => {
    setShowTaskModal(false);
    setTaskName("");
  };

  const handleCreateTaskFromModal = async () => {
    if (!historia?.id || !taskName.trim()) return;
    setCreatingTask(true);
    setError("");
    setInfo("");
    try {
      const creada = await crearTarea({
        nombre: taskName.trim(),
        descripcion: draft.descripcion?.trim() || "",
        id_historia: Number(historia.id),
        prioridad: "media",
        tipo: "otro",
      });

      const sprintResuelto = creada?.data?.id_sprint_resuelto ?? creada?.id_sprint_resuelto ?? null;
      if (!sprintResuelto) {
        setInfo(
          "Tarea creada correctamente. No encontramos un sprint disponible para asignar la historia automaticamente.",
        );
        setShowTaskModal(false);
        return;
      }
      try {
        sessionStorage.setItem("scrum.flash.success", "Tarea creada correctamente");
      } catch {
        // ignore storage failures
      }

      const queryProyecto = idProyecto ? `id_proyecto=${idProyecto}&` : "";
      setShowTaskModal(false);
      navigate(`/kanban?${queryProyecto}id_sprint=${sprintResuelto}`, {
        state: { toastMessage: "Tarea creada correctamente" },
      });
    } catch (err) {
      if (err.code === "UNAUTHENTICATED") {
        handleAuthError();
        return;
      }
      setError(err.message || "No se pudo crear la tarea");
    } finally {
      setCreatingTask(false);
    }
  };

  if (loading) {
    return (
      <section className="epicas-page">
        <p className="epicas-placeholder">Cargando historia...</p>
      </section>
    );
  }

  if (error && !historia) {
    return (
      <section className="epicas-page">
        <Alert
          variant="danger"
          className="shadow-sm mb-3"
          dismissible
          onClose={() => setError("")}
        >
          {error}
        </Alert>
      </section>
    );
  }

  return (
    <section className="epicas-page">
      <header className="epicas-header">
        <div className="historia-header-title-row">
          <h1>Historia de Usuario</h1>
          <div className="historia-epica-inline">
            <span className="historia-meta-label-sub">Épica:</span>
            <span className="historia-meta-value">{epicaLabel}</span>
          </div>
        </div>
        <div className="epicas-form-buttons">
          <button
            type="button"
            className="btn-create-task"
            onClick={handleOpenTaskModal}
            disabled={creatingTask}
          >
            {creatingTask
              ? "Creando tarea..."
              : `Crear tarea de esta historia (ID ${nextTaskNumber ?? "-"})`}
          </button>
        </div>
      </header>

      {(error || info) && (
        <Alert
          variant={error ? "danger" : "success"}
          className="shadow-sm mb-3"
          dismissible
          onClose={clearMessages}
        >
          <strong className="d-block mb-1">
            {error ? "No se pudo crear la tarea" : "Tarea creada"}
          </strong>
          <span>{error || info}</span>
        </Alert>
      )}

      <div className="historia-edit-vertical-layout">
        <article
          className={`epica-detail-card historia-main-card${isEditing ? " edit-mode-on" : ""}`}
        >
          <div className="historia-title-row compact">
            <div>
              <h2 className="historia-title-editable">
                {draft.nombre || "Sin nombre"}
              </h2>
              <p className="historia-epica-link">{epicaLabel}</p>
            </div>
            <div className="historia-actions-wrap">
              <button
                type="button"
                className="historia-menu-trigger"
                onClick={() => setOpenMenu((prev) => !prev)}
                aria-label="Abrir acciones"
              >
                ⋮
              </button>
              {openMenu && (
                <div className="historia-menu">
                  <button type="button" onClick={handleStartEdit}>
                    Editar
                  </button>
                  <button
                    type="button"
                    className="danger"
                    onClick={handleDeleteHistoria}
                  >
                    Borrar
                  </button>
                </div>
              )}
            </div>
          </div>
          {isEditing && (
            <div className="historia-name-row">
              <label htmlFor="historia-nombre-inline">
                Nombre de la historia
              </label>
              <input
                id="historia-nombre-inline"
                className="historia-name-input editable-control"
                type="text"
                value={draft.nombre}
                onChange={(event) =>
                  setDraft((prev) => ({
                    ...prev,
                    nombre: event.target.value,
                  }))
                }
              />
            </div>
          )}
          <div className="historia-meta-row-compact">
            <div>
              <span className="historia-meta-label">ID:</span>{" "}
              <span className="historia-meta-value">
                {displayHistoriaId || historia.id}
              </span>
            </div>
            <div>
              <span className="historia-meta-label">Épica:</span>{" "}
              <span className="historia-meta-value">
                {epicaLabel || historia.epicaId || ""}
              </span>
            </div>
            <div>
              <span className="historia-meta-label">Prioridad:</span>{" "}
              {isEditing ? (
                <select
                  className="historia-inline-select editable-control"
                  value={draft.prioridad}
                  onChange={(event) =>
                    setDraft((prev) => ({
                      ...prev,
                      prioridad: event.target.value,
                    }))
                  }
                >
                  {[1, 2, 3, 4, 5].map((value) => (
                    <option key={value} value={value}>
                      {value}
                    </option>
                  ))}
                </select>
              ) : (
                <span className="historia-meta-value">
                  {Number(draft.prioridad) || historia.prioridad}
                </span>
              )}
            </div>
            <div>
              <span className="historia-meta-label">Story Points:</span>{" "}
              {isEditing ? (
                <input
                  className="historia-inline-input editable-control"
                  type="number"
                  min="1"
                  step="1"
                  value={draft.storyPoints}
                  onChange={(event) =>
                    setDraft((prev) => ({
                      ...prev,
                      storyPoints: event.target.value,
                    }))
                  }
                />
              ) : (
                <span className="historia-meta-value">
                  {Number(draft.storyPoints) || historia.storyPoints}
                </span>
              )}
            </div>
          </div>
          <div className="historia-field-block historia-description-block">
            <label htmlFor="historia-descripcion">Descripción:</label>
            {isEditing ? (
              <textarea
                className="editable-control"
                id="historia-descripcion"
                placeholder="Aquí puedes poner tu descripción"
                value={draft.descripcion}
                onChange={(event) =>
                  setDraft((prev) => ({
                    ...prev,
                    descripcion: event.target.value,
                  }))
                }
              />
            ) : (
              <div className="epica-read-value epica-read-value--multiline">
                {draft.descripcion || "Sin descripción"}
              </div>
            )}
          </div>
          {isEditing && (
            <div className="historia-edit-actions-row">
              <button
                type="button"
                className="btn-main"
                onClick={handleSaveHistoria}
                disabled={savingHistoria || !draft.nombre.trim()}
              >
                {savingHistoria ? "Guardando..." : "Guardar"}
              </button>
              <button
                type="button"
                className="btn-soft"
                onClick={handleCancelEdit}
                disabled={savingHistoria}
              >
                Cancelar
              </button>
            </div>
          )}
        </article>
        <section className="epica-historias-card historia-criterios-card historia-criterios-vertical">
          <div className="historia-criterios-header">
            <div>
              <h3>Criterios de aceptación</h3>
              <p className="historia-criterios-subtitle">
                Define las condiciones para dar esta historia por completada.
              </p>
            </div>
            <div className="historia-criterios-header-actions">
              <button
                type="button"
                className="btn-soft"
                onClick={() => setShowNewCriterioForm((prev) => !prev)}
              >
                {showNewCriterioForm
                  ? "Dejar de crear criterios"
                  : "+ Crear nuevos criterios"}
              </button>
            </div>
          </div>
          {criterios.length === 0 ? (
            <p className="historia-criterios-empty">
              Aún no hay criterios. Agrega el primero para iniciar la
              validación.
            </p>
          ) : (
            <div className="historia-criterios-box">
              <ul className="criterios-list historia-criterios-list">
                {criterios.map((criterio) => (
                  <li key={criterio.id} className="criterio-item">
                    <div className="criterio-item-row">
                      {editingCriterioId === criterio.id ? (
                        <input
                          className="criterio-edit-input editable-control"
                          type="text"
                          value={editingCriterioText}
                          onChange={(event) =>
                            setEditingCriterioText(event.target.value)
                          }
                          disabled={savingCriterio}
                        />
                      ) : (
                        <span className="criterio-text">
                          {criterio.descripcion}
                        </span>
                      )}

                      {editingCriterioId !== criterio.id && (
                        <button
                          type="button"
                          className="criterio-menu-trigger"
                          onClick={() =>
                            setOpenCriterioMenuId((prev) =>
                              prev === criterio.id ? null : criterio.id,
                            )
                          }
                          aria-label="Abrir menú de criterio"
                        >
                          ⋮
                        </button>
                      )}
                    </div>

                    {openCriterioMenuId === criterio.id &&
                      editingCriterioId !== criterio.id && (
                        <div className="criterio-menu">
                          <button
                            type="button"
                            onClick={() => handleStartEditCriterio(criterio)}
                          >
                            Editar
                          </button>
                          <button
                            type="button"
                            className="danger"
                            onClick={() => handleDeleteCriterio(criterio)}
                          >
                            Eliminar
                          </button>
                        </div>
                      )}

                    {editingCriterioId === criterio.id && (
                      <div className="criterio-edit-actions">
                        <button
                          type="button"
                          className="btn-main"
                          onClick={handleSaveCriterio}
                          disabled={
                            savingCriterio || !editingCriterioText.trim()
                          }
                        >
                          {savingCriterio ? "Guardando..." : "Guardar"}
                        </button>
                        <button
                          type="button"
                          className="btn-soft"
                          onClick={handleCancelEditCriterio}
                          disabled={savingCriterio}
                        >
                          Cancelar
                        </button>
                      </div>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          )}
          {showNewCriterioForm && (
            <div className="historia-criterio-form">
              <input
                className="editable-control"
                type="text"
                placeholder="Escribe un criterio de aceptación"
                value={nuevoCriterio}
                onChange={(event) => setNuevoCriterio(event.target.value)}
                disabled={savingCriterio}
              />
              <button
                type="button"
                className="btn-main"
                onClick={handleAddCriterio}
                disabled={savingCriterio || !nuevoCriterio.trim()}
              >
                {savingCriterio ? "Agregando..." : "Agregar"}
              </button>
            </div>
          )}
        </section>
      </div>

      {openMenu && <div className="historia-menu-overlay" onClick={() => setOpenMenu(false)} />}
    </section>
  );
}
