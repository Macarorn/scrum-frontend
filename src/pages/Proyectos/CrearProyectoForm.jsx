import { useState } from "react";
import {
  Alert,
  Button,
  Card,
  Col,
  Container,
  Form,
  Row,
  Spinner,
} from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import { clearSessionTokens } from "../../services/auth.service";
import { crearProyecto } from "../../services/proyectos.service";
import "../../styles/CrearProyectoForm.css";

export default function CrearProyectoForm() {
  const navigate = useNavigate();
  const [nombre, setNombre] = useState("");
  const [descripcion, setDescripcion] = useState("");
  const [tipo, setTipo] = useState("");
  const [isTipoOpen, setIsTipoOpen] = useState(false);
  const [fechaInicio, setFechaInicio] = useState("");
  const [fechaFinEst, setFechaFinEst] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");
    setSuccess("");

    if (!nombre || !descripcion || !tipo) {
      setError("Por favor completa el nombre, descripción y tipo de proyecto.");
      return;
    }

    if (nombre.length < 3) {
      setError("El nombre debe tener al menos 3 caracteres");
      return;
    }

    if (fechaInicio && fechaFinEst && fechaInicio > fechaFinEst) {
      setError(
        "La fecha de fin estimada debe ser igual o posterior a la fecha de inicio.",
      );
      return;
    }

    setLoading(true);

    try {
      const response = await crearProyecto({
        nombre,
        descripcion,
        tipo,
        estado: "inicio",
        fecha_inicio: fechaInicio || null,
        fecha_fin_est: fechaFinEst || null,
      });

      if (response.success) {
        setSuccess("¡Proyecto creado exitosamente!");
        setTimeout(() => {
          navigate("/proyectos");
        }, 1500);
      }
    } catch (err) {
      if (err.code === "UNAUTHENTICATED") {
        clearSessionTokens();
        navigate("/login", { replace: true });
        return;
      }

      setError(err.message || "Error al crear el proyecto. Intenta de nuevo.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="scrum-form-container">
      <Container className="form-content">
        <Row className="justify-content-center align-items-center">
          <Col lg={12} md={12} xs={12}>
            <Card className="form-card shadow-lg border-0">
              <Card.Body className="text-center p-2 d-flex flex-column justify-content-between h-100">
                {/* Títulos */}
                <h1 className="welcome-title mb-1">Crear Proyecto</h1>
                <p className="welcome-subtitle text-muted mb-3">
                  Completa los datos básicos para iniciar tu proyecto.
                </p>

                {error && (
                  <Alert variant="danger" className="mb-4" role="alert">
                    {error}
                  </Alert>
                )}

                {success && (
                  <Alert variant="success" className="mb-4" role="alert">
                    {success}
                  </Alert>
                )}

                <Form onSubmit={handleSubmit} className="form-proyectos">
                  <Row className="gx-4 gy-4 align-items-end">
                    <Col md={12}>
                      <Form.Group
                        className="form-group"
                        controlId="nombreProyecto"
                      >
                        <Form.Label>Nombre del proyecto</Form.Label>
                        <Form.Control
                          type="text"
                          placeholder="Escribe un nombre"
                          value={nombre}
                          onChange={(e) => setNombre(e.target.value)}
                          className="shadow-sm"
                          disabled={loading}
                        />
                        <small className="text-muted">
                          Mínimo 3 caracteres
                        </small>
                      </Form.Group>
                    </Col>

                    <Col md={12}>
                      <Form.Group
                        className="form-group"
                        controlId="descripcionProyecto"
                      >
                        <Form.Label>Descripción del proyecto</Form.Label>
                        <Form.Control
                          as="textarea"
                          rows={3}
                          placeholder="Describe el objetivo y alcance del proyecto"
                          value={descripcion}
                          onChange={(e) => setDescripcion(e.target.value)}
                          className="shadow-sm"
                          disabled={loading}
                        />
                      </Form.Group>
                    </Col>

                    <Col md={6}>
                      <Form.Group
                        className="form-group"
                        controlId="tipoProyecto"
                      >
                        <Form.Label>Tipo de proyecto</Form.Label>
                        <div className="custom-dropdown-container">
                          <div 
                            className={`custom-dropdown-header ${isTipoOpen ? "open" : ""} ${tipo ? "selected" : ""}`}
                            onClick={() => !loading && setIsTipoOpen(!isTipoOpen)}
                          >
                            <span>{tipo || "Selecciona un tipo"}</span>
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={`dropdown-arrow ${isTipoOpen ? "open" : ""}`}>
                              <polyline points="6 9 12 15 18 9"></polyline>
                            </svg>
                          </div>
                          {isTipoOpen && (
                            <div className="custom-dropdown-menu">
                              {[
                                { value: "", label: "Selecciona un tipo" },
                                { value: "Desarrollo de software", label: "Desarrollo de software" },
                                { value: "Diseño UX/UI", label: "Diseño UX/UI" },
                                { value: "Migración de datos", label: "Migración de datos" },
                                { value: "Implementación Scrum", label: "Implementación Scrum" }
                              ].map((opcion) => (
                                <div
                                  key={opcion.value}
                                  className={`custom-dropdown-item ${tipo === opcion.value ? "active" : ""}`}
                                  onClick={() => {
                                    setTipo(opcion.value);
                                    setIsTipoOpen(false);
                                  }}
                                >
                                  {opcion.label}
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      </Form.Group>
                    </Col>

                    <Col md={6}>
                      <Form.Group
                        className="form-group"
                        controlId="fechaInicio"
                      >
                        <Form.Label>Fecha de inicio</Form.Label>
                        <Form.Control
                          type="date"
                          value={fechaInicio}
                          onChange={(e) => setFechaInicio(e.target.value)}
                          className="shadow-sm"
                          disabled={loading}
                        />
                      </Form.Group>
                    </Col>

                    <Col md={6}>
                      <Form.Group
                        className="form-group"
                        controlId="fechaFinEst"
                      >
                        <Form.Label>Fecha estimada de fin</Form.Label>
                        <Form.Control
                          type="date"
                          value={fechaFinEst}
                          onChange={(e) => setFechaFinEst(e.target.value)}
                          className="shadow-sm"
                          disabled={loading}
                        />
                      </Form.Group>
                    </Col>

                    <Col md={12} className="text-end">
                      <Button
                        type="submit"
                        className="btn-siguiente px-5 py-3"
                        disabled={loading}
                      >
                        {loading ? (
                          <>
                            <Spinner
                              as="span"
                              animation="border"
                              size="sm"
                              role="status"
                              aria-hidden="true"
                              className="me-2"
                            />
                            Creando...
                          </>
                        ) : (
                          <>Crear</>
                        )}
                      </Button>
                    </Col>
                  </Row>
                </Form>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      </Container>
    </div>
  );
}
