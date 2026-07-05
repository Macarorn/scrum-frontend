import "./KanbanLoader.css";

/**
 * Loader para vistas de tablero / proyecto especifico.
 */
export default function KanbanLoader({ message = "Armando tu tablero" }) {
  return (
    <div className="kanban-loader" role="status" aria-live="polite">
      <div className="kanban-loader__card">
        <div className="kanban-loader__line kanban-loader__line--1" />
        <div className="kanban-loader__line kanban-loader__line--2" />
        <div className="kanban-loader__line kanban-loader__line--3" />
        <div className="kanban-loader__dot" />
      </div>
      <p className="kanban-loader__title">ScrumTrack</p>
      <p className="kanban-loader__message">{message}</p>
    </div>
  );
}
