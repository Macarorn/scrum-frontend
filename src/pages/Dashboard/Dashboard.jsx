import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { FiPlus, FiFolder, FiBell, FiActivity } from "react-icons/fi";
import { getAccessToken, getTokenPayload } from "../../services/auth.service";
import API_URL from "../../services/api";
import "../../styles/Dashboard.css";

export default function Dashboard() {
  const [userName, setUserName] = useState("");
  const [stats, setStats] = useState({
    proyectos: 0,
    notificaciones: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const payload = getTokenPayload();
    if (payload?.sub) {
      setUserName(payload.sub);
    }

    const fetchStats = async () => {
      try {
        const token = getAccessToken();
        const [proyectosRes, notifRes] = await Promise.all([
          fetch(`${API_URL}/proyectos/usuario`, {
            headers: { Authorization: `Bearer ${token}` }
          }),
          fetch(`${API_URL}/notificaciones`, {
            headers: { Authorization: `Bearer ${token}` }
          })
        ]);

        let pCount = 0;
        if (proyectosRes.ok) {
          const pData = await proyectosRes.json();
          pCount = pData.data?.length || 0;
        }

        let nCount = 0;
        if (notifRes.ok) {
          const nData = await notifRes.json();
          nCount = nData.filter(n => !n.leido).length;
        }

        setStats({ proyectos: pCount, notificaciones: nCount });
      } catch (err) {
        console.error("Error fetching dashboard stats", err);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  return (
    <div className="dashboard-container p-4">
      <header className="dashboard-header mb-4">
        <h1 className="fw-bold mb-1">¡Hola, {userName || "Usuario"}! 👋</h1>
        <p className="text-muted">Aquí tienes un resumen de tu actividad en ScrumTrack.</p>
      </header>

      {loading ? (
        <div className="d-flex justify-content-center p-5">
          <div className="spinner-border text-success" role="status"></div>
        </div>
      ) : (
        <div className="row g-4 mb-4">
          <div className="col-md-4">
            <div className="dashboard-card shadow-sm p-4 h-100 bg-white rounded-3">
              <div className="d-flex align-items-center mb-3">
                <div className="dashboard-icon-bg bg-primary-subtle text-primary p-3 rounded-circle me-3">
                  <FiFolder size={24} />
                </div>
                <h3 className="h5 mb-0 fw-semibold">Proyectos Activos</h3>
              </div>
              <p className="fs-2 fw-bold mb-0">{stats.proyectos}</p>
            </div>
          </div>
          
          <div className="col-md-4">
            <div className="dashboard-card shadow-sm p-4 h-100 bg-white rounded-3">
              <div className="d-flex align-items-center mb-3">
                <div className="dashboard-icon-bg bg-warning-subtle text-warning p-3 rounded-circle me-3">
                  <FiBell size={24} />
                </div>
                <h3 className="h5 mb-0 fw-semibold">Notificaciones Pendientes</h3>
              </div>
              <p className="fs-2 fw-bold mb-0">{stats.notificaciones}</p>
            </div>
          </div>

          <div className="col-md-4">
            <div className="dashboard-card shadow-sm p-4 h-100 bg-white rounded-3">
              <div className="d-flex align-items-center mb-3">
                <div className="dashboard-icon-bg bg-success-subtle text-success p-3 rounded-circle me-3">
                  <FiActivity size={24} />
                </div>
                <h3 className="h5 mb-0 fw-semibold">Acciones Rápidas</h3>
              </div>
              <div className="d-flex flex-column gap-2 mt-3">
                <Link to="/crear-proyecto" className="btn btn-outline-success d-flex align-items-center justify-content-center gap-2">
                  <FiPlus /> Nuevo Proyecto
                </Link>
                <Link to="/proyectos" className="btn btn-outline-secondary d-flex align-items-center justify-content-center gap-2">
                  <FiFolder /> Ver Mis Proyectos
                </Link>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
