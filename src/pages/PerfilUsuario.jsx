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
    <div className="perfil-page">
      <Container>
        <div className="perfil-page-header perfil-animate">
          <h1 className="perfil-header-title">Mi perfil</h1>
          <p className="perfil-header-sub">Gestiona tu información personal y roles de acceso</p>
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
            {/* ── Left Column: Avatar Card ── */}
            <Col lg={4}>
              <Card className="perfil-card h-100 perfil-animate perfil-animate-delay-1">
                <Card.Body className="p-0">
                  <div className="perfil-cover"></div>
                  <div className="px-4 pb-4">
                    <div className="d-flex flex-column align-items-center text-center mb-3">
                      <div
                        className="rounded-circle perfil-avatar fw-bold d-flex align-items-center justify-content-center"
                        style={{ width: 100, height: 100 }}
                      >
                        {(perfil.nombre || "U").slice(0, 1).toUpperCase()}
                      </div>
                      <div className="mt-3">
                        <h2 className="perfil-user-name">{perfil.nombre}</h2>
                        <div className="perfil-user-email">{perfil.email}</div>
                      </div>
                    </div>

                    <div className="d-flex flex-wrap justify-content-center gap-2 mb-2">
                      <Badge
                        className={
                          perfil.activo ? "badge-estado-activa" : "bg-secondary"
                        }
                      >
                        {perfil.activo ? "✓ Cuenta activa" : "Cuenta inactiva"}
                      </Badge>
                      {perfil.rol_principal && (
                        <Badge className="badge-rol">{perfil.rol_principal}</Badge>
                      )}
                    </div>

                    {/* Stats strip */}
                    <div className="perfil-stats-strip">
                      <div className="perfil-stat-item">
                        <span className="perfil-stat-number">{roles.length > 0 ? roles.length : (perfil?.rol_principal ? 1 : 0)}</span>
                        <span className="perfil-stat-label">Roles</span>
                      </div>
                      <div className="perfil-stat-item">
                        <span className="perfil-stat-number">{permisos.length}</span>
                        <span className="perfil-stat-label">Permisos</span>
                      </div>
                      <div className="perfil-stat-item">
                        <span className="perfil-stat-number">
                          {perfil.fecha_registro
                            ? new Date(perfil.fecha_registro).toLocaleDateString("es-ES", { month: "short", year: "2-digit" })
                            : "—"}
                        </span>
                        <span className="perfil-stat-label">Registro</span>
                      </div>
                    </div>
                  </div>
                </Card.Body>
              </Card>
            </Col>

            {/* ── Right Column: Info Card ── */}
            <Col lg={8}>
              <Card className="perfil-card h-100 perfil-animate perfil-animate-delay-2">
                <Card.Body className="p-4 p-xl-5">
                  <div className="perfil-section-title">
                    <span className="perfil-section-icon green">
                      <i className="bi bi-person-lines-fill"></i>
                    </span>
                    Información de contacto
                  </div>
                  <ListGroup
                    variant="flush"
                    className="perfil-info-list"
                  >
                    <ListGroup.Item className="d-flex align-items-center">
                      <span className="perfil-info-label">Nombre</span>
                      <span className="perfil-info-value fw-semibold text-dark">
                        {perfil.nombre}
                      </span>
                    </ListGroup.Item>
                    <ListGroup.Item className="d-flex align-items-center">
                      <span className="perfil-info-label">Correo</span>
                      <span className="perfil-info-value fw-semibold text-dark">
                        {perfil.email}
                      </span>
                    </ListGroup.Item>
                    <ListGroup.Item className="d-flex align-items-center">
                      <span className="perfil-info-label">Teléfono</span>
                      <span className="perfil-info-value fw-semibold text-dark">
                        {perfil.telefono || "No disponible"}
                      </span>
                    </ListGroup.Item>
                    <ListGroup.Item className="d-flex align-items-center">
                      <span className="perfil-info-label">Ciudad</span>
                      <span className="perfil-info-value fw-semibold text-dark">
                        {perfil.ciudad || "No disponible"}
                      </span>
                    </ListGroup.Item>
                    <ListGroup.Item className="d-flex align-items-center border-bottom-0 pb-0">
                      <span className="perfil-info-label">Registro</span>
                      <span className="perfil-info-value fw-semibold text-dark">
                        {formatDate(perfil.fecha_registro)}
                      </span>
                    </ListGroup.Item>
                  </ListGroup>
                </Card.Body>
              </Card>
            </Col>

            {/* ── Roles Card ── */}
            <Col lg={6}>
              <Card className="perfil-card h-100 perfil-animate perfil-animate-delay-3">
                <Card.Body className="p-4 p-xl-5">
                  <div className="perfil-section-title">
                    <span className="perfil-section-icon purple">
                      <i className="bi bi-shield-check"></i>
                    </span>
                    Roles asignados
                  </div>
                  <div className="d-flex flex-wrap gap-2">
                    {roles.length > 0 ? (
                      roles.map((rol) => (
                        <Badge key={rol.id_rol || rol.nombre_rol} className="badge-rol">
                          {rol.nombre_rol}
                        </Badge>
                      ))
                    ) : perfil?.rol_principal ? (
                      <Badge className="badge-rol">
                        {perfil.rol_principal}
                      </Badge>
                    ) : (
                      <div className="perfil-roles-empty w-100">
                        <i className="bi bi-shield me-2"></i>Sin roles asignados
                      </div>
                    )}
                  </div>
                </Card.Body>
              </Card>
            </Col>

            {/* ── Permissions Card ── */}
            <Col lg={6}>
              <Card className="perfil-card h-100 perfil-animate perfil-animate-delay-4">
                <Card.Body className="p-4 p-xl-5">
                  <div className="perfil-section-title">
                    <span className="perfil-section-icon amber">
                      <i className="bi bi-key"></i>
                    </span>
                    Permisos de acceso
                  </div>
                  <div className="d-flex flex-wrap gap-2">
                    {permisos.length > 0 ? (
                      permisos.map((permiso) => {
                        const code =
                          typeof permiso === "string"
                            ? permiso
                            : permiso.nombre;
                        
                        let label = permissionLabels[code];
                        if (!label) {
                          const conEspacios = code.replace(/_/g, " ");
                          label = conEspacios.charAt(0).toUpperCase() + conEspacios.slice(1).toLowerCase();
                        }

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
                      <div className="perfil-permisos-empty w-100">
                        <i className="bi bi-lock me-2"></i>Sin permisos asignados
                      </div>
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
