import { useEffect, useMemo, useState } from "react";
import {
  Badge,
  Card,
  Col,
  Container,
  ListGroup,
  Row,
  Spinner,
} from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import { clearSessionTokens, getRolPlataforma } from "../../services/auth.service";
import { actualizarPerfil, obtenerPerfil } from "../../services/perfil.service";
import "../../styles/PerfilUsuario.css";
import { showError, showSuccess } from "../../utils/alerts";
import { RoleDisplay } from "../../components/RoleInfoPopover";

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
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [editData, setEditData] = useState({
    nombre: "",
    email: "",
    telefono: "",
    ciudad: "",
  });

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
        setEditData({
          nombre: response.data.nombre || "",
          email: response.data.email || "",
          telefono: response.data.telefono || "",
          ciudad: response.data.ciudad || "",
        });
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

  const handleEditClick = () => {
    setIsEditing(true);
    setEditData({
      nombre: perfil.nombre || "",
      email: perfil.email || "",
      telefono: perfil.telefono || "",
      ciudad: perfil.ciudad || "",
    });
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
  };

  const handleSaveEdit = async () => {
    if (!editData.nombre.trim()) {
      showError("El nombre es obligatorio");
      return;
    }
    
    setIsSaving(true);
    try {
      const updated = await actualizarPerfil({
        nombre: editData.nombre.trim(),
        email: editData.email.trim(),
        telefono: editData.telefono.trim(),
        ciudad: editData.ciudad.trim(),
      });
      
      setPerfil(prev => ({
        ...prev,
        nombre: updated.data?.nombre || editData.nombre.trim(),
        email: updated.data?.email || editData.email.trim(),
        telefono: updated.data?.telefono || editData.telefono.trim(),
        ciudad: updated.data?.ciudad || editData.ciudad.trim(),
      }));
      
      showSuccess("Perfil actualizado correctamente");
      setIsEditing(false);
    } catch (err) {
      if (err.code === "UNAUTHENTICATED") {
        clearSessionTokens();
        navigate("/login", { replace: true });
        return;
      }
      showError(err.message || "Error al actualizar el perfil");
    } finally {
      setIsSaving(false);
    }
  };

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
                      {getRolPlataforma() && (
                        <Badge className="badge-rol" bg={getRolPlataforma() === 'coordinador' ? 'secondary' : 'info'}>
                          {getRolPlataforma() === 'instructor_lider' ? 'Instructor Líder' : 'Coordinador'}
                        </Badge>
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
                  
                  <ListGroup variant="flush" className="perfil-info-list">
                    <ListGroup.Item className="d-flex align-items-center">
                      <span className="perfil-info-label">Nombre</span>
                      <span className="perfil-info-value fw-semibold text-dark">
                        {isEditing ? (
                          <input type="text" className="form-control form-control-sm ms-2 px-2 py-1" value={editData.nombre} onChange={(e) => setEditData({...editData, nombre: e.target.value})} />
                        ) : (
                          perfil.nombre
                        )}
                      </span>
                    </ListGroup.Item>
                    <ListGroup.Item className="d-flex align-items-center">
                      <span className="perfil-info-label">Correo</span>
                      <span className="perfil-info-value fw-semibold text-dark">
                        {isEditing ? (
                          <input type="email" className="form-control form-control-sm ms-2 px-2 py-1" value={editData.email} onChange={(e) => setEditData({...editData, email: e.target.value})} />
                        ) : (
                          perfil.email
                        )}
                      </span>
                    </ListGroup.Item>
                    <ListGroup.Item className="d-flex align-items-center">
                      <span className="perfil-info-label">Teléfono</span>
                      <span className="perfil-info-value fw-semibold text-dark">
                        {isEditing ? (
                          <input type="text" className="form-control form-control-sm ms-2 px-2 py-1" value={editData.telefono} onChange={(e) => setEditData({...editData, telefono: e.target.value})} />
                        ) : (
                          perfil.telefono || "No disponible"
                        )}
                      </span>
                    </ListGroup.Item>
                    <ListGroup.Item className="d-flex align-items-center">
                      <span className="perfil-info-label">Ciudad</span>
                      <span className="perfil-info-value fw-semibold text-dark">
                        {isEditing ? (
                          <input type="text" className="form-control form-control-sm ms-2 px-2 py-1" value={editData.ciudad} onChange={(e) => {
                            const val = e.target.value;
                            if (/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]*$/.test(val)) {
                              setEditData({...editData, ciudad: val});
                            }
                          }} />
                        ) : (
                          perfil.ciudad || "No disponible"
                        )}
                      </span>
                    </ListGroup.Item>
                    <ListGroup.Item className="d-flex align-items-center border-bottom-0 pb-0">
                      <span className="perfil-info-label">Registro</span>
                      <span className="perfil-info-value fw-semibold text-dark">
                        {formatDate(perfil.fecha_registro)}
                      </span>
                    </ListGroup.Item>
                  </ListGroup>

                  <div className="mt-4 text-end">
                    {!isEditing ? (
                      <button 
                        className="btn btn-sm" 
                        style={{ color: "#39a900", borderColor: "#39a900", backgroundColor: "transparent" }} 
                        onClick={handleEditClick}
                        onMouseOver={(e) => { e.currentTarget.style.backgroundColor = "#39a900"; e.currentTarget.style.color = "white"; }}
                        onMouseOut={(e) => { e.currentTarget.style.backgroundColor = "transparent"; e.currentTarget.style.color = "#39a900"; }}
                      >
                        <i className="bi bi-pencil me-1"></i> Editar
                      </button>
                    ) : (
                      <div className="d-flex gap-2 justify-content-end">
                        <button className="btn btn-sm btn-light" onClick={handleCancelEdit} disabled={isSaving}>Cancelar</button>
                        <button className="btn btn-sm" style={{ backgroundColor: "#39a900", color: "white", borderColor: "#39a900" }} onClick={handleSaveEdit} disabled={isSaving}>{isSaving ? "..." : "Guardar"}</button>
                      </div>
                    )}
                  </div>
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
                        <RoleDisplay
                          key={rol.id_rol || rol.nombre_rol}
                          roleName={rol.nombre_rol}
                          variant="pill"
                          showIcon={true}
                          popoverPosition="bottom"
                        />
                      ))
                    ) : perfil?.rol_principal ? (
                      <RoleDisplay
                        roleName={perfil.rol_principal}
                        variant="pill"
                        showIcon={true}
                        popoverPosition="bottom"
                      />
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
        ) : null}
      </Container>
    </div>
  );
}
