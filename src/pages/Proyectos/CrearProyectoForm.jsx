import { showError, showSuccess, showWarning, showInfo } from "../../utils/alerts";
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
  const [validated, setValidated] = useState(false);
  const [nombre, setNombre] = useState("");
  const [descripcion, setDescripcion] = useState("");
  const [tipo, setTipo] = useState("");
  const [isTipoOpen, setIsTipoOpen] = useState(false);
  const [fechaInicio, setFechaInicio] = useState("");
  const [fechaFinEst, setFechaFinEst] = useState("");
  const [teamSize, setTeamSize] = useState("");
  const [projectTypeText, setProjectTypeText] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleSubmit = async (event) => {
    event.preventDefault();
    const form = event.currentTarget;
    
    if (form.checkValidity() === false) {
      event.stopPropagation();
      setValidated(true);
      return;
    }

    setError("");
    setSuccess("");

    if (!tipo) {
      showError("Por favor selecciona un tipo de proyecto.");
      setError("");
      return;
    }

    if (nombre.length < 3) {
      showError("El nombre debe tener al menos 3 caracteres");
      setError("");
      return;
    }

    if (teamSize) {
      const num = Number(teamSize);
      if (!Number.isInteger(num) || num < 1) {
        showError("El número de integrantes debe ser un número entero mayor o igual a 1.");
      setError("");
        return;
      }
      if (num > 50) {
        showError("El número máximo de integrantes es 50.");
        setError("");
        return;
      }
    }

    if (fechaInicio && fechaFinEst && fechaInicio > fechaFinEst) {
      showError(
        "La fecha de fin estimada debe ser igual o posterior a la fecha de inicio.",
      );
      setError("");
      return;
    }

    setLoading(true);

    try {
      const response = await crearProyecto({
        nombre,
        descripcion,
        tipo,
        team_size: teamSize ? Number(teamSize) : 1,
        estado: "inicio",
        fecha_inicio: fechaInicio || null,
        fecha_fin_est: fechaFinEst || null,
      });

      if (response.success) {
        showSuccess("¡Proyecto creado exitosamente!");
      setSuccess("");
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

      showError(err.message || "Error al crear el proyecto. Intenta de nuevo.");
      setError("");
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

                

                

                <Form noValidate validated={validated} onSubmit={handleSubmit} className="form-proyectos">
                  <Row className="gx-4 gy-4 align-items-end">
                    <Col md={12}>
                      <Form.Group
                        className="form-group"
                        controlId="nombreProyecto"
                      >
                        <Form.Label>Nombre del proyecto</Form.Label>
                        <Form.Control
                          type="text"
                          placeholder="Ej: Migración a la nube..."
                          value={nombre}
                          onChange={(e) => setNombre(e.target.value)}
                          disabled={loading}
                          className="shadow-sm"
                          required
                          minLength={3}
                        />
                        <Form.Control.Feedback type="invalid">
                          Por favor ingresa un nombre válido (mínimo 3 caracteres).
                        </Form.Control.Feedback>
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
                          placeholder="Propósito u objetivo principal"
                          value={descripcion}
                          onChange={(e) => setDescripcion(e.target.value)}
                          disabled={loading}
                          className="shadow-sm"
                          required
                        />
                        <Form.Control.Feedback type="invalid">
                          Por favor añade una descripción del proyecto.
                        </Form.Control.Feedback>
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
                            className={`custom-dropdown-header ${isTipoOpen ? "open" : ""} ${tipo ? "selected" : ""} ${validated && !tipo ? "border-danger" : ""}`}
                            onClick={() => !loading && setIsTipoOpen(true)}
                          >
                            <input
                              type="text"
                              className="dropdown-input"
                              placeholder="Selecciona o escribe un tipo"
                              value={tipo}
                              onChange={(e) => {
                                setTipo(e.target.value);
                                setIsTipoOpen(true);
                              }}
                              disabled={loading}
                              autoComplete="off"
                              required
                            />
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={`dropdown-arrow ${isTipoOpen ? "open" : ""}`} onClick={(e) => {
                              e.stopPropagation();
                              setIsTipoOpen(!isTipoOpen);
                            }}>
                              <polyline points="6 9 12 15 18 9"></polyline>
                            </svg>
                          </div>
                          {isTipoOpen && (
                            <div className="custom-dropdown-menu">
                              {[
                                "Desarrollo de software",
                                "Diseño UX/UI",
                                "Migración de datos",
                                "Implementación Scrum",
                              ].filter(opt => opt.toLowerCase().includes(tipo.toLowerCase())).map((opcion) => (
                                <div
                                  key={opcion}
                                  className={`custom-dropdown-item ${tipo === opcion ? "active" : ""}`}
                                  onClick={() => {
                                    setTipo(opcion);
                                    setIsTipoOpen(false);
                                  }}
                                >
                                  {opcion}
                                </div>
                              ))}
                              {tipo && ![
                                "Desarrollo de software",
                                "Diseño UX/UI",
                                "Migración de datos",
                                "Implementación Scrum",
                              ].includes(tipo) && (
                                <div className="custom-dropdown-item custom-val">
                                  Usar: "<strong>{tipo}</strong>"
                                </div>
                              )}
                            </div>
                          )}
                          {validated && !tipo && (
                            <div className="invalid-feedback d-block" style={{ marginTop: '0.25rem' }}>
                              Por favor selecciona un tipo de proyecto.
                            </div>
                          )}
                        </div>
                      </Form.Group>
                    </Col>



                    <Col md={6}>
                      <Form.Group className="form-group" controlId="teamSize">
                        <Form.Label>Número de integrantes requeridos</Form.Label>
                        <Form.Control
                          type="number"
                          min="1"
                          max="50"
                          placeholder="Ej: 5"
                          value={teamSize}
                          onChange={(e) => setTeamSize(e.target.value)}
                          className="shadow-sm"
                          disabled={loading}
                          required
                        />
                        <Form.Control.Feedback type="invalid">
                          Por favor ingresa el número de integrantes.
                        </Form.Control.Feedback>
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
                          required
                        />
                        <Form.Control.Feedback type="invalid">
                          Selecciona una fecha de inicio.
                        </Form.Control.Feedback>
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
                          required
                        />
                        <Form.Control.Feedback type="invalid">
                          Selecciona una fecha estimada de fin.
                        </Form.Control.Feedback>
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
