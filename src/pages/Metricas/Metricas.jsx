import { FiRefreshCw, FiTrendingUp } from "react-icons/fi";
import "./Metricas.css";

import { KPICards } from "../../components/KPICards";
import { ProjectProgressPanel } from "../../components/ProjectProgressPanel";
// import { TaskStatusPanel } from "../../components/TaskStatusPanel";
// import { TeamMemberPanel } from "../../components/TeamMemberPanel";
// import { BacklogPanel } from "../../components/BacklogPanel";
// import { EpicStatusPanel } from "../../components/EpicStatusPanel";

export default function Metricas() {
  return (
    <main className="metricas-page">
      <section className="metricas-header">
        <div className="metricas-header-info">
          <div className="metricas-header-title-row">
            <div className="metricas-header-icon">
              <FiTrendingUp size={22} />
            </div>
            <h1 className="metricas-header-title">Dashboard del Proyecto</h1>
          </div>
          <p className="metricas-header-description">
            Resumen general del estado del proyecto y progreso del equipo Scrum
          </p>
        </div>
        <div className="metricas-header-actions">
          <select className="metricas-select" aria-label="Selector Sprint">
            <option>Sprint 11</option>
            <option>Sprint 10</option>
            <option>Sprint 9</option>
            <option>Sprint 8</option>
          </select>
          <button type="button" className="metricas-action-btn primary">
            <FiRefreshCw size={18} /> Actualizar
          </button>
        </div>
      </section>

      {/* KPIs — fila superior */}
      <section className="metricas-kpi-grid">
        <KPICards />
      </section>

      {/* Segunda fila: ProjectProgressPanel | TaskStatusPanel | TeamMemberPanel */}
      <section className="metricas-section-grid">
        <div className="metricas-panel">
          <ProjectProgressPanel />
        </div>

        {/* <div className="metricas-panel">
          <TaskStatusPanel />
        </div>

        <div className="metricas-panel metricas-member-panel">
          <TeamMemberPanel />
        </div> */}
      </section>

      {/* Tercera fila: BacklogPanel | EpicStatusPanel */}
      <section className="metricas-bottom-grid">
        {/* <div className="metricas-panel metricas-backlog-panel">
          <BacklogPanel />
        </div>

        <div className="metricas-panel metricas-epicas-panel">
          <EpicStatusPanel />
        </div> */}
      </section>
    </main>
  );
}
