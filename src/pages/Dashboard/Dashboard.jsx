import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { FiPlus, FiFolder, FiBell, FiSearch, FiMoreHorizontal } from "react-icons/fi";
import { getAccessToken, getTokenPayload } from "../../services/auth.service";
import API_URL from "../../services/api";
import "../../styles/Dashboard.css";

const getUserNameFromToken = () => {
  const token = getAccessToken();
  if (!token) return "Usuario";
  try {
    const base64Url = token.split(".")[1];
    const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split("")
        .map((c) => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2))
        .join(""),
    );

    const payload = JSON.parse(jsonPayload);
    const email = payload.email || payload.correo || "";
    const nameFromEmail = email ? email.split("@")[0] : "";
    const displayName = payload.nombre || payload.name || nameFromEmail || "Usuario";

    return displayName;
  } catch (error) {
    console.error("Error decoding token:", error);
    return "Usuario";
  }
};

export default function Dashboard() {
  const [userName, setUserName] = useState("");
  const [proyectos, setProyectos] = useState([]);
  const [stats, setStats] = useState({ productividad: 0, progresoGlobal: 0 });
  const [notificaciones, setNotificaciones] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    setUserName(getUserNameFromToken());

    const fetchData = async () => {
      try {
        const token = getAccessToken();
        const [statsRes, notifRes] = await Promise.all([
          fetch(`${API_URL}/proyectos/dashboard-stats`, {
            headers: { Authorization: `Bearer ${token}` }
          }),
          fetch(`${API_URL}/notificaciones`, {
            headers: { Authorization: `Bearer ${token}` }
          })
        ]);

        if (statsRes.ok) {
          const sData = await statsRes.json();
          setProyectos(sData.data.proyectos || []);
          setStats({
            productividad: sData.data.productividad || 0,
            progresoGlobal: sData.data.progresoGlobal || 0,
          });
        }

        if (notifRes.ok) {
          const nData = await notifRes.json();
          setNotificaciones((nData.data || []).filter(n => !n.leido));
        }
      } catch (err) {
        console.error("Error fetching dashboard data", err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  return (
    <div className="dash-v2-container">
      <header className="dash-v2-header">
        <div className="dash-v2-greeting">
          <h1>¡Hola, {userName}!</h1>
          <p>Echemos un vistazo a tu actividad de hoy</p>
        </div>
        <div className="dash-v2-header-actions">
          <div className="dash-v2-search">
            <FiSearch />
            <input type="text" placeholder="Buscar proyectos..." />
          </div>
          <button className="dash-v2-upgrade" onClick={() => navigate("/crear-proyecto")}>
            Nuevo Proyecto
          </button>
        </div>
      </header>

      {loading ? (
        <div className="dash-v2-loader">
          <div className="spinner-border text-success" role="status"></div>
        </div>
      ) : (
        <div className="dash-v2-grid">
          {/* Left Column */}
          <div className="dash-v2-col-left">
            
            {/* Blob Card */}
            <div className="dash-v2-card dash-blob-card">
              <div className="blob-card-header">
                <h2>Tu Resumen<br/>para Hoy</h2>
                <button className="icon-btn"><FiFolder /></button>
              </div>
              
              <div className="blobs-container">
                <div className="blob-orb blob-green-light"></div>
                <div className="blob-orb blob-green-dark"></div>
                
                <div className="blob-stat stat-1">
                  <span className="stat-val">{proyectos.length}</span>
                  <span className="stat-lbl">Proyectos</span>
                </div>
                
                <div className="blob-stat stat-2">
                  <span className="stat-val">{notificaciones.length}</span>
                  <span className="stat-lbl">Alertas</span>
                </div>
              </div>

              <div className="blob-legend">
                <div className="legend-item">
                  <span className="legend-color color-primary"></span> Proyectos activos
                </div>
                <div className="legend-item">
                  <span className="legend-color color-secondary"></span> Notificaciones
                </div>
              </div>
            </div>

            {/* Small Cards */}
            <div className="dash-v2-small-cards">
              <div className="dash-v2-card mini-card">
                <div className="mini-card-text">
                  <h3>Productividad</h3>
                  <p>Mantén el ritmo</p>
                  <button className="mini-action">Ver más <span className="pencil-icon">✎</span></button>
                </div>
                <div className="mini-card-chart">
                  <div className="radial-chart">
                    <svg viewBox="0 0 36 36">
                      <path className="circle-bg" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
                      <path className="circle" strokeDasharray={`${stats.productividad}, 100`} d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
                    </svg>
                    <div className="chart-center">
                      <span className="chart-lbl">Meta</span>
                      <span className="chart-val">{stats.productividad}%</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="dash-v2-card mini-card weight-card">
                <div className="weight-header">
                  <h3>Progreso Global</h3>
                  <span className="weight-percent">{stats.progresoGlobal}%<br/><small>Completado</small></span>
                </div>
                <div className="weight-bar-container">
                  <div className="weight-bar-track">
                    <div className="weight-bar-fill" style={{ width: `${stats.progresoGlobal}%` }}></div>
                    <div className="weight-marker" style={{ left: `${stats.progresoGlobal}%` }}>{stats.progresoGlobal}%</div>
                  </div>
                  <div className="weight-labels">
                    <span>0%</span>
                    <span>100%</span>
                  </div>
                </div>
              </div>
            </div>

          </div>

          {/* Right Column */}
          <div className="dash-v2-col-right">
            
            {/* Quick Actions Card */}
            <div className="dash-v2-card dash-actions-card">
              <div className="actions-card-header">
                <h3>Acciones Rápidas</h3>
                <span className="actions-subtitle">ScrumTrack <FiPlus/></span>
              </div>
              <div className="actions-grid-buttons">
                <button className="action-grid-btn" onClick={() => navigate("/crear-proyecto")}>
                  <div className="action-icon-circle green"><FiPlus /></div>
                  <span>Nuevo Proyecto</span>
                </button>
                <button className="action-grid-btn" onClick={() => navigate("/proyectos")}>
                  <div className="action-icon-circle green"><FiFolder /></div>
                  <span>Ver Proyectos</span>
                </button>
                <button className="action-grid-btn" onClick={() => navigate("/notificaciones")}>
                  <div className="action-icon-circle green"><FiBell /></div>
                  <span>Notificaciones</span>
                </button>
              </div>
            </div>

            {/* List Card */}
            <div className="dash-v2-card dash-list-card">
              <div className="list-card-header">
                <h3>Mis Proyectos</h3>
                <button className="add-new-btn" onClick={() => navigate("/proyectos")}>
                  Ver Todos <span className="add-icon"><FiPlus /></span>
                </button>
              </div>
              <div className="list-card-body">
                {proyectos.length === 0 ? (
                  <p className="no-data-text">No tienes proyectos aún.</p>
                ) : (
                  proyectos.slice(0, 4).map((p, idx) => (
                    <div className="list-item" key={p.id_proyecto || idx}>
                      <div className="item-avatar">
                        {p.nombre.charAt(0).toUpperCase()}
                      </div>
                      <div className="item-info">
                        <h4>{p.nombre}</h4>
                        <p>{p.descripcion || "Sin descripción"}</p>
                      </div>
                      <div className="item-progress">
                        <span className="progress-text">Estado: {p.estado || "Activo"}</span>
                        <div className="segmented-bar">
                          {[...Array(12)].map((_, i) => {
                            const activeSegments = Math.round((p.progreso || 0) / 100 * 12);
                            return <div key={i} className={`segment ${i < activeSegments ? 'active' : ''}`}></div>;
                          })}
                        </div>
                      </div>
                      <button className="item-more"><FiMoreHorizontal /></button>
                    </div>
                  ))
                )}
              </div>
            </div>

          </div>
        </div>
      )}
    </div>
  );
}
