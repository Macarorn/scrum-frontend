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

/* ── Componentes Personalizados para la Tabla del Gantt ─────── */
const CustomTaskListHeader = ({ headerHeight, rowWidth }) => {
  return (
    <div
      className="custom-gantt-header"
      style={{
        height: headerHeight,
        width: rowWidth,
      }}
    >
      <div className="custom-gantt-header-cell name">Concepto / Nombre</div>
      <div className="custom-gantt-header-cell date">Inicio</div>
      <div className="custom-gantt-header-cell date">Fin</div>
    </div>
  );
};

const CustomTaskListTable = ({
  rowHeight,
  rowWidth,
  tasks,
  selectedTaskId,
  setSelectedTask,
}) => {
  return (
    <div className="custom-gantt-table" style={{ width: rowWidth }}>
      {tasks.map((task) => {
        const isEpic = !!task.project;

        // Formatear fechas compactas (ej: 25 Jun)
        const formatDateCompact = (date) => {
          if (!date || isNaN(date.getTime())) return "—";
          return date.toLocaleDateString("es-MX", {
            day: "2-digit",
            month: "short",
          });
        };

        const startStr = formatDateCompact(task.start);
        const endStr = formatDateCompact(task.end);

        return (
          <div
            key={task.id}
            className={`custom-gantt-row ${isEpic ? "epic-row" : "sprint-row"} ${
              selectedTaskId === task.id ? "selected" : ""
            }`}
            style={{ height: rowHeight }}
            onClick={() => setSelectedTask(task.id)}
          >
            <div className="custom-gantt-cell name-cell" title={task._name || task.name}>
              {isEpic ? (
                <>
                  <span className="epic-indent">↳</span>
                  <span className="epic-badge">Épica</span>
                  <span className="task-name-text">
                    {(task._name || task.name).replace("  ↳ ", "")}
                  </span>
                </>
              ) : (
                <>
                  <svg viewBox="0 0 24 24" aria-hidden="true" className="sprint-icon-svg">
                    <path d="M4 6h16v3H4zm0 5h16v3H4zm0 5h10v3H4z" />
                  </svg>
                  <span className="task-name-text">{task._name || task.name}</span>
                </>
              )}
            </div>
            <div className="custom-gantt-cell date-cell">{startStr}</div>
            <div className="custom-gantt-cell date-cell">{endStr}</div>
          </div>
        );
      })}
    </div>
  );
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
  const [viewMode, setViewMode] = useState(ViewMode.Day);
  const [ganttWidth, setGanttWidth] = useState(0);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [statusMenuOpen, setStatusMenuOpen] = useState(false);

  const redirectToLogin = useCallback(() => {
    clearSessionTokens();
    navigate("/login", { replace: true });
  }, [navigate]);

  /* ── Medir el ancho disponible del contenedor ─────────────── */
  useEffect(() => {
    const updateWidth = () => {
      if (ganttWrapperRef.current) {
        setGanttWidth(ganttWrapperRef.current.offsetWidth - 2);
      }
    };
    updateWidth();
    window.addEventListener("resize", updateWidth);
    // Ejecutar de nuevo tras un pequeño delay para asegurar renderizado
    const timeout = setTimeout(updateWidth, 100);
    return () => {
      window.removeEventListener("resize", updateWidth);
      clearTimeout(timeout);
    };
  }, [loading, data]);

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

  /* ── Cerrar dropdown de estado al hacer click fuera ────────── */
  useEffect(() => {
    if (!statusMenuOpen) return;
    const handleOutside = (event) => {
      if (event.target.closest && event.target.closest(".gantt-status-picker")) {
        return;
      }
      setStatusMenuOpen(false);
    };
    document.addEventListener("mousedown", handleOutside);
    return () => {
      document.removeEventListener("mousedown", handleOutside);
    };
  }, [statusMenuOpen]);

  /* ── Transformar a formato gantt-task-react ────────────────── */
  const ganttTasks = useMemo(() => {
    if (!data?.sprints?.length) return [];

    const COLOR_PALETTE = [
      { parentBg: "#1e3a8a", parentProgress: "#1e40af", childBg: "#3b82f6", childProgress: "#2563eb" }, // Blue
      { parentBg: "#14532d", parentProgress: "#166534", childBg: "#22c55e", childProgress: "#16a34a" }, // Green
      { parentBg: "#78350f", parentProgress: "#92400e", childBg: "#f59e0b", childProgress: "#d97706" }, // Amber
      { parentBg: "#581c87", parentProgress: "#6b21a8", childBg: "#a855f7", childProgress: "#9333ea" }, // Purple
      { parentBg: "#831843", parentProgress: "#9d174d", childBg: "#ec4899", childProgress: "#db2777" }, // Pink
      { parentBg: "#7f1d1d", parentProgress: "#991b1b", childBg: "#ef4444", childProgress: "#dc2626" }, // Red
      { parentBg: "#134e4a", parentProgress: "#115e59", childBg: "#14b8a6", childProgress: "#0d9488" }, // Teal
    ];

    const getCompactName = (name, isEpica = false) => {
      if (viewMode === ViewMode.Day) {
        return isEpica ? `  ↳ ${name}` : name;
      }
      if (viewMode === ViewMode.Week) {
        // En semana tenemos más espacio. Mostramos el texto pero recortado a 20 caracteres.
        const prefix = isEpica ? "↳ " : "";
        if (name.length > 20) {
          return prefix + name.substring(0, 18) + "...";
        }
        return prefix + name;
      }
      // En mes es muy reducido, dejamos solo la clave (ej: S1, E2)
      const parts = name.split('-');
      let shortName = parts[0].trim();
      if (shortName.length > 8) {
        shortName = shortName.substring(0, 6) + '…';
      }
      return isEpica ? `↳ ${shortName}` : shortName;
    };

    const tasks = [];

    for (let i = 0; i < data.sprints.length; i++) {
      const sprint = data.sprints[i];

      // Filtro por estado
      if (statusFilter !== "all" && sprint.estado !== statusFilter) {
        continue;
      }

      const sprintMatchesSearch = !searchTerm || sprint.nombre.toLowerCase().includes(searchTerm.toLowerCase());

      const epicasDelSprint = data.epicas?.filter(
        (e) => e.sprint_parent === sprint.id
      ) || [];

      let epicasFiltradas = epicasDelSprint;
      if (searchTerm) {
        const matchingEpics = epicasDelSprint.filter(e => e.nombre.toLowerCase().includes(searchTerm.toLowerCase()));
        if (!sprintMatchesSearch && matchingEpics.length === 0) {
          continue; // Omitir el sprint si ni él ni sus épicas coinciden con la búsqueda
        }
        if (!sprintMatchesSearch) {
          epicasFiltradas = matchingEpics;
        }
      }

      const palette = COLOR_PALETTE[i % COLOR_PALETTE.length];
      const start = new Date(sprint.fecha_inicio);
      // Resetear a 00:00:00 para alinear exactamente con el grid
      start.setHours(0, 0, 0, 0);

      const end = new Date(sprint.fecha_fin);
      end.setHours(23, 59, 59, 999);

      if (isNaN(start.getTime()) || isNaN(end.getTime())) continue;
      if (end <= start) end.setDate(start.getDate() + 1);

      tasks.push({
        start,
        end,
        name: getCompactName(sprint.nombre, false),
        _name: sprint.nombre,
        id: sprint.id,
        type: "task",
        progress: sprint.progreso || 0,
        isDisabled: true,
        styles: {
          backgroundColor: palette.parentBg,
          backgroundSelectedColor: palette.parentProgress,
          progressColor: palette.parentProgress,
          progressSelectedColor: palette.parentProgress,
        },
      });

      for (const epica of epicasFiltradas) {
        tasks.push({
          start: new Date(start),
          end: new Date(end),
          name: getCompactName(epica.nombre, true),
          _name: `  ↳ ${epica.nombre}`,
          id: `${epica.id}-${sprint.id}`,
          type: "task",
          progress: 0,
          project: sprint.id,
          isDisabled: true,
          styles: {
            backgroundColor: palette.childBg,
            backgroundSelectedColor: palette.childProgress,
            progressColor: palette.childProgress,
            progressSelectedColor: palette.childProgress,
          },
        });
      }
    }

    return tasks;
  }, [data, viewMode, searchTerm, statusFilter]);

  /* ── Sprints filtrados para la tabla ────────────────────────── */
  const filteredSprints = useMemo(() => {
    if (!data?.sprints) return [];
    return data.sprints.filter(sprint => {
      const matchesSearch = !searchTerm || sprint.nombre.toLowerCase().includes(searchTerm.toLowerCase()) || 
        (data.epicas?.some(e => e.sprint_parent === sprint.id && e.nombre.toLowerCase().includes(searchTerm.toLowerCase())));
      const matchesStatus = statusFilter === "all" || sprint.estado === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [data, searchTerm, statusFilter]);

  const hasSprints = data?.sprints?.length > 0;

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
          <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", flexWrap: "wrap" }}>
            <h1 className="sprint-title">
              {data?.proyecto?.nombre || "Proyecto"}
            </h1>
            {data?.proyecto?.estado && (
              <span className="project-status-badge">
                {ESTADO_LABELS[data.proyecto.estado] || data.proyecto.estado}
              </span>
            )}
          </div>
          <p className="sprint-project-current">
            {data?.proyecto?.fecha_inicio && (
              <>Inicio: {formatDate(data.proyecto.fecha_inicio)}</>
            )}
            {data?.proyecto?.fecha_inicio && data?.proyecto?.fecha_fin_est && <> &nbsp;·&nbsp; </>}
            {data?.proyecto?.fecha_fin_est && (
              <>Fin estimado: {formatDate(data.proyecto.fecha_fin_est)}</>
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
        <div className="metrics-summary-card sprints-card">
          <div className="metrics-summary-icon sprints">
            <i className="bi bi-lightning-charge-fill" />
          </div>
          <div className="metrics-summary-info">
            <h4>{kpis.sprints}</h4>
            <p>Sprints totales</p>
          </div>
        </div>
        <div className="metrics-summary-card epicas-card">
          <div className="metrics-summary-icon epicas">
            <i className="bi bi-bookmark-star-fill" />
          </div>
          <div className="metrics-summary-info">
            <h4>{kpis.epicas}</h4>
            <p>Épicas del proyecto</p>
          </div>
        </div>
        <div className="metrics-summary-card completadas-card">
          <div className="metrics-summary-icon completadas">
            <i className="bi bi-check-circle-fill" />
          </div>
          <div className="metrics-summary-info">
            <h4>{kpis.completados}</h4>
            <p>Sprints completados</p>
          </div>
        </div>
        <div className="metrics-summary-card progreso-card">
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

        {/* ── Filtros del Gantt ───────────────────────────────── */}
        <div className="gantt-filters-bar">
          <div className="gantt-filter-item search-input-wrapper">
            <i className="bi bi-search search-icon" />
            <input
              type="text"
              placeholder="Buscar sprint o épica..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="gantt-filter-search"
            />
            {searchTerm && (
              <button className="clear-search-btn" onClick={() => setSearchTerm("")} title="Limpiar búsqueda">
                <i className="bi bi-x-circle-fill" />
              </button>
            )}
          </div>
          <div className="gantt-filter-item gantt-status-picker">
            <span className="gantt-filter-label">Estado:</span>
            <div className="custom-dropdown-container">
              <button
                type="button"
                className="custom-dropdown-toggle"
                onClick={() => setStatusMenuOpen((prev) => !prev)}
                aria-haspopup="menu"
                aria-expanded={statusMenuOpen}
              >
                <span>{
                  statusFilter === "all" ? "Todos" :
                  statusFilter === "planeado" ? "Planeados" :
                  statusFilter === "en_curso" ? "En curso" :
                  statusFilter === "completado" ? "Completados" :
                  statusFilter === "cancelado" ? "Cancelados" : "Todos"
                }</span>
                <span className="custom-dropdown-caret">▾</span>
              </button>

              {statusMenuOpen && (
                <div className="custom-dropdown-menu" role="menu">
                  {[
                    { value: "all", label: "Todos" },
                    { value: "planeado", label: "Planeados" },
                    { value: "en_curso", label: "En curso" },
                    { value: "completado", label: "Completados" },
                    { value: "cancelado", label: "Cancelados" }
                  ].map((opt) => {
                    const isSelected = statusFilter === opt.value;
                    return (
                      <button
                        key={opt.value}
                        type="button"
                        className={`custom-dropdown-item ${isSelected ? "selected" : ""}`}
                        onClick={() => {
                          setStatusFilter(opt.value);
                          setStatusMenuOpen(false);
                        }}
                      >
                        <span className="custom-dropdown-item-name">{opt.label}</span>
                        {isSelected && <i className="bi bi-check check-icon" />}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
          {(searchTerm || statusFilter !== "all") && (
            <button className="btn-clear-all-filters" onClick={() => { setSearchTerm(""); setStatusFilter("all"); }}>
              Limpiar filtros
            </button>
          )}
        </div>

        <div className={`gantt-scroll-area gantt-view-${viewMode.toLowerCase()}`} ref={ganttWrapperRef}>
          {/* Advertencia para pantallas móviles */}
          <div className="gantt-mobile-warning">
            <i className="bi bi-laptop-fill" />
            <h5>Optimizado para Pantallas Grandes</h5>
            <p>El cronograma Gantt requiere una pantalla más ancha para visualizarse correctamente. Por favor, accede desde una computadora para ver la línea de tiempo.</p>
          </div>

          <div className="gantt-desktop-content">
            {ganttTasks.length > 0 && ganttWidth > 0 ? (
              <div style={{ width: ganttWidth, overflow: "auto" }}>
                <Gantt
                  tasks={ganttTasks}
                  viewMode={viewMode}
                  listCellWidth="480px"
                  TaskListHeader={CustomTaskListHeader}
                  TaskListTable={CustomTaskListTable}
                  columnWidth={
                    viewMode === ViewMode.Month ? 250
                    : viewMode === ViewMode.Week ? 220
                    : 80
                  }
                  barCornerRadius={6}
                  barFill={50}
                  fontSize={
                    viewMode === ViewMode.Month ? "10"
                    : viewMode === ViewMode.Week ? "11"
                    : "12"
                  }
                  rowHeight={50}
                  headerHeight={55}
                  locale="es"
                  todayColor="rgba(57, 169, 0, 0.06)"
                  TooltipContent={({ task }) => {
                    const isSprint = task.type === "project";
                    let extra = null;
                    if (isSprint) {
                      extra = data?.sprints?.find(s => s.id === task.id);
                    } else {
                      const epicaId = task.id.substring(0, task.id.lastIndexOf("-sprint"));
                      extra = data?.epicas?.find(e => e.id === epicaId);
                    }

                    const startStr = task.start.toLocaleDateString("es-MX", { day: "numeric", month: "short" });
                    const endStr = task.end.toLocaleDateString("es-MX", { day: "numeric", month: "short", year: "numeric" });
                    const duration = Math.ceil((task.end.getTime() - task.start.getTime()) / (1000 * 60 * 60 * 24));

                    return (
                      <div className="gantt-custom-tooltip">
                        <div className="tooltip-header">
                          <strong>{(task._name || task.name).replace("  ↳ ", "")}</strong>
                        </div>
                        <div className="tooltip-body">
                          <p className="tooltip-dates">
                            <i className="bi bi-calendar-event"></i> {startStr} — {endStr} ({duration} {duration === 1 ? 'día' : 'días'})
                          </p>
                          {isSprint && extra && (
                            <>
                              <p className="tooltip-progress">
                                <i className="bi bi-graph-up"></i> Progreso: {extra.progreso}%
                              </p>
                              {extra.meta && (
                                <p className="tooltip-meta">
                                  <i className="bi bi-bullseye"></i> <strong>Meta:</strong> {extra.meta}
                                </p>
                              )}
                            </>
                          )}
                          {!isSprint && extra && (
                            <p className="tooltip-status">
                              <i className="bi bi-info-circle"></i> Estado: {ESTADO_LABELS[extra.estado] || extra.estado}
                            </p>
                          )}
                        </div>
                      </div>
                    );
                  }}
                />
              </div>
            ) : ganttTasks.length === 0 ? (
              <div className="gantt-empty">
                <i className="bi bi-calendar-x" />
                {searchTerm || statusFilter !== "all" ? (
                  <>
                    <p>No se encontraron resultados para los filtros aplicados</p>
                    <small>Prueba ajustando la búsqueda o el filtro de estado</small>
                  </>
                ) : (
                  <>
                    <p>No hay sprints con fechas para mostrar</p>
                    <small>Crea sprints con fechas de inicio y fin para ver el cronograma</small>
                  </>
                )}
              </div>
            ) : null}
          </div>
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
      {hasSprints && (
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
            {filteredSprints.length > 0 ? (
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
                  {filteredSprints.map((sprint) => {
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
            ) : (
              <div className="gantt-empty" style={{ padding: "3rem 1rem" }}>
                <i className="bi bi-search" style={{ fontSize: "2rem" }} />
                <p>No se encontraron sprints que coincidan con los filtros</p>
                <small>Intenta buscando otro término o cambiando los filtros</small>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default ProjectMetrics;
