import { useEffect, useMemo, useState } from "react";
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
import { listarProyectos } from "../../services/proyectos.service";
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
  const [proyectos, setProyectos] = useState([]);
  const [search, setSearch] = useState("");
  const [tipoFiltro, setTipoFiltro] = useState("Todos");
  const [estadoFiltro, setEstadoFiltro] = useState("Todos");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [joinedProjectId, setJoinedProjectId] = useState(null);
  const [message, setMessage] = useState("");

  useEffect(() => {
    const cargarProyectos = async () => {
      try {
        const response = await listarProyectos();
        setProyectos(response.data || []);
      } catch (err) {
        setError(err.message || "No se pudieron cargar los proyectos.");
      } finally {
        setLoading(false);
      }
    };

    cargarProyectos();
  }, []);

  const tipos = useMemo(() => {
    const allTipos = proyectos
      .map((proyecto) => proyecto.tipo)
      .filter(Boolean)
      .sort();
    return ["Todos", ...new Set(allTipos)];
  }, [proyectos]);

  const estados = useMemo(() => {
    const allEstados = proyectos
      .map((proyecto) => proyecto.estado)
      .filter(Boolean)
      .sort();
    return ["Todos", ...new Set(allEstados)];
  }, [proyectos]);

  const proyectosFiltrados = useMemo(() => {
    return proyectos.filter((proyecto) => {
      const texto = `${proyecto.nombre} ${proyecto.descripcion || ""}`.toLowerCase();
      const busca = search.trim().toLowerCase();
      const matchSearch = busca === "" || texto.includes(busca);
      const matchTipo = tipoFiltro === "Todos" || proyecto.tipo === tipoFiltro;
      const matchEstado = estadoFiltro === "Todos" || proyecto.estado === estadoFiltro;
      return matchSearch && matchTipo && matchEstado;
    });
  }, [proyectos, search, tipoFiltro, estadoFiltro]);

  const handleJoin = () => {
    // No hace nada aún
  };

  return (
    <div className="unirse-page">
      <Container fluid className="py-4 px-3 px-md-4">
        <div className="unirse-header mb-4">
          <div>
            <h1 className="unirse-title mb-1">Unirse a un Proyecto</h1>
            <p className="unirse-description mb-0 text-muted">
              Busca proyectos abiertos y solicita tu incorporación
            </p>
          </div>
        </div>

        {message && (
          <Alert variant="success" className="shadow-sm">
            {message}
          </Alert>
        )}

        <Card className="shadow-sm border-0 mb-4 filtro-card">
          <Card.Body>
            <Row className="g-3 align-items-start">
              <Col xs={12} md={4}>
                <Form.Group controlId="unirseSearch">
                  <Form.Label>Buscar proyectos</Form.Label>
                  <Form.Control
                    type="search"
                    placeholder="Escribe nombre o descripción"
                    value={search}
                    onChange={(event) => setSearch(event.target.value)}
                  />
                </Form.Group>
              </Col>
              <Col xs={12} md={4}>
                <Form.Group controlId="unirseTipo">
                  <Form.Label>Tipo</Form.Label>
                  <Form.Select
                    value={tipoFiltro}
                    onChange={(event) => setTipoFiltro(event.target.value)}
                  >
                    {tipos.map((tipo) => (
                      <option key={tipo} value={tipo}>
                        {tipo}
                      </option>
                    ))}
                  </Form.Select>
                </Form.Group>
              </Col>
              <Col xs={12} md={4}>
                <Form.Group controlId="unirseEstado">
                  <Form.Label>Estado</Form.Label>
                  <Form.Select
                    value={estadoFiltro}
                    onChange={(event) => setEstadoFiltro(event.target.value)}
                  >
                    {estados.map((estado) => (
                      <option key={estado} value={estado}>
                        {estado}
                      </option>
                    ))}
                  </Form.Select>
                </Form.Group>
              </Col>
            </Row>
          </Card.Body>
        </Card>

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

        {!loading && !error && proyectosFiltrados.length === 0 && (
          <Alert variant="info" className="shadow-sm">
            No se encontraron proyectos con esos criterios.
          </Alert>
        )}

        {!loading && !error && proyectosFiltrados.length > 0 && (
          <div className="proyectos-grid">
            {proyectosFiltrados.map((proyecto) => (
              <Card key={proyecto.id_proyecto} className="proyecto-card shadow-sm">
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
                    <span className="badge bg-success estado-badge">
                      {proyecto.estado || "Sin estado"}
                    </span>
                  </div>

                  <Card.Text className="proyecto-descripcion mb-3">
                    {proyecto.descripcion || "Sin descripción disponible."}
                  </Card.Text>

                  <div className="mt-auto proyecto-meta">
                    <div>
                      <strong>Inicio:</strong> {parseFecha(proyecto.fecha_inicio)}
                    </div>
                    <div>
                      <strong>Fin estimado:</strong> {parseFecha(proyecto.fecha_fin_est)}
                    </div>
                  </div>

                  <Button
                    className="mt-4 align-self-start btn-unirse-proyecto"
                    onClick={() => handleJoin()}
                  >
                    Solicitar unión
                  </Button>
                </Card.Body>
              </Card>
            ))}
          </div>
        )}
      </Container>
    </div>
  );
}
