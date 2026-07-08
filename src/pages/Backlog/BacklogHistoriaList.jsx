import React from 'react';

export default function BacklogHistoriaList({
  loadingHistorias,
  historiasFiltradas,
  handleOpenDetail,
  historiaDisplayIds,
  criteriaCounts,
  taskCounts
}) {
  return (
    <section className="backlog-panel">
      <div className="backlog-table-head">
        <span>Historias de usuario</span>
        <span>Prioridad</span>
        <span>Story points</span>
        <span>Tareas</span>
      </div>

      <div className="backlog-table-body">
        {loadingHistorias ? (
          <div className="backlog-empty-state">Cargando historias...</div>
        ) : historiasFiltradas.length === 0 ? (
          <div className="backlog-empty-state">
            No hay historias para mostrar.
          </div>
        ) : (
          historiasFiltradas.map((historia) => (
            <article key={historia.id} className="backlog-row">
              <button
                type="button"
                className="backlog-cell backlog-cell-title"
                onClick={() => handleOpenDetail(historia)}
              >
                <span className="backlog-title-text">{historia.nombre}</span>
                <span className="backlog-title-meta">
                  ID {historiaDisplayIds[String(historia.id)] ?? historia.id}{" "}
                  · {criteriaCounts[historia.id] ?? 0} criterios
                </span>
              </button>
              <span className="backlog-pill backlog-pill-priority">
                {historia.prioridad}
              </span>
              <span className="backlog-pill backlog-pill-points">
                {historia.storyPoints}
              </span>
              <span className="backlog-pill backlog-pill-points">
                {taskCounts[historia.id] ?? 0}
              </span>
            </article>
          ))
        )}
      </div>
    </section>
  );
}
