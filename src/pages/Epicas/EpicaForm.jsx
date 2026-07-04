import { showError, showSuccess, showWarning, showInfo } from "../../utils/alerts";
import { useEffect, useState } from "react";
import { Alert, Button, Card, Col, Container, Form, Row, Spinner } from "react-bootstrap";
import { useNavigate, useSearchParams } from "react-router-dom";
import "../../styles/CrearProyectoForm.css";
import { clearSessionTokens } from "../../services/auth.service";
import { crearEpica } from "../../services/epicas.service";
import { getActiveProjectId, setActiveProjectId } from "../../services/project-context.service";
import { listarProyectos } from "../../services/proyectos.service";

const ESTADOS_EPICA = ["por_hacer", "en_progreso", "completada", "cancelada"];
const INITIAL_FORM = {
  nombre: "",
  descripcion: "",
  categoria: "",
  prioridad: 3,
  estado: "por_hacer",
};

export default function EpicaForm() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  const [proyectos, setProyectos] = useState([]);
  const [selectedProyecto, setSelectedProyecto] = useState(
    searchParams.get("id_proyecto") || getActiveProjectId() || "",
  );
  const [form, setForm] = useState(INITIAL_FORM);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const handleAuthError = () => {
    clearSessionTokens();
    navigate("/login", { replace: true });
  };

  useEffect(() => {
    const loadProjects = async () => {
      setLoading(true);
      setError("");

      try {
        const response = await listarProyectos();
        const items = response.data || [];
        setProyectos(items);

        if (items.length === 0) {
          setSelectedProyecto("");
          setActiveProjectId("");
          setSearchParams({}, { replace: true });
          return;
        }

        const exists = items.some((item) => String(item.id_proyecto) === String(selectedProyecto));
        const nextProject = exists ? selectedProyecto : String(items[0].id_proyecto);
        setSelectedProyecto(nextProject);
        setActiveProjectId(nextProject);
        setSearchParams({ id_proyecto: nextProject }, { replace: true });
      } catch (err) {
        if (err.code === "UNAUTHENTICATED") {
          handleAuthError();
          return;
        }
        showError(err.message || "No se pudieron cargar los proyectos");
      setError("");
      } finally {
        setLoading(false);
      }
    };

    loadProjects();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleCreate = async (event) => {
    event.preventDefault();
    if (!selectedProyecto) {
      showWarning("Por favor selecciona un proyecto asociado.");
      return;
    }

    if (!form.nombre.trim()) {
      showWarning("Por favor ingresa el nombre de la épica.");
      return;
    }

    setSaving(true);
    setError("");

    try {
      const data = await crearEpica({
        proyectoId: Number(selectedProyecto),
        nombre: form.nombre.trim(),
        descripcion: form.descripcion.trim() || null,
        categoria: form.categoria.trim() || null,
        prioridad: Number(form.prioridad) || 3,
        estado: form.estado,
      });

      const idEpica = data?.id_epica ?? data?.id;
      navigate(`/epicas/${idEpica}?id_proyecto=${selectedProyecto}`, {
        state: { toastMessage: "Creación de Épica Exitosa" },
      });
    } catch (err) {
      if (err.code === "UNAUTHENTICATED") {
        handleAuthError();
        return;
      }
      showError(err.message || "No se pudo crear la épica");
      setError("");
    } finally {
      setSaving(false);
    }
  };

  const formatEstado = (est) => {
    if (!est) return "Por hacer";
    const conEspacios = est.replace(/_/g, " ");
    return conEspacios.charAt(0).toUpperCase() + conEspacios.slice(1).toLowerCase();
  };

  return (
    <div className="scrum-form-container">
      <Container className="form-content">
        <Row className="justify-content-center align-items-center">
          <Col lg={12} md={12} xs={12}>
            <div className="d-flex justify-content-between align-items-center mb-4">
              <div>
                <h1 className="welcome-title mb-1" style={{ textAlign: "left" }}>Nueva épica</h1>
                <p className="welcome-subtitle text-muted mb-0" style={{ textAlign: "left" }}>
                  Define una nueva épica para organizar el trabajo de tu proyecto.
                </p>
              </div>
              <Button
                variant="success"
                className="btn-main px-4"
                onClick={() => navigate(`/epicas?id_proyecto=${selectedProyecto}`)}
              >
                Volver
              </Button>
            </div>

            <Card className="form-card shadow-lg border-0">
              <Card.Body className="p-2">
                

                <Form onSubmit={handleCreate} className="form-proyectos">
                  <Row className="gx-4 gy-4">
                    <Col md={12}>
                      <Form.Group className="form-group" controlId="proyecto">
                        <Form.Label>Proyecto asociado</Form.Label>
                        <Form.Select
                          value={selectedProyecto}
                          onChange={(e) => {
                            const val = e.target.value;
                            setSelectedProyecto(val);
                            setActiveProjectId(val);
                            setSearchParams({ id_proyecto: val }, { replace: true });
                          }}
                          disabled={loading || saving}
                          className="shadow-sm"
                        >
                          {proyectos.length === 0 && <option value="">Sin proyectos</option>}
                          {proyectos.map((p) => (
                            <option key={p.id_proyecto} value={p.id_proyecto}>
                              {p.nombre}
                            </option>
                          ))}
                        </Form.Select>
                      </Form.Group>
                    </Col>

                    <Col md={12}>
                      <Form.Group className="form-group" controlId="epica-nombre">
                        <Form.Label>Nombre de la épica</Form.Label>
                        <Form.Control
                          type="text"
                          placeholder="Ej: Implementar pasarela de pagos"
                          value={form.nombre}
                          onChange={(e) => setForm((prev) => ({ ...prev, nombre: e.target.value }))}
                          disabled={loading || saving}
                          className="shadow-sm"
                          required
                        />
                      </Form.Group>
                    </Col>

                    <Col md={12}>
                      <Form.Group className="form-group" controlId="epica-descripcion">
                        <Form.Label>Descripción</Form.Label>
                        <Form.Control
                          as="textarea"
                          rows={4}
                          placeholder="Detalles sobre los objetivos y el alcance de esta épica..."
                          value={form.descripcion}
                          onChange={(e) => setForm((prev) => ({ ...prev, descripcion: e.target.value }))}
                          disabled={loading || saving}
                          className="shadow-sm"
                        />
                      </Form.Group>
                    </Col>

                    <Col md={4}>
                      <Form.Group className="form-group" controlId="epica-categoria">
                        <Form.Label>Categoría</Form.Label>
                        <Form.Control
                          type="text"
                          placeholder="Ej: Backend"
                          value={form.categoria}
                          onChange={(e) => setForm((prev) => ({ ...prev, categoria: e.target.value }))}
                          disabled={loading || saving}
                          className="shadow-sm"
                        />
                      </Form.Group>
                    </Col>

                    <Col md={4}>
                      <Form.Group className="form-group" controlId="epica-prioridad">
                        <Form.Label>Prioridad (1-5)</Form.Label>
                        <Form.Control
                          type="number"
                          min="1"
                          max="5"
                          value={form.prioridad}
                          onChange={(e) => setForm((prev) => ({ ...prev, prioridad: e.target.value }))}
                          disabled={loading || saving}
                          className="shadow-sm"
                        />
                      </Form.Group>
                    </Col>

                    <Col md={4}>
                      <Form.Group className="form-group" controlId="epica-estado">
                        <Form.Label>Estado inicial</Form.Label>
                        <Form.Select
                          value={form.estado}
                          onChange={(e) => setForm((prev) => ({ ...prev, estado: e.target.value }))}
                          disabled={loading || saving}
                          className="shadow-sm"
                        >
                          {ESTADOS_EPICA.map((estado) => (
                            <option key={estado} value={estado}>
                              {formatEstado(estado)}
                            </option>
                          ))}
                        </Form.Select>
                      </Form.Group>
                    </Col>

                    <Col md={12} className="text-end mt-4">
                      <Button
                        type="submit"
                        className="btn-main w-100 px-5 py-3"
                        disabled={loading || saving || !selectedProyecto || !form.nombre.trim()}
                      >
                        {saving ? (
                          <>
                            <Spinner as="span" animation="border" size="sm" role="status" aria-hidden="true" className="me-2" />
                            Creando...
                          </>
                        ) : (
                          "Crear épica"
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