import { useCallback, useEffect, useMemo, useState, useRef } from "react";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import { Gantt, ViewMode } from "gantt-task-react";
import "gantt-task-react/dist/index.css";
import API_URL from "../../services/api";
import { getAccessToken, clearSessionTokens } from "../../services/auth.service";
import "./ProjectMetrics.css";

/* ── Colores por estado ────────────────────────────────────── */
const ESTADO_COLORS = {
  planeado: "#94a3b8",
  en_curso: "#39a900",
  completado: "#10b981",
  cancelado: "#ef4444",
};

const ESTADO_LABELS = {
  planeado: "Planeado",
  en_curso: "En curso",
  completado: "Completado",
  cancelado: "Cancelado",
};

/* ══════════════════════════════════════════════════════════════
   Componente Principal — Métricas del Proyecto (solo Gantt)
   ══════════════════════════════════════════════════════════════ */
const ProjectMetrics = () => {
  const { id } = useParams();
  const [searchParams] = useSearchParams();
  const projectId = id || searchParams.get("id_proyecto");

  const navigate = useNavigate();
  const ganttWrapperRef = useRef(null);

  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [viewMode, setViewMode] = useState(ViewMode.Week);

  const redirectToLogin = useCallback(() => {
    clearSessionTokens();
    navigate("/login", { replace: true });
  }, [navigate]);

  /* ── Fetch datos ──────────────────────────────────────────── */
  useEffect(() => {
    if (!projectId) {
      setError("No se proporcionó un ID de proyecto.");
      setLoading(false);
      return;
    }

    const fetchData = async () => {
      try {
        setLoading(true);
        const token = getAccessToken();
        if (!token) { redirectToLogin(); return; }

        const res = await fetch(`${API_URL}/proyectos/${projectId}/gantt`, {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        });

        if (res.status === 401) { redirectToLogin(); return; }
        if (!res.ok) throw new Error("Error al cargar datos de métricas");

        const json = await res.json();
        setData(json.data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [projectId, redirectToLogin]);

  /* ── Transformar a formato gantt-task-react ────────────────── */
  const ganttTasks = useMemo(() => {
    if (!data?.sprints?.length) return [];

    const tasks = [];

    for (const sprint of data.sprints) {
      const start = new Date(sprint.fecha_inicio);
      const end = new Date(sprint.fecha_fin);

      if (isNaN(start.getTime()) || isNaN(end.getTime())) continue;
      if (end <= start) end.setDate(start.getDate() + 1);

      const barColor = ESTADO_COLORS[sprint.estado] || ESTADO_COLORS.planeado;

      tasks.push({
        start,
        end,
        name: sprint.nombre,
        id: sprint.id,
        type: "project",
        progress: sprint.progreso || 0,
        isDisabled: true,
        styles: {
          backgroundColor: barColor,
          backgroundSelectedColor: barColor,
          progressColor: "#10b981",
          progressSelectedColor: "#10b981",
        },
      });

      const epicasDelSprint = data.epicas?.filter(
        (e) => e.sprint_parent === sprint.id
      ) || [];

      for (const epica of epicasDelSprint) {
        tasks.push({
          start: new Date(start),
          end: new Date(end),
          name: `  ↳ ${epica.nombre}`,
          id: `${epica.id}-${sprint.id}`,
          type: "task",
          progress: 0,
          project: sprint.id,
          isDisabled: true,
          styles: {
            backgroundColor: "#f59e0b",
            backgroundSelectedColor: "#fbbf24",
            progressColor: "#d97706",
            progressSelectedColor: "#d97706",
          },
        });
      }
    }

    return tasks;
  }, [data]);

  /* ── KPIs ──────────────────────────────────────────────────── */
  const kpis = useMemo(() => {
    if (!data) return { sprints: 0, epicas: 0, completados: 0, progreso: 0 };
    const sprints = data.sprints?.length || 0;
    const epicas = data.epicas?.length || 0;
    const completados = data.sprints?.filter((s) => s.estado === "completado").length || 0;
    const totalTareas = data.sprints?.reduce((sum, s) => sum + (Number(s.tareas?.total) || 0), 0) || 0;
    const tareasCompletadas = data.sprints?.reduce((sum, s) => sum + (Number(s.tareas?.completadas) || 0), 0) || 0;
    const progreso = totalTareas > 0 ? Math.round((tareasCompletadas / totalTareas) * 100) : 0;
    return { sprints, epicas, completados, progreso };
  }, [data]);

  /* ── Formatear fecha ───────────────────────────────────────── */
  const formatDate = (dateStr) => {
    if (!dateStr) return "—";
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return "—";
    return d.toLocaleDateString("es-MX", { day: "2-digit", month: "short", year: "numeric" });
  };

  /* ── Render ────────────────────────────────────────────────── */
  if (loading) {
    return (
      <div className="metrics-page">
        <div className="metrics-loading">
          <div className="spinner-border" role="status" />
          <p>Cargando métricas del proyecto…</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="metrics-page">
        <div className="metrics-error">
          <i className="bi bi-exclamation-triangle-fill" />
          <h5>Error al cargar métricas</h5>
          <p className="text-muted">{error}</p>
          <button
            className="btn btn-outline-primary btn-sm mt-2"
            onClick={() => window.location.reload()}
          >
            Reintentar
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="metrics-page">
      {/* ── Encabezado ─────────────────────────────────────── */}
      <div className="metrics-topbar">
        <div>
          <p className="sprint-tag">Métricas del Proyecto</p>
          <h1 className="sprint-title">
            {data?.proyecto?.nombre || "Proyecto"}
          </h1>
          <p className="sprint-project-current">
            Estado: {ESTADO_LABELS[data?.proyecto?.estado] || data?.proyecto?.estado || "—"}
            {data?.proyecto?.fecha_inicio && (
              <> &nbsp;·&nbsp; Inicio: {formatDate(data.proyecto.fecha_inicio)}</>
            )}
            {data?.proyecto?.fecha_fin_est && (
              <> &nbsp;·&nbsp; Fin estimado: {formatDate(data.proyecto.fecha_fin_est)}</>
            )}
          </p>
        </div>
        <button
          className="btn btn-outline-secondary btn-sm"
          onClick={() => navigate(`/detalles_de_proyecto/${projectId}`)}
        >
          <i className="bi bi-arrow-left me-1" /> Volver al proyecto
        </button>
      </div>

      {/* ── Tarjetas KPI ───────────────────────────────────── */}
      <div className="metrics-summary-row">
        <div className="metrics-summary-card">
          <div className="metrics-summary-icon sprints">
            <i className="bi bi-lightning-charge-fill" />
          </div>
          <div className="metrics-summary-info">
            <h4>{kpis.sprints}</h4>
            <p>Sprints totales</p>
          </div>
        </div>
        <div className="metrics-summary-card">
          <div className="metrics-summary-icon epicas">
            <i className="bi bi-bookmark-star-fill" />
          </div>
          <div className="metrics-summary-info">
            <h4>{kpis.epicas}</h4>
            <p>Épicas del proyecto</p>
          </div>
        </div>
        <div className="metrics-summary-card">
          <div className="metrics-summary-icon completadas">
            <i className="bi bi-check-circle-fill" />
          </div>
          <div className="metrics-summary-info">
            <h4>{kpis.completados}</h4>
            <p>Sprints completados</p>
          </div>
        </div>
        <div className="metrics-summary-card">
          <div className="metrics-summary-icon progreso">
            <i className="bi bi-graph-up-arrow" />
          </div>
          <div className="metrics-summary-info">
            <h4>{kpis.progreso}%</h4>
            <p>Progreso general</p>
          </div>
        </div>
      </div>

      {/* ── Diagrama de Gantt ───────────────────────────────── */}
      <div className="metrics-section">
        <div className="metrics-section-header">
          <div>
            <h3>
              <i className="bi bi-bar-chart-steps" />
              Cronograma de Sprints y Épicas
            </h3>
            <p className="section-description">
              Visualiza la línea de tiempo de los sprints y sus épicas asignadas
            </p>
          </div>
          <div className="gantt-view-toggle">
            {[
              { mode: ViewMode.Day, label: "Día" },
              { mode: ViewMode.Week, label: "Semana" },
              { mode: ViewMode.Month, label: "Mes" },
            ].map(({ mode, label }) => (
              <button
                key={mode}
                className={viewMode === mode ? "active" : ""}
                onClick={() => setViewMode(mode)}
              >
                {label}
              </button>
            ))}
          </div>
        </div>
        <div className="gantt-scroll-area">
          {ganttTasks.length > 0 ? (
            <div className="gantt-container">
              <Gantt
                tasks={ganttTasks}
                viewMode={viewMode}
                listCellWidth=""
                columnWidth={
                  viewMode === ViewMode.Month ? 220
                  : viewMode === ViewMode.Week ? 140
                  : 60
                }
                barCornerRadius={5}
                barFill={75}
                fontSize="12"
                rowHeight={44}
                headerHeight={55}
                todayColor="rgba(57, 169, 0, 0.06)"
              />
            </div>
          ) : (
            <div className="gantt-empty">
              <i className="bi bi-calendar-x" />
              <p>No hay sprints con fechas para mostrar</p>
              <small>Crea sprints con fechas de inicio y fin para ver el cronograma</small>
            </div>
          )}
        </div>
        {ganttTasks.length > 0 && (
          <div className="gantt-legend">
            <div className="gantt-legend-item">
              <span className="gantt-legend-color" style={{ background: ESTADO_COLORS.planeado }} />
              Planeado
            </div>
            <div className="gantt-legend-item">
              <span className="gantt-legend-color" style={{ background: ESTADO_COLORS.en_curso }} />
              En curso
            </div>
            <div className="gantt-legend-item">
              <span className="gantt-legend-color" style={{ background: ESTADO_COLORS.completado }} />
              Completado
            </div>
            <div className="gantt-legend-item">
              <span className="gantt-legend-color" style={{ background: "#f59e0b" }} />
              Épica
            </div>
          </div>
        )}
      </div>

      {/* ── Tabla detalle de Sprints ────────────────────────── */}
      {data?.sprints?.length > 0 && (
        <div className="metrics-section">
          <div className="metrics-section-header">
            <div>
              <h3>
                <i className="bi bi-table" />
                Detalle de Sprints
              </h3>
              <p className="section-description">
                Información completa de cada sprint del proyecto
              </p>
            </div>
          </div>
          <div className="metrics-section-body" style={{ padding: 0 }}>
            <table className="sprint-detail-table">
              <thead>
                <tr>
                  <th>Sprint</th>
                  <th>Estado</th>
                  <th>Inicio</th>
                  <th>Fin</th>
                  <th>Tareas</th>
                  <th>Progreso</th>
                  <th>Meta</th>
                </tr>
              </thead>
              <tbody>
                {data.sprints.map((sprint) => {
                  const total = Number(sprint.tareas?.total) || 0;
                  const completadas = Number(sprint.tareas?.completadas) || 0;
                  const progreso = total > 0 ? Math.round((completadas / total) * 100) : 0;
                  return (
                    <tr key={sprint.id_sprint}>
                      <td style={{ fontWeight: 600 }}>{sprint.nombre}</td>
                      <td>
                        <span className={`sprint-status-badge ${sprint.estado}`}>
                          {ESTADO_LABELS[sprint.estado] || sprint.estado}
                        </span>
                      </td>
                      <td>{formatDate(sprint.fecha_inicio)}</td>
                      <td>{formatDate(sprint.fecha_fin)}</td>
                      <td>
                        <strong>{completadas}</strong>/{total}
                        <span style={{ color: "#9ca3af", marginLeft: 4, fontSize: "0.75rem" }}>
                          completadas
                        </span>
                      </td>
                      <td>
                        <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                          <div className="sprint-progress-bar">
                            <div
                              className="sprint-progress-bar-fill"
                              style={{ width: `${progreso}%` }}
                            />
                          </div>
                          <span style={{ fontSize: "0.78rem", fontWeight: 600, color: "#374151" }}>
                            {progreso}%
                          </span>
                        </div>
                      </td>
                      <td style={{ maxWidth: 200, fontSize: "0.8rem", color: "#6b7280" }}>
                        {sprint.meta || "—"}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProjectMetrics;
