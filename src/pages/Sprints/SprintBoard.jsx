import { useEffect, useMemo, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import "../../styles/SprintBoard.css";
import { clearSessionTokens } from "../../services/auth.service";
import { listarProyectos } from "../../services/proyectos.service";
import {
  cambiarEstadoTarea,
  editarTarea,
  eliminarTarea,
  listarSprintsPorProyecto,
  obtenerDetalleTarea,
  obtenerTareasPorSprint,
} from "../../services/sprint.service";

const BOARD_COLUMNS = [
  { key: "por_hacer", title: "Por Hacer" },
  { key: "en_progreso", title: "En Progreso" },
  { key: "bloqueado", title: "En Revision" },
  { key: "terminado", title: "Terminado" },
];

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
  const [searchParams, setSearchParams] = useSearchParams();

  const [proyectos, setProyectos] = useState([]);
  const [sprints, setSprints] = useState([]);
  const [tareas, setTareas] = useState([]);

  const [selectedProyecto, setSelectedProyecto] = useState(searchParams.get("id_proyecto") || "");
  const [selectedSprint, setSelectedSprint] = useState(searchParams.get("id_sprint") || "");
  const [searchTerm, setSearchTerm] = useState("");

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
    estimacion_dias: "",
    fecha_fin_est: "",
  });
  const [modalMode, setModalMode] = useState("detail");
  const [error, setError] = useState("");

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
          setSelectedSprint("");
          setTareas([]);
          return;
        }

        const proyectoExiste = lista.some((proyecto) => String(proyecto.id_proyecto) === String(selectedProyecto));
        const idProyectoInicial = proyectoExiste ? selectedProyecto : String(lista[0].id_proyecto);
        setSelectedProyecto(idProyectoInicial);
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

    cargarProyectos();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!selectedProyecto) {
      setSprints([]);
      setSelectedSprint("");
      setTareas([]);
      syncQuery("", "");
      return;
    }

    const cargarSprints = async () => {
      setLoadingSprints(true);
      setError("");

      try {
        const listaSprints = (await listarSprintsPorProyecto(selectedProyecto)) || [];
        setSprints(listaSprints);

        if (listaSprints.length === 0) {
          setSelectedSprint("");
          setTareas([]);
          syncQuery(selectedProyecto, "");
          return;
        }

        const sprintExiste = listaSprints.some((sprint) => String(sprint.id_sprint) === String(selectedSprint));
        const sprintInicial = sprintExiste
          ? listaSprints.find((sprint) => String(sprint.id_sprint) === String(selectedSprint))
          : pickPreferredSprint(listaSprints);

        const nextSprint = sprintInicial ? String(sprintInicial.id_sprint) : "";
        setSelectedSprint(nextSprint);
        syncQuery(selectedProyecto, nextSprint);
      } catch (err) {
        if (err.code === "UNAUTHENTICATED") {
          handleAuthError();
          return;
        }

        setError(err.message || "No se pudieron cargar los sprints");
      } finally {
        setLoadingSprints(false);
      }
    };

    cargarSprints();
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
        const listaTareas = (await obtenerTareasPorSprint(selectedSprint)) || [];
        setTareas(listaTareas);
      } catch (err) {
        if (err.code === "UNAUTHENTICATED") {
          handleAuthError();
          return;
        }

        setError(err.message || "No se pudieron cargar las tareas");
      } finally {
        setLoadingTareas(false);
      }
    };

    cargarTareas();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedSprint]);

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

  const sprintActual = sprints.find((sprint) => String(sprint.id_sprint) === String(selectedSprint));

  const closeModal = () => {
    setSelectedTaskDetail(null);
    setModalMode("detail");
    setEditLoading(false);
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

      setError(err.message || "No se pudo abrir el detalle de la tarea");
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
        estimacion_dias: target.estimacion_dias ?? "",
        fecha_fin_est: target.fecha_fin_est ? String(target.fecha_fin_est).slice(0, 10) : "",
      });
      setModalMode("edit");
    } catch (err) {
      if (err.code === "UNAUTHENTICATED") {
        handleAuthError();
        return;
      }

      setError(err.message || "No se pudo abrir la edicion de la tarea");
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
        estimacion_dias: editDraft.estimacion_dias === "" ? null : Number(editDraft.estimacion_dias),
        fecha_fin_est: editDraft.fecha_fin_est || null,
      });

      setTareas((prev) =>
        prev.map((task) =>
          task.id_tarea === updated.id_tarea ? { ...task, ...updated } : task,
        ),
      );
      setSelectedTaskDetail(updated);
      setModalMode("detail");
    } catch (err) {
      if (err.code === "UNAUTHENTICATED") {
        handleAuthError();
        return;
      }

      setError(err.message || "No se pudo editar la tarea");
    } finally {
      setEditLoading(false);
    }
  };

  const handleDeleteTask = async (task) => {
    setOpenMenuTaskId(null);
    const confirmar = window.confirm(`Quieres borrar la tarea \"${task.nombre}\"?`);
    if (!confirmar) return;

    setUpdatingTaskId(task.id_tarea);
    setError("");
    try {
      await eliminarTarea(task.id_tarea);
      setTareas((prev) => prev.filter((item) => item.id_tarea !== task.id_tarea));
      if (selectedTaskDetail?.id_tarea === task.id_tarea) {
        closeModal();
      }
    } catch (err) {
      if (err.code === "UNAUTHENTICATED") {
        handleAuthError();
        return;
      }

      setError(err.message || "No se pudo borrar la tarea");
    } finally {
      setUpdatingTaskId(null);
    }
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
        task.id_tarea === dragTask.id_tarea ? { ...task, estado: nextEstado } : task,
      ),
    );

    try {
      const tareaActualizada = await cambiarEstadoTarea(dragTask.id_tarea, nextEstado);

      if (tareaActualizada && tareaActualizada.id_tarea) {
        setTareas((prev) =>
          prev.map((task) =>
            task.id_tarea === tareaActualizada.id_tarea
              ? { ...task, ...tareaActualizada }
              : task,
          ),
        );
      }
    } catch (err) {
      if (err.code === "UNAUTHENTICATED") {
        handleAuthError();
        return;
      }

      setTareas(previousTasks);
      setError(err.message || "No se pudo mover la tarea");
    } finally {
      setUpdatingTaskId(null);
      setDragTask(null);
    }
  };

  return (
    <section className="sprint-page">
      <div className="sprint-topbar">
        <div>
          <p className="sprint-tag">Sprints</p>
          <h1 className="sprint-title">
            {sprintActual ? sprintActual.nombre : "Sprint"}
          </h1>
        </div>

        <div className="sprint-actions">
          <div className="selector-box">
            <label htmlFor="proyectoSelect">Proyecto</label>
            <select
              id="proyectoSelect"
              value={selectedProyecto}
              onChange={(event) => {
                const nextProject = event.target.value;
                setSelectedProyecto(nextProject);
                setSelectedSprint("");
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

          <div className="selector-box">
            <label htmlFor="sprintSelect">Sprint</label>
            <select
              id="sprintSelect"
              value={selectedSprint}
              onChange={(event) => {
                const nextSprint = event.target.value;
                setSelectedSprint(nextSprint);
                syncQuery(selectedProyecto, nextSprint);
              }}
              disabled={loadingSprints || sprints.length === 0}
            >
              {sprints.length === 0 && <option value="">Sin sprints</option>}
              {sprints.map((sprint) => (
                <option key={sprint.id_sprint} value={sprint.id_sprint}>
                  {sprint.nombre}
                </option>
              ))}
            </select>
          </div>

          <div className="search-box">
            <span aria-hidden="true">Q</span>
            <input
              type="text"
              placeholder="Buscar"
              value={searchTerm}
              onChange={(event) => setSearchTerm(event.target.value)}
            />
          </div>
        </div>
      </div>

      {error && <p className="board-feedback board-error">{error}</p>}

      {!error && !loading && !loadingSprints && selectedProyecto && sprints.length === 0 && (
        <p className="board-feedback">Este proyecto no tiene sprints creados.</p>
      )}

      {!error && !loading && proyectos.length === 0 && (
        <p className="board-feedback">No hay proyectos disponibles para mostrar el tablero.</p>
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
                <div className="task-card task-card-placeholder">Cargando tareas...</div>
              ) : (
                (groupedTasks[column.key] || []).map((task) => (
                  <div
                    className={`task-card ${updatingTaskId === task.id_tarea ? "task-card-updating" : ""}`}
                    key={task.id_tarea}
                    draggable={updatingTaskId !== task.id_tarea}
                    onDragStart={() => handleDragStart(task)}
                    onDragEnd={() => {
                      setActiveDropColumn("");
                      setDragTask(null);
                    }}
                  >
                    <p>{task.nombre}</p>
                    <div className="task-story">{task.historia_nombre || "Sin historia"}</div>
                    <div className="task-foot">
                      <small>{formatEta(task)}</small>
                      <div className="task-actions-wrap">
                        <button
                          type="button"
                          className="task-menu-trigger"
                          onClick={(event) => {
                            event.stopPropagation();
                            setOpenMenuTaskId((prev) => (prev === task.id_tarea ? null : task.id_tarea));
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
                            <button type="button" onClick={() => openTaskDetail(task)}>Ver detalle</button>
                            <button type="button" onClick={() => openEditTask(task)}>Editar</button>
                            <button type="button" className="task-menu-danger" onClick={() => handleDeleteTask(task)}>
                              Borrar
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))
              )}

              {!loadingTareas && (groupedTasks[column.key] || []).length === 0 && (
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
        <div className="task-modal-backdrop" onClick={closeModal}>
          <div className="task-modal" onClick={(event) => event.stopPropagation()}>
            <div className="task-modal-header">
              <h3>{selectedTaskDetail.nombre}</h3>
              <button type="button" onClick={closeModal}>Cerrar</button>
            </div>

            {modalMode === "detail" ? (
              <div className="task-modal-content">
                <p>{selectedTaskDetail.descripcion || "Sin descripcion"}</p>
                <div className="task-modal-grid">
                  <div>
                    <strong>Historia:</strong>
                    <span>{selectedTaskDetail.historia_nombre || "Sin historia"}</span>
                  </div>
                  <div>
                    <strong>Estado:</strong>
                    <span>{selectedTaskDetail.estado || "sin estado"}</span>
                  </div>
                  <div>
                    <strong>Prioridad:</strong>
                    <span>{selectedTaskDetail.prioridad || "media"}</span>
                  </div>
                  <div>
                    <strong>Asignado a:</strong>
                    <span>
                      {Array.isArray(selectedTaskDetail.asignados)
                        ? selectedTaskDetail.asignados.map((user) => user.nombre).join(", ") || "Sin asignados"
                        : selectedTaskDetail.asignados || "Sin asignados"}
                    </span>
                  </div>
                </div>
                <div className="task-modal-buttons">
                  <button type="button" onClick={() => openEditTask(selectedTaskDetail)}>Editar</button>
                  <button
                    type="button"
                    className="task-menu-danger"
                    onClick={() => handleDeleteTask(selectedTaskDetail)}
                  >
                    Borrar
                  </button>
                </div>
              </div>
            ) : (
              <div className="task-modal-content">
                <div className="task-modal-form">
                  <label htmlFor="task-name">Nombre</label>
                  <input
                    id="task-name"
                    value={editDraft.nombre}
                    onChange={(event) => setEditDraft((prev) => ({ ...prev, nombre: event.target.value }))}
                  />

                  <label htmlFor="task-desc">Descripcion</label>
                  <textarea
                    id="task-desc"
                    value={editDraft.descripcion}
                    onChange={(event) => setEditDraft((prev) => ({ ...prev, descripcion: event.target.value }))}
                  />

                  <label htmlFor="task-priority">Prioridad</label>
                  <select
                    id="task-priority"
                    value={editDraft.prioridad}
                    onChange={(event) => setEditDraft((prev) => ({ ...prev, prioridad: event.target.value }))}
                  >
                    <option value="baja">Baja</option>
                    <option value="media">Media</option>
                    <option value="alta">Alta</option>
                    <option value="critica">Critica</option>
                  </select>

                  <label htmlFor="task-estimation">Estimacion (dias)</label>
                  <input
                    id="task-estimation"
                    type="number"
                    min="0"
                    step="0.5"
                    value={editDraft.estimacion_dias}
                    onChange={(event) =>
                      setEditDraft((prev) => ({ ...prev, estimacion_dias: event.target.value }))
                    }
                  />

                  <label htmlFor="task-date">Fecha entrega</label>
                  <input
                    id="task-date"
                    type="date"
                    value={editDraft.fecha_fin_est}
                    onChange={(event) => setEditDraft((prev) => ({ ...prev, fecha_fin_est: event.target.value }))}
                  />
                </div>

                <div className="task-modal-buttons">
                  <button type="button" onClick={() => setModalMode("detail")} disabled={editLoading}>
                    Cancelar
                  </button>
                  <button
                    type="button"
                    onClick={handleSaveEdit}
                    disabled={editLoading || !editDraft.nombre.trim()}
                  >
                    {editLoading ? "Guardando..." : "Guardar"}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </section>
  );
}