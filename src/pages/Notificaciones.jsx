import { useMemo, useState } from "react";
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

const solicitudesPendientes = [
  {
    id: 1,
    proyecto: "App Scrum",
    solicitante: "Jefferson López",
    rolSolicitado: "Developer",
    fecha: "22 abr 2026, 09:15",
    estado: "Pendiente",
  },
  {
    id: 2,
    proyecto: "Portal de Clientes",
    solicitante: "Sofía Bonilla",
    rolSolicitado: "Product Owner",
    fecha: "22 abr 2026, 08:40",
    estado: "Pendiente",
  },
];

const misSolicitudes = [
  {
    id: 1,
    proyecto: "App Scrum",
    estado: "Aprobada",
    fecha: "21 abr 2026, 18:20",
  },
  {
    id: 2,
    proyecto: "Intranet Comercial",
    estado: "En revisión",
    fecha: "22 abr 2026, 07:55",
  },
];

const emptyStateCards = [
  "No hay solicitudes pendientes por aprobar.",
  "Aún no tienes solicitudes enviadas.",
];

const notificacionesGeneralesMock = [
  {
    id: 1,
    tipo: "informativa",
    titulo: "Recordatorio daily",
    mensaje: "Tu daily del equipo Alpha inicia a las 9:30 a.m.",
    fecha: "22 abr 2026, 09:00",
    leida: false,
  },
  {
    id: 2,
    tipo: "prioritaria",
    titulo: "Cambio en alcance",
    mensaje: "Se agregó una historia crítica al sprint en curso.",
    fecha: "21 abr 2026, 16:35",
    leida: true,
  },
  {
    id: 3,
    tipo: "sistema",
    titulo: "Actualización completada",
    mensaje: "La maqueta de solicitudes fue publicada para revisión UX.",
    fecha: "20 abr 2026, 11:20",
    leida: true,
  },
];

const rolesDisponibles = [
  "Product Owner",
  "Scrum Master",
  "Developer",
  "Designer",
];

const statusVariant = {
  Pendiente: "warning",
  Aprobada: "success",
  Rechazada: "danger",
  "En revisión": "info",
};

