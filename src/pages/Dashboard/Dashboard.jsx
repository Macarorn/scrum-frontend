import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { FiPlus, FiFolder, FiBell, FiSearch, FiMoreHorizontal } from "react-icons/fi";
import { getAccessToken } from "../../services/auth.service";
import API_URL from "../../services/api";
import powerbiService from "../../components/powerbi/powerbiService";
import PowerBICharts from "../../components/powerbi/PowerBICharts";
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
  const [powerbiData, setPowerbiData] = useState(null);
  const [powerbiLoading, setPowerbiLoading] = useState(true);
  const [powerbiError, setPowerbiError] = useState(null);
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

    const fetchPowerBIData = async () => {
      try {
        setPowerbiError(null);
        setPowerbiLoading(true);
        const data = await powerbiService.getAllData();
        setPowerbiData(data);
      } catch (err) {
        console.error("Error fetching Power BI data", err);
        setPowerbiError(err.message || "No se pudo cargar la información de métricas");
      } finally {
        setPowerbiLoading(false);
      }
    };

    fetchData();
    fetchPowerBIData();
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
        <div className="dash-v2-simple-layout" style={{ display: "flex", flexDirection: "column", gap: "24px", maxWidth: "1200px" }}>
          
          {/* Top Row: Quick Actions */}
          <div className="dash-actions-row" style={{ display: "flex", gap: "16px", flexWrap: "wrap" }}>
            <button className="dash-v2-upgrade" style={{ display: "flex", alignItems: "center", gap: "8px", padding: "12px 24px" }} onClick={() => navigate("/crear-proyecto")}>
              <FiPlus size={18} /> Nuevo Proyecto
            </button>
            <button className="dash-v2-upgrade" style={{ background: "#ffffff", color: "var(--text-main)", border: "1px solid #e2e8f0", boxShadow: "0 2px 8px rgba(0,0,0,0.02)", display: "flex", alignItems: "center", gap: "8px", padding: "12px 24px" }} onClick={() => navigate("/proyectos")}>
              <FiFolder size={18} /> Ver Proyectos
            </button>
            <button className="dash-v2-upgrade" style={{ background: "#ffffff", color: "var(--text-main)", border: "1px solid #e2e8f0", boxShadow: "0 2px 8px rgba(0,0,0,0.02)", display: "flex", alignItems: "center", gap: "8px", padding: "12px 24px" }} onClick={() => navigate("/notificaciones")}>
              <FiBell size={18} /> Notificaciones ({notificaciones.length})
            </button>
          </div>

          {/* Main Card: Mis Proyectos */}
          <div className="dash-v2-card dash-list-card">
            <div className="list-card-header" style={{ marginBottom: "20px" }}>
              <h3 style={{ fontSize: "20px", fontWeight: "700", margin: 0 }}>Mis Proyectos Activos</h3>
            </div>
            <div className="list-card-body">
              {proyectos.length === 0 ? (
                <p className="no-data-text" style={{ color: "var(--text-soft)", fontStyle: "italic" }}>No tienes proyectos aún.</p>
              ) : (
                proyectos.slice(0, 5).map((p, idx) => (
                  <div className="list-item" key={p.id_proyecto || idx} style={{ display: "flex", alignItems: "center", padding: "16px 20px", background: "#ffffff", border: "1px solid #f1f5f9", borderRadius: "16px", marginBottom: "12px", boxShadow: "0 2px 5px rgba(0,0,0,0.01)" }}>
                    <div className="item-avatar" style={{ width: "42px", height: "42px", borderRadius: "12px", background: "var(--primary)", color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "18px", fontWeight: "bold", marginRight: "16px" }}>
                      {p.nombre.charAt(0).toUpperCase()}
                    </div>
                    <div className="item-info" style={{ flexGrow: 1 }}>
                      <h4 style={{ margin: "0 0 4px 0", fontSize: "16px", fontWeight: "700", color: "var(--text-main)" }}>{p.nombre}</h4>
                      <p style={{ margin: 0, fontSize: "14px", color: "var(--text-soft)" }}>{p.descripcion || "Sin descripción"}</p>
                    </div>
                    <div className="item-status">
                      <span style={{ padding: "6px 12px", background: "#f1f5f9", color: "var(--text-secondary)", borderRadius: "20px", fontSize: "13px", fontWeight: "600", textTransform: "capitalize" }}>
                        {p.estado || "Activo"}
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>
            {proyectos.length > 5 && (
              <div style={{ marginTop: "16px", textAlign: "center" }}>
                <button onClick={() => navigate("/proyectos")} style={{ background: "transparent", border: "none", color: "var(--primary)", fontWeight: "700", cursor: "pointer", padding: "8px" }}>
                  Ver todos los proyectos →
                </button>
              </div>
            )}
          </div>

          <div className="dash-v2-card dash-list-card">
            <div className="list-card-header" style={{ marginBottom: "20px" }}>
              <h3 style={{ fontSize: "20px", fontWeight: "700", margin: 0 }}>Indicadores de Power BI</h3>
            </div>
            <div className="list-card-body" style={{ gap: "24px" }}>
              {powerbiLoading ? (
                <div className="dash-v2-loader">
                  <div className="spinner-border text-success" role="status"></div>
                </div>
              ) : powerbiError ? (
                <div style={{ padding: "20px", background: "#fff5f5", borderRadius: "16px", color: "#842029", border: "1px solid #f5c2c7" }}>
                  <h4 style={{ margin: 0, fontWeight: 700 }}>Error cargando métricas</h4>
                  <p style={{ margin: "8px 0 0" }}>{powerbiError}</p>
                </div>
              ) : (
                <>
                  <div className="dash-v2-small-cards" style={{ gridTemplateColumns: "repeat(3, minmax(0, 1fr))", gap: "20px" }}>
                    <div className="mini-card" style={{ padding: "24px", borderRadius: "24px", background: "#ffffff", boxShadow: "0 8px 30px rgba(0,0,0,0.05)" }}>
                      <div className="mini-card-text">
                        <h3>Proyectos</h3>
                        <p>{powerbiData?.proyectos?.length ?? 0} proyectos registrados</p>
                      </div>
                      <div className="pencil-icon">📁</div>
                    </div>
                    <div className="mini-card" style={{ padding: "24px", borderRadius: "24px", background: "#ffffff", boxShadow: "0 8px 30px rgba(0,0,0,0.05)" }}>
                      <div className="mini-card-text">
                        <h3>Sprints</h3>
                        <p>{powerbiData?.sprints?.length ?? 0} sprints totales</p>
                      </div>
                      <div className="pencil-icon">⏱️</div>
                    </div>
                    <div className="mini-card" style={{ padding: "24px", borderRadius: "24px", background: "#ffffff", boxShadow: "0 8px 30px rgba(0,0,0,0.05)" }}>
                      <div className="mini-card-text">
                        <h3>Épicas</h3>
                        <p>{powerbiData?.epicas?.length ?? 0} épicas registradas</p>
                      </div>
                      <div className="pencil-icon">🏷️</div>
                    </div>
                  </div>

                  <div className="dash-v2-small-cards" style={{ gridTemplateColumns: "repeat(3, minmax(0, 1fr))", gap: "20px", marginTop: "20px" }}>
                    <div className="mini-card" style={{ padding: "24px", borderRadius: "24px", background: "#ffffff", boxShadow: "0 8px 30px rgba(0,0,0,0.05)" }}>
                      <div className="mini-card-text">
                        <h3>Historias</h3>
                        <p>{powerbiData?.historias?.length ?? 0} historias de usuario</p>
                      </div>
                      <div className="pencil-icon">📘</div>
                    </div>
                    <div className="mini-card" style={{ padding: "24px", borderRadius: "24px", background: "#ffffff", boxShadow: "0 8px 30px rgba(0,0,0,0.05)" }}>
                      <div className="mini-card-text">
                        <h3>Tareas</h3>
                        <p>{powerbiData?.tareas?.length ?? 0} tareas totales</p>
                      </div>
                      <div className="pencil-icon">✅</div>
                    </div>
                    <div className="mini-card" style={{ padding: "24px", borderRadius: "24px", background: "#ffffff", boxShadow: "0 8px 30px rgba(0,0,0,0.05)" }}>
                      <div className="mini-card-text">
                        <h3>Usuarios</h3>
                        <p>{powerbiData?.usuarios?.length ?? 0} usuarios activos</p>
                      </div>
                      <div className="pencil-icon">👥</div>
                    </div>
                  </div>

                  <div style={{ marginTop: "32px" }}>
                    <PowerBICharts data={powerbiData} loading={powerbiLoading} error={powerbiError} />
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
