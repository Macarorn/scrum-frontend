import { useEffect, useState } from "react";
import { Alert, Button, Card, Container, Spinner } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import { listarProyectos } from "../../services/proyectos.service";

export default function ProyectosOverview() {
  const navigate = useNavigate();
  const [proyectos, setProyectos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/login");
  };

  useEffect(() => {
    const cargarProyectos = async () => {
      try {
        const response = await listarProyectos();
        setProyectos(response.data || []);
      } catch (err) {
        setError(err.message || "No se pudieron cargar los proyectos");
      } finally {
        setLoading(false);
      }
    };

    cargarProyectos();
  }, []);

  return (
    <div className="min-vh-100 bg-light text-start">
      <Container fluid className="py-4 px-3 px-md-4">
        <div className="d-flex flex-column flex-sm-row align-items-sm-center justify-content-between gap-3 mb-4">
          <h1 className="h3 fw-bold text-success-emphasis mb-0">Proyectos</h1>
          <Button
            variant="outline-primary"
            onClick={handleLogout}
            className="fw-semibold align-self-start align-self-sm-auto"
          >
            Logout
          </Button>
        </div>

        {loading && (
          <div className="text-center py-5">
            <Spinner animation="border" role="status" />
          </div>
        )}

        {error && !loading && (
          <Alert variant="danger" role="alert">
            {error}
          </Alert>
        )}

        {!loading && !error && proyectos.length > 0 && (
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
              gap: "1rem",
            }}
          >
            {proyectos.map((proyecto) => (
              <Card
                key={proyecto.id_proyecto}
                className="shadow-sm border-0 w-100"
                style={{ minHeight: "120px", borderRadius: "16px" }}
              >
                <Card.Body className="d-flex align-items-center justify-content-center text-center p-4">
                  <Card.Title
                    as="h5"
                    className="mb-0 fw-semibold text-break"
                    style={{ color: "#183153", lineHeight: 1.2 }}
                  >
                    {proyecto.nombre}
                  </Card.Title>
                </Card.Body>
              </Card>
            ))}
          </div>
        )}

        {!loading && !error && proyectos.length === 0 && (
          <Alert variant="info" role="alert">
            Aún no hay proyectos creados.
          </Alert>
        )}
      </Container>
    </div>
  );
}
