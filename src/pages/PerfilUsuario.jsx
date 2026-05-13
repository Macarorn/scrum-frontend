import { useEffect, useMemo, useState } from "react";
import {
  Alert,
  Badge,
  Card,
  Col,
  Container,
  ListGroup,
  Row,
  Spinner,
} from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import { clearSessionTokens } from "../services/auth.service";
import { obtenerPerfil } from "../services/perfil.service";
import "../styles/PerfilUsuario.css";
import { showError } from "../utils/alerts";

const formatDate = (value) => {
  if (!value) return "No disponible";

  return new Date(value).toLocaleString("es-ES", {
    dateStyle: "medium",
    timeStyle: "short",
  });
};

export default function PerfilUsuario() {
  const navigate = useNavigate();
  const [perfil, setPerfil] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const permissionLabels = {
    "perfil:update": "Actualizar perfil",
    "usuarios:read": "Ver usuarios",
    "usuarios:update": "Editar usuarios",
    "usuarios:delete": "Eliminar usuarios",
    "roles:assign": "Asignar roles",
    "roles:read": "Ver roles",
    "permisos:read": "Ver permisos",
  };

  useEffect(() => {
    const cargarPerfil = async () => {
      try {
        const response = await obtenerPerfil();
        setPerfil(response.data);
      } catch (err) {
        if (err.code === "UNAUTHENTICATED") {
          clearSessionTokens();
          navigate("/login", { replace: true });
          return;
        }

        const message = err.message || "No se pudo cargar el perfil";
        setError(message);
        showError(message);
      } finally {
        setLoading(false);
      }
    };

    cargarPerfil();
  }, [navigate]);

  const roles = useMemo(() => perfil?.roles || [], [perfil]);
  const permisos = useMemo(() => perfil?.permisos || [], [perfil]);

  //   const handleLogout = () => {
  //     localStorage.removeItem("token");
  //     navigate("/login");
  //   };

  return (
    <div className="min-vh-100 bg-light py-4">
      <Container>
        <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-3 mb-4">
          <div>
            <h1 className="h3 fw-bold text-success-emphasis mb-1">Mi perfil</h1>
          </div>
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

        {!loading && !error && perfil && (
          <Row className="g-4">
            <Col lg={5}>
              <Card className="border-0 shadow-sm h-100">
                <Card.Body className="p-4">
                  <div className="d-flex align-items-center gap-3 mb-4">
                    <div
                      className="rounded-circle perfil-avatar fw-bold d-flex align-items-center justify-content-center"
                      style={{ width: 64, height: 64 }}
                    >
                      {(perfil.nombre || "U").slice(0, 1).toUpperCase()}
                    </div>
                    <div>
                      <h2 className="h5 fw-bold mb-1">{perfil.nombre}</h2>
                      <div className="text-muted">{perfil.email}</div>
                    </div>
                  </div>

                  <div className="d-flex flex-wrap gap-2">
                    <Badge
                      className={
                        perfil.activo ? "badge-estado-activa" : "bg-secondary"
                      }
                    >
                      {perfil.activo ? "Cuenta activa" : "Cuenta inactiva"}
                    </Badge>
                    <Badge bg="dark">{perfil.rol_principal}</Badge>
                  </div>
                </Card.Body>
              </Card>
            </Col>

            <Col lg={7}>
              <Card className="border-0 shadow-sm h-100">
                <Card.Body className="p-4">
                  <h3 className="h5 fw-bold mb-3">Datos del usuario</h3>
                  <ListGroup
                    variant="flush"
                    className="rounded-3 overflow-hidden border"
                  >
                    <ListGroup.Item className="d-flex justify-content-between gap-3">
                      <span className="text-muted">Nombre</span>
                      <span className="fw-semibold text-end">
                        {perfil.nombre || "No disponible"}
                      </span>
                    </ListGroup.Item>
                    <ListGroup.Item className="d-flex justify-content-between gap-3">
                      <span className="text-muted">Correo</span>
                      <span className="fw-semibold text-end">
                        {perfil.email || "No disponible"}
                      </span>
                    </ListGroup.Item>
                    <ListGroup.Item className="d-flex justify-content-between gap-3">
                      <span className="text-muted">Teléfono</span>
                      <span className="fw-semibold text-end">
                        {perfil.telefono || "No disponible"}
                      </span>
                    </ListGroup.Item>
                    <ListGroup.Item className="d-flex justify-content-between gap-3">
                      <span className="text-muted">Ciudad</span>
                      <span className="fw-semibold text-end">
                        {perfil.ciudad || "No disponible"}
                      </span>
                    </ListGroup.Item>
                    <ListGroup.Item className="d-flex justify-content-between gap-3">
                      <span className="text-muted">Fecha de registro</span>
                      <span className="fw-semibold text-end">
                        {formatDate(perfil.fecha_registro)}
                      </span>
                    </ListGroup.Item>
                    {/* <ListGroup.Item className="d-flex justify-content-between gap-3">
                      <span className="text-muted">Última actualización</span>
                      <span className="fw-semibold text-end">
                        {formatDate(perfil.fecha_actualizacion)}
                      </span>
                    </ListGroup.Item> */}
                  </ListGroup>
                </Card.Body>
              </Card>
            </Col>

            <Col lg={6}>
              <Card className="border-0 shadow-sm h-100">
                <Card.Body className="p-4">
                  <h3 className="h5 fw-bold mb-3">Roles</h3>
                  <div className="d-flex flex-wrap gap-2">
                    {roles.length > 0 ? (
                      roles.map((rol) => (
                        <Badge key={rol.id_rol || rol.nombre_rol} bg="primary">
                          {rol.nombre_rol}
                        </Badge>
                      ))
                    ) : (
                      <span className="text-muted">Sin roles asignados</span>
                    )}
                  </div>
                </Card.Body>
              </Card>
            </Col>

            <Col lg={6}>
              <Card className="border-0 shadow-sm h-100">
                <Card.Body className="p-4">
                  <h3 className="h5 fw-bold mb-3">Permisos</h3>
                  <div className="d-flex flex-wrap gap-2">
                    {permisos.length > 0 ? (
                      permisos.map((permiso) => {
                        const code =
                          typeof permiso === "string"
                            ? permiso
                            : permiso.nombre;
                        const label = permissionLabels[code] || code;
                        const key =
                          typeof permiso === "string"
                            ? permiso
                            : permiso.id_permiso || permiso.nombre;

                        return (
                          <Badge key={key} bg="light" text="dark" pill>
                            {label}
                          </Badge>
                        );
                      })
                    ) : (
                      <span className="text-muted">Sin permisos asignados</span>
                    )}
                  </div>
                </Card.Body>
              </Card>
            </Col>
          </Row>
        )}
      </Container>
    </div>
  );
}
