import { useState } from "react";
import {
  Alert,
  Button,
  Card,
  Col,
  Container,
  Form,
  InputGroup,
  Row,
  Spinner,
} from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import { listarTodosProyectos } from "../../services/proyectos.service";
import { crearSolicitudIngreso } from "../../services/solicitudes.service";
import "../../styles/UnirseProyecto.css";

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

export default function UnirseProyecto() {
  const [searchQuery, setSearchQuery] = useState("");
  const [proyectos, setProyectos] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [searched, setSearched] = useState(false);
  const [joiningProjectId, setJoiningProjectId] = useState(null);
  const [mensajeSolicitud, setMensajeSolicitud] = useState("");
  const navigate = useNavigate();

  const handleSearch = async () => {
    if (!searchQuery.trim()) {
      setError("Por favor ingresa un nombre o código de proyecto");
      return;
    }

    setLoading(true);
    setError("");
    setSearched(true);

    try {
      const response = await listarTodosProyectos();
      const allProyectos = response.data || [];
      const query = searchQuery.trim().toLowerCase();

      const filtered = allProyectos.filter((proyecto) => {
        const nombre = proyecto.nombre?.toLowerCase() || "";
        const codigo = proyecto.codigo_proyecto?.toLowerCase() || "";
        const descripcion = proyecto.descripcion?.toLowerCase() || "";

        return (
          nombre.includes(query) ||
          codigo.includes(query) ||
          descripcion.includes(query)
        );
      });

      setProyectos(filtered);
    } catch (err) {
      setError(err.message || "Error al buscar proyectos");
      setProyectos([]);
    } finally {
      setLoading(false);
    }
  };

  const handleJoin = async (proyectoId) => {
    setError("");
    setSuccess("");
    setJoiningProjectId(proyectoId);

    try {
      await crearSolicitudIngreso({
        idProyecto: proyectoId,
        mensajeOpcional: mensajeSolicitud,
      });
      setSuccess(
        "Solicitud enviada correctamente. Te redirigimos al centro de notificaciones.",
      );
      setTimeout(() => {
        navigate("/notificaciones", {
          state: {
            flashType: "success",
            flashMessage:
              "Solicitud enviada correctamente. Espera la aprobación del administrador.",
          },
        });
      }, 700);
    } catch (err) {
      setError(err.message || "Error al unirse al proyecto");
    } finally {
      setJoiningProjectId(null);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter") {
      handleSearch();
    }
  };

  return (
    <div className="unirse-page">
      <Container fluid className="py-4 px-3 px-md-4">
        <div className="unirse-header mb-4">
          <div>
            <h1 className="unirse-title mb-1">Unirse a un Proyecto</h1>
            <p className="unirse-description mb-0">
              Busca proyectos por nombre o código único
            </p>
          </div>
        </div>

        <Row className="justify-content-center">
          <Col lg={10} xl={8}>
            <Card className="filtro-card shadow-sm border-0 mb-4">
              <Card.Body className="p-4">
                <h5 className="mb-3">Buscar proyectos</h5>
                <InputGroup className="mb-3">
                  <Form.Control
                    type="text"
                    placeholder="Nombre o código del proyecto..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onKeyPress={handleKeyPress}
                    className="form-control-lg"
                  />
                  <Button
                    variant="success"
                    size="lg"
                    onClick={handleSearch}
                    disabled={loading}
                    className="px-4"
                  >
                    {loading ? (
                      <Spinner animation="border" size="sm" />
                    ) : (
                      "Buscar"
                    )}
                  </Button>
                </InputGroup>

                {error && (
                  <Alert variant="danger" className="mb-0">
                    {error}
                  </Alert>
                )}

                {success && (
                  <Alert variant="success" className="mb-0">
                    {success}
                  </Alert>
                )}

                <Form.Group className="mt-3">
                  <Form.Label>Mensaje opcional para la solicitud</Form.Label>
                  <Form.Control
                    as="textarea"
                    rows={3}
                    placeholder="Cuéntale al administrador por qué quieres unirte al proyecto"
                    value={mensajeSolicitud}
                    onChange={(e) => setMensajeSolicitud(e.target.value)}
                  />
                </Form.Group>
              </Card.Body>
            </Card>

            {searched && !loading && proyectos.length === 0 && !error && (
              <Alert variant="info" className="shadow-sm text-center">
                No se encontraron proyectos que coincidan con tu búsqueda.
              </Alert>
            )}

            {searched && !loading && proyectos.length > 0 && (
              <div className="proyectos-grid">
                {proyectos.map((proyecto) => (
                  <Card
                    key={proyecto.id_proyecto}
                    className="proyecto-card shadow-sm"
                  >
                    <Card.Body className="d-flex flex-column h-100">
                      <div className="d-flex justify-content-between align-items-start mb-3">
                        <div>
                          <Card.Title className="mb-1 proyecto-nombre">
                            {proyecto.nombre}
                          </Card.Title>
                          <Card.Text className="text-muted mb-2 proyecto-type">
                            {proyecto.tipo || "Tipo no definido"}
                          </Card.Text>
                        </div>
                        <span
                          className={`badge ${
                            proyecto.estado === "activo"
                              ? "bg-success"
                              : proyecto.estado === "pausado"
                                ? "bg-warning"
                                : proyecto.estado === "completado"
                                  ? "bg-info"
                                  : "bg-secondary"
                          }`}
                        >
                          {proyecto.estado || "Sin estado"}
                        </span>
                      </div>

                      <Card.Text className="proyecto-descripcion mb-3">
                        {proyecto.descripcion || "Sin descripción disponible."}
                      </Card.Text>

                      <div className="mt-auto proyecto-meta">
                        <div>
                          <strong>Código:</strong>{" "}
                          {proyecto.codigo_proyecto || "N/A"}
                        </div>
                        <div>
                          <strong>Inicio:</strong>{" "}
                          {parseFecha(proyecto.fecha_inicio)}
                        </div>
                        <div>
                          <strong>Fin estimado:</strong>{" "}
                          {parseFecha(proyecto.fecha_fin_est)}
                        </div>
                      </div>

                      <Button
                        className="mt-4 align-self-start btn-unirse-proyecto"
                        variant={
                          proyecto.es_miembro ? "secondary" : "outline-success"
                        }
                        onClick={() => handleJoin(proyecto.id_proyecto)}
                        disabled={
                          proyecto.es_miembro ||
                          joiningProjectId === proyecto.id_proyecto
                        }
                      >
                        {proyecto.es_miembro
                          ? "Ya eres miembro"
                          : joiningProjectId === proyecto.id_proyecto
                            ? "Uniendo..."
                            : "Solicitar unirse"}
                      </Button>
                    </Card.Body>
                  </Card>
                ))}
              </div>
            )}
          </Col>
        </Row>
      </Container>
    </div>
  );
}
