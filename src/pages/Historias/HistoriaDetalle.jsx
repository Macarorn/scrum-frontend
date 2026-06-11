import { showError, showSuccess, showWarning, showInfo } from "../../utils/alerts";
import { useEffect, useMemo, useState } from "react";
import { Alert, Modal, Button, Form } from "react-bootstrap";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import { clearSessionTokens, canEditBacklog, canManageSprints } from "../../services/auth.service";
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
import { listarMiembrosProyecto } from "../../services/proyectos.service";
import { crearTarea, editarTarea, eliminarTarea } from "../../services/sprint.service";
import { asignarUsuarioTarea, contarTareasPorHistoria, listarTareasPorHistoria, desasignarUsuarioTarea } from "../../services/tareas.service";
import "../../styles/Epicas.css";
export default function HistoriaDetalle() {
  const navigate = useNavigate();
  const { idHistoria } = useParams();
  const [searchParams] = useSearchParams();

  const [historia, setHistoria] = useState(null);
  const [epica, setEpica] = useState(null);
  const [criterios, setCriterios] = useState([]);
  const [tareasHistoria, setTareasHistoria] = useState([]);
  const [loadingTareas, setLoadingTareas] = useState(false);
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
  const [showNewCriterioModal, setShowNewCriterioModal] = useState(false);
  const [openCriterioMenuId, setOpenCriterioMenuId] = useState(null);
  const [editingCriterioId, setEditingCriterioId] = useState(null);
  const [editingCriterioText, setEditingCriterioText] = useState("");

  const [loading, setLoading] = useState(true);
  const [savingHistoria, setSavingHistoria] = useState(false);
  const [savingCriterio, setSavingCriterio] = useState(false);
  const [creatingTask, setCreatingTask] = useState(false);
  const [nextTaskNumber, setNextTaskNumber] = useState(null);
  const [taskName, setTaskName] = useState("");
  const [taskDescripcion, setTaskDescripcion] = useState("");
  const [taskPrioridad, setTaskPrioridad] = useState("media");
  const [taskEstado, setTaskEstado] = useState("por_hacer");
  const [taskEstimacionDias, setTaskEstimacionDias] = useState("");
  const [taskFechaFinEst, setTaskFechaFinEst] = useState("");
  const [taskUsuarioResponsable, setTaskUsuarioResponsable] = useState("");
  const [taskUsuarioAsignado, setTaskUsuarioAsignado] = useState("");
  const [showTaskModal, setShowTaskModal] = useState(false);
  const [showEditTaskModal, setShowEditTaskModal] = useState(false);
  const [showTaskDetailModal, setShowTaskDetailModal] = useState(false);
  const [editingTask, setEditingTask] = useState(null);
  const [editTaskForm, setEditTaskForm] = useState({
    nombre: "",
    descripcion: "",
    prioridad: "media",
    estado: "por_hacer",
    estimacion_dias: "",
    fecha_fin_est: "",
    id_usuario_responsable: "",
    asignado: "",
  });
  const [error, setError] = useState("");
  const [info, setInfo] = useState("");
  const [miembrosProyecto, setMiembrosProyecto] = useState([]);
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

  const [canEdit, setCanEdit] = useState(false);
  const [canCreateTask, setCanCreateTask] = useState(false);

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

  // Cargar permisos del usuario en el proyecto
  useEffect(() => {
    const loadPermissions = async () => {
      if (idProyecto) {
        const hasPermission = await canEditBacklog(idProyecto);
        setCanEdit(hasPermission);
        const hasSprintPermission = await canManageSprints(idProyecto);
        setCanCreateTask(hasSprintPermission);
      }
    };
    loadPermissions();
  }, [idProyecto]);

  // Cargar miembros del proyecto
  useEffect(() => {
    const cargarMiembros = async () => {
      if (!idProyecto) {
        setMiembrosProyecto([]);
        return;
      }

      try {
        const response = await listarMiembrosProyecto(idProyecto);
        setMiembrosProyecto(response.data || []);
      } catch (err) {
        console.error("Error cargando miembros:", err);
        setMiembrosProyecto([]);
      }
    };

    cargarMiembros();
  }, [idProyecto]);

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

        // Cargar tareas de la historia
        setLoadingTareas(true);
        try {
          const tareas = await listarTareasPorHistoria(idHistoria);
          setTareasHistoria(tareas || []);
        } catch (err) {
          console.error("Error cargando tareas:", err);
          setTareasHistoria([]);
        } finally {
          setLoadingTareas(false);
        }
      } catch (err) {
        if (err.code === "UNAUTHENTICATED") {
          handleAuthError();
          return;
        }

        showError(err.message || "No se pudo cargar la historia");
        setError("");
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

      showError(err.message || "No se pudo guardar la historia");
      setError("");
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
      showSuccess("Criterio creado exitosamente");
      handleCloseNewCriterioModal();
    } catch (err) {
      if (err.code === "UNAUTHENTICATED") {
        handleAuthError();
        return;
      }

      showError(err.message || "No se pudo crear el criterio");
      setError("");
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

      showError(err.message || "No se pudo editar el criterio");
      setError("");
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

      showError(err.message || "No se pudo eliminar el criterio");
      setError("");
    } finally {
      setSavingCriterio(false);
      setProcessingConfirm(false);
    }
  };

  const handleDeleteCriterio = (criterioId) => {
    if (!criterioId) return;

    const criterio = criterios.find((c) => c.id === criterioId);
    if (!criterio) return;

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

      showError(err.message || "No se pudo eliminar la historia");
      setError("");
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
    setTaskDescripcion("");
    setTaskPrioridad("media");
    setTaskEstado("por_hacer");
    setTaskEstimacionDias("");
    setTaskFechaFinEst("");
    setTaskUsuarioResponsable("");
    setTaskUsuarioAsignado("");
  };

  const handleOpenNewCriterioModal = () => {
    setShowNewCriterioModal(true);
    setNuevoCriterio("");
  };

  const handleCloseNewCriterioModal = () => {
    setShowNewCriterioModal(false);
    setNuevoCriterio("");
  };

  const handleOpenEditTaskModal = (tarea) => {
    setEditingTask(tarea);
    setEditTaskForm({
      nombre: tarea.nombre || "",
      descripcion: tarea.descripcion || "",
      prioridad: tarea.prioridad || "media",
      estado: tarea.estado || "por_hacer",
      estimacion_dias: tarea.estimacion_dias || "",
      fecha_fin_est: tarea.fecha_fin_est ? tarea.fecha_fin_est.split('T')[0] : "",
      id_usuario_responsable: tarea.id_usuario_responsable ? String(tarea.id_usuario_responsable) : "",
      asignado: tarea.asignados?.length > 0 ? String(tarea.asignados[0].id_usuario) : "",
    });
    setShowEditTaskModal(true);
  };

  const handleCloseEditTaskModal = () => {
    setShowEditTaskModal(false);
    setEditingTask(null);
    setEditTaskForm({
      nombre: "",
      descripcion: "",
      prioridad: "media",
      estado: "por_hacer",
      estimacion_dias: "",
      fecha_fin_est: "",
      id_usuario_responsable: "",
      asignado: "",
    });
  };

  const handleOpenTaskDetailModal = (tarea) => {
    console.log("Tarea al abrir modal de detalle:", tarea);
    console.log("Asignados de la tarea:", tarea.asignados);
    setEditingTask(tarea);
    setShowTaskDetailModal(true);
  };

  const handleCloseTaskDetailModal = () => {
    setShowTaskDetailModal(false);
    setEditingTask(null);
  };

  const handleDeleteTask = async () => {
    if (!editingTask?.id_tarea) return;

    setProcessingConfirm(true);
    try {
      await eliminarTarea(editingTask.id_tarea);
      showSuccess("Tarea eliminada correctamente");
      
      // Recargar tareas
      const tareas = await listarTareasPorHistoria(idHistoria);
      setTareasHistoria(tareas || []);
      
      handleCloseTaskDetailModal();
    } catch (err) {
      if (err.code === "UNAUTHENTICATED") {
        handleAuthError();
        return;
      }
      showError(err.message || "No se pudo eliminar la tarea");
    } finally {
      setProcessingConfirm(false);
    }
  };

  const handleDeleteTaskClick = () => {
    setConfirmModal({
      show: true,
      title: "Eliminar tarea",
      body: `¿Estás seguro de que quieres eliminar la tarea "${editingTask?.nombre}"? Esta acción no se puede deshacer.`,
      confirmLabel: "Eliminar",
      cancelLabel: "Cancelar",
      onConfirm: handleDeleteTask,
    });
  };

  const handleSaveTaskEdit = async () => {
    if (!editingTask?.id_tarea || !editTaskForm.nombre.trim()) return;

    setCreatingTask(true);
    setError("");
    setInfo("");

    try {
      await editarTarea(editingTask.id_tarea, {
        nombre: editTaskForm.nombre.trim(),
        descripcion: editTaskForm.descripcion.trim() || "",
        prioridad: editTaskForm.prioridad,
        estado: editTaskForm.estado,
        estimacion_dias: editTaskForm.estimacion_dias === "" ? null : Number(editTaskForm.estimacion_dias),
        fecha_fin_est: editTaskForm.fecha_fin_est || null,
        id_usuario_responsable: editTaskForm.id_usuario_responsable ? Number(editTaskForm.id_usuario_responsable) : null,
      });

      // Primero eliminar todas las asignaciones actuales
      if (editingTask.asignados && editingTask.asignados.length > 0) {
        for (const asignado of editingTask.asignados) {
          try {
            await desasignarUsuarioTarea(editingTask.id_tarea, asignado.id_usuario);
          } catch (err) {
            console.error("Error desasignando usuario:", err);
          }
        }
      }

      // Asignar usuario adicional si se seleccionó uno
      if (editTaskForm.asignado) {
        console.log("Asignando usuario adicional al editar:", editTaskForm.asignado);
        await asignarUsuarioTarea(editingTask.id_tarea, editTaskForm.asignado, false);
      }

      // Recargar tareas
      const tareas = await listarTareasPorHistoria(idHistoria);
      setTareasHistoria(tareas || []);

      showSuccess("Tarea actualizada correctamente");
      handleCloseEditTaskModal();
    } catch (err) {
      if (err.code === "UNAUTHENTICATED") {
        handleAuthError();
        return;
      }
      showError(err.message || "No se pudo actualizar la tarea");
    } finally {
      setCreatingTask(false);
    }
  };

  const handleCreateTaskFromModal = async () => {
    const camposFaltantes = [];
    if (!taskName.trim()) camposFaltantes.push("nombre");
    if (!taskDescripcion.trim()) camposFaltantes.push("descripción");
    
    if (camposFaltantes.length > 0) {
      showError(`Falta ${camposFaltantes.join(", ")}`);
      return;
    }
    setCreatingTask(true);
    setError("");
    setInfo("");
    try {
      const creada = await crearTarea({
        nombre: taskName.trim(),
        descripcion: taskDescripcion.trim() || "",
        id_historia: Number(historia.id),
        prioridad: taskPrioridad,
        estado: taskEstado,
        tipo: "otro",
        estimacion_dias: taskEstimacionDias === "" ? null : Number(taskEstimacionDias),
        fecha_fin_est: taskFechaFinEst || null,
        id_usuario_responsable: taskUsuarioResponsable ? Number(taskUsuarioResponsable) : null,
      });

      // Asignar usuario adicional si se seleccionó uno
      if (taskUsuarioAsignado && creada.data?.id_tarea) {
        try {
          console.log("Asignando usuario adicional a tarea:", creada.data.id_tarea, taskUsuarioAsignado);
          await asignarUsuarioTarea(creada.data.id_tarea, taskUsuarioAsignado, false);
        } catch (assignError) {
          console.error("Error asignando usuario adicional:", assignError);
          showError("Tarea creada pero no se pudo asignar el usuario adicional");
        }
      } else {
        console.log("No se seleccionó usuario adicional para asignar");
      }

      // Recargar tareas para obtener asignados y sprint
      const tareas = await listarTareasPorHistoria(idHistoria);
      console.log("Tareas después de crear:", tareas);
      setTareasHistoria(tareas || []);

      showSuccess("Tarea creada correctamente");
      handleCloseTaskModal();
    } catch (err) {
      if (err.code === "UNAUTHENTICATED") {
        handleAuthError();
        return;
      }
      showError(err.message || "No se pudo crear la tarea");
      setError("");
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

      <div className="historia-edit-layout">
        <div className="historia-layout-main">
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
              {canEdit && (
                <button
                  type="button"
                  className="historia-menu-trigger"
                  onClick={() => setOpenMenu((prev) => !prev)}
                  aria-label="Abrir acciones"
                >
                  ⋮
                </button>
              )}
              {openMenu && canEdit && (
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
                onClick={handleOpenNewCriterioModal}
              >
                + Crear nuevo criterio
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
                        <>
                          <input
                            className="criterio-edit-input editable-control"
                            type="text"
                            value={editingCriterioText}
                            onChange={(event) =>
                              setEditingCriterioText(event.target.value)
                            }
                            disabled={savingCriterio}
                          />
                          <div className="criterio-edit-actions">
                            <button
                              type="button"
                              className="btn-main"
                              onClick={handleSaveCriterio}
                              disabled={savingCriterio || !editingCriterioText.trim()}
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
                        </>
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

                    {openCriterioMenuId === criterio.id && (
                      <div className="criterio-menu">
                        <button
                          type="button"
                          onClick={() => handleStartEditCriterio(criterio)}
                        >
                          Editar
                        </button>
                        <button
                          type="button"
                          className="criterio-menu-danger"
                          onClick={() => {
                            setOpenCriterioMenuId(null);
                            handleDeleteCriterio(criterio.id);
                          }}
                        >
                          Eliminar
                        </button>
                      </div>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </section>
        </div>
        <section className="epica-historias-card historia-tareas-card">
          <div className="historia-criterios-header">
            <div>
              <h3>Tareas de esta historia</h3>
              <p className="historia-criterios-subtitle">
                Lista de tareas asociadas a esta historia de usuario.
              </p>
            </div>
            <div className="historia-criterios-header-actions">
              {canCreateTask && (
                <button
                  type="button"
                  className="btn-create-task"
                  onClick={handleOpenTaskModal}
                  disabled={creatingTask}
                >
                  {creatingTask
                    ? "Creando tarea..."
                    : `Crear tarea (ID ${nextTaskNumber ?? "-"})`}
                </button>
              )}
            </div>
          </div>
          {loadingTareas ? (
            <p className="historia-criterios-empty">Cargando tareas...</p>
          ) : tareasHistoria.length === 0 ? (
            <p className="historia-criterios-empty">
              Aún no hay tareas. Crea la primera tarea para esta historia.
            </p>
          ) : (
            <div className="historia-tareas-grid">
              {tareasHistoria.map((tarea) => (
                <div key={tarea.id_tarea} className="historia-tarea-card" onClick={() => handleOpenTaskDetailModal(tarea)}>
                  <div className="historia-tarea-header">
                    <h4>{tarea.nombre}</h4>
                    <div className="historia-tarea-header-right">
                      {canEdit && (
                        <button
                          type="button"
                          className="btn-edit-icon"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleOpenEditTaskModal(tarea);
                          }}
                          disabled={creatingTask}
                          title="Editar tarea"
                        >
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                            <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
                          </svg>
                        </button>
                      )}
                      <span className={`task-priority-badge priority-${(tarea.prioridad || "media").toLowerCase()}`}>
                        {String(tarea.prioridad || "Media").charAt(0).toUpperCase() + String(tarea.prioridad || "Media").slice(1).toLowerCase()}
                      </span>
                    </div>
                  </div>
                  <div className="historia-tarea-body">
                    <p className="historia-tarea-description">
                      {tarea.descripcion || "Sin descripción"}
                    </p>
                    <div className="historia-tarea-meta">
                      <span className="historia-tarefa-estado">
                        Estado: {String(tarea.estado || "por_hacer").replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase())}
                      </span>
                      {tarea.asignados && tarea.asignados.length > 0 && (
                        <span className="historia-tarea-asignado">
                          Asignado a: {tarea.asignados.map((u) => u.nombre).join(", ")}
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="historia-tarea-footer">
                    <button
                      type="button"
                      className="btn-view-kanban"
                      onClick={(e) => {
                        e.stopPropagation();
                        const queryProyecto = idProyecto ? `id_proyecto=${idProyecto}&` : "";
                        const sprintId = tarea.id_sprint;
                        if (sprintId) {
                          navigate(`/kanban?${queryProyecto}id_sprint=${sprintId}`, {
                            state: { highlightTaskId: tarea.id_tarea },
                          });
                        } else {
                          showError("La tarea no está asignada a un sprint");
                        }
                      }}
                    >
                      Ver en Kanban
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>

      {openMenu && <div className="historia-menu-overlay" onClick={() => setOpenMenu(false)} />}

      <Modal show={showTaskModal} onHide={handleCloseTaskModal} centered size="lg">
        <Modal.Header closeButton>
          <Modal.Title>Crear tarea para esta historia</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
              <Form.Group className="mb-3">
                <Form.Label>Nombre de la tarea</Form.Label>
                <Form.Control
                  type="text"
                  value={taskName}
                  onChange={(e) => setTaskName(e.target.value)}
                  placeholder="Nombre de la tarea"
                  disabled={creatingTask}
                />
              </Form.Group>
              <Form.Group className="mb-3">
                <Form.Label>Prioridad</Form.Label>
                <Form.Select
                  value={taskPrioridad}
                  onChange={(e) => setTaskPrioridad(e.target.value)}
                  disabled={creatingTask}
                >
                  <option value="baja">Baja</option>
                  <option value="media">Media</option>
                  <option value="alta">Alta</option>
                  <option value="critica">Crítica</option>
                </Form.Select>
              </Form.Group>
              <Form.Group className="mb-3" style={{ gridColumn: '1 / -1' }}>
                <Form.Label>Descripción</Form.Label>
                <Form.Control
                  as="textarea"
                  rows={3}
                  value={taskDescripcion}
                  onChange={(e) => setTaskDescripcion(e.target.value)}
                  placeholder="Describe el trabajo a realizar"
                  disabled={creatingTask}
                />
              </Form.Group>
              <Form.Group className="mb-3">
                <Form.Label>Estado</Form.Label>
                <Form.Select
                  value={taskEstado}
                  onChange={(e) => setTaskEstado(e.target.value)}
                  disabled={creatingTask}
                >
                  <option value="por_hacer">Por hacer</option>
                  <option value="en_progreso">En progreso</option>
                  <option value="completado">Completado</option>
                  <option value="bloqueado">Bloqueado</option>
                </Form.Select>
              </Form.Group>
              <Form.Group className="mb-3">
                <Form.Label>Estimación (días)</Form.Label>
                <Form.Control
                  type="number"
                  min="0"
                  step="0.5"
                  value={taskEstimacionDias}
                  onChange={(e) => setTaskEstimacionDias(e.target.value)}
                  placeholder="0"
                  disabled={creatingTask}
                />
              </Form.Group>
              <Form.Group className="mb-3">
                <Form.Label>Fecha fin estimada</Form.Label>
                <Form.Control
                  type="date"
                  value={taskFechaFinEst}
                  onChange={(e) => setTaskFechaFinEst(e.target.value)}
                  disabled={creatingTask}
                />
              </Form.Group>
              <Form.Group className="mb-3">
                <Form.Label>Responsable</Form.Label>
                <Form.Select
                  value={taskUsuarioResponsable}
                  onChange={(e) => setTaskUsuarioResponsable(e.target.value)}
                  disabled={creatingTask}
                >
                  <option value="">Sin responsable</option>
                  {miembrosProyecto.map((miembro) => (
                    <option key={miembro.id_usuario} value={miembro.id_usuario}>
                      {miembro.nombre}
                    </option>
                  ))}
                </Form.Select>
              </Form.Group>
              <Form.Group className="mb-3">
                <Form.Label>Asignar a (opcional)</Form.Label>
                <Form.Select
                  value={taskUsuarioAsignado}
                  onChange={(e) => setTaskUsuarioAsignado(e.target.value)}
                  disabled={creatingTask}
                >
                  <option value="">Sin asignar opcional</option>
                  {miembrosProyecto.map((miembro) => (
                    <option key={miembro.id_usuario} value={miembro.id_usuario}>
                      {miembro.nombre}
                    </option>
                  ))}
                </Form.Select>
              </Form.Group>
            </div>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleCloseTaskModal} disabled={creatingTask}>
            Cancelar
          </Button>
          <Button className="btn-main" onClick={handleCreateTaskFromModal} disabled={creatingTask || !taskName.trim()}>
            {creatingTask ? "Creando..." : "Crear tarea"}
          </Button>
        </Modal.Footer>
      </Modal>

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
            className={confirmModal.confirmLabel === "Eliminar" ? "btn-danger" : "btn-main"}
            onClick={confirmModal.onConfirm}
            disabled={processingConfirm || !confirmModal.onConfirm}
          >
            {processingConfirm ? "Procesando..." : confirmModal.confirmLabel}
          </button>
        </Modal.Footer>
      </Modal>

      <Modal show={showNewCriterioModal} onHide={handleCloseNewCriterioModal} centered>
        <Modal.Header closeButton>
          <Modal.Title>Crear criterio de aceptación</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Form.Group className="mb-3">
              <Form.Label>Criterio de aceptación</Form.Label>
              <Form.Control
                as="textarea"
                rows={3}
                value={nuevoCriterio}
                onChange={(e) => setNuevoCriterio(e.target.value)}
                placeholder="Describe el criterio de aceptación"
                disabled={savingCriterio}
              />
            </Form.Group>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleCloseNewCriterioModal} disabled={savingCriterio}>
            Cancelar
          </Button>
          <Button className="btn-main" onClick={handleAddCriterio} disabled={savingCriterio || !nuevoCriterio.trim()}>
            {savingCriterio ? "Guardando..." : "Crear criterio"}
          </Button>
        </Modal.Footer>
      </Modal>

      <Modal show={showEditTaskModal} onHide={handleCloseEditTaskModal} centered size="lg">
        <Modal.Header closeButton>
          <Modal.Title>Editar tarea</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
              <Form.Group className="mb-3">
                <Form.Label>Nombre de la tarea</Form.Label>
                <Form.Control
                  type="text"
                  value={editTaskForm.nombre}
                  onChange={(e) => setEditTaskForm((prev) => ({ ...prev, nombre: e.target.value }))}
                  placeholder="Nombre de la tarea"
                  disabled={creatingTask}
                />
              </Form.Group>
              <Form.Group className="mb-3">
                <Form.Label>Prioridad</Form.Label>
                <Form.Select
                  value={editTaskForm.prioridad}
                  onChange={(e) => setEditTaskForm((prev) => ({ ...prev, prioridad: e.target.value }))}
                  disabled={creatingTask}
                >
                  <option value="baja">Baja</option>
                  <option value="media">Media</option>
                  <option value="alta">Alta</option>
                  <option value="critica">Crítica</option>
                </Form.Select>
              </Form.Group>
              <Form.Group className="mb-3" style={{ gridColumn: '1 / -1' }}>
                <Form.Label>Descripción</Form.Label>
                <Form.Control
                  as="textarea"
                  rows={3}
                  value={editTaskForm.descripcion}
                  onChange={(e) => setEditTaskForm((prev) => ({ ...prev, descripcion: e.target.value }))}
                  placeholder="Describe el trabajo a realizar"
                  disabled={creatingTask}
                />
              </Form.Group>
              <Form.Group className="mb-3">
                <Form.Label>Estado</Form.Label>
                <Form.Select
                  value={editTaskForm.estado}
                  onChange={(e) => setEditTaskForm((prev) => ({ ...prev, estado: e.target.value }))}
                  disabled={creatingTask}
                >
                  <option value="por_hacer">Por hacer</option>
                  <option value="en_progreso">En progreso</option>
                  <option value="completado">Completado</option>
                  <option value="bloqueado">Bloqueado</option>
                </Form.Select>
              </Form.Group>
              <Form.Group className="mb-3">
                <Form.Label>Estimación (días)</Form.Label>
                <Form.Control
                  type="number"
                  min="0"
                  step="0.5"
                  value={editTaskForm.estimacion_dias || ""}
                  onChange={(e) => setEditTaskForm((prev) => ({ ...prev, estimacion_dias: e.target.value }))}
                  disabled={creatingTask}
                />
              </Form.Group>
              <Form.Group className="mb-3">
                <Form.Label>Fecha de entrega estimada</Form.Label>
                <Form.Control
                  type="date"
                  value={editTaskForm.fecha_fin_est || ""}
                  onChange={(e) => setEditTaskForm((prev) => ({ ...prev, fecha_fin_est: e.target.value }))}
                  disabled={creatingTask}
                />
              </Form.Group>
              <Form.Group className="mb-3">
                <Form.Label>Responsable</Form.Label>
                <Form.Select
                  value={editTaskForm.id_usuario_responsable || ""}
                  onChange={(e) => setEditTaskForm((prev) => ({ ...prev, id_usuario_responsable: e.target.value }))}
                  disabled={creatingTask}
                >
                  <option value="">Sin responsable</option>
                  {miembrosProyecto.map((miembro) => (
                    <option key={miembro.id_usuario} value={String(miembro.id_usuario)}>
                      {miembro.nombre}
                    </option>
                  ))}
                </Form.Select>
              </Form.Group>
              <Form.Group className="mb-3">
                <Form.Label>Asignar a (opcional)</Form.Label>
                <Form.Select
                  value={editTaskForm.asignado || ""}
                  onChange={(e) => setEditTaskForm((prev) => ({ ...prev, asignado: e.target.value }))}
                  disabled={creatingTask}
                >
                  <option value="">Sin asignar opcional</option>
                  {miembrosProyecto.map((miembro) => (
                    <option key={miembro.id_usuario} value={String(miembro.id_usuario)}>
                      {miembro.nombre}
                    </option>
                  ))}
                </Form.Select>
              </Form.Group>
            </div>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleCloseEditTaskModal} disabled={creatingTask}>
            Cancelar
          </Button>
          <Button className="btn-main" onClick={handleSaveTaskEdit} disabled={creatingTask || !editTaskForm.nombre.trim()}>
            {creatingTask ? "Guardando..." : "Guardar cambios"}
          </Button>
        </Modal.Footer>
      </Modal>

      <Modal show={showTaskDetailModal} onHide={handleCloseTaskDetailModal} centered size="lg">
        <Modal.Header>
          <Modal.Title>Detalle de tarea</Modal.Title>
          <div className="task-detail-actions">
            {canEdit && (
              <>
                <button 
                  className="task-detail-icon-btn" 
                  onClick={() => {
                    handleCloseTaskDetailModal();
                    handleOpenEditTaskModal(editingTask);
                  }}
                  title="Editar tarea"
                >
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                    <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
                  </svg>
                </button>
                <button 
                  className="task-detail-icon-btn task-detail-delete-btn" 
                  onClick={handleDeleteTaskClick}
                  title="Eliminar tarea"
                >
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="3 6 5 6 21 6"></polyline>
                    <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                  </svg>
                </button>
              </>
            )}
            <button 
              className="task-detail-icon-btn" 
              onClick={handleCloseTaskDetailModal}
              title="Cerrar"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="18" y1="6" x2="6" y2="18"></line>
                <line x1="6" y1="6" x2="18" y2="18"></line>
              </svg>
            </button>
          </div>
        </Modal.Header>
        <Modal.Body>
          {editingTask && (
            <div className="task-detail-content">
              <div className="task-detail-section">
                <h5>Nombre</h5>
                <p>{editingTask.nombre}</p>
              </div>
              <div className="task-detail-section">
                <h5>Descripción</h5>
                <p>{editingTask.descripcion || "Sin descripción"}</p>
              </div>
              <div className="task-detail-section">
                <h5>Prioridad</h5>
                <p>{String(editingTask.prioridad || "Media").charAt(0).toUpperCase() + String(editingTask.prioridad || "Media").slice(1).toLowerCase()}</p>
              </div>
              <div className="task-detail-section">
                <h5>Estado</h5>
                <p>{String(editingTask.estado || "por_hacer").replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase())}</p>
              </div>
              <div className="task-detail-section">
                <h5>Responsable</h5>
                <p>
                  {editingTask.responsable_nombre || "Sin responsable"}
                </p>
              </div>
              <div className="task-detail-section">
                <h5>Asignado a</h5>
                <p>
                  {editingTask.asignados && editingTask.asignados.length > 0
                    ? editingTask.asignados.map((u) => u.nombre).join(", ")
                    : "Sin asignar"}
                </p>
              </div>
            </div>
          )}
        </Modal.Body>
      </Modal>
    </section>
  );
}
