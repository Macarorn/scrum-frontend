import React from "react";

export default function SprintTaskCard({
  task,
  updatingTaskId,
  openTaskDetail,
  handleDragStart,
  setDragTask,
  setActiveDropColumn,
  openMenuTaskId,
  setOpenMenuTaskId,
  openEditTask,
  handleDeleteTask,
  formatEta
}) {
  return (
    <div
      className={`task-card ${updatingTaskId === task.id_tarea ? "task-card-updating" : ""}`}
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
              <button
                type="button"
                onClick={() => openTaskDetail(task)}
              >
                Ver detalle
              </button>
              <button
                type="button"
                onClick={() => openEditTask(task)}
              >
                Editar
              </button>
              <button
                type="button"
                className="task-menu-danger"
                onClick={() => handleDeleteTask(task)}
              >
                Eliminar
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
