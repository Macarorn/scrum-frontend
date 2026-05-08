import { useEffect, useState } from "react";
import { Alert, Button, Card, Container, Spinner } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import { clearSessionTokens } from "../../services/auth.service";
import { listarProyectos } from "../../services/proyectos.service";
import "../../styles/ProyectosOverview.css";

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

  useEffect(() => {
    const cargarProyectos = async () => {
      try {
        const response = await listarProyectos();
        setProyectos(response.data || []);
      } catch (err) {
        if (err.code === "UNAUTHENTICATED") {
          clearSessionTokens();
          navigate("/login", { replace: true });
          return;
        }

        setError(err.message || "No se pudieron cargar los proyectos");
      } finally {
        setLoading(false);
      }
    };

    cargarProyectos();
  }, [navigate]);

  const handleAcceder = (proyectoId) => {
    navigate(`/detalles_de_proyecto/${proyectoId}`);
  };

  return (
    <div className="proyectos-overview-page">
      <Container fluid className="py-4 px-3 px-md-4">
        <div className="proyectos-overview-header">
          <div className="text-start">
            <h1 className="proyectos-overview-title mb-1">Proyectos</h1>
            <p className="proyectos-overview-description mb-0">
              Accede a tus proyectos creados
            </p>
          </div>
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
        </div>

        {loading && (
          <div className="text-center py-5">
            <Spinner animation="border" role="status" />
          </div>
        )}

        {error && !loading && (
          <Alert variant="danger" className="shadow-sm">
            {error}
          </Alert>
        )}

        {!loading && !error && proyectos.length === 0 && (
          <Alert variant="info" className="shadow-sm">
            Aún no hay proyectos creados, ni te has unido a alguno. ¡Crea tu primer proyecto o espera a que te agreguen a uno!
          </Alert>
        )}

        {!loading && !error && proyectos.length > 0 && (
          <div className="proyectos-overview-cards-grid">
            {proyectos.map((proyecto) => (
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
                <Card.Body className="d-flex flex-column align-items-center h-100 p-4 text-center">
                  <Card.Title className="mb-1 proyectos-overview-card-nombre">
                    {proyecto.nombre}
                  </Card.Title>
                  <Card.Text className="mb-3 proyectos-overview-card-tipo">
                    {proyecto.tipo || "Tipo no definido"}
                  </Card.Text>
                  
                  <span className={`badge mb-3 proyectos-overview-estado-badge ${
                    proyecto.estado === "activo" ? "bg-success" :
                    proyecto.estado === "pausado" ? "bg-warning" :
                    proyecto.estado === "completado" ? "bg-info" : "bg-secondary"
                  }`}>
                    {proyecto.estado || "Sin estado"}
                  </span>

                  <Card.Text className="proyectos-overview-card-descripcion mb-4">
                    {proyecto.descripcion || "Sin descripción disponible."}
                  </Card.Text>

                  <div className="mt-auto proyectos-overview-meta w-100">
                    <div className="meta-item justify-content-center">
                      <span className="meta-label me-2">Código:</span> 
                      <span className="meta-value">{proyecto.codigo_proyecto || "N/A"}</span>
                    </div>
                    <div className="meta-item justify-content-center">
                      <span className="meta-label me-2">Inicio:</span> 
                      <span className="meta-value">{parseFecha(proyecto.fecha_inicio)}</span>
                    </div>
                    <div className="meta-item justify-content-center">
                      <span className="meta-label me-2">Fin:</span> 
                      <span className="meta-value">{parseFecha(proyecto.fecha_fin_est)}</span>
                    </div>
                  </div>
                </Card.Body>
              </Card>
            ))}
          </div>
        )}
      </Container>
    </div>
  );
}