import { showError, showSuccess, showWarning, showInfo } from "../../utils/alerts";
import { useEffect, useMemo, useRef, useState } from "react";
import { Modal, Form, Button } from "react-bootstrap";
import { useLocation, useNavigate, useSearchParams } from "react-router-dom";
import AutoDismissAlert from "../../components/AutoDismissAlert";
import { clearSessionTokens, canEditBacklog } from "../../services/auth.service";
import {
  getActiveProjectId,
  setActiveProjectId,
} from "../../services/project-context.service";
import { listarMiembrosProyecto } from "../../services/proyectos.service";
import { listarProyectos } from "../../services/proyectos.service";
import {
  cambiarEstadoTarea,
  editarTarea,
  eliminarTarea,
  listarSprintsPorProyecto,
  obtenerDetalleTarea,
  obtenerTareasPorSprint,
} from "../../services/sprint.service";
import { asignarUsuarioTarea, desasignarUsuarioTarea, listarUsuariosAsignados } from "../../services/tareas.service";
import "../../styles/SprintBoard.css";
import "../../styles/Epicas.css";

const BOARD_COLUMNS = [
  { key: "por_hacer", title: "Por Hacer" },
  { key: "en_progreso", title: "En Progreso" },
  { key: "bloqueado", title: "En Revision" },
  { key: "terminado", title: "Terminado" },
];

const ESTADO_TAREA_LABELS = {
  por_hacer: "Por hacer",
  en_progreso: "En progreso",
  bloqueado: "En revisión",
  terminado: "Terminado",
};

const PRIORIDAD_LABELS = {
  baja: "Baja",
  media: "Media",
  alta: "Alta",
  critica: "Crítica",
};

const formatEstadoTareaLabel = (estado) => ESTADO_TAREA_LABELS[estado] || estado || "";
const formatPrioridadLabel = (prioridad) => PRIORIDAD_LABELS[prioridad] || prioridad || "";

const pickPreferredSprint = (sprints) => {
  if (!Array.isArray(sprints) || sprints.length === 0) {
    return null;
  }

  const sprintEnCurso = sprints.find((sprint) => sprint.estado === "en_curso");
  return sprintEnCurso || sprints[0];
};

const formatEta = (task) => {
  if (task.estimacion_dias) {
    const dias = Number(task.estimacion_dias);
    if (!Number.isNaN(dias)) {
      return `${dias} dia${dias === 1 ? "" : "s"}`;
    }
  }

  if (task.fecha_fin_est) {
    const fecha = new Date(task.fecha_fin_est);
    if (!Number.isNaN(fecha.getTime())) {
      return `Fin: ${fecha.toLocaleDateString()}`;
    }
  }

  return "Sin estimacion";
};

