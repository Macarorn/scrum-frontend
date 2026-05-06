import "bootstrap/dist/css/bootstrap.min.css";
import { useState } from "react";
import { Button, Card, Col, Container, Row } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import "../../styles/CrearProyecto.css";

export default function CrearProyecto() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  const handleCrearProyecto = () => {
    setLoading(true);
    // Simulamos una navegación o acción
    setTimeout(() => {
      navigate("/crear-proyecto-form");
      setLoading(false);
    }, 300);
  };

  return (
    <div className="scrum-welcome-container">
      <Container className="welcome-content">
        <Row className="justify-content-center align-items-center">
          <Col lg={12} md={12} xs={12}>
            <Card className="welcome-card shadow-lg border-0">
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
                    <circle cx="30" cy="30" r="30" fill="var(--primary)" />
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
                <h1 className="welcome-title mb-1">Bienvenido a Scrum</h1>
                <p className="welcome-subtitle text-muted mb-3">
                  Elige tu próximo paso para empezar a colaborar.
                </p>

                {/* Botones de Acción */}
                <div className="botones-container mb-2">
                  <Button
                    className="btn-unirse-proyecto"
                    onClick={handleCrearProyecto}
                    disabled={loading}
                  >
                    <svg
                      className="btn-icon"
                      width="20"
                      height="20"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                    >
                      <line x1="12" y1="5" x2="12" y2="19"></line>
                      <line x1="5" y1="12" x2="19" y2="12"></line>
                    </svg>
                    <span className="ms-2">Crear un Proyecto</span>
                  </Button>

                  <Button
                    className="btn-unirse-proyecto"
                    onClick={() => navigate("/unirse-proyecto")}
                  >
                    <span>Unirse a un proyecto</span>
                  </Button>

                  <Button
                    className="btn-unirse-proyecto"
                    onClick={() => navigate("/perfil")}
                  >
                    <span>Ir a Perfil</span>
                  </Button>

                  {/* <Button
                    className="btn-unirse-proyecto"
                    onClick={handleUnirseProyecto}
                    disabled={loading}
                  >
                    <svg className="btn-icon" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <polyline points="22 12 18 12 15 21 9 3 6 12 2 12"></polyline>
                    </svg>
                    <span className="ms-2">Unirse a un Proyecto</span>
                  </Button> */}
                </div>

                {/* Beneficios Claves */}
                <div className="beneficios-section">
                  <h6 className="beneficios-title mb-4">BENEFICIOS CLAVES</h6>
                  <Row className="g-4">
                    <Col md={3} sm={6} xs={6} className="text-center">
                      <div className="beneficio-item">
                        <div className="beneficio-icon">
                          <svg
                            width="40"
                            height="40"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="var(--primary)"
                            strokeWidth="2"
                          >
                            <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
                            <circle cx="9" cy="7" r="4"></circle>
                            <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
                            <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
                          </svg>
                        </div>
                        <p className="beneficio-text mt-2">Colaboración</p>
                      </div>
                    </Col>

                    <Col md={3} sm={6} xs={6} className="text-center">
                      <div className="beneficio-item">
                        <div className="beneficio-icon">
                          <svg
                            width="40"
                            height="40"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="var(--primary)"
                            strokeWidth="2"
                          >
                            <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path>
                          </svg>
                        </div>
                        <p className="beneficio-text mt-2">Calidad</p>
                      </div>
                    </Col>

                    <Col md={3} sm={6} xs={6} className="text-center">
                      <div className="beneficio-item">
                        <div className="beneficio-icon">
                          <svg
                            width="40"
                            height="40"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="var(--primary)"
                            strokeWidth="2"
                          >
                            <circle cx="12" cy="12" r="1"></circle>
                            <path d="M12 1v6m0 6v6"></path>
                            <path d="M4.22 4.22l4.24 4.24m5.08 5.08l4.24 4.24M1 12h6m6 0h6M4.22 19.78l4.24-4.24m5.08-5.08l4.24-4.24"></path>
                          </svg>
                        </div>
                        <p className="beneficio-text mt-2">Entregas Rápidas</p>
                      </div>
                    </Col>

                    <Col md={3} sm={6} xs={6} className="text-center">
                      <div className="beneficio-item">
                        <div className="beneficio-icon">
                          <svg
                            width="40"
                            height="40"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="var(--primary)"
                            strokeWidth="2"
                          >
                            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
                          </svg>
                        </div>
                        <p className="beneficio-text mt-2">Satisfacción</p>
                      </div>
                    </Col>
                  </Row>
                </div>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      </Container>
    </div>
  );
}
