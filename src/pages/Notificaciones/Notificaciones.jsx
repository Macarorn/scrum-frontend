import { showError, showSuccess, showWarning, showInfo } from "../../utils/alerts";
import { useEffect, useMemo, useState } from "react";
import {
  Alert,
  Badge,
  Button,
  Card,
  Col,
  Container,
  Form,
  ListGroup,
  Modal,
  Row,
  Spinner,
} from "react-bootstrap";
import { useLocation } from "react-router-dom";
import "../../styles/Notificaciones.css";
import {
  listarNotificaciones as listarNotificacionesApi,
  marcarNotificacionComoLeida,
} from "../../services/notificaciones.service";
import { listarProyectos, listarRolesProyecto, listarMiembrosProyecto } from "../../services/proyectos.service";
import {
  aprobarSolicitud as aprobarSolicitudApi,
  listarSolicitudesPendientesPorProyecto,
  listarSolicitudesUsuario,
  rechazarSolicitud as rechazarSolicitudApi,
  cancelarSolicitud as cancelarSolicitudApi,
} from "../../services/solicitudes.service";
import { RoleDisplay } from "../../components/RoleInfoPopover";
import { getUserFromToken } from "../../services/auth.service";

const REFRESH_INTERVAL_MS = 15000;
const BUILTIN_ROLES_TO_EXCLUDE_WHEN_ACTIVE = ["Product Owner", "Scrum Master"];
const formatDateTime = (value) => {
  if (!value) return "Sin fecha";

  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return String(value);

  return parsed.toLocaleString("es-ES", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

const mapSolicitud = (solicitud, projectMap) => ({
  ...solicitud,
  nombre_proyecto:
    solicitud.nombre_proyecto ||
    projectMap.get(String(solicitud.id_proyecto)) ||
    `Proyecto #${solicitud.id_proyecto}`,
  fecha_formateada: formatDateTime(solicitud.fecha_creacion),
});

const mapNotificacion = (notificacion) => ({
  ...notificacion,
  leida: Boolean(notificacion.leida),
  fecha_formateada: formatDateTime(notificacion.fecha_creacion),
  nombre_solicitante:
    notificacion.nombre_solicitante || notificacion.nombre_usuario_solicitante,
  rol_solicitud: notificacion.rol_solicitud || "",
});

const findProjectId = (proyectos, currentProjectId) => {
  const current = String(currentProjectId || "");

  if (
    current &&
    proyectos.some((proyecto) => String(proyecto.id_proyecto) === current)
  ) {
    return current;
  }

  return proyectos.length > 0 ? String(proyectos[0].id_proyecto) : "";
};

export default function Notificaciones() {
  const location = useLocation();
  const [notificaciones, setNotificaciones] = useState([]);
  const [solicitudesUsuario, setSolicitudesUsuario] = useState([]);
  const [solicitudesPendientes, setSolicitudesPendientes] = useState([]);
  const [proyectos, setProyectos] = useState([]);
  const [selectedProjectId, setSelectedProjectId] = useState("");
  const [projectMenuOpen, setProjectMenuOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  // eslint-disable-next-line no-unused-vars
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");
  const [feedback, setFeedback] = useState({ type: "", message: "" });
  const [solicitudSeleccionada, setSolicitudSeleccionada] = useState(null);
  const [rolAprobacion, setRolAprobacion] = useState("3");
  const [mensajeInternoAprobacion, setMensajeInternoAprobacion] = useState("");
  const [rolesProyectoAprobacion, setRolesProyectoAprobacion] = useState([]);
  const [loadingRolesAprobacion, setLoadingRolesAprobacion] = useState(false);
  const [rechazoSeleccionado, setRechazoSeleccionado] = useState(null);
  const [motivoRechazo, setMotivoRechazo] = useState("");
  const [confirmingRechazo, setConfirmingRechazo] = useState(false);

  const projectMap = useMemo(
    () =>
      new Map(
        proyectos.map((proyecto) => [
          String(proyecto.id_proyecto),
          proyecto.nombre,
        ])
      ),
    [proyectos]
  );

  useEffect(() => {
    const flashMessage = location.state?.flashMessage;

    if (flashMessage) {
      setFeedback({
        type: location.state?.flashType || "success",
        message: flashMessage,
      });
    }
  }, [location.state]);

  const loadPendingRequests = async (projectId, projectMapArg) => {
    if (!projectId) {
      setSolicitudesPendientes([]);
      return;
    }
    try {
      const response = await listarSolicitudesPendientesPorProyecto(projectId);
      const pending = response.data || [];
      setSolicitudesPendientes(
        pending.map((solicitud) => mapSolicitud(solicitud, projectMapArg))
      );
    } catch (error) {
      // Silenciosamente ignorar errores de permisos
      setSolicitudesPendientes([]);
    }
  };

  const loadDashboard = async ({ silent = false } = {}) => {
    if (!silent) {
      setLoading(true);
    } else {
      setRefreshing(true);
    }

    if (!silent) setError("");

    try {
      const [notificacionesResponse, solicitudesResponse, proyectosResponse] =
        await Promise.all([
          listarNotificacionesApi(),
          listarSolicitudesUsuario(),
          listarProyectos(),
        ]);

      const proyectosData = proyectosResponse.data || [];
      const nextProjectId = findProjectId(proyectosData, selectedProjectId);
      const nextProjectMap = new Map(
        proyectosData.map((proyecto) => [
          String(proyecto.id_proyecto),
          proyecto.nombre,
        ])
      );

      setProyectos(proyectosData);
      setSelectedProjectId(nextProjectId);
      setNotificaciones(
        (notificacionesResponse.data || []).map(mapNotificacion)
      );
      setSolicitudesUsuario(
        (solicitudesResponse.data || []).map((solicitud) =>
          mapSolicitud(solicitud, nextProjectMap)
        )
      );
      await loadPendingRequests(nextProjectId, nextProjectMap);
    } catch (fetchError) {
      if (!silent) {
        const errorMessage = fetchError.message || "No fue posible cargar el centro de notificaciones";
        if (errorMessage !== "Sin permisos") {
          showError(errorMessage);
        }
        setError("");
      }
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    void loadDashboard();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const intervalId = window.setInterval(() => {
      loadDashboard({ silent: true });
    }, REFRESH_INTERVAL_MS);
    return () => window.clearInterval(intervalId);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Cerrar menú al hacer clic fuera o presionar escape
  useEffect(() => {
    if (!projectMenuOpen) return undefined;

    const handleOutside = (event) => {
      if (event.target.closest && event.target.closest('.notif-picker')) return;
      setProjectMenuOpen(false);
    };

    const handleEsc = (event) => {
      if (event.key === 'Escape') setProjectMenuOpen(false);
    };

    document.addEventListener('mousedown', handleOutside);
    document.addEventListener('keydown', handleEsc);
    return () => {
      document.removeEventListener('mousedown', handleOutside);
      document.removeEventListener('keydown', handleEsc);
    };
  }, [projectMenuOpen]);

  const handleProjectChange = async (nextProjectId) => {
    setSelectedProjectId(nextProjectId);
    setError("");

    try {
      await loadPendingRequests(nextProjectId, projectMap);
    } catch (projectError) {
      showError(
        projectError.message ||
        "No fue posible cargar las solicitudes pendientes del proyecto"
      );
      setError("");
    }
  };

  const handleMarkAsRead = async (idNotificacion) => {
    try {
      await marcarNotificacionComoLeida(idNotificacion);
      setNotificaciones((current) =>
        current.map((notificacion) =>
          String(notificacion.id_notificacion) === String(idNotificacion)
            ? { ...notificacion, leida: true }
            : notificacion
        )
      );
      setFeedback({
        type: "success",
        message: "Notificación marcada como leída.",
      });
    } catch (markError) {
      showError(
        markError.message || "No fue posible marcar la notificación como leída"
      );
      setError("");
    }
  };

  const esInvitacionPendiente = (notificacion) =>
    Boolean(
      notificacion.id_solicitud &&
        notificacion.titulo?.includes("Invitación a proyecto") &&
        String(notificacion.estado_solicitud).toLowerCase() === "pendiente"
    );

  const aceptarInvitacion = async (notificacion) => {
    try {
      await aprobarSolicitudApi({
        idSolicitud: notificacion.id_solicitud,
        idRol: notificacion.id_rol_solicitud || notificacion.id_rol,
      });
      setFeedback({
        type: "success",
        message: `Invitación aceptada para ${notificacion.nombre_proyecto}.`,
      });
      await loadDashboard({ silent: true });
    } catch (acceptError) {
      setError(acceptError.message || "No fue posible aceptar la invitación");
    }
  };

  const rechazarInvitacion = (notificacion) => {
    abrirModalRechazo(notificacion, "invitacion");
  };

  const abrirModalRechazo = (target, tipo) => {
    setRechazoSeleccionado({ target, tipo });
    setMotivoRechazo("");
  };

  const cerrarModalRechazo = () => {
    setRechazoSeleccionado(null);
    setMotivoRechazo("");
  };

  const confirmarRechazo = async () => {
    if (!rechazoSeleccionado) {
      return;
    }

    const { target, tipo } = rechazoSeleccionado;
    const motivoFinal = motivoRechazo?.trim() || null;

    // Intentar resolver varios nombres posibles para el id de solicitud
    const idSolicitud =
      target?.id_solicitud ??
      target?.idSolicitud ??
      target?.id ??
      target?.solicitud_id ??
      target?.target?.id_solicitud ??
      null;

    if (!idSolicitud) {
      console.error("confirmarRechazo: id de solicitud no encontrado", { rechazoSeleccionado });
      setError("No se pudo identificar la solicitud a rechazar.");
      return;
    }

    setConfirmingRechazo(true);
    try {
      console.debug("confirmarRechazo: llamando API de rechazo", { idSolicitud, motivoFinal, tipo });
      if (tipo === "invitacion") {
        // Para invitaciones, el usuario invitado debe cancelar la invitación (no el aprobador)
        await cancelarSolicitudApi({ idSolicitud, motivo: motivoFinal });
      } else {
        await rechazarSolicitudApi({
          idSolicitud,
          motivo: motivoFinal,
        });
      }
      setFeedback({
        type: "warning",
        message:
          tipo === "invitacion"
            ? `Invitación rechazada para ${target.nombre_proyecto}.`
            : `Solicitud rechazada para ${target.nombre_proyecto}.`,
      });
      cerrarModalRechazo();
      await loadDashboard({ silent: true });
    } catch (rejectError) {
      console.error("confirmarRechazo: error al rechazar", rejectError);
      setError(rejectError.message || "No fue posible rechazar la solicitud");
    } finally {
      setConfirmingRechazo(false);
    }
  };

  const abrirModalAprobacion = (solicitud) => {
    // Validar que el usuario actual no sea el creador de la solicitud
    const currentUser = getUserFromToken();
    if (currentUser && currentUser.id === solicitud.id_usuario_creador) {
      showWarning("No puedes aprobar una solicitud que tú creaste");
      return;
    }
    setSolicitudSeleccionada(solicitud);
    setMensajeInternoAprobacion("");
    setRolesProyectoAprobacion([]);
    setRolAprobacion("3");
    void loadRolesParaAprobacion(solicitud.id_proyecto);
  };

  const loadRolesParaAprobacion = async (proyectoId) => {
    setLoadingRolesAprobacion(true);
    try {
      const [rolesResponse, miembrosResponse] = await Promise.all([
        listarRolesProyecto(proyectoId),
        listarMiembrosProyecto(proyectoId),
      ]);

      const rolesData = rolesResponse.data || [];
      const miembrosData = miembrosResponse.data || [];
      const activeRoleNames = new Set(
        miembrosData
          .filter((miembro) => miembro.activo || miembro.activo === 1)
          .map((miembro) => miembro.rol)
      );

      const availableRoles = rolesData.filter((rol) => {
        if (!BUILTIN_ROLES_TO_EXCLUDE_WHEN_ACTIVE.includes(rol.nombre_rol)) {
          return true;
        }
        return !activeRoleNames.has(rol.nombre_rol);
      });

      setRolesProyectoAprobacion(availableRoles);
      if (availableRoles.length > 0) {
        setRolAprobacion(String(availableRoles[0].id_rol));
      } else {
        setRolAprobacion("");
      }
    } catch (loadError) {
      console.error("Error cargando roles para aprobación", loadError);
      setRolesProyectoAprobacion([]);
      setRolAprobacion("3");
    } finally {
      setLoadingRolesAprobacion(false);
    }
  };

  const cerrarModalAprobacion = () => {
    setSolicitudSeleccionada(null);
    setRolAprobacion("3");
    setMensajeInternoAprobacion("");
  };

  const aprobarSolicitud = async () => {
    if (!solicitudSeleccionada) {
      return;
    }

    try {
      await aprobarSolicitudApi({
        idSolicitud: solicitudSeleccionada.id_solicitud,
        idRol: rolAprobacion,
      });

      setFeedback({
        type: "success",
        message: `Solicitud aprobada para ${solicitudSeleccionada.nombre_proyecto}.`,
      });
      cerrarModalAprobacion();
      await loadDashboard({ silent: true });
    } catch (approvalError) {
      showError(approvalError.message || "No fue posible aprobar la solicitud");
      setError("");
    }
  };

  const rechazarSolicitud = (solicitud) => {
    // Validar que el usuario actual no sea el creador de la solicitud
    const currentUser = getUserFromToken();
    if (currentUser && currentUser.id === solicitud.id_usuario_creador) {
      showWarning("No puedes rechazar una solicitud que tú creaste");
      return;
    }
    
    abrirModalRechazo(solicitud, "solicitud");
  };

  if (loading) {
    return (
      <div className="min-vh-100 bg-light d-flex align-items-center justify-content-center">
        <Spinner animation="border" role="status" />
      </div>
    );
  }

  // Helpers para clases de badges (estilo premium)
  const badgeClassForNotificacion = (tipo) => {
    if (tipo === "urgente") return "badge-notif urgente";
    if (tipo === "prioritaria") return "badge-notif prioritaria";
    if (tipo === "sistema") return "badge-notif sistema";
    return "badge-notif normal";
  };

  const badgeClassForSolicitudEstado = (estado) => {
    if (estado === "Aprobada") return "badge-notif badge-estado aprobada";
    if (estado === "Pendiente") return "badge-notif badge-estado pendiente";
    return "badge-notif badge-estado rechazada";
  };

  return (
    <div className="min-vh-100 pb-5" style={{ backgroundColor: "#fafafa" }}>
      <Container className="pt-4 max-w-7xl">
        <div className="mb-4 text-start">
          <h1 className="fw-bold notif-header-title mb-1">
            Centro de notificaciones
          </h1>
          <p className="text-muted mb-0" style={{ fontSize: "16px" }}>
            Solicitudes de ingreso, notificaciones del sistema y cambios de estado con actualización automática.
          </p>
        </div>

        {feedback.message && (
          <Alert
            variant={feedback.type || "success"}
            className="shadow-sm"
            dismissible
            onClose={() => setFeedback({ type: "", message: "" })}
          >
            {feedback.message}
          </Alert>
        )}

        {error && error !== "Sin permisos" && (
          <Alert variant="danger" className="shadow-sm">
            {error}
          </Alert>
        )}

        <Row className="g-4">
          <Col xl={7}>
            <Card className="notif-card h-100">
              <Card.Body className="p-4 p-xl-5">
                <div className="d-flex justify-content-between align-items-center mb-4 flex-wrap gap-2">
                  <h2 className="h5 fw-bold mb-0 text-dark border-bottom pb-3 w-100">
                    Notificaciones recientes
                  </h2>
                </div>

                {notificaciones.length > 0 ? (
                  <ListGroup variant="flush" className="notif-list-group">
                    {notificaciones.map((notificacion) => (
                      <ListGroup.Item key={notificacion.id_notificacion}>
                        <div className="d-flex justify-content-between align-items-start gap-3">
                          <div className="flex-grow-1">
                            <div className="d-flex flex-wrap align-items-center gap-2 mb-2">
                              <span className="fw-bold text-dark fs-6">
                                {notificacion.titulo}
                              </span>
                              <span className={badgeClassForNotificacion(notificacion.tipo)}>
                                {notificacion.tipo}
                              </span>
                            </div>
                            <div className="text-muted mb-2 notif-mensaje" style={{ fontSize: "15px" }}>
                              {notificacion.mensaje || "Sin mensaje adicional."}
                            </div>
                            <div className="d-flex flex-wrap gap-3 text-muted small fw-medium">
                              {notificacion.nombre_proyecto ? (
                                <span><i className="bi bi-folder2 me-1"></i> {notificacion.nombre_proyecto}</span>
                              ) : null}
                              {notificacion.nombre_solicitante ? (
                                <span className="me-3">
                                  Solicitante: {notificacion.nombre_solicitante}
                                </span>
                              ) : null}
                              {notificacion.rol_solicitud ? (
                                <span className="me-3">
                                  Rol: {notificacion.rol_solicitud}
                                </span>
                              ) : null}
                              <span><i className="bi bi-clock me-1"></i> {notificacion.fecha_formateada}</span>
                            </div>
                          </div>
                          {esInvitacionPendiente(notificacion) ? (
                            <div className="d-flex flex-wrap gap-2 mt-2">
                              <button
                                className="btn-action-soft btn-aprobar"
                                onClick={() => aceptarInvitacion(notificacion)}
                              >
                                Aceptar
                              </button>
                              <button
                                className="btn-action-soft btn-rechazar"
                                onClick={() => rechazarInvitacion(notificacion)}
                              >
                                Rechazar
                              </button>
                            </div>
                          ) : !notificacion.leida ? (
                            <button
                              className="btn-action-soft btn-leida ms-2 mt-1"
                              onClick={() => handleMarkAsRead(notificacion.id_notificacion)}
                            >
                              Marcar leída
                            </button>
                          ) : null}
                        </div>
                      </ListGroup.Item>
                    ))}
                  </ListGroup>
                ) : (
                  <div className="text-center py-5 text-muted">
                    <i className="bi bi-bell-slash fs-1 d-block mb-3 text-secondary opacity-50"></i>
                    No tienes notificaciones activas en este momento.
                  </div>
                )}
              </Card.Body>
            </Card>
          </Col>

          <Col xl={5}>
            <Row className="g-4">
              <Col xs={12}>
                <Card className="notif-card h-100">
                  <Card.Body className="p-4 p-xl-5">
                    <h2 className="h5 fw-bold mb-4 text-dark border-bottom pb-3">
                      Solicitudes por aprobar
                    </h2>

                    <div className="mb-4">
                      <label className="text-muted mb-2 fw-semibold" style={{ fontSize: "13px", textTransform: "uppercase", letterSpacing: "0.5px" }}>Proyecto</label>
                      <div className="notif-picker">
                        <button
                          type="button"
                          className="notif-picker-toggle"
                          onClick={() => setProjectMenuOpen((prev) => !prev)}
                          disabled={proyectos.length === 0}
                        >
                          <span>{proyectos.find((p) => String(p.id_proyecto) === String(selectedProjectId))?.nombre || "Sin proyectos disponibles"}</span>
                          <span className="notif-picker-caret">▾</span>
                        </button>

                        {projectMenuOpen && (
                          <div className="notif-picker-menu" role="menu">
                            <div className="notif-picker-menu-list">
                              {proyectos.map((proyecto) => (
                                <button
                                  key={proyecto.id_proyecto}
                                  type="button"
                                  className={`notif-picker-item ${String(proyecto.id_proyecto) === String(selectedProjectId) ? "selected" : ""}`}
                                  onClick={() => {
                                    handleProjectChange(String(proyecto.id_proyecto));
                                    setProjectMenuOpen(false);
                                  }}
                                >
                                  {proyecto.nombre}
                                </button>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>

                    {solicitudesPendientes.length > 0 ? (
                      <ListGroup variant="flush" className="notif-list-group border rounded-4">
                        {solicitudesPendientes.map((solicitud) => (
                          <ListGroup.Item key={solicitud.id_solicitud} className="p-4">
                            <div className="d-flex flex-column gap-2">
                              <div className="d-flex flex-wrap align-items-center gap-2 mb-1">
                                <span className="fw-bold text-dark fs-6">
                                  {solicitud.nombre_usuario_solicitante || `Usuario #${solicitud.id_usuario}`}
                                </span>
                                <span className={badgeClassForSolicitudEstado(solicitud.estado)}>
                                  {solicitud.estado}
                                </span>
                              </div>
                              <div className="text-muted fw-medium" style={{ fontSize: "14px" }}>
                                {solicitud.nombre_proyecto}
                              </div>
                              <div className="text-muted" style={{ fontSize: "15px" }}>
                                {solicitud.mensaje_opcional || "Sin mensaje opcional."}
                              </div>
                              <div className="text-muted small mt-1">
                                <i className="bi bi-clock me-1"></i> {solicitud.fecha_formateada}
                              </div>
                              <div className="d-flex flex-wrap gap-2 mt-3">
                                <button
                                  className="btn-action-soft btn-aprobar"
                                  onClick={() => abrirModalAprobacion(solicitud)}
                                >
                                  Aprobar
                                </button>
                                <button
                                  className="btn-action-soft btn-rechazar"
                                  onClick={() => rechazarSolicitud(solicitud)}
                                >
                                  Rechazar
                                </button>
                              </div>
                            </div>
                          </ListGroup.Item>
                        ))}
                      </ListGroup>
                    ) : (
                      <div className="bg-light rounded-4 p-4 text-center text-muted">
                        No hay solicitudes pendientes para el proyecto seleccionado.
                      </div>
                    )}
                  </Card.Body>
                </Card>
              </Col>

              <Col xs={12}>
                <Card className="notif-card h-100">
                  <Card.Body className="p-4 p-xl-5">
                    <h2 className="h5 fw-bold mb-4 text-dark border-bottom pb-3">
                      Mis solicitudes
                    </h2>

                    {solicitudesUsuario.length > 0 ? (
                      <ListGroup variant="flush" className="notif-list-group border rounded-4">
                        {solicitudesUsuario.map((solicitud) => (
                          <ListGroup.Item key={solicitud.id_solicitud} className="p-4">
                            <div className="d-flex justify-content-between align-items-start gap-3">
                              <div className="flex-grow-1">
                                <div className="fw-bold text-dark fs-6 mb-1">
                                  {solicitud.nombre_proyecto}
                                </div>
                                <div className="text-muted small mb-2">
                                  <i className="bi bi-clock me-1"></i> {solicitud.fecha_formateada}
                                </div>
                                {solicitud.motivo ? (
                                  <div className="text-muted solicitud-motivo" style={{ fontSize: "14px" }}>
                                    <span className="fw-semibold">Motivo:</span> {solicitud.motivo}
                                  </div>
                                ) : null}
                              </div>
                              <span className={badgeClassForSolicitudEstado(solicitud.estado)}>
                                {solicitud.estado}
                              </span>
                            </div>
                          </ListGroup.Item>
                        ))}
                      </ListGroup>
                    ) : (
                      <div className="bg-light rounded-4 p-4 text-center text-muted">
                        Aún no has enviado solicitudes de ingreso.
                      </div>
                    )}
                  </Card.Body>
                </Card>
              </Col>
            </Row>
          </Col>
        </Row>

        <Modal
          show={Boolean(rechazoSeleccionado)}
          onHide={cerrarModalRechazo}
          centered
        >
          <Modal.Header closeButton>
            <Modal.Title>
              {rechazoSeleccionado?.tipo === "invitacion"
                ? "Rechazar invitación"
                : "Rechazar solicitud"}
            </Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <p className="mb-3">
              {rechazoSeleccionado?.tipo === "invitacion"
                ? `¿Deseas rechazar esta invitación al proyecto ${rechazoSeleccionado?.target?.nombre_proyecto || "este proyecto"}?`
                : `Escribe un motivo opcional para rechazar la solicitud de ${
                    rechazoSeleccionado?.target?.nombre_usuario_solicitante ||
                    `usuario #${rechazoSeleccionado?.target?.id_usuario}`
                  }.`}
            </p>
            <Form.Group>
              <Form.Label>Motivo de rechazo</Form.Label>
              <Form.Control
                as="textarea"
                rows={4}
                value={motivoRechazo}
                onChange={(event) => setMotivoRechazo(event.target.value)}
                placeholder="Opcional: explica el motivo del rechazo"
              />
            </Form.Group>
          </Modal.Body>
            <Modal.Footer>
            <Button variant="secondary" onClick={cerrarModalRechazo}>
              Cancelar
            </Button>
            <Button variant="danger" onClick={confirmarRechazo} disabled={confirmingRechazo}>
              {confirmingRechazo ? (
                <>
                  <Spinner animation="border" size="sm" role="status" className="me-2" />
                  Rechazando...
                </>
              ) : (
                "Rechazar"
              )}
            </Button>
          </Modal.Footer>
        </Modal>

        <Modal
          show={Boolean(solicitudSeleccionada)}
          onHide={cerrarModalAprobacion}
          centered
        >
          <Modal.Header closeButton>
            <Modal.Title>Aprobar solicitud</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <p className="mb-3">
              Elige el rol con el que se agregará al usuario al proyecto{" "}
              <strong>{solicitudSeleccionada?.nombre_proyecto}</strong>.
            </p>

            <Form.Group className="mb-3">
              <Form.Label>Rol asignado</Form.Label>
              <div className="d-flex flex-column gap-2">
                {loadingRolesAprobacion && (
                  <div className="text-center py-3">
                    <Spinner animation="border" size="sm" /> Cargando roles...
                  </div>
                )}
                {!loadingRolesAprobacion && rolesProyectoAprobacion.length === 0 && (
                  <div className="text-muted p-3 border rounded-3">
                    No hay roles disponibles para asignar en este proyecto.
                  </div>
                )}
                {rolesProyectoAprobacion.map((rol) => (
                  <label key={rol.id_rol} className="d-flex align-items-center p-3 border rounded-3" style={{
                    cursor: 'pointer',
                    backgroundColor: rolAprobacion === String(rol.id_rol) ? '#f0f7ff' : 'transparent',
                    borderColor: rolAprobacion === String(rol.id_rol) ? '#4A90E2' : '#dee2e6',
                    transition: 'all 0.2s ease',
                  }}>
                    <input
                      type="radio"
                      name="rol"
                      value={rol.id_rol}
                      checked={rolAprobacion === String(rol.id_rol)}
                      onChange={(event) => setRolAprobacion(event.target.value)}
                      style={{ cursor: 'pointer', marginRight: '10px' }}
                    />
                    <RoleDisplay
                      roleName={rol.nombre_rol}
                      variant="badge"
                      showIcon={true}
                      popoverPosition="right"
                    />
                  </label>
                ))}
              </div>
            </Form.Group>

            <Form.Group>
              <Form.Label>Mensaje interno</Form.Label>
              <Form.Control
                as="textarea"
                rows={3}
                value={mensajeInternoAprobacion}
                onChange={(event) => setMensajeInternoAprobacion(event.target.value)}
                placeholder="Opcional: anota una observación antes de aprobar"
              />
            </Form.Group>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={cerrarModalAprobacion}>
              Cancelar
            </Button>
            <Button
              variant="success"
              onClick={aprobarSolicitud}
              disabled={loadingRolesAprobacion || !rolAprobacion}
            >
              Aprobar solicitud
            </Button>
          </Modal.Footer>
        </Modal>
      </Container>
    </div>
  );
}