export default function SprintBoard() {
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams, setSearchParams] = useSearchParams();
  const openTaskId = searchParams.get("open_task");

  const [proyectos, setProyectos] = useState([]);
  const [sprints, setSprints] = useState([]);
  const [tareas, setTareas] = useState([]);
  const [miembrosProyecto, setMiembrosProyecto] = useState([]);
  const [projectMenuOpen, setProjectMenuOpen] = useState(false);
  const [sprintMenuOpen, setSprintMenuOpen] = useState(false);
  const [projectMenuRight, setProjectMenuRight] = useState(false);
  const [sprintMenuRight, setSprintMenuRight] = useState(false);

  const [selectedProyecto, setSelectedProyecto] = useState(
    searchParams.get("id_proyecto") || getActiveProjectId() || "",
  );
  const [selectedSprint, setSelectedSprint] = useState(
    searchParams.get("id_sprint") || "",
  );
  const [searchTerm] = useState("");

  const [loading, setLoading] = useState(true);
  const [loadingSprints, setLoadingSprints] = useState(false);
  const [loadingTareas, setLoadingTareas] = useState(false);
  const [updatingTaskId, setUpdatingTaskId] = useState(null);
  const [dragTask, setDragTask] = useState(null);
  const [activeDropColumn, setActiveDropColumn] = useState("");
  const [openMenuTaskId, setOpenMenuTaskId] = useState(null);
  const [selectedTaskDetail, setSelectedTaskDetail] = useState(null);
  const [detailsLoading, setDetailsLoading] = useState(false);
  const [editLoading, setEditLoading] = useState(false);
  const [editDraft, setEditDraft] = useState({
    nombre: "",
    descripcion: "",
    prioridad: "media",
    estado: "por_hacer",
    estimacion_dias: "",
    fecha_fin_est: "",
    id_usuario_responsable: "",
    asignado: "",
  });
  const [modalMode, setModalMode] = useState("detail");
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
  const [assigningTaskId, setAssigningTaskId] = useState(null);
  const [modalMenuOpen, setModalMenuOpen] = useState(false);

  const [canEdit, setCanEdit] = useState(false);

  const handleAuthError = () => {
    clearSessionTokens();
    navigate("/login", { replace: true });
  };

  const syncQuery = (idProyecto, idSprint) => {
    const nextQuery = {};

    if (idProyecto) nextQuery.id_proyecto = idProyecto;
    if (idSprint) nextQuery.id_sprint = idSprint;

    setSearchParams(nextQuery, { replace: true });
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

  // Cargar miembros del proyecto
  useEffect(() => {
    const cargarMiembros = async () => {
      if (!selectedProyecto) {
        setMiembrosProyecto([]);
        return;
      }

      try {
        const response = await listarMiembrosProyecto(selectedProyecto);
        setMiembrosProyecto(response.data || []);
      } catch (err) {
        console.error("Error cargando miembros:", err);
        setMiembrosProyecto([]);
      }
    };

    cargarMiembros();
  }, [selectedProyecto]);

  useEffect(() => {
    const message = location.state?.toastMessage;
    const fallbackMessage = (() => {
      try {
        return sessionStorage.getItem("scrum.flash.success") || "";
      } catch {
        return "";
      }
    })();

    const finalMessage = message || fallbackMessage;
    if (!finalMessage) return;

    showSuccess(finalMessage);
    setSuccess("");

    try {
      sessionStorage.removeItem("scrum.flash.success");
    } catch {
      // ignore storage failures
    }

    if (message) {
      navigate(`${location.pathname}${location.search}`, {
        replace: true,
        state: {},
      });
    }
  }, [location.pathname, location.search, location.state, navigate]);

  useEffect(() => {
    const cargarProyectos = async () => {
      setLoading(true);
      setError("");

      try {
        const response = await listarProyectos();
        const lista = response.data || [];
        setProyectos(lista);

        if (lista.length === 0) {
          setSelectedProyecto("");
          setActiveProjectId("");
          setSelectedSprint("");
          setTareas([]);
          return;
        }

        const proyectoExiste = lista.some(
          (proyecto) =>
            String(proyecto.id_proyecto) === String(selectedProyecto),
        );
        const idProyectoInicial = proyectoExiste
          ? selectedProyecto
          : String(lista[0].id_proyecto);
        setSelectedProyecto(idProyectoInicial);
        setActiveProjectId(idProyectoInicial);
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

    cargarProyectos();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!selectedProyecto) {
      setActiveProjectId("");
      setSprints([]);
      setSelectedSprint("");
      setTareas([]);
      syncQuery("", "");
      return;
    }

    setActiveProjectId(selectedProyecto);
    setSprints([]);
    setSelectedSprint("");
    setTareas([]);
    setOpenMenuTaskId(null);
    setSelectedTaskDetail(null);

    let active = true;

    const cargarSprints = async () => {
      setLoadingSprints(true);
      setError("");

      try {
        const listaSprints =
          (await listarSprintsPorProyecto(selectedProyecto)) || [];
        if (!active) return;
        setSprints(listaSprints);

        if (listaSprints.length === 0) {
          setSelectedSprint("");
          setTareas([]);
          syncQuery(selectedProyecto, "");
          return;
        }

        const sprintExiste = listaSprints.some(
          (sprint) => String(sprint.id_sprint) === String(selectedSprint),
        );
        const sprintInicial = sprintExiste
          ? listaSprints.find(
            (sprint) => String(sprint.id_sprint) === String(selectedSprint),
          )
          : pickPreferredSprint(listaSprints);

        const nextSprint = sprintInicial ? String(sprintInicial.id_sprint) : "";
        setSelectedSprint(nextSprint);
        syncQuery(selectedProyecto, nextSprint);
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

    cargarSprints();
    return () => {
      active = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedProyecto]);

  useEffect(() => {
    if (!selectedSprint) {
      setTareas([]);
      return;
    }

    const cargarTareas = async () => {
      setLoadingTareas(true);
      setError("");

      try {
        const listaTareas =
          (await obtenerTareasPorSprint(selectedSprint)) || [];
        setTareas(listaTareas);
      } catch (err) {
        if (err.code === "UNAUTHENTICATED") {
          handleAuthError();
          return;
        }

        showError(err.message || "No se pudieron cargar las tareas");
        setError("");
      } finally {
        setLoadingTareas(false);
      }
    };

    cargarTareas();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedSprint]);

  // Auto-abrir tarea desde URL (open_task param)
  const autoOpened = useRef(false);
  useEffect(() => {
    if (!openTaskId || !tareas.length || loadingTareas || autoOpened.current) return;
    const targetTask = tareas.find(t => String(t.id_tarea) === String(openTaskId));
    if (targetTask) {
      autoOpened.current = true;
      openTaskDetail(targetTask);
      // Limpiar el parámetro de la URL para evitar re-apertura
      const nextParams = new URLSearchParams(searchParams);
      nextParams.delete("open_task");
      setSearchParams(nextParams, { replace: true });
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [openTaskId, tareas, loadingTareas]);

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

  const tareasFiltradas = useMemo(() => {
    const searchLower = searchTerm.trim().toLowerCase();
    if (!searchLower) return tareas;

    return tareas.filter((task) => {
      const nombre = (task.nombre || "").toLowerCase();
      const historia = (task.historia_nombre || "").toLowerCase();
      return nombre.includes(searchLower) || historia.includes(searchLower);
    });
  }, [searchTerm, tareas]);

  const groupedTasks = useMemo(() => {
    const groups = {
      por_hacer: [],
      en_progreso: [],
      bloqueado: [],
      terminado: [],
    };

    tareasFiltradas.forEach((task) => {
      const estado = task.estado || "por_hacer";
      if (groups[estado]) {
        groups[estado].push(task);
      }
    });

    return groups;
  }, [tareasFiltradas]);

  const sprintActual = sprints.find(
    (sprint) => String(sprint.id_sprint) === String(selectedSprint),
  );
  const proyectoActual = proyectos.find(
    (proyecto) => String(proyecto.id_proyecto) === String(selectedProyecto),
  );

  const closeModal = () => {
    setSelectedTaskDetail(null);
    setModalMode("detail");
    setEditLoading(false);
    setModalMenuOpen(false);
  };

  const openTaskDetail = async (task) => {
    setOpenMenuTaskId(null);
    setDetailsLoading(true);
    setError("");

    try {
      const detalle = await obtenerDetalleTarea(task.id_tarea);
      setSelectedTaskDetail(detalle || task);
      setModalMode("detail");
    } catch (err) {
      if (err.code === "UNAUTHENTICATED") {
        handleAuthError();
        return;
      }

      showError(err.message || "No se pudo abrir el detalle de la tarea");
      setError("");
    } finally {
      setDetailsLoading(false);
    }
  };

  const openEditTask = async (task) => {
    setOpenMenuTaskId(null);
    setDetailsLoading(true);
    setError("");

    try {
      const detalle = await obtenerDetalleTarea(task.id_tarea);
      const target = detalle || task;
      setSelectedTaskDetail(target);
      setEditDraft({
        nombre: target.nombre || "",
        descripcion: target.descripcion || "",
        prioridad: target.prioridad || "media",
        estado: target.estado || "por_hacer",
        estimacion_dias: target.estimacion_dias ?? "",
        fecha_fin_est: target.fecha_fin_est
          ? String(target.fecha_fin_est).slice(0, 10)
          : "",
        id_usuario_responsable: target.id_usuario_responsable ? String(target.id_usuario_responsable) : "",
        asignado: target.asignados && target.asignados.length > 0
          ? String((target.asignados.find(u => !u.es_responsable) || target.asignados[0]).id_usuario)
          : "",
      });
      setModalMode("edit");
    } catch (err) {
      if (err.code === "UNAUTHENTICATED") {
        handleAuthError();
        return;
      }

      showError(err.message || "No se pudo abrir la edicion de la tarea");
      setError("");
    } finally {
      setDetailsLoading(false);
    }
  };

  const handleSaveEdit = async () => {
    if (!selectedTaskDetail?.id_tarea) return;

    setEditLoading(true);
    setError("");

    try {
      const updated = await editarTarea(selectedTaskDetail.id_tarea, {
        nombre: editDraft.nombre.trim(),
        descripcion: editDraft.descripcion.trim() || null,
        prioridad: editDraft.prioridad,
        estado: editDraft.estado,
        estimacion_dias:
          editDraft.estimacion_dias === ""
            ? null
            : Number(editDraft.estimacion_dias),
        fecha_fin_est: editDraft.fecha_fin_est || null,
        id_usuario_responsable: editDraft.id_usuario_responsable ? Number(editDraft.id_usuario_responsable) : null,
      });

      // Eliminar asignaciones actuales
      if (selectedTaskDetail.asignados && selectedTaskDetail.asignados.length > 0) {
        for (const asignado of selectedTaskDetail.asignados) {
          try {
            await desasignarUsuarioTarea(selectedTaskDetail.id_tarea, asignado.id_usuario);
          } catch (err) {
            console.error("Error desasignando usuario:", err);
          }
        }
      }

      // Asignar usuario adicional si se seleccionó uno
      if (editDraft.asignado) {
        await asignarUsuarioTarea(selectedTaskDetail.id_tarea, editDraft.asignado, false);
      }

      setTareas((prev) =>
        prev.map((task) =>
          task.id_tarea === updated.id_tarea ? { ...task, ...updated } : task,
        ),
      );
      setSelectedTaskDetail(updated);
      setModalMode("detail");
      showSuccess("Guardado correctamente");
      setSuccess("");
    } catch (err) {
      if (err.code === "UNAUTHENTICATED") {
        handleAuthError();
        return;
      }

      showError(err.message || "No se pudo editar la tarea");
      setError("");
    } finally {
      setEditLoading(false);
    }
  };

  const closeConfirmModal = () => {
    setConfirmModal((prev) => ({ ...prev, show: false, onConfirm: null }));
  };

  const confirmDeleteTask = async (task) => {
    if (!task?.id_tarea) return;

    setConfirmModal((prev) => ({ ...prev, show: false, onConfirm: null }));
    setProcessingConfirm(true);
    setUpdatingTaskId(task.id_tarea);
    setError("");

    try {
      await eliminarTarea(task.id_tarea);
      setTareas((prev) => prev.filter((item) => item.id_tarea !== task.id_tarea));
      if (selectedTaskDetail?.id_tarea === task.id_tarea) {
        closeModal();
      }
      showSuccess("Eliminado correctamente");
      setSuccess("");
    } catch (err) {
      if (err.code === "UNAUTHENTICATED") {
        handleAuthError();
        return;
      }

      showError(err.message || "No se pudo borrar la tarea");
      setError("");
    } finally {
      setProcessingConfirm(false);
      setUpdatingTaskId(null);
    }
  };

  const handleDeleteTask = (task) => {
    setOpenMenuTaskId(null);
    if (!task) return;

    setConfirmModal({
      show: true,
      title: "Eliminar tarea",
      body: `¿Deseas continuar y eliminar la tarea "${task.nombre}"?`,
      confirmLabel: "Eliminar",
      cancelLabel: "Cancelar",
      onConfirm: () => confirmDeleteTask(task),
    });
  };

  const handleDragStart = (task) => {
    if (updatingTaskId) return;
    setDragTask({ id_tarea: task.id_tarea, estado: task.estado });
  };

  const handleDropTask = async (nextEstado) => {
    if (!dragTask || !dragTask.id_tarea || dragTask.estado === nextEstado) {
      setActiveDropColumn("");
      return;
    }

    const previousTasks = [...tareas];
    setActiveDropColumn("");
    setUpdatingTaskId(dragTask.id_tarea);
    setError("");

    setTareas((prev) =>
      prev.map((task) =>
        task.id_tarea === dragTask.id_tarea
          ? { ...task, estado: nextEstado }
          : task,
      ),
    );

    try {
      const tareaActualizada = await cambiarEstadoTarea(
        dragTask.id_tarea,
        nextEstado,
      );

      if (tareaActualizada && tareaActualizada.id_tarea) {
        setTareas((prev) =>
          prev.map((task) =>
            task.id_tarea === tareaActualizada.id_tarea
              ? { ...task, ...tareaActualizada }
              : task,
          ),
        );
        showSuccess("Actualizado correctamente");
        setSuccess("");
      }
    } catch (err) {
      if (err.code === "UNAUTHENTICATED") {
        handleAuthError();
        return;
      }

      setTareas(previousTasks);
      showError(err.message || "No se pudo mover la tarea");
      setError("");
    } finally {
      setUpdatingTaskId(null);
      setDragTask(null);
    }
  };

  const handleAssignUser = async (taskId, userId) => {
    if (!canEdit) return;

    setAssigningTaskId(taskId);
    setError("");

    try {
      if (userId) {
        await asignarUsuarioTarea(taskId, userId, false);
        showSuccess("Usuario asignado correctamente");
      } else {
        // Desasignar todos los usuarios (opcional, por ahora solo asignamos)
        showInfo("Seleccione un usuario para asignar");
        setAssigningTaskId(null);
        return;
      }

      // Recargar tareas para actualizar la UI
      const listaTareas = await obtenerTareasPorSprint(selectedSprint);
      setTareas(listaTareas);
    } catch (err) {
      if (err.code === "UNAUTHENTICATED") {
        handleAuthError();
        return;
      }

      showError(err.message || "No se pudo asignar el usuario");
      setError("");
    } finally {
      setAssigningTaskId(null);
    }
  };

  return (
    <section className="sprint-page">
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





      {!error &&
        !loading &&
        !loadingSprints &&
        selectedProyecto &&
        sprints.length === 0 && (
          <p className="board-feedback">
            Este proyecto no tiene sprints creados.
          </p>
        )}

      {!error && !loading && proyectos.length === 0 && (
        <p className="board-feedback">
          No hay proyectos disponibles para mostrar el tablero.
        </p>
      )}

      <div className="board-grid">
        {BOARD_COLUMNS.map((column) => (
          <article key={column.key} className="board-column">
            <header className="column-head">
              <h2>{column.title}</h2>
              <span>{groupedTasks[column.key]?.length || 0}</span>
            </header>

            <div
              className={`column-cards ${activeDropColumn === column.key ? "column-cards-dragging" : ""}`}
              onDragOver={(event) => {
                event.preventDefault();
                if (!updatingTaskId) {
                  setActiveDropColumn(column.key);
                }
              }}
              onDragLeave={() => {
                if (activeDropColumn === column.key) {
                  setActiveDropColumn("");
                }
              }}
              onDrop={(event) => {
                event.preventDefault();
                handleDropTask(column.key);
              }}
            >
              {loadingTareas ? (
                <div className="task-card task-card-placeholder">
                  Cargando tareas...
                </div>
              ) : (
                (groupedTasks[column.key] || []).map((task) => (
                  <div
                    className={`task-card ${updatingTaskId === task.id_tarea ? "task-card-updating" : ""}`}
                    key={task.id_tarea}
                    draggable={updatingTaskId !== task.id_tarea}
                    onClick={() => openTaskDetail(task)}
                    onDragStart={() => handleDragStart(task)}
                    onDragEnd={() => {
                      setActiveDropColumn("");
                      setDragTask(null);
                    }}
                    data-priority={(task.prioridad || "media").toLowerCase()}
                  >
                    <div className="task-card-header">
                      <p>{task.nombre}</p>
                      <span className={`task-priority-badge priority-${(task.prioridad || "media").toLowerCase()}`}>
                        {String(task.prioridad || "Media").charAt(0).toUpperCase() + String(task.prioridad || "Media").slice(1).toLowerCase()}
                      </span>
                    </div>
                    <div className="task-story">
                      {task.historia_nombre || "Sin historia"}
                    </div>
                    <div className="task-assignee">
                      {task.asignados && task.asignados.length > 0 ? (
                        <span className="task-assignee-name">
                          {task.asignados.filter(u => !u.es_responsable).map((u) => u.nombre).join(", ") || "Sin asignar"}
                        </span>
                      ) : (
                        <span className="task-assignee-name">Sin asignar</span>
                      )}
                    </div>
                    <div className="task-foot">
                      <small>{formatEta(task)}</small>
                      <div className="task-actions-wrap">
                        <button
                          type="button"
                          className="task-menu-trigger"
                          onClick={(event) => {
                            event.stopPropagation();
                            setOpenMenuTaskId((prev) =>
                              prev === task.id_tarea ? null : task.id_tarea,
                            );
                          }}
                          onMouseDown={(event) => event.stopPropagation()}
                        >
                          ...
                        </button>
                        {openMenuTaskId === task.id_tarea && (
                          <div
                            className="task-menu"
                            onClick={(event) => event.stopPropagation()}
                            onMouseDown={(event) => event.stopPropagation()}
                          >
                            {canEdit && (
                              <button
                                type="button"
                                onClick={() => openEditTask(task)}
                              >
                                Editar
                              </button>
                            )}
                            {canEdit && (
                              <button
                                type="button"
                                className="task-menu-danger"
                                onClick={() => handleDeleteTask(task)}
                              >
                                Eliminar
                              </button>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))
              )}

              {!loadingTareas &&
                (groupedTasks[column.key] || []).length === 0 && (
                  <div className="task-card task-card-empty">Sin tareas</div>
                )}
            </div>
          </article>
        ))}
      </div>

      {detailsLoading && (
        <div className="task-modal-backdrop">
          <div className="task-modal">Cargando tarea...</div>
        </div>
      )}

      {!detailsLoading && selectedTaskDetail && (
        <Modal show={true} onHide={closeModal} centered size="lg">
          <Modal.Header style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <div style={{ display: "flex", alignItems: "center" }}>
              <Modal.Title>{selectedTaskDetail.nombre}</Modal.Title>
              {modalMode === "detail" && (
                <div className="modal-priority-indicator">
                  <span className={`modal-priority-dot ${(selectedTaskDetail.prioridad || "media").toLowerCase()}`}></span>
                </div>
              )}
            </div>
            {modalMode === "detail" && canEdit && (
              <div style={{ position: "relative" }}>
                <button
                  type="button"
                  style={{
                    background: "transparent",
                    border: "none",
                    fontSize: "24px",
                    cursor: "pointer",
                    padding: "4px 8px",
                    color: "#64748b",
                    lineHeight: "1",
                    letterSpacing: "-2px",
                  }}
                  onClick={() => setModalMenuOpen(!modalMenuOpen)}
                >
                  ⋮
                </button>
                {modalMenuOpen && (
                  <div
                    style={{
                      position: "absolute",
                      right: 0,
                      top: "100%",
                      background: "#ffffff",
                      border: "1px solid #e2e8f0",
                      borderRadius: "8px",
                      boxShadow: "0 4px 12px rgba(0, 0, 0, 0.1)",
                      zIndex: 1000,
                      minWidth: "120px",
                      padding: "4px",
                    }}
                  >
                    <button
                      type="button"
                      style={{
                        width: "100%",
                        textAlign: "left",
                        padding: "8px 12px",
                        border: "none",
                        background: "transparent",
                        cursor: "pointer",
                        borderRadius: "4px",
                        fontSize: "14px",
                      }}
                      onClick={() => {
                        setModalMenuOpen(false);
                        openEditTask(selectedTaskDetail);
                      }}
                    >
                      Editar
                    </button>
                    <button
                      type="button"
                      style={{
                        width: "100%",
                        textAlign: "left",
                        padding: "8px 12px",
                        border: "none",
                        background: "transparent",
                        cursor: "pointer",
                        borderRadius: "4px",
                        fontSize: "14px",
                        color: "#dc2626",
                      }}
                      onClick={() => {
                        setModalMenuOpen(false);
                        handleDeleteTask(selectedTaskDetail);
                      }}
                    >
                      Eliminar
                    </button>
                  </div>
                )}
              </div>
            )}
          </Modal.Header>
          <Modal.Body>
            {modalMode === "detail" ? (
              <div>
                <p>{selectedTaskDetail.descripcion || "Sin descripcion"}</p>
                <div className="task-modal-grid">
                  <div>
                    <strong>Historia:</strong>
                    <span style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                      {selectedTaskDetail.historia_nombre || "Sin historia"}
                      {selectedTaskDetail.id_historia && (
                        <button
                          type="button"
                          onClick={() => navigate(`/historias/${selectedTaskDetail.id_historia}?id_proyecto=${selectedProyecto}`)}
                          style={{
                            background: "transparent",
                            border: "none",
                            padding: "0",
                            cursor: "pointer",
                            display: "flex",
                            alignItems: "center",
                            color: "#39a900",
                            transition: "opacity 0.2s ease",
                          }}
                          onMouseEnter={(e) => e.currentTarget.style.opacity = "0.7"}
                          onMouseLeave={(e) => e.currentTarget.style.opacity = "1"}
                          title="Ver historia"
                        >
                          <svg
                            width="16"
                            height="16"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          >
                            <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"></path>
                            <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"></path>
                          </svg>
                        </button>
                      )}
                    </span>
                  </div>
                  <div>
                    <strong>Estado:</strong>
                    <span>{formatEstadoTareaLabel(selectedTaskDetail.estado) || "sin estado"}</span>
                  </div>
                  <div>
                    <strong>Prioridad:</strong>
                    <span>{formatPrioridadLabel(selectedTaskDetail.prioridad) || "media"}</span>
                  </div>
                  <div>
                    <strong>Responsable:</strong>
                    <span>
                      {selectedTaskDetail.responsable_nombre || "Sin responsable"}
                    </span>
                  </div>
                  <div>
                    <strong>Asignado a:</strong>
                    <span>
                      {Array.isArray(selectedTaskDetail.asignados)
                        ? selectedTaskDetail.asignados
                            .filter((user) => !user.es_responsable)
                            .map((user) => user.nombre)
                            .join(", ") || "Sin asignados"
                        : selectedTaskDetail.asignados || "Sin asignados"}
                    </span>
                  </div>
                  <div>
                    <strong>Estimación:</strong>
                    <span>
                      {selectedTaskDetail.estimacion_dias
                        ? `${selectedTaskDetail.estimacion_dias} día${selectedTaskDetail.estimacion_dias === 1 ? "" : "s"}`
                        : "Sin estimación"}
                    </span>
                  </div>
                  <div>
                    <strong>Fecha de entrega estimada:</strong>
                    <span>
                      {selectedTaskDetail.fecha_fin_est
                        ? new Date(selectedTaskDetail.fecha_fin_est).toLocaleDateString()
                        : "Sin fecha"}
                    </span>
                  </div>
                </div>
              </div>
            ) : (
              <Form>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                  <Form.Group className="mb-3">
                    <Form.Label>Nombre de la tarea</Form.Label>
                    <Form.Control
                      type="text"
                      value={editDraft.nombre}
                      onChange={(e) => setEditDraft((prev) => ({ ...prev, nombre: e.target.value }))}
                      disabled={editLoading}
                    />
                  </Form.Group>
                  <Form.Group className="mb-3">
                    <Form.Label>Prioridad</Form.Label>
                    <Form.Select
                      value={editDraft.prioridad}
                      onChange={(e) => setEditDraft((prev) => ({ ...prev, prioridad: e.target.value }))}
                      disabled={editLoading}
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
                      value={editDraft.descripcion}
                      onChange={(e) => setEditDraft((prev) => ({ ...prev, descripcion: e.target.value }))}
                      disabled={editLoading}
                    />
                  </Form.Group>
                  <Form.Group className="mb-3">
                    <Form.Label>Estado</Form.Label>
                    <Form.Select
                      value={editDraft.estado}
                      onChange={(e) => setEditDraft((prev) => ({ ...prev, estado: e.target.value }))}
                      disabled={editLoading}
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
                      value={editDraft.estimacion_dias || ""}
                      onChange={(e) => setEditDraft((prev) => ({ ...prev, estimacion_dias: e.target.value }))}
                      disabled={editLoading}
                    />
                  </Form.Group>
                  <Form.Group className="mb-3">
                    <Form.Label>Fecha de entrega estimada</Form.Label>
                    <Form.Control
                      type="date"
                      value={editDraft.fecha_fin_est || ""}
                      onChange={(e) => setEditDraft((prev) => ({ ...prev, fecha_fin_est: e.target.value }))}
                      disabled={editLoading}
                    />
                  </Form.Group>
                  <Form.Group className="mb-3">
                    <Form.Label>Responsable</Form.Label>
                    <Form.Select
                      value={editDraft.id_usuario_responsable || ""}
                      onChange={(e) => setEditDraft((prev) => ({ ...prev, id_usuario_responsable: e.target.value }))}
                      disabled={editLoading}
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
                    <Form.Label>Asignar a (adicional)</Form.Label>
                    <Form.Select
                      value={editDraft.asignado || ""}
                      onChange={(e) => setEditDraft((prev) => ({ ...prev, asignado: e.target.value }))}
                      disabled={editLoading}
                    >
                      <option value="">Sin asignar adicional</option>
                      {miembrosProyecto.map((miembro) => (
                        <option key={miembro.id_usuario} value={String(miembro.id_usuario)}>
                          {miembro.nombre}
                        </option>
                      ))}
                    </Form.Select>
                  </Form.Group>
                </div>
              </Form>
            )}
          </Modal.Body>
          <Modal.Footer>
            {modalMode === "detail" ? (
              <button type="button" className="btn-cerrar-modal" onClick={closeModal}>
                Cerrar
              </button>
            ) : (
              <>
                <button
                  type="button"
                  className="btn-cerrar-modal"
                  onClick={() => setModalMode("detail")}
                  disabled={editLoading}
                >
                  Cancelar
                </button>
                <Button
                  className="btn-main"
                  onClick={handleSaveEdit}
                  disabled={editLoading || !editDraft.nombre.trim()}
                >
                  {editLoading ? "Guardando..." : "Guardar"}
                </Button>
              </>
            )}
          </Modal.Footer>
        </Modal>
      )}
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
              confirmModal.confirmLabel === "Eliminar" ? "btn-danger" : "btn-main"
            }
            onClick={confirmModal.onConfirm}
            disabled={processingConfirm || !confirmModal.onConfirm}
          >
            {processingConfirm ? "Procesando..." : confirmModal.confirmLabel}
          </button>
        </Modal.Footer>
      </Modal>
    </section >
  );
}
