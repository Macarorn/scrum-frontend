import "bootstrap/dist/css/bootstrap.min.css";
import { useCallback, useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import "../assets/detalles_de_proyecto.css";
import "../styles/SprintBoard.css";
import API_URL from "../services/api";
import { clearSessionTokens, getAccessToken } from "../services/auth.service";
import { showError, showSuccess, showWarning } from "../utils/alerts";

const ROLES_CON_PERMISO_EDICION = ["Product Owner", "Scrum Master", "usuario"];

const formatearFecha = (fecha) => {
  if (!fecha) return "";

  const fechaObj = new Date(fecha);
  if (Number.isNaN(fechaObj.getTime())) return fecha;

  const dia = String(fechaObj.getDate()).padStart(2, "0");
  const mes = String(fechaObj.getMonth() + 1).padStart(2, "0");
  const anio = fechaObj.getFullYear();
  return `${dia}/${mes}/${anio}`;
};

const formatearFechaInput = (fecha) => {
  if (!fecha) return "";

  const fechaObj = new Date(fecha);
  if (Number.isNaN(fechaObj.getTime())) return "";

  return fechaObj.toISOString().slice(0, 10);
};

const valorFormATexto = (valor) => {
  return valor || "No definido";
};

const buildFormData = (project) => ({
  nombre: project?.nombre || "",
  descripcion: project?.descripcion || "",
  tipo: project?.tipo || "",
  estado: project?.estado || "",
  fecha_inicio: formatearFechaInput(project?.fecha_inicio),
  fecha_fin_est: formatearFechaInput(project?.fecha_fin_est),
});

const getSesionUsuarioDesdeToken = () => {
  const token = getAccessToken();

  if (!token) {
    return { id_usuario: null, rol: "" };
  }

  try {
    const payload = JSON.parse(atob(token.split(".")[1]));
    return {
      id_usuario: payload?.id_usuario || null,
      rol: payload?.rol || payload?.rol_principal || "",
    };
  } catch {
    return { id_usuario: null, rol: "" };
  }
};

const DetallesDeProyecto = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [projectDetails, setProjectDetails] = useState(null);
  const [allProjects, setAllProjects] = useState([]);
  const [error, setError] = useState("");
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [formData, setFormData] = useState(buildFormData());
  const [actionMessage, setActionMessage] = useState("");
  const [actionType, setActionType] = useState("");
  const [projectMenuOpen, setProjectMenuOpen] = useState(false);
  const [projectMenuRight, setProjectMenuRight] = useState(false);

  const sesionUsuario = getSesionUsuarioDesdeToken();
  const userRole = sesionUsuario.rol || projectDetails?.rol_principal || "";
  const esCreadorDelProyecto =
    sesionUsuario.id_usuario &&
    String(projectDetails?.creado_por) === String(sesionUsuario.id_usuario);
  const canEdit =
    esCreadorDelProyecto || ROLES_CON_PERMISO_EDICION.includes(userRole);

  const redirectToLogin = useCallback(() => {
    clearSessionTokens();
    navigate("/login", { replace: true });
  }, [navigate]);

  const limpiarMensaje = () => {
    setActionMessage("");
    setActionType("");
  };

  const resetFormFromProject = (project) => {
    setFormData(buildFormData(project));
  };

  useEffect(() => {
    const cargarDatos = async () => {
      try {
        const token = getAccessToken();

        if (!token) {
          redirectToLogin();
          return;
        }

        const headers = {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        };

        const [detalleRes, listadoRes] = await Promise.all([
          fetch(`${API_URL}/proyectos/${id}`, { headers }),
          fetch(`${API_URL}/proyectos`, { headers }),
        ]);

        if (detalleRes.status === 401 || listadoRes.status === 401) {
          redirectToLogin();
          return;
        }

        if (!detalleRes.ok) {
          throw new Error("No se pudo cargar el detalle del proyecto");
        }

        if (!listadoRes.ok) {
          throw new Error("No se pudo cargar la lista de proyectos");
        }

        const detalleData = await detalleRes.json();
        const listadoData = await listadoRes.json();
        const detalleProyecto = detalleData.data || detalleData;
        const listaProyectos = listadoData.data || listadoData || [];
        const proyectos = Array.isArray(listaProyectos) ? listaProyectos : [];
        const proyectoEnListado = proyectos.find(
          (project) => String(project.id_proyecto) === String(id),
        );
        const proyectoCombinado = {
          ...(proyectoEnListado || {}),
          ...(detalleProyecto || {}),
        };

        setAllProjects(proyectos);
        setProjectDetails(proyectoCombinado);
        resetFormFromProject(proyectoCombinado);
      } catch (err) {
        const message = err.message || "Error cargando el proyecto";
        setError(message);
        showError(message);
      }
    };

    cargarDatos();
  }, [id, navigate, redirectToLogin]);

  useEffect(() => {
    if (!projectMenuOpen) return undefined;

    const handleOutside = (event) => {
      if (event.target.closest?.(".backlog-epica-picker")) return;
      setProjectMenuOpen(false);
    };

    const handleEsc = (event) => {
      if (event.key === "Escape") {
        setProjectMenuOpen(false);
      }
    };

    document.addEventListener("mousedown", handleOutside);
    document.addEventListener("keydown", handleEsc);

    return () => {
      document.removeEventListener("mousedown", handleOutside);
      document.removeEventListener("keydown", handleEsc);
    };
  }, [projectMenuOpen]);

  const handleToggleEdit = () => {
    limpiarMensaje();

    if (!canEdit) {
      setActionType("error");
      setActionMessage(
        "No puedes editar este proyecto por permisos de tu rol actual.",
      );
      return;
    }

    if (isEditing) {
      resetFormFromProject(projectDetails);
      setIsEditing(false);
      return;
    }

    setIsEditing(true);
  };

  const handleFieldChange = (event) => {
    const { name, value } = event.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleCancelarEdicion = () => {
    resetFormFromProject(projectDetails);
    limpiarMensaje();
    setIsEditing(false);
  };

  const handleGuardarCambios = async () => {
    limpiarMensaje();

    if (!formData.nombre.trim()) {
      setActionType("error");
      setActionMessage("El nombre del proyecto es obligatorio.");
      showWarning("Completa todos los campos");
      return;
    }

    if (
      formData.fecha_inicio &&
      formData.fecha_fin_est &&
      formData.fecha_inicio > formData.fecha_fin_est
    ) {
      const message = "La fecha de fin debe ser posterior a la fecha de inicio";
      setActionType("error");
      setActionMessage(message);
      showError(message);
      return;
    }

    try {
      setIsSaving(true);
      const token = getAccessToken();

      if (!token) {
        redirectToLogin();
        return;
      }

      const payload = {
        nombre: formData.nombre.trim(),
        descripcion: formData.descripcion.trim() || null,
        tipo: formData.tipo.trim() || null,
        estado: formData.estado.trim() || null,
        fecha_inicio: formData.fecha_inicio || null,
        fecha_fin_est: formData.fecha_fin_est || null,
      };

      const response = await fetch(`${API_URL}/proyectos/${id}`, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });
      const result = await response.json();

      if (!response.ok) {
        if (response.status === 401) {
          redirectToLogin();
          return;
        }

        if (response.status === 403) {
          throw new Error(
            result.message ||
              "No puedes realizar esta accion por permisos de tu rol.",
          );
        }

        throw new Error(result.message || "No se pudo actualizar el proyecto");
      }

      const updatedProject = result.data || payload;

      setProjectDetails((prev) => ({
        ...(prev || {}),
        ...updatedProject,
      }));
      setAllProjects((prev) =>
        prev.map((project) =>
          String(project.id_proyecto) === String(id)
            ? { ...project, ...updatedProject }
            : project,
        ),
      );
      resetFormFromProject(updatedProject);
      setActionType("success");
      setActionMessage("Proyecto actualizado correctamente.");
      showSuccess("Proyecto actualizado correctamente.");
      setIsEditing(false);
    } catch (err) {
      const message = err.message || "Ocurrio un error al guardar los cambios.";
      setActionType("error");
      setActionMessage(message);
      showError(message);
    } finally {
      setIsSaving(false);
    }
  };

  if (error) {
    return <div>{error}</div>;
  }

  if (!projectDetails || projectDetails.creado_por == null) {
    return <div>Cargando...</div>;
  }

  return (
    <div className="detalles-container">
      <main className="main-container">
        <div className="sprint-topbar">
          <div>
            <p className="sprint-tag">Detalles del Proyecto</p>
            <h1 className="sprint-title">
              {projectDetails.nombre || "Proyecto"}
            </h1>
            <p className="sprint-project-current">
              {projectDetails.tipo || ""}
            </p>
          </div>

          <div className="sprint-actions">
            <div className="selector-box">
              <label>Proyecto</label>
              <div
                className={`backlog-epica-picker ${
                  projectMenuRight ? "menu-right" : ""
                }`}
              >
                <button
                  type="button"
                  className="backlog-epica-toggle"
                  onClick={(event) => {
                    const rect = event.currentTarget.getBoundingClientRect();
                    const shouldRight = window.innerWidth - rect.right < 360;
                    setProjectMenuOpen((prev) => !prev);
                    setProjectMenuRight(shouldRight);
                  }}
                  disabled={allProjects.length === 0}
                >
                  <span>{projectDetails.nombre}</span>
                  <span className="backlog-epica-caret">v</span>
                </button>

                {projectMenuOpen && (
                  <div
                    className={`backlog-epica-menu ${
                      projectMenuRight ? "menu-right" : ""
                    }`}
                    role="menu"
                  >
                    <div className="backlog-epica-menu-list">
                      {allProjects.map((proyecto) => (
                        <button
                          key={proyecto.id_proyecto}
                          type="button"
                          className={`backlog-epica-item ${
                            String(proyecto.id_proyecto) ===
                            String(projectDetails.id_proyecto)
                              ? "selected"
                              : ""
                          }`}
                          onClick={() => {
                            navigate(
                              `/detalles_de_proyecto/${proyecto.id_proyecto}`,
                            );
                          }}
                        >
                          <span className="backlog-epica-item-name">
                            {proyecto.nombre}
                          </span>
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="project-card">
          <button
            className={`edit-btn ${isEditing ? "active" : ""}`}
            onClick={handleToggleEdit}
            type="button"
            title={
              canEdit
                ? isEditing
                  ? "Salir del modo edicion"
                  : "Editar proyecto"
                : "Sin permisos para editar"
            }
          >
            <i className="bx bxs-pencil"></i>
          </button>

          {actionMessage && (
            <div
              className={`project-action-message ${
                actionType === "success" ? "success" : "error"
              }`}
            >
              {actionMessage}
            </div>
          )}

          <div className="project-header">
            <div className="project-icon">
              <i className="bx bx-store"></i>
            </div>

            <div className="project-info">
              <div className="info-field">
                <label>Nombre del proyecto</label>
                <input
                  type="text"
                  name="nombre"
                  className={`project-field ${
                    isEditing ? "is-editable" : "is-readonly"
                  }`}
                  value={
                    isEditing ? formData.nombre : projectDetails.nombre || ""
                  }
                  readOnly={!isEditing}
                  onChange={handleFieldChange}
                />
              </div>

              <div className="info-field">
                <label>Fecha inicio</label>
                {isEditing ? (
                  <input
                    type="date"
                    name="fecha_inicio"
                    className="project-field is-editable"
                    value={formData.fecha_inicio}
                    readOnly={!isEditing}
                    onChange={handleFieldChange}
                  />
                ) : (
                  <input
                    type="text"
                    className="project-field is-readonly"
                    value={formatearFecha(projectDetails.fecha_inicio)}
                    readOnly
                  />
                )}
              </div>

              <div className="info-field">
                <label>Rol asignado</label>
                <input
                  type="text"
                  className="project-field is-readonly"
                  value={valorFormATexto(userRole)}
                  readOnly
                />
              </div>

              <div className="info-field">
                <label>Tipo</label>
                <input
                  type="text"
                  name="tipo"
                  className={`project-field ${
                    isEditing ? "is-editable" : "is-readonly"
                  }`}
                  value={
                    isEditing
                      ? formData.tipo
                      : valorFormATexto(projectDetails.tipo)
                  }
                  readOnly={!isEditing}
                  onChange={handleFieldChange}
                />
              </div>

              <div className="info-field">
                <label>Estado</label>
                <input
                  type="text"
                  name="estado"
                  className={`project-field ${
                    isEditing ? "is-editable" : "is-readonly"
                  }`}
                  value={
                    isEditing
                      ? formData.estado
                      : valorFormATexto(projectDetails.estado)
                  }
                  readOnly={!isEditing}
                  onChange={handleFieldChange}
                />
              </div>

              <div className="info-field">
                <label>Codigo del proyecto</label>
                <input
                  type="text"
                  className="project-field is-readonly"
                  value={projectDetails.codigo_proyecto || "N/A"}
                  readOnly
                />
              </div>

              <div className="info-field">
                <label>Fin estimado</label>
                {isEditing ? (
                  <input
                    type="date"
                    name="fecha_fin_est"
                    className="project-field is-editable"
                    value={formData.fecha_fin_est}
                    readOnly={!isEditing}
                    onChange={handleFieldChange}
                  />
                ) : (
                  <input
                    type="text"
                    className="project-field is-readonly"
                    value={formatearFecha(projectDetails.fecha_fin_est)}
                    readOnly
                  />
                )}
              </div>
            </div>
          </div>

          <div className="project-body">
            <div className="info-field w-100">
              <label>Descripcion</label>
              <textarea
                name="descripcion"
                className={`project-textarea ${
                  isEditing ? "is-editable" : "is-readonly"
                }`}
                rows={3}
                value={
                  isEditing
                    ? formData.descripcion
                    : valorFormATexto(projectDetails.descripcion)
                }
                readOnly={!isEditing}
                onChange={handleFieldChange}
              />
            </div>
          </div>

          {isEditing && (
            <div className="edit-actions">
              <button
                type="button"
                className="btn btn-success"
                onClick={handleGuardarCambios}
                disabled={isSaving}
              >
                {isSaving ? "Guardando..." : "Guardar cambios"}
              </button>
              <button
                type="button"
                className="btn btn-outline-secondary"
                onClick={handleCancelarEdicion}
                disabled={isSaving}
              >
                Cancelar
              </button>
            </div>
          )}

          <div className="project-body">
            <div className="accesos-row">
              <div className="accesos-spacer" />
              <div className="accesos-directos-section mt-0">
                <h3 className="accesos-title">Accesos directos</h3>
                <div className="accesos-directos-buttons">
                  <button
                    type="button"
                    className="btn btn-outline-primary acceso-btn"
                    onClick={() =>
                      navigate(
                        `/backlog?id_proyecto=${projectDetails.id_proyecto}`,
                      )
                    }
                  >
                    <i className="bx bx-list-ul"></i> Backlog
                  </button>
                  <button
                    type="button"
                    className="btn btn-outline-primary acceso-btn"
                    onClick={() =>
                      navigate(
                        `/epicas?id_proyecto=${projectDetails.id_proyecto}`,
                      )
                    }
                  >
                    <i className="bx bx-bookmark"></i> Epicas
                  </button>
                  <button
                    type="button"
                    className="btn btn-outline-primary acceso-btn"
                    onClick={() =>
                      navigate(
                        `/sprints?id_proyecto=${projectDetails.id_proyecto}`,
                      )
                    }
                  >
                    <i className="bx bx-run"></i> Sprints operativos
                  </button>
                  <button
                    type="button"
                    className="btn btn-outline-primary acceso-btn"
                    onClick={() =>
                      navigate(
                        `/kanban?id_proyecto=${projectDetails.id_proyecto}`,
                      )
                    }
                  >
                    <i className="bx bx-grid-alt"></i> Tablero Kanban
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        <section className="other-projects">
          <div className="other-projects-header">
            <h2>Otros proyectos</h2>
          </div>
          <div className="other-projects-list">
            {allProjects
              .filter((project) => String(project.id_proyecto) !== String(id))
              .map((project) => (
                <div
                  key={project.id_proyecto}
                  className="small-card d-flex flex-column align-items-start"
                  style={{ cursor: "pointer" }}
                  onClick={() =>
                    navigate(`/detalles_de_proyecto/${project.id_proyecto}`)
                  }
                >
                  <p
                    className="small-card-title mb-1"
                    style={{ fontWeight: 600 }}
                  >
                    {project.nombre}
                  </p>
                  <span className="badge-epica">Epica</span>
                </div>
              ))}
          </div>
        </section>
      </main>
    </div>
  );
};

export default DetallesDeProyecto;
