import { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import { Gantt, ViewMode } from "gantt-task-react";
import "gantt-task-react/dist/index.css";
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell,
  PieChart, Pie, Legend,
} from "recharts";
import API_URL from "../../services/api";
import { getAccessToken, clearSessionTokens } from "../../services/auth.service";
import "./ProjectMetrics.css";

/* ── Paleta de colores ─────────────────────────────────────── */
const COLORS = {
  sprintPlaneado: "#818cf8",
  sprintEnCurso: "#6c63ff",
  sprintCompletado: "#10b981",
  sprintCancelado: "#ef4444",
  epica: "#f59e0b",
  epicaHija: "#fbbf24",
};

const ESTADO_COLORS = {
  planeado: "#818cf8",
  en_curso: "#6c63ff",
  completado: "#10b981",
  cancelado: "#ef4444",
};

const PIE_COLORS = ["#6c63ff", "#f59e0b", "#10b981", "#ef4444", "#3b82f6", "#8b5cf6"];

/* ── Tooltip personalizado ─────────────────────────────────── */
const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="recharts-custom-tooltip">
      <p>{label}</p>
      {payload.map((entry, i) => (
        <p key={i} style={{ color: entry.color }}>
          {entry.name}: {entry.value}
        </p>
      ))}
    </div>
  );
};

