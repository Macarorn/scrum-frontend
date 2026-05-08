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

        setError(err.message || "No se pudo cargar el perfil");
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
    <div className="min-vh-100 pb-5" style={{ backgroundColor: "#fafafa" }}>
      <Container className="pt-4">
        <div className="mb-4 text-start">
          <h1 className="fw-bold perfil-header-title mb-1">Mi perfil</h1>
          <p className="text-muted mb-0">Gestiona tu información personal y roles de acceso</p>
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
            <Col lg={4}>
              <Card className="perfil-card h-100">
                <Card.Body className="p-0">
                  <div className="perfil-cover"></div>
                  <div className="px-4 pb-5">
                    <div className="d-flex flex-column align-items-center text-center mb-4">
                      <div
                        className="rounded-circle perfil-avatar fw-bold d-flex align-items-center justify-content-center"
                        style={{ width: 90, height: 90 }}
                      >
                        {(perfil.nombre || "U").slice(0, 1).toUpperCase()}
                      </div>
                      <div className="mt-3">
                        <h2 className="h4 fw-bold mb-1 text-dark">{perfil.nombre}</h2>
                        <div className="text-muted">{perfil.email}</div>
                      </div>
                    </div>

                    <div className="d-flex flex-wrap justify-content-center gap-2">
                      <Badge
                        className={
                          perfil.activo ? "badge-estado-activa" : "bg-secondary"
                        }
                      >
                        {perfil.activo ? "Cuenta activa" : "Cuenta inactiva"}
                      </Badge>
                      {perfil.rol_principal && (
                        <Badge className="badge-rol">{perfil.rol_principal}</Badge>
                      )}
                    </div>
                  </div>
                </Card.Body>
              </Card>
            </Col>

            <Col lg={8}>
              <Card className="perfil-card h-100">
                <Card.Body className="p-4 p-xl-5">
                  <h3 className="h5 fw-bold mb-4 text-dark">Información de contacto</h3>
                  <ListGroup
                    variant="flush"
                    className="perfil-list-group"
                  >
                    <ListGroup.Item>
                      <span className="text-muted" style={{ width: "140px" }}>Nombre</span>
                      <span className="fw-semibold text-dark">
                        {perfil.nombre || "No disponible"}
                      </span>
                    </ListGroup.Item>
                    <ListGroup.Item>
                      <span className="text-muted" style={{ width: "140px" }}>Correo</span>
                      <span className="fw-semibold text-dark">
                        {perfil.email || "No disponible"}
                      </span>
                    </ListGroup.Item>
                    <ListGroup.Item>
                      <span className="text-muted" style={{ width: "140px" }}>Teléfono</span>
                      <span className="fw-semibold text-dark">
                        {perfil.telefono || "No disponible"}
                      </span>
                    </ListGroup.Item>
                    <ListGroup.Item>
                      <span className="text-muted" style={{ width: "140px" }}>Ciudad</span>
                      <span className="fw-semibold text-dark">
                        {perfil.ciudad || "No disponible"}
                      </span>
                    </ListGroup.Item>
                    <ListGroup.Item>
                      <span className="text-muted" style={{ width: "140px" }}>Registro</span>
                      <span className="fw-semibold text-dark">
                        {formatDate(perfil.fecha_registro)}
                      </span>
                    </ListGroup.Item>
                  </ListGroup>
                </Card.Body>
              </Card>
            </Col>

            <Col lg={6}>
              <Card className="perfil-card h-100">
                <Card.Body className="p-4 p-xl-5">
                  <h3 className="h5 fw-bold mb-4 text-dark">Roles asignados</h3>
                  <div className="d-flex flex-wrap gap-2">
                    {roles.length > 0 ? (
                      roles.map((rol) => (
                        <Badge key={rol.id_rol || rol.nombre_rol} className="badge-rol">
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
              <Card className="perfil-card h-100">
                <Card.Body className="p-4 p-xl-5">
                  <h3 className="h5 fw-bold mb-4 text-dark">Permisos de acceso</h3>
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
                          <span key={key} className="badge-permiso">
                            {label}
                          </span>
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
