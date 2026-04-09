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
import { crearProyecto } from "../../services/proyectos.service";
import "../../styles/CrearProyectoForm.css";

export default function CrearProyectoForm() {
  const navigate = useNavigate();
  const [numIntegrantes, setNumIntegrantes] = useState("");
  const [nombre, setNombre] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");
    setSuccess("");

    if (!numIntegrantes || !nombre) {
      setError("Por favor completa todos los campos");
      return;
    }

    if (nombre.length < 3) {
      setError("El nombre debe tener al menos 3 caracteres");
      return;
    }

    if (numIntegrantes < 1) {
      setError("Debe haber al menos 1 integrante");
      return;
    }

    setLoading(true);

    try {
      const response = await crearProyecto({
        nombre,
        numIntegrantes: parseInt(numIntegrantes, 10),
      });

      if (response.success) {
        setSuccess("¡Proyecto creado exitosamente!");
        setTimeout(() => {
          navigate("/proyectos");
        }, 1500);
      }
    } catch (err) {
      setError(err.message || "Error al crear el proyecto. Intenta de nuevo.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="scrum-form-container">
      {/* Fondo decorativo con iconos */}
      <div className="background-icons">
        <span className="icon-bg">✓</span>
        <span className="icon-bg">✓</span>
        <span className="icon-bg">👥</span>
        <span className="icon-bg">📋</span>
        <span className="icon-bg">🚀</span>
        <span className="icon-bg">⏱</span>
        <span className="icon-bg">✓</span>
        <span className="icon-bg">📁</span>
        <span className="icon-bg">👥</span>
        <span className="icon-bg">📊</span>
      </div>

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
                    <circle cx="30" cy="30" r="30" fill="#28a745" />
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
                        controlId="cantidadIntegrantes"
                      >
                        <Form.Label>
                          ¿Cuántos integrantes requiere el grupo?
                        </Form.Label>
                        <Form.Control
                          type="number"
                          min="1"
                          placeholder="Ej: 5"
                          value={numIntegrantes}
                          onChange={(e) => setNumIntegrantes(e.target.value)}
                          className="shadow-sm"
                          disabled={loading}
                        />
                      </Form.Group>
                    </Col>

                    {/* Campo "tipo de proyecto" deshabilitado/comentado por requerimiento actual */}
                    {/**
                    <Col md={12}>
                      <Form.Group className="form-group" controlId="tipoProyecto">
                        <Form.Label>¿Qué tipo de proyecto es?</Form.Label>
                        <Form.Select className="shadow-sm" disabled={loading}>
                          <option value="">Selecciona un tipo</option>
                          <option value="web">Proyecto Web</option>
                          <option value="movil">Proyecto Móvil</option>
                          <option value="ux">UX/UI</option>
                          <option value="scrum">Scrum</option>
                        </Form.Select>
                      </Form.Group>
                    </Col>
                    */}

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
                          <>Siguiente</>
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
