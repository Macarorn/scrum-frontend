import { useEffect, useState } from "react";
import { useLocation, useNavigate, useParams, useSearchParams } from "react-router-dom";
import "../../styles/Epicas.css";
import { clearSessionTokens } from "../../services/auth.service";
import { obtenerEpica } from "../../services/epicas.service";
import { listarHistoriasPorEpica } from "../../services/historias.service";

export default function EpicaDetalle() {
  const navigate = useNavigate();
  const location = useLocation();
  const { idEpica } = useParams();
  const [searchParams] = useSearchParams();

  const [epica, setEpica] = useState(null);
  const [historias, setHistorias] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [toastMessage, setToastMessage] = useState("");

  const idProyecto = searchParams.get("id_proyecto") || "";

  const handleAuthError = () => {
    clearSessionTokens();
    navigate("/login", { replace: true });
  };

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      setError("");

      try {
        const [epicaData, historiasData] = await Promise.all([
          obtenerEpica(idEpica),
          listarHistoriasPorEpica(idEpica),
        ]);

        setEpica(epicaData);
        setHistorias(historiasData || []);
      } catch (err) {
        if (err.code === "UNAUTHENTICATED") {
          handleAuthError();
          return;
        }
        setError(err.message || "No se pudo cargar el detalle de la epica");
      } finally {
        setLoading(false);
      }
    };

    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [idEpica]);

  useEffect(() => {
    const message = location.state?.toastMessage;
    if (!message) return;

    setToastMessage(message);
    const timeout = setTimeout(() => {
      setToastMessage("");
      navigate(location.pathname + location.search, { replace: true, state: {} });
    }, 2600);

    return () => clearTimeout(timeout);
  }, [location.pathname, location.search, location.state, navigate]);

  if (loading) {
    return (
      <section className="epicas-page">
        <p className="epicas-placeholder">Cargando epica...</p>
      </section>
    );
  }

  if (error) {
    return (
      <section className="epicas-page">
        <p className="epicas-error">{error}</p>
      </section>
    );
  }

  if (!epica) {
    return (
      <section className="epicas-page">
        <p className="epicas-placeholder">Epica no encontrada.</p>
      </section>
    );
  }

  return (
    <section className="epicas-page">
      <header className="epicas-header">
        <div>
          <h1>Epicas</h1>
          <p>{epica.nombre}</p>
        </div>
        <div className="epicas-form-buttons">
          <button
            type="button"
            className="btn-soft"
            onClick={() => navigate(`/epicas?id_proyecto=${idProyecto}`)}
          >
            Volver
          </button>
        </div>
      </header>

      <div className="epica-detail-layout">
        <article className="epica-detail-card">
          <h2>{epica.nombre}</h2>
          <div className="epica-detail-field">
            <strong>Descripcion</strong>
            <p>{epica.descripcion || "Sin descripcion"}</p>
          </div>
          <div className="epica-detail-field">
            <strong>Categoria</strong>
            <p>{epica.categoria || "Sin categoria"}</p>
          </div>
          <div className="epica-detail-field">
            <strong>Prioridad</strong>
            <p>{epica.prioridad || 3}</p>
          </div>
          <div className="epica-detail-field">
            <strong>Estado</strong>
            <p>{epica.estado || "por_hacer"}</p>
          </div>
        </article>

        <section className="epica-historias-card">
          <h3>Historias de usuario</h3>
          {historias.length === 0 ? (
            <p className="epicas-placeholder">No hay historias asociadas.</p>
          ) : (
            <div className="historias-list">
              {historias.map((historia) => (
                <button
                  key={historia.id}
                  type="button"
                  className="historia-item"
                  onClick={() =>
                    navigate(`/historias/${historia.id}?id_epica=${epica.id}&id_proyecto=${idProyecto}`)
                  }
                >
                  <span>{historia.nombre}</span>
                  <small>#{historia.id}</small>
                </button>
              ))}
            </div>
          )}
        </section>
      </div>

      {toastMessage && (
        <div className="epica-toast" role="status" aria-live="polite">
          <div className="epica-toast-text">{toastMessage}</div>
          <span className="epica-toast-icon" aria-hidden="true">✓</span>
        </div>
      )}
    </section>
  );
}
