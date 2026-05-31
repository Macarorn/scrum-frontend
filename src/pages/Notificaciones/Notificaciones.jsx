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
import { FiBellOff, FiFolder, FiClock } from 'react-icons/fi';
import {
  listarNotificaciones as listarNotificacionesApi,
  marcarNotificacionComoLeida,
} from "../../services/notificaciones.service";
import { listarProyectos } from "../../services/proyectos.service";
import {
  aprobarSolicitud as aprobarSolicitudApi,
  listarSolicitudesPendientesPorProyecto,
  listarSolicitudesUsuario,
  rechazarSolicitud as rechazarSolicitudApi,
} from "../../services/solicitudes.service";

const REFRESH_INTERVAL_MS = 15000;

const rolesDisponibles = [
  { id: 1, nombre: "Product Owner" },
  { id: 2, nombre: "Scrum Master" },
  { id: 3, nombre: "Developer" },
];

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
  const [solicitudRechazoSeleccionada, setSolicitudRechazoSeleccionada] = useState(null);
  const [rolAprobacion, setRolAprobacion] = useState("3");
  const [motivoRechazo, setMotivoRechazo] = useState("");

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

  const abrirModalAprobacion = (solicitud) => {
    setSolicitudSeleccionada(solicitud);
    setRolAprobacion("3");
    setMotivoRechazo("");
  };

  const cerrarModalAprobacion = () => {
    setSolicitudSeleccionada(null);
    setRolAprobacion("3");
    setMotivoRechazo("");
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

  const abrirModalRechazo = (solicitud) => {
    setSolicitudRechazoSeleccionada(solicitud);
    setMotivoRechazo("");
  };

  const cerrarModalRechazo = () => {
    setSolicitudRechazoSeleccionada(null);
    setMotivoRechazo("");
  };

  const confirmarRechazo = async () => {
    if (!solicitudRechazoSeleccionada) {
      return;
    }

    try {
      await rechazarSolicitudApi({
        idSolicitud: solicitudRechazoSeleccionada.id_solicitud,
        motivo: motivoRechazo,
      });

      setFeedback({
        type: "warning",
        message: `Solicitud rechazada para ${solicitudRechazoSeleccionada.nombre_proyecto}.`,
      });
      cerrarModalRechazo();
      await loadDashboard({ silent: true });
    } catch (rejectError) {
      showError(rejectError.message || "No fue posible rechazar la solicitud");
      setError("");
    }
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
                            <div className="text-muted mb-2" style={{ fontSize: "15px" }}>
                              {notificacion.mensaje || "Sin mensaje adicional."}
                            </div>
                            <div className="d-flex flex-wrap gap-3 text-muted small fw-medium">
                              {notificacion.nombre_proyecto ? (
                                <span><FiFolder className="me-1" /> {notificacion.nombre_proyecto}</span>
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
                              <span><FiClock className="me-1" /> {notificacion.fecha_formateada}</span>
                            </div>
                          </div>
                          {!notificacion.leida ? (
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
                    <FiBellOff className="fs-1 d-block mb-3 text-secondary opacity-50" />
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
                                <FiClock className="me-1" /> {solicitud.fecha_formateada}
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
                                  onClick={() => abrirModalRechazo(solicitud)}
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
                                  <FiClock className="me-1" /> {solicitud.fecha_formateada}
                                </div>
                                {solicitud.motivo ? (
                                  <div className="text-muted" style={{ fontSize: "14px" }}>
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
              <Form.Select
                value={rolAprobacion}
                onChange={(event) => setRolAprobacion(event.target.value)}
              >
                {rolesDisponibles.map((rol) => (
                  <option key={rol.id} value={rol.id}>
                    {rol.nombre}
                  </option>
                ))}
              </Form.Select>
            </Form.Group>

            <Form.Group>
              <Form.Label>Mensaje interno</Form.Label>
              <Form.Control
                as="textarea"
                rows={3}
                value={motivoRechazo}
                onChange={(event) => setMotivoRechazo(event.target.value)}
                placeholder="Opcional: anota una observación antes de aprobar"
              />
            </Form.Group>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={cerrarModalAprobacion}>
              Cancelar
            </Button>
            <Button variant="success" onClick={aprobarSolicitud}>
              Aprobar solicitud
            </Button>
          </Modal.Footer>
        </Modal>

        <Modal
          show={Boolean(solicitudRechazoSeleccionada)}
          onHide={cerrarModalRechazo}
          centered
        >
          <Modal.Header closeButton>
            <Modal.Title>Rechazar solicitud</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <p className="mb-3">
              ¿Estás seguro de rechazar la solicitud de{" "}
              <strong>{solicitudRechazoSeleccionada?.nombre_usuario_solicitante || `usuario #${solicitudRechazoSeleccionada?.id_usuario}`}</strong> para el proyecto{" "}
              <strong>{solicitudRechazoSeleccionada?.nombre_proyecto}</strong>?
            </p>

            <Form.Group>
              <Form.Label>Motivo del rechazo (Opcional)</Form.Label>
              <Form.Control
                as="textarea"
                rows={3}
                value={motivoRechazo}
                onChange={(event) => setMotivoRechazo(event.target.value)}
                placeholder="Escribe un motivo para el rechazo"
              />
            </Form.Group>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={cerrarModalRechazo}>
              Cancelar
            </Button>
            <Button variant="danger" onClick={confirmarRechazo}>
              Rechazar solicitud
            </Button>
          </Modal.Footer>
        </Modal>
      </Container>
    </div>
  );
}