export default function Notificaciones() {
  const [solicitudes, setSolicitudes] = useState(solicitudesPendientes);
  const [misSolicitudesState, setMisSolicitudesState] =
    useState(misSolicitudes);
  const [notificacionesGenerales, setNotificacionesGenerales] = useState(
    notificacionesGeneralesMock,
  );
  const [modoVisual, setModoVisual] = useState("normal");
  const [sinPermisos, setSinPermisos] = useState(false);
  const [loadingAccion, setLoadingAccion] = useState(false);
  const [feedback, setFeedback] = useState({ type: "", message: "" });
  const [solicitudSeleccionada, setSolicitudSeleccionada] = useState(null);
  const [rolAprobacion, setRolAprobacion] = useState("");
  const [errorRol, setErrorRol] = useState("");

  const pendientes = useMemo(
    () =>
      solicitudes.filter((solicitud) => solicitud.estado === "Pendiente")
        .length,
    [solicitudes],
  );

  const marcarComoLeida = (id) => {
    setNotificacionesGenerales((current) =>
      current.map((item) => (item.id === id ? { ...item, leida: true } : item)),
    );
  };

  const abrirModalAprobacion = (solicitud) => {
    if (sinPermisos) return;
    setSolicitudSeleccionada(solicitud);
    setRolAprobacion("");
    setErrorRol("");
  };

  const cerrarModalAprobacion = () => {
    setSolicitudSeleccionada(null);
    setRolAprobacion("");
    setErrorRol("");
  };

  const aprobarSolicitud = async () => {
    if (!rolAprobacion) {
      setErrorRol("Debes seleccionar un rol para aprobar la solicitud.");
      return;
    }

    setLoadingAccion(true);
    setErrorRol("");

    setTimeout(() => {
      const solicitud = solicitudSeleccionada;
      if (!solicitud) {
        setLoadingAccion(false);
        return;
      }

      setSolicitudes((current) =>
        current.map((item) =>
          item.id === solicitud.id
            ? {
                ...item,
                estado: "Aprobada",
                rolAprobado: rolAprobacion,
              }
            : item,
        ),
      );

      setMisSolicitudesState((current) => [
        {
          id: Date.now(),
          proyecto: solicitud.proyecto,
          estado: "Aprobada",
          fecha: "22 abr 2026, 10:10",
        },
        ...current,
      ]);

      setFeedback({
        type: "success",
        message: `Solicitud aprobada para ${solicitud.solicitante} con rol ${rolAprobacion}.`,
      });

      setLoadingAccion(false);
      cerrarModalAprobacion();
    }, 700);
  };

  const rechazarSolicitud = (solicitud) => {
    if (sinPermisos) return;

    setSolicitudes((current) =>
      current.map((item) =>
        item.id === solicitud.id
          ? {
              ...item,
              estado: "Rechazada",
            }
          : item,
      ),
    );

    setMisSolicitudesState((current) => [
      {
        id: Date.now(),
        proyecto: solicitud.proyecto,
        estado: "Rechazada",
        fecha: "22 abr 2026, 10:11",
      },
      ...current,
    ]);

    setFeedback({
      type: "danger",
      message: `Solicitud rechazada para ${solicitud.solicitante}.`,
    });
  };

  const solicitudesPendientesVisibles =
    modoVisual === "empty"
      ? []
      : solicitudes.filter((item) => item.estado === "Pendiente");

  const misSolicitudesVisibles =
    modoVisual === "empty" ? [] : misSolicitudesState;
  const notificacionesVisibles =
    modoVisual === "empty" ? [] : notificacionesGenerales;

  return (
    <div className="min-vh-100 bg-light py-4">
      <Container fluid className="px-3 px-md-4">
        <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-3 mb-4">
          <div>
            <h1 className="h3 fw-bold text-success-emphasis mb-1">
              Centro de notificaciones
            </h1>
            <p className="text-muted mb-0">
              Maqueta visual para resolver solicitudes de ingreso a proyectos.
            </p>
          </div>

          <div className="d-flex gap-2 flex-wrap">
            <Badge
              bg="warning"
              text="dark"
              className="align-self-center py-2 px-3"
            >
              {pendientes} pendientes
            </Badge>
            <Form.Select
              size="sm"
              value={modoVisual}
              onChange={(event) => setModoVisual(event.target.value)}
              style={{ maxWidth: 180 }}
              aria-label="Modo visual"
            >
              <option value="normal">Modo normal</option>
              <option value="loading">Modo loading</option>
              <option value="error">Modo error</option>
              <option value="empty">Modo vacío</option>
            </Form.Select>
            <Button
              variant={sinPermisos ? "danger" : "outline-secondary"}
              size="sm"
              onClick={() => setSinPermisos((current) => !current)}
            >
              {sinPermisos ? "Sin permisos: activo" : "Sin permisos: inactivo"}
            </Button>
          </div>
        </div>


        {modoVisual === "loading" && (
          <div className="text-center py-5">
            <Spinner animation="border" role="status" />
          </div>
        )}

        {modoVisual === "error" && (
          <Alert variant="danger" className="shadow-sm">
            Error funcional simulado: el usuario ya es miembro, la solicitud
            está duplicada o no tiene permisos para esta acción.
          </Alert>
        )}

        {feedback.message && modoVisual === "normal" && (
          <Alert
            variant={feedback.type || "success"}
            className="shadow-sm"
            dismissible
            onClose={() => setFeedback({ type: "", message: "" })}
          >
            {feedback.message}
          </Alert>
        )}

        <Row className="g-4" aria-disabled={sinPermisos}>
          <Col xl={7}>
            <Card className="border-0 shadow-sm h-100">
              <Card.Body className="p-4">
                <h2 className="h5 fw-bold mb-3">Notificaciones generales</h2>
                {notificacionesVisibles.length > 0 ? (
                  <ListGroup
                    variant="flush"
                    className="border rounded-3 overflow-hidden mb-3"
                  >
                    {notificacionesVisibles.map((item) => (
                      <ListGroup.Item key={item.id} className="p-3">
                        <div className="d-flex justify-content-between align-items-start gap-3">
                          <div>
                            <div className="fw-semibold">{item.titulo}</div>
                            <div className="text-muted small mb-1">
                              {item.mensaje}
                            </div>
                            <div className="text-muted small">{item.fecha}</div>
                          </div>
                          <div className="d-flex flex-column align-items-end gap-2">
                            <Badge bg={item.leida ? "secondary" : "primary"}>
                              {item.leida ? "Leída" : "Nueva"}
                            </Badge>
                            {!item.leida && (
                              <Button
                                size="sm"
                                variant="outline-primary"
                                onClick={() => marcarComoLeida(item.id)}
                              >
                                Marcar leída
                              </Button>
                            )}
                          </div>
                        </div>
                      </ListGroup.Item>
                    ))}
                  </ListGroup>
                ) : (
                  <Alert variant="secondary" className="mb-3">
                    No tienes notificaciones generales.
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
                    <div className="d-flex justify-content-between align-items-center mb-3">
                      <h2 className="h5 fw-bold mb-0">
                        Solicitudes pendientes
                      </h2>
                      <Badge bg="warning" text="dark">
                        Requieren acción
                      </Badge>
                    </div>

                    {solicitudesPendientesVisibles.length > 0 ? (
                      <ListGroup
                        variant="flush"
                        className="border rounded-3 overflow-hidden"
                      >
                        {solicitudesPendientesVisibles.map((solicitud) => (
                          <ListGroup.Item key={solicitud.id} className="p-3">
                            <div className="d-flex flex-column gap-2">
                              <div>
                                <div className="fw-semibold">
                                  {solicitud.proyecto}
                                </div>
                                <div className="text-muted small">
                                  {solicitud.solicitante} solicita{" "}
                                  {solicitud.rolSolicitado}
                                </div>
                                <div className="text-muted small">
                                  {solicitud.fecha}
                                </div>
                              </div>

                              <div className="d-flex flex-column flex-sm-row gap-2 align-items-start align-items-sm-center">
                                <Badge bg={statusVariant[solicitud.estado]}>
                                  {solicitud.estado}
                                </Badge>
                                <Button
                                  size="sm"
                                  variant="outline-success"
                                  onClick={() =>
                                    abrirModalAprobacion(solicitud)
                                  }
                                  disabled={sinPermisos}
                                >
                                  Aprobar
                                </Button>
                                <Button
                                  size="sm"
                                  variant="outline-danger"
                                  onClick={() => rechazarSolicitud(solicitud)}
                                  disabled={sinPermisos}
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
                        No hay notificaciones pendientes en este momento.
                      </Alert>
                    )}
                  </Card.Body>
                </Card>
              </Col>

              <Col xs={12}>
                <Card className="border-0 shadow-sm h-100">
                  <Card.Body className="p-4">
                    <h2 className="h5 fw-bold mb-3">Mis solicitudes</h2>

                    {misSolicitudesVisibles.length > 0 ? (
                      <ListGroup
                        variant="flush"
                        className="border rounded-3 overflow-hidden"
                      >
                        {misSolicitudesVisibles.map((solicitud) => (
                          <ListGroup.Item
                            key={solicitud.id}
                            className="d-flex justify-content-between align-items-start gap-3"
                          >
                            <div>
                              <div className="fw-semibold">
                                {solicitud.proyecto}
                              </div>
                              <div className="text-muted small">
                                {solicitud.fecha}
                              </div>
                            </div>
                            <Badge bg={statusVariant[solicitud.estado]}>
                              {solicitud.estado}
                            </Badge>
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

              <Col xs={12}>
                <Card className="border-0 shadow-sm h-100">
                  <Card.Body className="p-4">
                    <h3 className="h6 fw-bold mb-3">
                      Estados vacíos y bloqueo visual
                    </h3>
                    <div className="d-grid gap-3">
                      {emptyStateCards.map((message) => (
                        <Alert
                          key={message}
                          variant="light"
                          className="mb-0 border"
                        >
                          {message}
                        </Alert>
                      ))}
                      <div className="p-3 rounded-3 bg-danger-subtle border border-danger-subtle">
                        <div className="fw-semibold text-danger mb-1">
                          Sin permisos
                        </div>
                        <div className="text-danger-emphasis small">
                          El aprobador sin permisos ve las acciones
                          deshabilitadas para aprobar o rechazar solicitudes.
                        </div>
                      </div>
                    </div>
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
            <p className="mb-2">
              Selecciona el rol para{" "}
              <strong>{solicitudSeleccionada?.solicitante}</strong> en el
              proyecto <strong>{solicitudSeleccionada?.proyecto}</strong>.
            </p>

            <Form.Group>
              <Form.Label>Rol asignado</Form.Label>
              <Form.Select
                value={rolAprobacion}
                onChange={(event) => {
                  setRolAprobacion(event.target.value);
                  if (errorRol) setErrorRol("");
                }}
              >
                <option value="">Selecciona un rol</option>
                {rolesDisponibles.map((rol) => (
                  <option key={rol} value={rol}>
                    {rol}
                  </option>
                ))}
              </Form.Select>
              {errorRol && (
                <Form.Text className="text-danger d-block mt-2">
                  {errorRol}
                </Form.Text>
              )}
            </Form.Group>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="outline-secondary" onClick={cerrarModalAprobacion}>
              Cancelar
            </Button>
            <Button
              variant="success"
              onClick={aprobarSolicitud}
              disabled={loadingAccion}
            >
              {loadingAccion ? "Aprobando..." : "Confirmar aprobación"}
            </Button>
          </Modal.Footer>
        </Modal>
      </Container>
    </div>
  );
}