/* ── Componente principal ──────────────────────────────────── */
const ProjectMetrics = () => {
  const { id } = useParams();
  const [searchParams] = useSearchParams();
  const projectIdFromQuery = searchParams.get("id_proyecto");
  const projectId = id || projectIdFromQuery;

  const navigate = useNavigate();

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

      // Asegurarse de que las fechas son válidas
      if (isNaN(start.getTime()) || isNaN(end.getTime())) continue;

      // Ajustar end para que sea al menos 1 día después de start
      if (end <= start) end.setDate(start.getDate() + 1);

      const barColor = ESTADO_COLORS[sprint.estado] || COLORS.sprintPlaneado;

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

      // Agregar épicas como sub-items del sprint
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
            backgroundColor: COLORS.epica,
            backgroundSelectedColor: COLORS.epicaHija,
            progressColor: "#d97706",
            progressSelectedColor: "#d97706",
          },
        });
      }
    }

    return tasks;
  }, [data]);

  /* ── Datos para gráfico de barras (tareas por sprint) ─────── */
  const barChartData = useMemo(() => {
    if (!data?.sprints?.length) return [];
    return data.sprints.map((s) => ({
      nombre: s.nombre.length > 20 ? s.nombre.substring(0, 18) + "…" : s.nombre,
      Completadas: s.tareas?.completadas || 0,
      "En progreso": s.tareas?.en_progreso || 0,
      Pendientes: s.tareas?.pendientes || 0,
    }));
  }, [data]);

  /* ── Datos para gráfico de pastel (sprints por estado) ────── */
  const pieChartData = useMemo(() => {
    if (!data?.sprints?.length) return [];
    const countByState = {};
    for (const s of data.sprints) {
      const label = s.estado === "en_curso" ? "En curso"
        : s.estado === "completado" ? "Completado"
        : s.estado === "cancelado" ? "Cancelado"
        : "Planeado";
      countByState[label] = (countByState[label] || 0) + 1;
    }
    return Object.entries(countByState).map(([name, value]) => ({ name, value }));
  }, [data]);

  /* ── KPIs ──────────────────────────────────────────────────── */
  const kpis = useMemo(() => {
    if (!data) return { sprints: 0, epicas: 0, completados: 0, progreso: 0 };
    const sprints = data.sprints?.length || 0;
    const epicas = data.epicas?.length || 0;
    const completados = data.sprints?.filter((s) => s.estado === "completado").length || 0;
    const totalTareas = data.sprints?.reduce((sum, s) => sum + (s.tareas?.total || 0), 0) || 0;
    const tareasCompletadas = data.sprints?.reduce((sum, s) => sum + (s.tareas?.completadas || 0), 0) || 0;
    const progreso = totalTareas > 0 ? Math.round((tareasCompletadas / totalTareas) * 100) : 0;
    return { sprints, epicas, completados, progreso };
  }, [data]);

  /* ── Render ────────────────────────────────────────────────── */
  if (loading) {
    return (
      <div className="metrics-page">
        <div className="metrics-loading">
          <div className="spinner-border text-primary" role="status" />
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
      {/* ── Top Bar ─────────────────────────────────────────── */}
      <div className="metrics-topbar">
        <div>
          <p className="sprint-tag">Métricas del Proyecto</p>
          <h1 className="sprint-title">{data?.proyecto?.nombre || "Proyecto"}</h1>
          <p className="sprint-project-current">
            Estado: {data?.proyecto?.estado || "—"}
          </p>
        </div>
        <button
          className="btn btn-outline-secondary btn-sm"
          onClick={() => navigate(`/detalles_de_proyecto/${projectId}`)}
        >
          <i className="bi bi-arrow-left me-1" /> Volver al proyecto
        </button>
      </div>

      {/* ── KPI Cards ───────────────────────────────────────── */}
      <div className="metrics-summary-row">
        <div className="metrics-summary-card">
          <div className="metrics-summary-icon sprints">
            <i className="bi bi-lightning-charge-fill" />
          </div>
          <div className="metrics-summary-info">
            <h4>{kpis.sprints}</h4>
            <p>Sprints</p>
          </div>
        </div>
        <div className="metrics-summary-card">
          <div className="metrics-summary-icon epicas">
            <i className="bi bi-bookmark-star-fill" />
          </div>
          <div className="metrics-summary-info">
            <h4>{kpis.epicas}</h4>
            <p>Épicas</p>
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

      {/* ── Gantt Chart ─────────────────────────────────────── */}
      <div className="metrics-section">
        <div className="metrics-section-header">
          <h3>
            <i className="bi bi-bar-chart-steps" />
            Diagrama de Gantt
          </h3>
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
        <div className="metrics-section-body">
          {ganttTasks.length > 0 ? (
            <div className="gantt-container">
              <Gantt
                tasks={ganttTasks}
                viewMode={viewMode}
                listCellWidth=""
                columnWidth={viewMode === ViewMode.Month ? 200 : viewMode === ViewMode.Week ? 120 : 55}
                barCornerRadius={4}
                barFill={75}
                fontSize="12"
                rowHeight={40}
                headerHeight={50}
                todayColor="rgba(108, 99, 255, 0.08)"
              />
            </div>
          ) : (
            <div className="gantt-empty">
              <i className="bi bi-calendar-x" />
              <p>No hay sprints con fechas para mostrar en el Gantt</p>
              <small>Crea sprints con fechas de inicio y fin para ver el diagrama</small>
            </div>
          )}
        </div>
        {ganttTasks.length > 0 && (
          <div className="gantt-legend">
            <div className="gantt-legend-item">
              <span className="gantt-legend-color" style={{ background: COLORS.sprintPlaneado }} />
              Planeado
            </div>
            <div className="gantt-legend-item">
              <span className="gantt-legend-color" style={{ background: COLORS.sprintEnCurso }} />
              En curso
            </div>
            <div className="gantt-legend-item">
              <span className="gantt-legend-color" style={{ background: COLORS.sprintCompletado }} />
              Completado
            </div>
            <div className="gantt-legend-item">
              <span className="gantt-legend-color" style={{ background: COLORS.epica }} />
              Épica
            </div>
          </div>
        )}
      </div>

      {/* ── Charts Row ──────────────────────────────────────── */}
      <div className="metrics-charts-row">
        {/* Barras: Tareas por Sprint */}
        <div className="metrics-section">
          <div className="metrics-section-header">
            <h3>
              <i className="bi bi-bar-chart-fill" />
              Tareas por Sprint
            </h3>
          </div>
          <div className="metrics-section-body">
            {barChartData.length > 0 ? (
              <ResponsiveContainer width="100%" height={280}>
                <BarChart data={barChartData} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
                  <XAxis dataKey="nombre" tick={{ fontSize: 11 }} />
                  <YAxis allowDecimals={false} tick={{ fontSize: 11 }} />
                  <Tooltip content={<CustomTooltip />} />
                  <Legend wrapperStyle={{ fontSize: 12 }} />
                  <Bar dataKey="Completadas" fill="#10b981" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="En progreso" fill="#f59e0b" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="Pendientes" fill="#ef4444" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="gantt-empty">
                <i className="bi bi-bar-chart" />
                <p>Sin datos de tareas aún</p>
              </div>
            )}
          </div>
        </div>

        {/* Pastel: Sprints por estado */}
        <div className="metrics-section">
          <div className="metrics-section-header">
            <h3>
              <i className="bi bi-pie-chart-fill" />
              Sprints por Estado
            </h3>
          </div>
          <div className="metrics-section-body">
            {pieChartData.length > 0 ? (
              <ResponsiveContainer width="100%" height={280}>
                <PieChart>
                  <Pie
                    data={pieChartData}
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={95}
                    paddingAngle={3}
                    dataKey="value"
                    label={({ name, percent }) =>
                      `${name} (${(percent * 100).toFixed(0)}%)`
                    }
                  >
                    {pieChartData.map((_, index) => (
                      <Cell key={index} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend wrapperStyle={{ fontSize: 12 }} />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="gantt-empty">
                <i className="bi bi-pie-chart" />
                <p>Sin sprints para graficar</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProjectMetrics;
