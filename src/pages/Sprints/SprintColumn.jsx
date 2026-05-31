import React from "react";
import SkeletonLoader from "../../components/SkeletonLoader";
import SprintTaskCard from "./SprintTaskCard";

export default function SprintColumn({
  column,
  groupedTasks,
  activeDropColumn,
  setActiveDropColumn,
  updatingTaskId,
  handleDropTask,
  loadingTareas,
  openTaskDetail,
  handleDragStart,
  setDragTask,
  openMenuTaskId,
  setOpenMenuTaskId,
  openEditTask,
  handleDeleteTask,
  formatEta
}) {
  return (
    <article className="board-column">
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
          <>
            <div className="task-card task-card-placeholder border-0 p-3 shadow-sm">
              <SkeletonLoader type="text" className="w-75 mb-2" />
              <SkeletonLoader type="text" className="w-50 mb-3" />
              <SkeletonLoader type="card-board" />
            </div>
            <div className="task-card task-card-placeholder border-0 p-3 shadow-sm">
              <SkeletonLoader type="text" className="w-100 mb-2" />
              <SkeletonLoader type="card-board" />
            </div>
          </>
        ) : (
          (groupedTasks[column.key] || []).map((task) => (
            <SprintTaskCard
              key={task.id_tarea}
              task={task}
              updatingTaskId={updatingTaskId}
              openTaskDetail={openTaskDetail}
              handleDragStart={handleDragStart}
              setDragTask={setDragTask}
              setActiveDropColumn={setActiveDropColumn}
              openMenuTaskId={openMenuTaskId}
              setOpenMenuTaskId={setOpenMenuTaskId}
              openEditTask={openEditTask}
              handleDeleteTask={handleDeleteTask}
              formatEta={formatEta}
            />
          ))
        )}

        {!loadingTareas &&
          (groupedTasks[column.key] || []).length === 0 && (
            <div className="task-card task-card-empty">Sin tareas</div>
          )}
      </div>
    </article>
  );
}
