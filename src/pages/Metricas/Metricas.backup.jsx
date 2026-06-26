import { useMemo, useState } from "react";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  ArcElement,
  RadialLinearScale,
  Tooltip,
  Legend,
  Filler,
} from "chart.js";
import { Line, Doughnut } from "react-chartjs-2";
import {
  FiSearch,
  FiFolder,
  FiClock,
  FiAlertCircle,
  FiCheckCircle,
  FiLayers,
  FiDownload,
  FiRefreshCw,
} from "react-icons/fi";
import { FaTrophy } from "react-icons/fa";
import "./Metricas.css";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  ArcElement,
  RadialLinearScale,
  Tooltip,
  Legend,
  Filler,
);

const accentColor = "#39A900";
const purpleColor = "#7c3aed";
const orangeColor = "#f59e0b";
const blueColor = "#2563eb";
const redColor = "#ef4444";
const pageBackground = "#F8FAFC";

export default function Metricas() {
  const [search, setSearch] = useState("");

  const kpiCards = [
    {
      title: "Progreso del Backlog",
      value: "74%",
      caption: "89 de 120 completados",
      progress: 74,
      icon: <FiFolder size={20} />,
      iconColor: accentColor,
      iconBackground: "rgba(57, 169, 0, 0.12)",
    },
    {
      title: "Épicas Completadas",
      value: "8",
      caption: "de 11 épicas",
      secondary: "73% del total",
      icon: <FaTrophy size={18} />,
      iconColor: purpleColor,
      iconBackground: "rgba(124, 58, 237, 0.12)",
    },
    {
      title: "Épicas Pendientes",
      value: "3",
      caption: "por completar",
      secondary: "27% del total",
      icon: <FiAlertCircle size={18} />,
      iconColor: orangeColor,
      iconBackground: "rgba(245, 158, 11, 0.12)",
    },
    {
      title: "Historias de Usuario",
      value: "45",
      caption: "28 completadas",
      secondary: "17 pendientes",
      icon: <FiLayers size={18} />,
      iconColor: blueColor,
      iconBackground: "rgba(37, 99, 235, 0.12)",
    },
    {
      title: "Tareas Completadas",
      value: "89",
      caption: "de 120 tareas",
      secondary: "74% del total",
      icon: <FiCheckCircle size={18} />,
      iconColor: accentColor,
      iconBackground: "rgba(57, 169, 0, 0.12)",
    },
    {
      title: "Tareas Pendientes",
      value: "31",
      caption: "15 por hacer",
      secondary: "16 en progreso",
      icon: <FiClock size={18} />,
      iconColor: redColor,
      iconBackground: "rgba(239, 68, 68, 0.12)",
    },
  ];

  const projectProgressData = {
    labels: ["Completado", "Restante"],
    datasets: [
      {
        data: [74, 26],
        backgroundColor: [accentColor, "#e2e8f0"],
        borderWidth: 0,
      },
    ],
  };

  const taskStateData = {
    labels: ["Por hacer", "En progreso", "Terminadas"],
    datasets: [
      {
        data: [15, 16, 89],
        backgroundColor: ["#0d6efd", accentColor, "#ff8a52"],
        borderWidth: 0,
      },
    ],
  };

  const epicStatusData = {
    labels: ["Completadas", "Pendientes"],
    datasets: [
      {
        data: [8, 3],
        backgroundColor: [accentColor, orangeColor],
        borderWidth: 0,
      },
    ],
  };

  const memberTrendData = useMemo(
    () => ({
      labels: ["Lun", "Mar", "Mié", "Jue", "Vie"],
      datasets: [
        {
          label: "Progreso",
          data: [58, 65, 68, 72, 82],
          borderColor: accentColor,
          backgroundColor: "rgba(57, 169, 0, 0.18)",
          fill: true,
          tension: 0.4,
          pointRadius: 0,
          borderWidth: 2,
        },
      ],
    }),
    [],
  );

  const miniLineOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: {
        backgroundColor: "rgba(33, 37, 41, 0.92)",
        titleColor: "#ffffff",
        bodyColor: "#f8f9fa",
      },
    },
    scales: {
      x: {
        grid: { display: false },
        ticks: { color: "#94a3b8", font: { size: 11 } },
      },
      y: {
        display: false,
      },
    },
  };

  const taskStateLegend = [
    { label: "Por hacer", value: "15", percentage: "12%", color: "#0d6efd" },
    { label: "En progreso", value: "16", percentage: "13%", color: accentColor },
    { label: "Terminadas", value: "89", percentage: "75%", color: "#ff8a52" },
  ];

  const memberMetrics = [
    { label: "Historias asignadas", value: "12" },
    { label: "Tareas asignadas", value: "25" },
    { label: "Completadas", value: "18" },
    { label: "En progreso", value: "5" },
    { label: "Pendientes", value: "2" },
    { label: "Cumplimiento", value: "82%" },
  ];

  return (
    <div className="container-fluid py-4" style={{ background: pageBackground, minHeight: "100vh" }}>
      <div className="metricas-container">
        <div className="metricas-header d-flex flex-column flex-md-row justify-content-between align-items-start gap-3 mb-4">
          <div>
            <p className="text-success fw-semibold mb-2 metricas-header-label">Dashboard de métricas</p>
            <h2 className="metricas-title mb-1">Visión general del proyecto</h2>
            <p className="text-muted mb-0">Seguimiento de backlog, épicas y tareas para el equipo.</p>
          </div>
          <div className="d-flex flex-wrap gap-2">
            <button type="button" className="metric-btn metric-btn-secondary">
              <FiRefreshCw size={16} />
              Actualizar
            </button>
            <button type="button" className="metric-btn metric-btn-primary">
              <FiDownload size={16} />
              Exportar
            </button>
          </div>
        </div>

        <div className="row gx-3 gy-3 mb-4">
          {kpiCards.map((card) => (
            <div key={card.title} className="col-12 col-sm-6 col-xl-2">
              <div className="card metric-card rounded-4 h-100">
                <div className="metric-card-body d-flex flex-column justify-content-between h-100">
                  <div className="d-flex align-items-start justify-content-between gap-3">
                    <div>
                      <div className="metric-label mb-2">{card.title}</div>
                      <div className="metric-value">{card.value}</div>
                      <div className="text-muted small mt-2">{card.caption}</div>
                      {card.secondary && <div className="text-muted small">{card.secondary}</div>}
                    </div>
                    <div className="metric-icon" style={{ background: card.iconBackground, color: card.iconColor }}>
                      {card.icon}
                    </div>
                  </div>

                  {card.progress !== undefined ? (
                    <div className="mt-4">
                      <div className="d-flex justify-content-between align-items-center mb-2 text-muted small">
                        <span>Progreso</span>
                        <span>{card.progress}%</span>
                      </div>
                      <div className="progress" style={{ height: 9, borderRadius: 999 }}>
                        <div
                          className="progress-bar"
                          role="progressbar"
                          style={{ width: `${card.progress}%`, backgroundColor: card.iconColor }}
                          aria-valuenow={card.progress}
                          aria-valuemin="0"
                          aria-valuemax="100"
                        />
                      </div>
                    </div>
                  ) : (
                    <div className="mt-4" style={{ height: 9, borderRadius: 999, background: "#f1f5f9" }} />
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="row gx-3 gy-3 mb-4">
          <div className="col-12 col-xl-4">
            <div className="card metric-card rounded-4 shadow-sm h-100">
              <div className="metric-card-body d-flex flex-column h-100">
                <div className="mb-4">
                  <h5 className="fw-semibold mb-1">Progreso General del Proyecto</h5>
                  <p className="text-muted mb-0">El avance global del proyecto y la última variación del sprint.</p>
                </div>

                <div className="d-flex flex-column flex-lg-row align-items-center gap-4 flex-fill">
                  <div className="donut-wrapper flex-shrink-0" style={{ width: 180, minHeight: 180 }}>
                    <Doughnut
                      data={projectProgressData}
                      options={{
                        responsive: true,
                        maintainAspectRatio: false,
                        cutout: "72%",
                        plugins: { legend: { display: false }, tooltip: { enabled: false } },
                      }}
                    />
                    <div className="metricas-donut-center">
                      <div className="value">74%</div>
                      <div className="label">completado</div>
                    </div>
                  </div>

                  <div className="flex-fill d-flex flex-column justify-content-between h-100">
                    <div>
                      <h6 className="fw-semibold mb-2">Estado general del proyecto</h6>
                      <p className="text-muted mb-0">El proyecto tiene un avance del 74% con 89 tareas completadas de un total de 120.</p>
                    </div>
                    <div className="mt-4 rounded-4 p-3" style={{ background: "rgba(57, 169, 0, 0.12)" }}>
                      <div className="fw-semibold text-success">+8%</div>
                      <div className="text-muted small">desde el último sprint</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="col-12 col-xl-4">
            <div className="card metric-card rounded-4 shadow-sm h-100">
              <div className="metric-card-body d-flex flex-column h-100">
                <div className="mb-4">
                  <h5 className="fw-semibold mb-1">Estado de las Tareas</h5>
                  <p className="text-muted mb-0">Resumen por estado del backlog actual.</p>
                </div>

                <div className="d-flex flex-column flex-md-row gap-4 flex-fill">
                  <div className="flex-shrink-0" style={{ width: 180, minHeight: 180 }}>
                    <Doughnut
                      data={taskStateData}
                      options={{
                        responsive: true,
                        maintainAspectRatio: false,
                        cutout: "68%",
                        plugins: {
                          legend: { display: false },
                          tooltip: { backgroundColor: "rgba(33,37,41,0.92)", titleColor: "#fff", bodyColor: "#f8f9fa" },
                        },
                      }}
                    />
                    <div className="metricas-donut-center">
                      <div className="value">120</div>
                      <div className="label">tareas</div>
                    </div>
                  </div>

                  <div className="flex-fill d-flex flex-column justify-content-between h-100">
                    <div>
                      {taskStateLegend.map((item) => (
                        <div key={item.label} className="d-flex align-items-center justify-content-between mb-3">
                          <div className="d-flex align-items-center gap-3">
                            <span className="metricas-legend-dot" style={{ background: item.color }} />
                            <div>
                              <div className="fw-semibold">{item.label}</div>
                              <div className="text-muted small">{item.value} tareas</div>
                            </div>
                          </div>
                          <div className="text-muted small">{item.percentage}</div>
                        </div>
                      ))}
                    </div>
                    <div className="pt-3 border-top mt-2">
                      <div className="text-muted small">Total de tareas</div>
                      <div className="fw-semibold">120</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="col-12 col-xl-4">
            <div className="card metric-card rounded-4 shadow-sm h-100">
              <div className="metric-card-body d-flex flex-column h-100">
                <div className="mb-4">
                  <h5 className="fw-semibold mb-1">Seguimiento por Integrante</h5>
                  <p className="text-muted mb-0">Busca un integrante para ver su progreso.</p>
                </div>

                <div className="input-group mb-4 search-input-group">
                  <span className="input-group-text bg-white border-0">
                    <FiSearch size={18} className="text-muted" />
                  </span>
                  <input
                    type="text"
                    className="form-control border-0"
                    placeholder="Buscar integrante"
                    value={search}
                    onChange={(event) => setSearch(event.target.value)}
                  />
                </div>

                <div className="member-card rounded-4 p-3 mb-4">
                  <div className="d-flex align-items-center gap-3 mb-3">
                    <div className="member-avatar">MG</div>
                    <div>
                      <div className="fw-semibold">María González</div>
                      <div className="text-muted small">Desarrolladora</div>
                    </div>
                  </div>
                  <div className="row g-2">
                    {memberMetrics.map((item) => (
                      <div key={item.label} className="col-6">
                        <div className="member-metric p-3 rounded-4">
                          <div className="text-muted small">{item.label}</div>
                          <div className="fw-semibold">{item.value}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="mb-4">
                  <div className="d-flex align-items-center justify-content-between mb-2">
                    <div className="text-muted small">Cumplimiento</div>
                    <div className="fw-semibold">82%</div>
                  </div>
                  <div className="progress" style={{ height: 10, borderRadius: 999 }}>
                    <div className="progress-bar bg-success" role="progressbar" style={{ width: "82%" }} aria-valuenow="82" aria-valuemin="0" aria-valuemax="100" />
                  </div>
                </div>

                <div className="flex-fill" style={{ minHeight: 100 }}>
                  <Line data={memberTrendData} options={miniLineOptions} />
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="row gx-3 gy-3">
          <div className="col-12 col-xl-6">
            <div className="card metric-card rounded-4 shadow-sm h-100">
              <div className="metric-card-body d-flex flex-column justify-content-between h-100">
                <div>
                  <h5 className="fw-semibold mb-3">Avance del Backlog</h5>
                  <div className="d-flex flex-column flex-sm-row justify-content-between gap-3 mb-3">
                    <div>
                      <div className="text-muted small">Total backlog</div>
                      <div className="fw-semibold">120</div>
                    </div>
                    <div>
                      <div className="text-muted small">Completados</div>
                      <div className="fw-semibold">89</div>
                    </div>
                    <div>
                      <div className="text-muted small">Pendientes</div>
                      <div className="fw-semibold">31</div>
                    </div>
                  </div>
                  <div className="text-muted small mb-2">Progreso total</div>
                  <div className="progress mb-4" style={{ height: 12, borderRadius: 999 }}>
                    <div className="progress-bar bg-success" role="progressbar" style={{ width: "74%" }} aria-valuenow="74" aria-valuemin="0" aria-valuemax="100" />
                  </div>
                </div>

                <div className="d-flex align-items-center gap-4 flex-wrap">
                  <div className="d-flex align-items-center justify-content-center rounded-4" style={{ width: 110, height: 110, background: "rgba(57, 169, 0, 0.08)" }}>
                    <div className="text-center">
                      <div className="h2 mb-0" style={{ color: accentColor, fontSize: "1.75rem" }}>74%</div>
                      <div className="text-muted small">completado</div>
                    </div>
                  </div>
                  <div className="text-muted small">El backlog muestra 89 ítems completados de un total de 120, con 31 tareas pendientes activas.</div>
                </div>
              </div>
            </div>
          </div>

          <div className="col-12 col-xl-6">
            <div className="card metric-card rounded-4 shadow-sm h-100">
              <div className="metric-card-body d-flex flex-column justify-content-between h-100">
                <div>
                  <h5 className="fw-semibold mb-3">Estado de las Épicas</h5>
                  <div className="d-flex flex-column flex-sm-row align-items-center gap-4 mb-3">
                    <div className="flex-shrink-0" style={{ width: 160, minHeight: 160 }}>
                      <Doughnut
                        data={epicStatusData}
                        options={{
                          responsive: true,
                          maintainAspectRatio: false,
                          cutout: "68%",
                          plugins: { legend: { display: false }, tooltip: { enabled: false } },
                        }}
                      />
                      <div className="metricas-donut-center">
                        <div className="value">11</div>
                        <div className="label">épicas totales</div>
                      </div>
                    </div>

                    <div className="flex-fill">
                      <div className="d-flex justify-content-between mb-3">
                        <div>
                          <div className="text-muted small">Completadas</div>
                          <div className="fw-semibold">8</div>
                        </div>
                        <div>
                          <div className="text-muted small">Pendientes</div>
                          <div className="fw-semibold">3</div>
                        </div>
                      </div>
                      <div className="text-muted">Total de épicas: 11</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
