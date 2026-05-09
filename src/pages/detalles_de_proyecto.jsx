import "bootstrap/dist/css/bootstrap.min.css";
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import useAutoDismiss from "../hooks/useAutoDismiss";
import "../assets/detalles_de_proyecto.css";
import "../styles/SprintBoard.css";
import API_URL from "../services/api";
import { getAccessToken } from "../services/auth.service";

const ROLES_CON_PERMISO_EDICION = ["Product Owner", "Scrum Master", "usuario"];

// Función para formatear fecha a dd/mm/aaaa
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
  if (!valor) return "No definido";
  return valor;
};

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
  const [error, setError] = useState("");
  const [allProjects, setAllProjects] = useState([]);
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [formData, setFormData] = useState({
    nombre: "",
    descripcion: "",
    tipo: "",
    project_type_text: "",
    team_size: "",
    estado: "",
    fecha_inicio: "",
    fecha_fin_est: "",
  });
  const [actionMessage, setActionMessage] = useState("");
  const [actionType, setActionType] = useState("");
  const [projectMenuOpen, setProjectMenuOpen] = useState(false);
  const [projectMenuRight, setProjectMenuRight] = useState(false);


  // Proyecto actual + listado para completar campos faltantes
  useEffect(() => {
    const cargarDatos = async () => {
      try {
        const token = getAccessToken();

        const [detalleRes, listadoRes] = await Promise.all([
          fetch(`${API_URL}/proyectos/${id}`, {
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
          }),
          fetch(`${API_URL}/proyectos`, {
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
          }),
        ]);

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
        const proyectoEnListado = listaProyectos.find(
          (project) => String(project.id_proyecto) === String(id),
        );

        setAllProjects(Array.isArray(listaProyectos) ? listaProyectos : []);
        const proyectoCombinado = {
          ...(proyectoEnListado || {}),
          ...(detalleProyecto || {}),
        };

        setProjectDetails(proyectoCombinado);
        setFormData({
          nombre: proyectoCombinado.nombre || "",
          descripcion: proyectoCombinado.descripcion || "",
          tipo: ["Desarrollo de software", "Diseño UX/UI", "Migración de datos", "Implementación Scrum"].includes(proyectoCombinado.tipo) ? proyectoCombinado.tipo : (proyectoCombinado.tipo ? "Otro" : ""),
          project_type_text: ["Desarrollo de software", "Diseño UX/UI", "Migración de datos", "Implementación Scrum"].includes(proyectoCombinado.tipo) ? "" : proyectoCombinado.tipo || "",
          estado: proyectoCombinado.estado || "",
          fecha_inicio: formatearFechaInput(proyectoCombinado.fecha_inicio),
          fecha_fin_est: formatearFechaInput(proyectoCombinado.fecha_fin_est),
          team_size: proyectoCombinado.team_size || 1,
        });
      } catch (err) {
        setError(err.message || "Error cargando el proyecto");
      }
    };

    cargarDatos();
  }, [id]);

  const sesionUsuario = getSesionUsuarioDesdeToken();
  const userRole = sesionUsuario.rol || projectDetails?.rol_principal || "";
  const esCreadorDelProyecto =
    sesionUsuario.id_usuario &&
    String(projectDetails?.creado_por) === String(sesionUsuario.id_usuario);
  const canEdit =
    esCreadorDelProyecto || ROLES_CON_PERMISO_EDICION.includes(userRole);

  const limpiarMensaje = () => {
    setActionMessage("");
    setActionType("");
  };

  // Auto-dismiss visible action messages after 4s and on route change
  useAutoDismiss(actionMessage, (v) => { setActionMessage(v); setActionType(''); }, 4000);


  useEffect(() => {
    if (!projectMenuOpen) return undefined;

    const handleOutside = (event) => {
      if (event.target.closest && event.target.closest('.backlog-epica-picker')) return;
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
      setFormData({
        nombre: projectDetails.nombre || "",
        descripcion: projectDetails.descripcion || "",
        tipo: ["Desarrollo de software", "Diseño UX/UI", "Migración de datos", "Implementación Scrum"].includes(projectDetails.tipo) ? projectDetails.tipo : (projectDetails.tipo ? "Otro" : ""),
        project_type_text: ["Desarrollo de software", "Diseño UX/UI", "Migración de datos", "Implementación Scrum"].includes(projectDetails.tipo) ? "" : projectDetails.tipo || "",
        estado: projectDetails.estado || "",
        fecha_inicio: formatearFechaInput(projectDetails.fecha_inicio),
        fecha_fin_est: formatearFechaInput(projectDetails.fecha_fin_est),
        team_size: projectDetails.team_size || 1,
      });
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
    setFormData({
      nombre: projectDetails.nombre || "",
      descripcion: projectDetails.descripcion || "",
      tipo: ["Desarrollo de software", "Diseño UX/UI", "Migración de datos", "Implementación Scrum"].includes(projectDetails.tipo) ? projectDetails.tipo : (projectDetails.tipo ? "Otro" : ""),
      project_type_text: ["Desarrollo de software", "Diseño UX/UI", "Migración de datos", "Implementación Scrum"].includes(projectDetails.tipo) ? "" : projectDetails.tipo || "",
      estado: projectDetails.estado || "",
      fecha_inicio: formatearFechaInput(projectDetails.fecha_inicio),
      fecha_fin_est: formatearFechaInput(projectDetails.fecha_fin_est),
      team_size: projectDetails.team_size || 1,
    });
    limpiarMensaje();
    setIsEditing(false);
  };

  const handleGuardarCambios = async () => {
    limpiarMensaje();

    if (!formData.nombre.trim()) {
      setActionType("error");
      setActionMessage("El nombre del proyecto es obligatorio.");
      return;
    }

    if (formData.tipo === "Otro" && (!formData.project_type_text || !formData.project_type_text.trim())) {
      setActionType("error");
      setActionMessage("El tipo de proyecto personalizado es obligatorio.");
      return;
    }

    if (formData.team_size) {
      const num = Number(formData.team_size);
      if (!Number.isInteger(num) || num < 1) {
        setActionType("error");
        setActionMessage("El número de integrantes debe ser un entero >= 1.");
        return;
      }
    }

    try {
      setIsSaving(true);
      const token = getAccessToken();
      const payload = {
        nombre: formData.nombre.trim(),
        descripcion: formData.descripcion.trim() || null,
        tipo: formData.tipo === "Otro" && formData.project_type_text ? formData.project_type_text.trim() : (formData.tipo || null),
        estado: formData.estado.trim() || null,
        fecha_inicio: formData.fecha_inicio || null,
        fecha_fin_est: formData.fecha_fin_est || null,
        team_size: formData.team_size ? Number(formData.team_size) : 1,
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
        if (response.status === 403) {
          throw new Error(
            result.message ||
              "No puedes realizar esta acción por permisos de tu rol.",
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

      setFormData({
        nombre: updatedProject.nombre || "",
        descripcion: updatedProject.descripcion || "",
        tipo: ["Desarrollo de software", "Diseño UX/UI", "Migración de datos", "Implementación Scrum"].includes(updatedProject.tipo) ? updatedProject.tipo : (updatedProject.tipo ? "Otro" : ""),
        project_type_text: ["Desarrollo de software", "Diseño UX/UI", "Migración de datos", "Implementación Scrum"].includes(updatedProject.tipo) ? "" : updatedProject.tipo || "",
        estado: updatedProject.estado || "",
        fecha_inicio: formatearFechaInput(updatedProject.fecha_inicio),
        fecha_fin_est: formatearFechaInput(updatedProject.fecha_fin_est),
        team_size: updatedProject.team_size || 1,
      });

      setActionType("success");
      setActionMessage("Proyecto actualizado correctamente.");
      setIsEditing(false);
    } catch (err) {
      setActionType("error");
      setActionMessage(
        err.message || "Ocurrió un error al guardar los cambios.",
      );
    } finally {
      setIsSaving(false);
    }
  };


  // Returns condicionales después de todos los hooks

  if (error) {
    return <div>{error}</div>;
  }
  if (!projectDetails || projectDetails.creado_por == null) {
    return <div>Cargando...</div>;
  }

  return (
    <div className="detalles-container">
      {/* MAIN */}
      <main className="main-container">
        <div className="sprint-topbar">
          <div>
            <p className="sprint-tag">Detalles del Proyecto</p>
            <h1 className="sprint-title">{projectDetails.nombre || "Proyecto"}</h1>
            <p className="sprint-project-current">{projectDetails.tipo || ""}</p>
          </div>

          <div className="sprint-actions">
            <div className="selector-box">
              <label>Proyecto</label>
              <div className={`backlog-epica-picker ${projectMenuRight ? "menu-right" : ""}`}>
                <button
                  type="button"
                  className="backlog-epica-toggle"
                  onClick={(e) => {
                    const rect = e.currentTarget.getBoundingClientRect();
                    const shouldRight = window.innerWidth - rect.right < 360;
                    setProjectMenuOpen((prev) => !prev);
                    try { setProjectMenuRight(shouldRight); } catch {}
                  }}
                  disabled={allProjects.length === 0}
                >
                  <span>{projectDetails.nombre}</span>
                  <span className="backlog-epica-caret">▾</span>
                </button>

                {projectMenuOpen && (
                  <div className={`backlog-epica-menu ${projectMenuRight ? "menu-right" : ""}`} role="menu">
                    <div className="backlog-epica-menu-list">
                      {allProjects.map((proyecto) => (
                        <button
                          key={proyecto.id_proyecto}
                          type="button"
                          className={`backlog-epica-item ${String(proyecto.id_proyecto) === String(projectDetails.id_proyecto) ? "selected" : ""}`}
                          onClick={() => {
                            navigate(`/detalles_de_proyecto/${proyecto.id_proyecto}`);
                          }}
                        >
                          <span className="backlog-epica-item-name">{proyecto.nombre}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="project-card ">
          <button
            className={`edit-btn ${isEditing ? "active" : ""}`}
            onClick={handleToggleEdit}
            type="button"
            title={
              canEdit
                ? isEditing
                  ? "Salir del modo edición"
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

          {/* INFO PRINCIPAL */}
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
                  className={`project-field ${isEditing ? "is-editable" : "is-readonly"}`}
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
                {isEditing ? (
                  <select
                    name="tipo"
                    className="project-field is-editable"
                    value={formData.tipo}
                    onChange={handleFieldChange}
                  >
                    <option value="">Selecciona un tipo</option>
                    <option value="Desarrollo de software">Desarrollo de software</option>
                    <option value="Diseño UX/UI">Diseño UX/UI</option>
                    <option value="Migración de datos">Migración de datos</option>
                    <option value="Implementación Scrum">Implementación Scrum</option>
                    <option value="Otro">Otro</option>
                  </select>
                ) : (
                  <input
                    type="text"
                    className="project-field is-readonly"
                    value={valorFormATexto(projectDetails.tipo)}
                    readOnly
                  />
                )}
              </div>

              {isEditing && formData.tipo === "Otro" && (
                <div className="info-field">
                  <label>Tipo personalizado <span className="text-danger">*</span></label>
                  <input
                    type="text"
                    name="project_type_text"
                    className="project-field is-editable"
                    value={formData.project_type_text}
                    onChange={handleFieldChange}
                    placeholder="Escribe el tipo"
                  />
                </div>
              )}

              <div className="info-field">
                <label>Estado</label>
                <input
                  type="text"
                  name="estado"
                  className={`project-field ${isEditing ? "is-editable" : "is-readonly"}`}
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
                <label>Código del proyecto</label>
                <input
                  type="text"
                  className="project-field is-readonly"
                  value={projectDetails.codigo_proyecto || "N/A"}
                  readOnly
                />
              </div>

              <div className="info-field">
                <label>Integrantes requeridos</label>
                <input
                  type="number"
                  name="team_size"
                  min="1"
                  className={`project-field ${isEditing ? "is-editable" : "is-readonly"}`}
                  value={
                    isEditing
                      ? formData.team_size
                      : valorFormATexto(projectDetails.team_size || 1)
                  }
                  readOnly={!isEditing}
                  onChange={handleFieldChange}
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
              <label>Descripción</label>
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

          {/* BODY */}
          <div className="project-body">
            {/* ACCESOS DIRECTOS alineado */}
            <div className="accesos-row">
              <div className="accesos-spacer" />
              <div className="accesos-directos-section mt-0">
                <h3 className="accesos-title">Accesos directos</h3>
                <div className="accesos-directos-buttons">
                  <button
                    className="btn btn-outline-primary acceso-btn"
                    onClick={() => navigate(`/backlog?id_proyecto=${projectDetails.id_proyecto}`)}
                  >
                    <i className="bx bx-list-ul"></i> Backlog
                  </button>
                  <button
                    className="btn btn-outline-primary acceso-btn"
                    onClick={() => navigate(`/epicas?id_proyecto=${projectDetails.id_proyecto}`)}
                  >
                    <i className="bx bx-bookmark"></i> Épicas
                  </button>
                  <button
                    className="btn btn-outline-primary acceso-btn"
                    onClick={() => navigate(`/sprints?id_proyecto=${projectDetails.id_proyecto}`)}
                  >
                    <i className="bx bx-run"></i> Sprints operativos
                  </button>
                  <button
                    className="btn btn-outline-primary acceso-btn"
                    onClick={() => navigate(`/kanban?id_proyecto=${projectDetails.id_proyecto}`)}
                  >
                    <i className="bx bx-grid-alt"></i> Tablero Kanban
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* OTROS PROYECTOS - Grid en vez de carrusel */}
        <section className="other-projects">
          <div className="other-projects-header">
            <h2>Otros proyectos</h2>
          </div>
          <div className="other-projects-list">
            {allProjects
              .filter((project) => String(project.id_proyecto) !== String(id))
              .map((project, idx) => (
                <div
                  key={idx}
                  className="small-card d-flex flex-column align-items-start"
                  style={{ cursor: "pointer" }}
                  onClick={() =>
                    navigate(`/detalles_de_proyecto/${project.id_proyecto}`)
                  }
                >
                  {/* Aquí puedes agregar los avatares si tienes los datos */}
                  <p
                    className="small-card-title mb-1"
                    style={{ fontWeight: 600 }}
                  >
                    {project.nombre}
                  </p>
                  <span className="badge-epica">Épica</span>
                </div>
              ))}
          </div>
        </section>
      </main>
    </div>
  );
};

export default DetallesDeProyecto;
