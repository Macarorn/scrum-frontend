import { useEffect, useState } from "react";
import { Button, Card, Container, Spinner, Form, Row, Col } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import { clearSessionTokens, isCoordinador } from "../../services/auth.service";
import { listarProyectos, listarTodosProyectos } from "../../services/proyectos.service";
import SkeletonLoader from "../../components/SkeletonLoader";
import "../../styles/ProyectosOverview.css";
import { showError, showInfo } from "../../utils/alerts";

const parseFecha = (fecha) => {
  if (!fecha) return "No disponible";
  const fechaObj = new Date(fecha);
  if (Number.isNaN(fechaObj.getTime())) return fecha;
  return fechaObj.toLocaleDateString("es-ES", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
};

export default function ProyectosOverview() {
  const navigate = useNavigate();
  const [proyectos, setProyectos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [grupoFilter, setGrupoFilter] = useState("");
  const esCoordinador = isCoordinador();

  useEffect(() => {
    const cargarProyectos = async () => {
      try {
        const response = esCoordinador ? await listarTodosProyectos() : await listarProyectos();
        const items = response.data || [];
        setProyectos(items);
        if (items.length === 0) {
          showInfo(esCoordinador ? "No hay proyectos en la plataforma." : "Aún no hay proyectos creados, ni te has unido a alguno.");
        }
      } catch (err) {
        if (err.code === "UNAUTHENTICATED") {
          clearSessionTokens();
          navigate("/login", { replace: true });
          return;
        }

        const message = err.message || "No se pudieron cargar los proyectos";
        setError(message);
        showError(message);
      } finally {
        setLoading(false);
      }
    };

    cargarProyectos();
  }, [navigate, esCoordinador]);

  const handleAcceder = (proyectoId) => {
    navigate(`/detalles_de_proyecto/${proyectoId}`);
  };

  const proyectosFiltrados = grupoFilter
    ? proyectos.filter((p) => {
        const term = grupoFilter.toLowerCase();
        return (p.nombre && p.nombre.toLowerCase().includes(term)) ||
               (p.numero_ficha && p.numero_ficha.includes(term));
      })
    : proyectos;

  return (
    <div className="proyectos-overview-page">
      <Container fluid className="pt-2 pb-4 px-3 px-md-4">
        <div className="proyectos-overview-header">
          <div className="text-start">
            <h1 className="proyectos-overview-title mb-1">Proyectos</h1>
            <p className="proyectos-overview-description mb-0">
              {esCoordinador ? "Panel de supervisión - Todos los proyectos" : "Accede a tus proyectos creados"}
            </p>
          </div>
          <div className="proyectos-overview-header-right">
            {esCoordinador && proyectos.length > 0 && (
              <Form.Control
                type="text"
                placeholder="Buscar por nombre o grupo..."
                value={grupoFilter}
                onChange={(e) => setGrupoFilter(e.target.value)}
                className="proyectos-search-input"
              />
            )}
            {!esCoordinador && (
              <div className="proyectos-overview-actions">
                <Button
                  variant="outline-success"
                  onClick={() => navigate("/unirse-proyecto")}
                >
                  Unirse a proyecto
                </Button>
                <Button
                  variant="success"
                  onClick={() => navigate("/crear-proyecto-form")}
                >
                  Nuevo proyecto
                </Button>
              </div>
            )}
          </div>
        </div>

        {loading && <SkeletonLoader variant="card" count={3} />}

        {!loading && !error && proyectosFiltrados.length > 0 && (
          <div className="proyectos-overview-cards-grid">
            {proyectosFiltrados.map((proyecto) => (
              <Card
                key={proyecto.id_proyecto}
                className="proyectos-overview-card shadow-sm"
                role="button"
                tabIndex={0}
                onClick={() => handleAcceder(proyecto.id_proyecto)}
                onKeyDown={(event) => {
                  if (event.key === "Enter" || event.key === " ") {
                    event.preventDefault();
                    handleAcceder(proyecto.id_proyecto);
                  }
                }}
                aria-label={`Abrir detalles del proyecto ${proyecto.nombre}`}
              >
                <Card.Body className="d-flex flex-column h-100 p-4">
                  <div className="d-flex align-items-center mb-4">
                    <div className="project-card-icon">
                      {proyecto.nombre.slice(0, 1).toUpperCase()}
                    </div>
                    <div className="ms-3">
                      <div className="d-flex align-items-center gap-2">
                        <Card.Title className="proyectos-overview-card-nombre m-0">
                          {proyecto.nombre}
                        </Card.Title>
                      </div>
                      <div className="proyectos-overview-card-tipo">
                        {proyecto.tipo || "Desarrollo de software"}
                      </div>
                    </div>
                  </div>

                  <Card.Text className="proyectos-overview-card-descripcion mb-4">
                    {proyecto.descripcion || "Sistema de gestión de proyectos con metodología Scrum para equipos ágiles."}
                  </Card.Text>

                  <div className="mt-auto project-data-grid">
                    <div className="data-box">
                      <span className="label">CÓDIGO</span>
                      <span className="val">{proyecto.codigo_proyecto || "SCRUM001"}</span>
                    </div>
                    {esCoordinador && (
                      <div className="data-box">
                        <span className="label">GRUPO</span>
                        <span className="val">{proyecto.numero_ficha || "-"}</span>
                      </div>
                    )}
                    <div className="data-box">
                      <span className="label">INICIO</span>
                      <span className="val">{parseFecha(proyecto.fecha_inicio)}</span>
                    </div>
                    {esCoordinador && (
                      <div className="data-box">
                        <span className="label">ESTADO</span>
                        <span className="val">{proyecto.estado || "activo"}</span>
                      </div>
                    )}
                    {esCoordinador && (
                      <div className="data-box" style={{ gridColumn: "span 2" }}>
                        <span className="label">PRODUCT OWNER</span>
                        <span className="val">{proyecto.creador_nombre || proyecto.creador_email || "N/A"}</span>
                      </div>
                    )}
                    {!esCoordinador && (
                      <div className="data-box">
                        <span className="label">ENTREGA</span>
                        <span className="val">{parseFecha(proyecto.fecha_fin_est)}</span>
                      </div>
                    )}
                  </div>
                </Card.Body>
              </Card>
            ))}
          </div>
        )}

        {!loading && !error && proyectosFiltrados.length === 0 && proyectos.length > 0 && (
          <div className="text-center py-4 text-muted">
            No hay proyectos que coincidan con el filtro "{grupoFilter}"
          </div>
        )}

        {!loading && !error && proyectos.length === 0 && (
          <div className="proyectos-empty-state text-center py-5">
            <div className="empty-state-icon mb-4">
              <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" style={{ color: "var(--primary)" }}>
                <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
                <line x1="9" y1="9" x2="15" y2="9" />
                <line x1="9" y1="13" x2="15" y2="13" />
                <line x1="9" y1="17" x2="13" y2="17" />
              </svg>
            </div>
            <h2 className="empty-state-title fs-3 fw-bold mb-2">No tienes proyectos activos</h2>
            <p className="empty-state-text text-muted mb-4 mx-auto" style={{ maxWidth: "480px" }}>
              {esCoordinador 
                ? "No hay proyectos registrados en la plataforma en este momento." 
                : "Aún no has creado ningún proyecto ni te has unido a uno existente. ¡Comienza ahora!"}
            </p>
            {!esCoordinador && (
              <div className="d-flex justify-content-center gap-3">
                <Button variant="outline-success" size="lg" onClick={() => navigate("/unirse-proyecto")}>
                  Unirse a un proyecto
                </Button>
                <Button variant="success" size="lg" onClick={() => navigate("/crear-proyecto-form")}>
                  Crear nuevo proyecto
                </Button>
              </div>
            )}
          </div>
        )}
      </Container>
    </div>
  );
}
