import { useState } from "react";
import {
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
import { showError, showSuccess, showWarning } from "../../utils/alerts";

export default function CrearProyectoForm() {
  const navigate = useNavigate();
  const [nombre, setNombre] = useState("");
  const [descripcion, setDescripcion] = useState("");
  const [tipo, setTipo] = useState("");
  const [fechaInicio, setFechaInicio] = useState("");
  const [fechaFinEst, setFechaFinEst] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [, setSuccess] = useState("");

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");
    setSuccess("");

    const fechaVacia = !fechaInicio || !fechaFinEst;
    const camposFaltantes = !nombre || !descripcion || !tipo;

    if (fechaVacia && camposFaltantes) {
      showWarning("Todos los campos son obligatorios");
      return;
    }

    if (fechaVacia) {
      showError("La fecha es obligatoria");
      return;
    }

    if (camposFaltantes) {
      const message =
        "Por favor completa el nombre, descripción y tipo de proyecto.";
      setError(message);
      showWarning("Todos los campos son obligatorios");
      return;
    }

    if (nombre.length < 3) {
      const message = "El nombre debe tener al menos 3 caracteres";
      setError(message);
      showWarning(message);
      return;
    }

    if (fechaInicio && fechaFinEst && fechaInicio > fechaFinEst) {
      const message = "La fecha de fin debe ser posterior a la fecha de inicio";
      setError(message);
      showError(message);
      return;
    }

    const payload = {
      nombre,
      descripcion,
      tipo,
      estado: "inicio",
      fecha_inicio: fechaInicio || null,
      fecha_fin_est: fechaFinEst || null,
    };

    setLoading(true);

    try {
      const response = await crearProyecto(payload);

      if (response.success) {
        const message = "¡Proyecto creado exitosamente!";

        setSuccess(message);
        showSuccess(message);

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

      const message =
        err.message || "Error al crear el proyecto. Intenta de nuevo.";

      setError(message);
      showError(message);
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
                {/* Icono Principal */}
                <div className="icon-circle mb-2">
                  <svg
                    width="60"
                    height="60"
                    viewBox="0 0 60 60"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <circle cx="30" cy="30" r="30" fill="#39a900" />
                    <path
                      d="M25 32L28 35L38 22"
                      stroke="white"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </div>

                {/* Títulos */}
                <h1 className="welcome-title mb-1">Crear Proyecto</h1>
                <p className="welcome-subtitle text-muted mb-3">
                  Completa los datos básicos para iniciar tu proyecto.
                </p>

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
                        <Form.Select
                          value={tipo}
                          onChange={(e) => setTipo(e.target.value)}
                          className="shadow-sm"
                          disabled={loading}
                        >
                          <option value="">Selecciona un tipo</option>
                          <option value="Desarrollo de software">
                            Desarrollo de software
                          </option>
                          <option value="Diseño UX/UI">Diseño UX/UI</option>
                          <option value="Migración de datos">
                            Migración de datos
                          </option>
                          <option value="Implementación Scrum">
                            Implementación Scrum
                          </option>
                        </Form.Select>
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
