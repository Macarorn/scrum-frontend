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
import {
  listarNotificaciones as listarNotificacionesApi,
  marcarNotificacionComoLeida,
} from "../services/notificaciones.service";
import { listarProyectos } from "../services/proyectos.service";
import {
  aprobarSolicitud as aprobarSolicitudApi,
  listarSolicitudesPendientesPorProyecto,
  listarSolicitudesUsuario,
  rechazarSolicitud as rechazarSolicitudApi,
} from "../services/solicitudes.service";

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
  const [loading, setLoading] = useState(true);
  // eslint-disable-next-line no-unused-vars
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");
  const [feedback, setFeedback] = useState({ type: "", message: "" });
  const [solicitudSeleccionada, setSolicitudSeleccionada] = useState(null);
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
    const response = await listarSolicitudesPendientesPorProyecto(projectId);
    const pending = response.data || [];
    setSolicitudesPendientes(
      pending.map((solicitud) => mapSolicitud(solicitud, projectMapArg))
    );
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
        setError(
          fetchError.message ||
            "No fue posible cargar el centro de notificaciones"
        );
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

  const handleProjectChange = async (event) => {
    const nextProjectId = event.target.value;
    setSelectedProjectId(nextProjectId);
    setError("");

    try {
      await loadPendingRequests(nextProjectId, projectMap);
    } catch (projectError) {
      setError(
        projectError.message ||
          "No fue posible cargar las solicitudes pendientes del proyecto"
      );
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
      setError(
        markError.message || "No fue posible marcar la notificación como leída"
      );
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
      setError(approvalError.message || "No fue posible aprobar la solicitud");
    }
  };

  const rechazarSolicitud = async (solicitud) => {
    const motivo = window.prompt(
      `Escribe un motivo opcional para rechazar la solicitud de ${
        solicitud.nombre_usuario_solicitante || `usuario #${solicitud.id_usuario}`
      }`,
      motivoRechazo
    );

    if (motivo === null) {
      return;
    }

    try {
      await rechazarSolicitudApi({
        idSolicitud: solicitud.id_solicitud,
        motivo,
      });

      setFeedback({
        type: "warning",
        message: `Solicitud rechazada para ${solicitud.nombre_proyecto}.`,
      });
      await loadDashboard({ silent: true });
    } catch (rejectError) {
      setError(rejectError.message || "No fue posible rechazar la solicitud");
    }
  };

  if (loading) {
    return (
      <div className="min-vh-100 bg-light d-flex align-items-center justify-content-center">
        <Spinner animation="border" role="status" />
      </div>
    );
  }

  // Helpers para estilos de badges (garantizar contraste)
  const badgeStyleForNotificacion = (tipo) => {
    if (tipo === "urgente") {
      return { background: "#e53935", color: "#fff" }; // rojo
    }
    if (tipo === "prioritaria") {
      return { background: "#ffb300", color: "#111" }; // amarillo oscuro texto oscuro
    }
    if (tipo === "sistema") {
      return { background: "#9e9e9e", color: "#fff" }; // gris
    }
    return { background: "#39a900", color: "#fff" }; // verde por defecto con texto blanco
  };

  const badgeStyleForSolicitudEstado = (estado) => {
    if (estado === "Aprobada") {
      return { background: "#39a900", color: "#fff" };
    }
    if (estado === "Pendiente") {
      return { background: "#ffb300", color: "#111" };
    }
    return { background: "#e0e0e0", color: "#333" };
  };

  return (
    <div className="min-vh-100 bg-light py-4">
      {/* CSS local para hover de botones y reglas globales de contraste */}
      <style>{`
        /* Quitar azules por defecto en títulos si algún style global intenta aplicarlos */
        .notifs-heading { color: #39a900 !important; }
        .notifs-subheading { color: #39a900 !important; }

        /* Botones outline: hover -> fondo del color y texto blanco */
        .btn-outline-success.custom {
          color: #39a900;
          border-color: #39a900;
        }
        .btn-outline-success.custom:hover,
        .btn-outline-success.custom:focus {
          background-color: #39a900 !important;
          color: #fff !important;
          border-color: #39a900 !important;
        }

        .btn-outline-danger.custom {
          color: #d9534f;
          border-color: #d9534f;
        }
        .btn-outline-danger.custom:hover,
        .btn-outline-danger.custom:focus {
          background-color: #d9534f !important;
          color: #fff !important;
          border-color: #d9534f !important;
        }

        /* Make list cards slightly subtler (optional) */
        .card.border-0.shadow-sm.h-100 {
          background: #fff;
        }
      `}</style>

      <Container fluid className="px-3 px-md-4">
        <div className="d-flex flex-column flex-lg-row justify-content-between align-items-lg-center gap-3 mb-4">
          <div>
            <h1
              className="h3 fw-bold mb-1 notifs-heading"
              style={{ color: "#39a900" }}
            >
              Centro de notificaciones
            </h1>
            <p className="text-muted mb-0">
              Solicitudes de ingreso, notificaciones del sistema y cambios de
              estado con actualización automática.
            </p>
          </div>
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
            <Card className="border-0 shadow-sm h-100">
              <Card.Body className="p-4">
                <div className="d-flex justify-content-between align-items-center mb-3 flex-wrap gap-2">
                  <div>
                    <h2
                      className="h5 fw-bold mb-1 notifs-subheading"
                      style={{ color: "#39a900" }}
                    >
                      Notificaciones recientes
                    </h2>
                  </div>
                </div>

                {notificaciones.length > 0 ? (
                  <ListGroup
                    variant="flush"
                    className="border rounded-3 overflow-hidden"
                  >
                    {notificaciones.map((notificacion) => (
                      <ListGroup.Item
                        key={notificacion.id_notificacion}
                        className="p-3"
                      >
                        <div className="d-flex justify-content-between align-items-start gap-3">
                          <div className="flex-grow-1">
                            <div className="d-flex flex-wrap align-items-center gap-2 mb-2">
                              <span className="fw-semibold">
                                {notificacion.titulo}
                              </span>
                              <Badge
                                style={{
                                  ...badgeStyleForNotificacion(
                                    notificacion.tipo
                                  ),
                                  fontWeight: 600,
                                  letterSpacing: 0.5,
                                }}
                                className="rounded-pill px-2 border"
                              >
                                {notificacion.tipo}
                              </Badge>
                            </div>
                            <div className="text-muted small mb-1">
                              {notificacion.mensaje || "Sin mensaje adicional."}
                            </div>
                            <div className="text-muted small">
                              {notificacion.nombre_proyecto ? (
                                <span className="me-3">
                                  Proyecto: {notificacion.nombre_proyecto}
                                </span>
                              ) : null}
                              {notificacion.nombre_usuario_solicitante ? (
                                <span className="me-3">
                                  Solicitante:{" "}
                                  {notificacion.nombre_usuario_solicitante}
                                </span>
                              ) : null}
                              <span>{notificacion.fecha_formateada}</span>
                            </div>
                          </div>
                          {!notificacion.leida ? (
                            <Button
                              size="sm"
                              className="btn-outline-success custom"
                              variant="outline-success"
                              onClick={() =>
                                handleMarkAsRead(notificacion.id_notificacion)
                              }
                            >
                              Marcar leída
                            </Button>
                          ) : null}
                        </div>
                      </ListGroup.Item>
                    ))}
                  </ListGroup>
                ) : (
                  <Alert variant="secondary" className="mb-0">
                    No tienes notificaciones activas.
                  </Alert>
                )}
              </Card.Body>
            </Card>
          </Col>

          <Col xl={5}>
            <Row className="g-4">
              <Col xs={12}>
                <Card className="border-0 shadow-sm h-100">
                  <Card.Body className="p-4">
                    <div className="d-flex flex-column flex-sm-row justify-content-between align-items-center gap-3 mb-3">
                      <div className="flex-grow-1">
                        <h2
                          className="h5 fw-bold mb-1"
                          style={{ color: "#39a900" }}
                        >
                          Solicitudes por aprobar
                        </h2>
                        <p className="text-muted mb-0 small">
                          Selecciona el proyecto para ver las solicitudes
                          pendientes.
                        </p>
                      </div>
                    </div>
                    <div style={{ minWidth: 220, width: "5%" }}>
                      <Form.Select
                        value={selectedProjectId}
                        onChange={handleProjectChange}
                        disabled={proyectos.length === 0}
                        aria-label="Seleccionar proyecto"
                        style={{
                          borderColor: "#39a900",
                          fontWeight: 500,
                        }}
                      >
                        {proyectos.length === 0 ? (
                          <option value="">Sin proyectos disponibles</option>
                        ) : null}
                        {proyectos.map((proyecto) => (
                          <option
                            key={proyecto.id_proyecto}
                            value={proyecto.id_proyecto}
                          >
                            {proyecto.nombre}
                          </option>
                        ))}
                      </Form.Select>
                    </div>

                    {solicitudesPendientes.length > 0 ? (
                      <ListGroup
                        variant="flush"
                        className="border rounded-3 overflow-hidden"
                      >
                        {solicitudesPendientes.map((solicitud) => (
                          <ListGroup.Item
                            key={solicitud.id_solicitud}
                            className="p-3"
                          >
                            <div className="d-flex flex-column gap-2">
                              <div className="d-flex flex-wrap align-items-center gap-2">
                                <span className="fw-semibold">
                                  {solicitud.nombre_usuario_solicitante ||
                                    `Usuario #${solicitud.id_usuario}`}
                                </span>
                                <Badge
                                  style={{
                                    ...badgeStyleForSolicitudEstado(
                                      solicitud.estado
                                    ),
                                    fontWeight: 600,
                                    letterSpacing: 0.5,
                                  }}
                                  className="rounded-pill px-2 border"
                                >
                                  {solicitud.estado}
                                </Badge>
                              </div>
                              <div className="text-muted small">
                                {solicitud.nombre_proyecto}
                              </div>
                              <div className="text-muted small">
                                {solicitud.mensaje_opcional ||
                                  "Sin mensaje opcional."}
                              </div>
                              <div className="text-muted small">
                                {solicitud.fecha_formateada}
                              </div>
                              <div className="d-flex flex-wrap gap-2 mt-2">
                                <Button
                                  size="sm"
                                  className="btn-outline-success custom"
                                  variant="outline-success"
                                  onClick={() =>
                                    abrirModalAprobacion(solicitud)
                                  }
                                >
                                  Aprobar
                                </Button>
                                <Button
                                  size="sm"
                                  className="btn-outline-danger custom"
                                  variant="outline-danger"
                                  onClick={() => rechazarSolicitud(solicitud)}
                                >
                                  Rechazar
                                </Button>
                              </div>
                            </div>
                          </ListGroup.Item>
                        ))}
                      </ListGroup>
                    ) : (
                      <Alert variant="secondary" className="mb-0">
                        No hay solicitudes pendientes para el proyecto
                        seleccionado.
                      </Alert>
                    )}
                  </Card.Body>
                </Card>
              </Col>

              <Col xs={12}>
                <Card className="border-0 shadow-sm h-100">
                  <Card.Body className="p-4">
                    <h2
                      className="h5 fw-bold mb-3"
                      style={{ color: "#39a900" }}
                    >
                      Mis solicitudes
                    </h2>

                    {solicitudesUsuario.length > 0 ? (
                      <ListGroup
                        variant="flush"
                        className="border rounded-3 overflow-hidden"
                      >
                        {solicitudesUsuario.map((solicitud) => (
                          <ListGroup.Item
                            key={solicitud.id_solicitud}
                            className="p-3"
                          >
                            <div className="d-flex justify-content-between align-items-start gap-3">
                              <div className="flex-grow-1">
                                <div className="fw-semibold">
                                  {solicitud.nombre_proyecto}
                                </div>
                                <div className="text-muted small">
                                  {solicitud.fecha_formateada}
                                </div>
                                {solicitud.motivo ? (
                                  <div className="text-muted small mt-1">
                                    Motivo: {solicitud.motivo}
                                  </div>
                                ) : null}
                              </div>
                              <Badge
                                style={{
                                  ...badgeStyleForSolicitudEstado(
                                    solicitud.estado
                                  ),
                                  fontWeight: 600,
                                  letterSpacing: 0.5,
                                }}
                                className="rounded-pill px-2 border"
                              >
                                {solicitud.estado}
                              </Badge>
                            </div>
                          </ListGroup.Item>
                        ))}
                      </ListGroup>
                    ) : (
                      <Alert variant="secondary" className="mb-0">
                        Aún no has enviado solicitudes de ingreso.
                      </Alert>
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
      </Container>
    </div>
  );
}
