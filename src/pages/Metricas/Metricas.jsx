import { useMemo, useState } from "react";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  RadialLinearScale,
  Tooltip,
  Legend,
  Filler,
} from "chart.js";
import { Line, Doughnut, Bar, PolarArea } from "react-chartjs-2";
import {
  FiActivity,
  FiBarChart2,
  FiClock,
  FiDownload,
  FiRefreshCw,
  FiTrendingUp,
} from "react-icons/fi";
import { FaBug, FaTasks, FaRocket } from "react-icons/fa";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  RadialLinearScale,
  Tooltip,
  Legend,
  Filler,
);

const accentColor = "#39A900";
const cardShadow = "0 24px 60px rgba(0, 0, 0, 0.08)";
const pageBackground = "linear-gradient(180deg, #f6fbf3 0%, #ffffff 100%)";

export default function Metricas() {
  const [sprintA, setSprintA] = useState("Sprint 10");
  const [sprintB, setSprintB] = useState("Sprint 9");

  const sprintOptions = ["Sprint 7", "Sprint 8", "Sprint 9", "Sprint 10"];

  const kpiCards = [
    {
      title: "Sprint Actual",
      value: "Sprint 10",
      caption: "En progreso",
      accent: accentColor,
      icon: <FiActivity size={18} />,
      badge: "Última entrega 5 días",
    },
    {
      title: "Tareas Totales",
      value: "45",
      caption: "+5 desde ayer",
      accent: "#0d6efd",
      icon: <FaTasks size={18} />,
      badge: "Total sprint",
    },
    {
      title: "Velocidad",
      value: "90%",
      caption: "Prometido vs completado",
      accent: accentColor,
      icon: <FiBarChart2 size={18} />,
      badge: "Rendimiento estable",
    },
    {
      title: "Bugs Críticos",
      value: "3",
      caption: "+1 desde ayer",
      accent: "#ff4d6d",
      icon: <FaBug size={18} />,
      badge: "Atención urgente",
    },
  ];

  const lineLabels = ["Día 1", "Día 5", "Día 10", "Día 15", "Día 20", "Día 25"];

  const sprintLineValues = {
    "Sprint 7": [55, 48, 62, 70, 58, 64],
    "Sprint 8": [60, 52, 67, 73, 61, 68],
    "Sprint 9": [65, 58, 72, 79, 66, 74],
    "Sprint 10": [72, 66, 80, 84, 72, 78],
  };

  const lineData = useMemo(
    () => ({
      labels: lineLabels,
      datasets: [
        {
          label: sprintA,
          data: sprintLineValues[sprintA],
          borderColor: accentColor,
          backgroundColor: "rgba(57, 169, 0, 0.18)",
          fill: true,
          tension: 0.35,
          pointRadius: 4,
          pointBackgroundColor: accentColor,
        },
        {
          label: sprintB,
          data: sprintLineValues[sprintB],
          borderColor: "#0d6efd",
          backgroundColor: "rgba(13, 110, 253, 0.16)",
          fill: true,
          tension: 0.35,
          pointRadius: 4,
          borderDash: [6, 6],
        },
      ],
    }),
    [sprintA, sprintB],
  );

  const sprintStatusData = {
    labels: ["Por hacer", "En progreso", "Terminado"],
    datasets: [
      {
        data: [15, 18, 27],
        backgroundColor: ["#0d6efd", accentColor, "#ff8a52"],
        borderWidth: 0,
      },
    ],
  };

  const velocityData = {
    labels: ["Sprint 7", "Sprint 8", "Sprint 9", "Sprint 10"],
    datasets: [
      {
        label: "Promedio",
        data: [48, 52, 55, 60],
        backgroundColor: "rgba(108, 117, 125, 0.16)",
        borderColor: "rgba(108, 117, 125, 0.35)",
        borderWidth: 1,
      },
      {
        label: "Completado",
        data: [42, 45, 50, 58],
        backgroundColor: "rgba(57, 169, 0, 0.35)",
        borderColor: accentColor,
        borderWidth: 1,
      },
    ],
  };

  const distributionData = {
    labels: ["Features", "Bugs", "Deuda Técnica"],
    datasets: [
      {
        data: [60, 25, 15],
        backgroundColor: [accentColor, "#ff4d6d", "#f7c948"],
        borderWidth: 0,
      },
    ],
  };

  const projectProgressData = {
    labels: ["Completado", "Restante"],
    datasets: [
      {
        data: [66, 34],
        backgroundColor: [accentColor, "#e9ecef"],
        borderWidth: 0,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        labels: {
          color: "#6c757d",
          boxWidth: 12,
          boxHeight: 12,
        },
      },
      tooltip: {
        backgroundColor: "rgba(33, 37, 41, 0.92)",
        titleColor: "#ffffff",
        bodyColor: "#f8f9fa",
        displayColors: false,
      },
    },
    scales: {
      x: {
        ticks: {
          color: "#6c757d",
          font: { size: 12 },
        },
        grid: {
          display: false,
        },
      },
      y: {
        beginAtZero: true,
        ticks: {
          color: "#6c757d",
          font: { size: 12 },
        },
        grid: {
          color: "rgba(0, 0, 0, 0.05)",
        },
      },
    },
  };

  return (
    <div className="container-fluid py-4" style={{ background: pageBackground }}>
      <style>{`
        .metricas-page {
          min-height: 100vh;
        }

        .metricas-card {
          transition: transform 0.25s ease, box-shadow 0.25s ease;
          border: 1px solid rgba(145, 158, 171, 0.16);
          background: #ffffff;
        }

        .metricas-card:hover {
          transform: translateY(-6px);
          box-shadow: ${cardShadow};
        }

        .metricas-kpi-card {
          min-height: 138px;
          padding: 1rem 1.1rem;
          display: flex;
          flex-direction: column;
          justify-content: space-between;
        }

        .metricas-kpi-line {
          height: 4px;
          border-radius: 999px;
          margin-top: 0.95rem;
        }

        .metricas-kpi-icon {
          width: 42px;
          height: 42px;
          border-radius: 14px;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          background: rgba(57, 169, 0, 0.12);
          color: ${accentColor};
        }

        .metricas-kpi-title {
          font-size: 0.78rem;
          letter-spacing: 0.08em;
          text-transform: uppercase;
          color: #6c757d;
        }

        .metricas-kpi-value {
          font-size: 1.85rem;
          font-weight: 700;
        }

        .metricas-kpi-caption {
          color: #6c757d;
        }

        .metricas-header-label {
          letter-spacing: 0.08em;
          font-size: 0.8rem;
        }

        .metricas-select-group {
          display: inline-flex;
          align-items: center;
          gap: 0.5rem;
          padding: 8px 10px;
          border-radius: 16px;
          background: #ffffff;
          border: 1px solid rgba(145, 158, 171, 0.18);
          box-shadow: 0 8px 24px rgba(15, 23, 42, 0.04);
        }

        .metricas-select {
          min-width: 140px;
          height: 44px;
          border-radius: 12px;
          border: 1px solid #e5e7eb;
          background: #ffffff;
          box-shadow: none;
          padding-left: 0.85rem;
          padding-right: 1.1rem;
          font-size: 0.95rem;
        }

        .metricas-select:focus {
          box-shadow: 0 0 0 4px rgba(57, 169, 0, 0.12);
          border-color: ${accentColor};
        }

        .metricas-select-separator {
          color: #6c757d;
          font-weight: 700;
          letter-spacing: 0.12em;
          text-transform: uppercase;
          font-size: 0.82rem;
        }

        .metricas-chart-card {
          min-height: 450px;
        }

        .metricas-donut-box {
          position: relative;
          min-height: 260px;
        }

        .metricas-donut-center {
          position: absolute;
          inset: 50% auto auto 50%;
          transform: translate(-50%, -50%);
          text-align: center;
          pointer-events: none;
        }

        .metricas-donut-center .value {
          font-size: 2.25rem;
          font-weight: 700;
          color: #212529;
          line-height: 1;
        }

        .metricas-donut-center .label {
          color: #6c757d;
          font-size: 0.95rem;
        }

        .metricas-legend-item {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          margin-bottom: 1rem;
        }

        .metricas-legend-dot {
          width: 12px;
          height: 12px;
          border-radius: 50%;
        }

        .metricas-metric-value {
          font-size: 1.35rem;
          font-weight: 700;
          color: #212529;
        }

        .metricas-metric-label {
          font-size: 0.95rem;
          color: #6c757d;
        }

        .metricas-progress-label {
          font-size: 0.95rem;
          font-weight: 600;
          color: ${accentColor};
        }

        .metricas-progress-bar-custom {
          height: 10px;
          border-radius: 999px;
          background: #e9ecef;
          overflow: hidden;
        }

        .metricas-progress-bar-custom-inner {
          height: 100%;
          background: ${accentColor};
          border-radius: 999px;
        }

        .metricas-progress-divider {
          border-top: 1px dashed rgba(145, 158, 171, 0.35);
          margin: 0.75rem 0;
        }

        .metricas-progress-footer {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 0.35rem;
        }

        .metricas-progress-donut {
          width: 164px;
          height: 164px;
          position: relative;
        }

        .metricas-progress-donut canvas {
          width: 100% !important;
          height: 100% !important;
        }

        .metricas-progress-donut .metricas-donut-center,
        .metricas-donut-center {
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          pointer-events: none;
          width: auto;
          height: auto;
          text-align: center;
        }

        .metricas-progress-donut .value,
        .metricas-donut-center .value {
          font-size: 2.2rem;
        }

        .metricas-progress-footer .text-muted {
          letter-spacing: 0.01em;
        }

        .metric-btn {
          height: 44px;
          padding: 0 20px;
          border-radius: 14px;
          font-weight: 600;
          border: none;
          display: inline-flex;
          align-items: center;
          gap: 0.65rem;
          transition: transform 0.25s ease, box-shadow 0.25s ease, background 0.25s ease;
          cursor: pointer;
          text-decoration: none;
          color: inherit;
        }

        .metric-btn:focus {
          outline: none;
          box-shadow: 0 0 0 4px rgba(57, 169, 0, 0.12);
        }

        .metric-btn-primary {
          background: ${accentColor};
          color: #ffffff;
          box-shadow: 0 8px 20px rgba(57, 169, 0, 0.25);
        }

        .metric-btn-primary:hover {
          transform: translateY(-2px);
        }

        .metric-btn-secondary {
          background: #ffffff;
          color: #334155;
          border: 1px solid #e5e7eb;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
        }

        .metric-btn-secondary:hover {
          background: #f8fafc;
          transform: translateY(-2px);
        }
      `}</style>

      <div className="metricas-page">
        <div className="d-flex flex-column flex-md-row justify-content-between align-items-start gap-3 mb-4">
          <div>
            <p className="text-success fw-semibold mb-2 metricas-header-label">Dashboard de métricas</p>
            <h1 className="h3 fw-bold mb-1">Métricas del Proyecto</h1>
            <p className="text-muted mb-0">Análisis y seguimiento del rendimiento Scrum</p>
          </div>
          <div className="d-flex flex-wrap gap-2">
            <button type="button" className="metric-btn metric-btn-secondary">
              <FiDownload size={16} />
              Exportar
            </button>
            <button type="button" className="metric-btn metric-btn-primary">
              <FiRefreshCw size={16} />
              Actualizar
            </button>
          </div>
        </div>

        <div className="row g-3 mb-4">
          {kpiCards.map((card) => (
            <div key={card.title} className="col-12 col-sm-6 col-xl-3">
              <div className="card metricas-card rounded-4 shadow-sm metricas-kpi-card">
                <div className="d-flex align-items-center justify-content-between mb-3">
                  <div>
                    <div className="metricas-kpi-title">{card.title}</div>
                    <div className="metricas-kpi-value mt-1">{card.value}</div>
                    <div className="metricas-kpi-caption mt-2">{card.caption}</div>
                  </div>
                  <span
                    className="metricas-kpi-icon"
                    style={{ background: card.accent === accentColor ? "rgba(57, 169, 0, 0.12)" : `${card.accent}20`, color: card.accent }}
                  >
                    {card.icon}
                  </span>
                </div>
                <div>
                  <div className="text-muted small">{card.badge}</div>
                  <div className="metricas-kpi-line" style={{ background: card.accent }} />
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="row g-3 mb-4">
          <div className="col-12 col-xl-8">
            <div className="card metricas-card rounded-4 shadow-sm metricas-chart-card">
              <div className="card-body h-100 d-flex flex-column">
                <div className="d-flex flex-column flex-md-row justify-content-between align-items-start align-items-md-center gap-3 mb-4">
                  <div>
                    <h5 className="fw-semibold mb-1">Comparativa Desarrollo de Sprints</h5>
                    <p className="text-muted mb-0">Sprint actual vs Sprint anterior en el mismo gráfico.</p>
                  </div>
                  <div className="metricas-select-group">
                    <select
                      className="form-select form-select-sm metricas-select"
                      value={sprintA}
                      onChange={(event) => setSprintA(event.target.value)}
                    >
                      {sprintOptions.map((option) => (
                        <option key={option} value={option}>
                          {option}
                        </option>
                      ))}
                    </select>
                    <span className="metricas-select-separator">VS</span>
                    <select
                      className="form-select form-select-sm metricas-select"
                      value={sprintB}
                      onChange={(event) => setSprintB(event.target.value)}
                    >
                      {sprintOptions.map((option) => (
                        <option key={option} value={option}>
                          {option}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
                <div className="flex-fill" style={{ minHeight: 450 }}>
                  <Line data={lineData} options={chartOptions} />
                </div>
              </div>
            </div>
          </div>

          <div className="col-12 col-xl-4">
            <div className="card metricas-card rounded-4 shadow-sm h-100">
              <div className="card-body h-100 d-flex flex-column">
                <div className="d-flex align-items-center justify-content-between mb-4">
                  <div>
                    <h5 className="fw-semibold mb-1">Estado del Sprint Actual</h5>
                    <p className="text-muted mb-0">Resumen de tareas por estado.</p>
                  </div>
                  <FiClock size={22} className="text-success" />
                </div>
                <div className="d-flex flex-column flex-grow-1 justify-content-between">
                  <div className="d-flex flex-column flex-sm-row align-items-center gap-4">
                    <div className="metricas-donut-box" style={{ width: 240, minHeight: 240 }}>
                      <Doughnut
                        data={sprintStatusData}
                        options={{
                          ...chartOptions,
                          plugins: {
                            ...chartOptions.plugins,
                            legend: { display: false },
                          },
                          cutout: "70%",
                        }}
                      />
                      <div className="metricas-donut-center">
                        <div className="value">60%</div>
                        <div className="label">Completado</div>
                      </div>
                    </div>
                    <div className="flex-fill">
                      <div className="metricas-legend-item">
                        <span className="metricas-legend-dot" style={{ background: "#0d6efd" }} />
                        <div>
                          <div className="fw-semibold">Por hacer</div>
                          <div className="text-muted small">15 tareas</div>
                        </div>
                      </div>
                      <div className="metricas-legend-item">
                        <span className="metricas-legend-dot" style={{ background: accentColor }} />
                        <div>
                          <div className="fw-semibold">En progreso</div>
                          <div className="text-muted small">18 tareas</div>
                        </div>
                      </div>
                      <div className="metricas-legend-item">
                        <span className="metricas-legend-dot" style={{ background: "#ff8a52" }} />
                        <div>
                          <div className="fw-semibold">Terminado</div>
                          <div className="text-muted small">27 tareas</div>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="bg-light rounded-4 p-3 border mt-3">
                    <div className="text-muted small mb-2">Días restantes</div>
                    <div className="fw-bold text-success">5 días</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="row g-3">
          <div className="col-12 col-xl-4">
            <div className="card metricas-card rounded-4 shadow-sm h-100">
              <div className="card-body h-100 d-flex flex-column">
                <div className="d-flex align-items-center justify-content-between mb-4">
                  <div>
                    <h5 className="fw-semibold mb-1">Historial de Velocidad</h5>
                    <p className="text-muted mb-0">Prometido vs completado por Sprint.</p>
                  </div>
                  <FiTrendingUp size={22} className="text-success" />
                </div>
                <div className="flex-fill" style={{ minHeight: 300 }}>
                  <Bar data={velocityData} options={chartOptions} />
                </div>
              </div>
            </div>
          </div>

          <div className="col-12 col-xl-4">
            <div className="card metricas-card rounded-4 shadow-sm h-100">
              <div className="card-body d-flex flex-column justify-content-between h-100">
                <div>
                  <div className="d-flex align-items-center justify-content-between mb-4">
                    <div>
                      <h5 className="fw-semibold mb-1">Distribución de Tareas</h5>
                      <p className="text-muted mb-0">Features, Bugs, Deuda Técnica.</p>
                    </div>
                    <FaRocket size={22} className="text-success" />
                  </div>
                </div>
                <div className="flex-fill" style={{ minHeight: 220 }}>
                  <PolarArea
                    data={distributionData}
                    options={{
                      ...chartOptions,
                      plugins: {
                        ...chartOptions.plugins,
                        legend: {
                          position: "bottom",
                          labels: { color: "#6c757d", boxWidth: 12, boxHeight: 12 },
                        },
                      },
                      scales: {
                        r: {
                          ticks: { color: "#6c757d" },
                          grid: { color: "rgba(0, 0, 0, 0.06)" },
                        },
                      },
                    }}
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="col-12 col-xl-3">
            <div className="card metricas-card rounded-4 shadow-sm h-100">
              <div className="card-body d-flex flex-column justify-content-between h-100">
                <div>
                  <div className="d-flex align-items-start justify-content-between mb-4">
                    <div>
                      <h5 className="fw-semibold mb-1">Progreso del Proyecto</h5>
                      <p className="text-muted mb-0">Avance del delivery.</p>
                    </div>
                  </div>
                </div>
                <div className="d-flex flex-column flex-md-row align-items-center gap-4 mb-3">
                  <div className="metricas-progress-donut position-relative">
                    <Doughnut
                      data={projectProgressData}
                      options={{
                        ...chartOptions,
                        plugins: {
                          ...chartOptions.plugins,
                          legend: { display: false },
                          tooltip: { enabled: false },
                        },
                        cutout: "72%",
                        maintainAspectRatio: false,
                        elements: {
                          arc: { borderWidth: 0 },
                        },
                        scales: {
                          r: {
                            display: false,
                            grid: { display: false },
                            ticks: { display: false },
                            angleLines: { display: false },
                            pointLabels: { display: false },
                          },
                        },
                      }}
                    />
                    <div className="metricas-donut-center">
                      <div className="value">66%</div>
                    </div>
                  </div>
                  <div className="flex-fill">
                    <div className="d-flex justify-content-between align-items-start mb-3">
                      <div>
                        <div className="metricas-metric-label">Sprints Terminados</div>
                        <div className="metricas-metric-value">8 de 12</div>
                      </div>
                    </div>
                    <div className="metricas-progress-divider" />
                    <div className="d-flex justify-content-between align-items-start mt-3">
                      <div>
                        <div className="metricas-metric-label">Próxima Entrega</div>
                        <div className="metricas-metric-value text-success">3 semanas</div>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="metricas-progress-footer">
                  <div className="metricas-progress-bar-custom mb-2">
                    <div className="metricas-progress-bar-custom-inner" style={{ width: "66%" }} />
                  </div>
                  <div className="text-muted small">66% completado</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
