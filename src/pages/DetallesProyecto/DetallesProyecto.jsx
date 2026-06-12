import "bootstrap/dist/css/bootstrap.min.css";
import { useCallback, useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import "../../styles/detalles-proyecto.css";
import "../../styles/CrearProyectoForm.css";
import "../../styles/SprintDetail.css";
import "../../styles/Backlog.css";
import { Alert, Spinner } from "react-bootstrap";
import useAutoDismiss from "../../hooks/useAutoDismiss";
import API_URL from "../../services/api";
import { clearSessionTokens, getAccessToken, getTokenPayload, canEditBacklog } from "../../services/auth.service";
import { showError, showSuccess, showWarning } from "../../utils/alerts";
import { FiPlay, FiGrid, FiList, FiLayers, FiCheckSquare, FiEdit, FiEdit2, FiBookmark, FiFileText } from 'react-icons/fi';
import DocumentosProyecto from './DocumentosProyecto';

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
  team_size: project?.team_size || 1,
});

const getSesionUsuarioDesdeToken = () => {
  const payload = getTokenPayload(getAccessToken());

  return {
    id_usuario: payload?.id_usuario || null,
    rol: payload?.rol || payload?.rol_principal || "",
  };
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
  const [isTipoOpen, setIsTipoOpen] = useState(false);
  const [isEstadoOpen, setIsEstadoOpen] = useState(false);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (!event.target.closest('.custom-dropdown-container')) {
        setIsTipoOpen(false);
        setIsEstadoOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const redirectToLogin = useCallback(() => {
    clearSessionTokens();
    navigate("/login", { replace: true });
  }, [navigate]);

  // Proyecto actual + listado para completar campos faltantes
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
        setFormData(buildFormData(proyectoCombinado));
      } catch (err) {
        const message = err.message || "Error cargando el proyecto";
        setError(message);
        showError(message);
      }
    };

    cargarDatos();
  }, [id, redirectToLogin]);

  const sesionUsuario = getSesionUsuarioDesdeToken();
  const [canEdit, setCanEdit] = useState(false);
  const [userRoleInProject, setUserRoleInProject] = useState("");
  const esCreadorDelProyecto =
    sesionUsuario.id_usuario &&
    String(projectDetails?.creado_por) === String(sesionUsuario.id_usuario);

  // Cargar permisos y rol del usuario en el proyecto
  useEffect(() => {
    const loadPermissions = async () => {
      if (id) {
        // Obtener el rol del usuario en el proyecto
        try {
          const { obtenerMiRolEnProyecto } = await import("../../services/proyectos.service.js");
          const roleData = await obtenerMiRolEnProyecto(id);
          const role = roleData?.rol || "";
          setUserRoleInProject(role);

          // Product Owner y Scrum Master pueden editar el proyecto
          const canEditByRole = role === "Product Owner" || role === "Scrum Master";
          const canEditByCreator = esCreadorDelProyecto;
          setCanEdit(canEditByCreator || canEditByRole);
        } catch (error) {
          console.error("Error al obtener rol en proyecto:", error);
          // Fallback al rol global
          setUserRoleInProject(sesionUsuario.rol || "");
          const canEditByCreator = esCreadorDelProyecto;
          setCanEdit(canEditByCreator);
        }
      }
    };
    loadPermissions();
  }, [id, esCreadorDelProyecto]);

  const limpiarMensaje = () => {
    setActionMessage("");
    setActionType("");
  };

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
      document.removeEventListener("mousedown", handleOutside);
      document.removeEventListener("keydown", handleEsc);
    };
  }, [projectMenuOpen]);

  const handleToggleEdit = () => {
    limpiarMensaje();

    if (!canEdit) {
      showError("No puedes editar este proyecto por permisos de tu rol actual.");
      return;
    }

    if (isEditing) {
      setFormData(buildFormData(projectDetails));
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
    setFormData(buildFormData(projectDetails));
    limpiarMensaje();
    setIsEditing(false);
  };

  const handleGuardarCambios = async () => {
    limpiarMensaje();

    if (!formData.fecha_inicio || !formData.fecha_fin_est) {
      showError("La fecha es obligatoria");
      return;
    }

    if (!formData.nombre.trim()) {
      setActionType("error");
      setActionMessage("El nombre del proyecto es obligatorio.");
      showWarning("Todos los campos son obligatorios");
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


    if (formData.team_size) {
      const num = Number(formData.team_size);
      if (!Number.isInteger(num) || num < 1) {
        setActionType("error");
        setActionMessage("El número de integrantes debe ser un entero >= 1.");
        return;
      }
      if (num > 50) {
        setActionType("error");
        setActionMessage("El número máximo de integrantes es 50.");
        return;
      }
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
        tipo: formData.tipo?.trim() || null,
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

      setFormData(buildFormData(updatedProject));

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


  // Returns condicionales después de todos los hooks

  if (error) {
    return (
      <div className="p-4 w-100 d-flex justify-content-center">
        <Alert variant="danger" className="w-100 shadow-sm" style={{ maxWidth: '600px' }}>
          {error}
        </Alert>
      </div>
    );
  }

  if (!projectDetails || projectDetails.creado_por == null) {
    return (
      <div className="min-vh-100 d-flex align-items-center justify-content-center">
        <Spinner animation="border" role="status" variant="primary" />
      </div>
    );
  }

  return (
    <div className="detalles-container">
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
                  <div className={`backlog-epica-menu ${projectMenuRight ? "menu-right" : ""}`} role="menu">
                    <div className="backlog-epica-menu-list">
                      {allProjects.map((proyecto) => (
                        <button
                          key={proyecto.id_proyecto}
                          type="button"
                          className={`backlog-epica-item ${String(proyecto.id_proyecto) ===
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
            <FiEdit2 />
          </button>

          {actionMessage && (
            <div
              className={`project-action-message ${actionType === "success" ? "success" : "error"
                }`}
            >
              {actionMessage}
            </div>
          )}

          <div className="project-header">
            <div className="project-icon">
              <FiLayers />
            </div>

            <div className="project-info">
              <div className="info-field">
                <label>Nombre del proyecto</label>
                <input
                  type="text"
                  name="nombre"
                  className={`project-field ${isEditing ? "is-editable" : "is-readonly"
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
                  value={valorFormATexto(userRoleInProject)}
                  readOnly
                />
              </div>

              <div className="info-field">
                <label>Tipo</label>
                {isEditing ? (
                  <div className="custom-dropdown-container">
                    <div 
                      className={`custom-dropdown-header ${isTipoOpen ? "open" : ""} selected`}
                      onClick={() => setIsTipoOpen(!isTipoOpen)}
                      style={{ height: '42px', padding: '0 12px' }}
                    >
                      <input
                        type="text"
                        className="dropdown-input"
                        placeholder="Selecciona o escribe un tipo"
                        value={formData.tipo}
                        onChange={(e) => {
                          setFormData({ ...formData, tipo: e.target.value });
                          setIsTipoOpen(true);
                        }}
                        autoComplete="off"
                      />
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={`dropdown-arrow ${isTipoOpen ? "open" : ""}`} onClick={(e) => {
                        e.stopPropagation();
                        setIsTipoOpen(!isTipoOpen);
                      }}>
                        <polyline points="6 9 12 15 18 9"></polyline>
                      </svg>
                    </div>
                    {isTipoOpen && (
                      <div className="custom-dropdown-menu">
                        {[
                          "Desarrollo de software",
                          "Diseño UX/UI",
                          "Migración de datos",
                          "Implementación Scrum",
                        ].filter(opt => opt.toLowerCase().includes((formData.tipo || "").toLowerCase())).map((opcion) => (
                          <div
                            key={opcion}
                            className={`custom-dropdown-item ${formData.tipo === opcion ? "active" : ""}`}
                            onClick={() => {
                              setFormData({ ...formData, tipo: opcion });
                              setIsTipoOpen(false);
                            }}
                          >
                            {opcion}
                          </div>
                        ))}
                        {formData.tipo && ![
                          "Desarrollo de software",
                          "Diseño UX/UI",
                          "Migración de datos",
                          "Implementación Scrum",
                        ].includes(formData.tipo) && (
                          <div
                            className="custom-dropdown-item active"
                            onClick={() => setIsTipoOpen(false)}
                          >
                            Usar: "<strong>{formData.tipo}</strong>"
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                ) : (
                  <input
                    type="text"
                    className="project-field is-readonly"
                    value={valorFormATexto(projectDetails.tipo)}
                    readOnly
                  />
                )}
              </div>


              <div className="info-field">
                <label>Estado</label>
                {isEditing ? (
                  <div className="custom-dropdown-container">
                    <div 
                      className={`custom-dropdown-header ${isEstadoOpen ? "open" : ""} selected`}
                      onClick={() => setIsEstadoOpen(!isEstadoOpen)}
                      style={{ height: '42px', padding: '0 12px', cursor: 'pointer' }}
                    >
                      <div className="dropdown-input d-flex align-items-center" style={{ cursor: 'pointer' }}>
                        {formData.estado ? (formData.estado.charAt(0).toUpperCase() + formData.estado.slice(1)) : "Selecciona un estado"}
                      </div>
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={`dropdown-arrow ${isEstadoOpen ? "open" : ""}`}>
                        <polyline points="6 9 12 15 18 9"></polyline>
                      </svg>
                    </div>
                    {isEstadoOpen && (
                      <div className="custom-dropdown-menu">
                        {[
                          { value: "inicio", label: "Inicio" },
                          { value: "activo", label: "Activo" },
                          { value: "pausado", label: "Pausado" },
                          { value: "completado", label: "Completado" },
                          { value: "cancelado", label: "Cancelado" },
                        ].map((opcion) => (
                          <div
                            key={opcion.value}
                            className={`custom-dropdown-item ${formData.estado === opcion.value ? "active" : ""}`}
                            onClick={() => {
                              setFormData({ ...formData, estado: opcion.value });
                              setIsEstadoOpen(false);
                            }}
                          >
                            {opcion.label}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                ) : (
                  <input
                    type="text"
                    className="project-field is-readonly"
                    value={valorFormATexto(projectDetails.estado)}
                    readOnly
                  />
                )}
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
                <label>Integrantes requeridos</label>
                <input
                  type="number"
                  name="team_size"
                  min="1"
                  max="50"
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
              <label>Descripcion</label>
              <textarea
                name="descripcion"
                className={`project-textarea ${isEditing ? "is-editable" : "is-readonly"
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
                    <FiList /> Backlog
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
                    <FiBookmark /> Epicas
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
                    <FiPlay /> Sprints operativos
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
                    <FiGrid /> Tablero Kanban
                  </button>
                  <button
                    className="btn btn-outline-primary acceso-btn"
                    onClick={() =>
                      navigate(
                        `/projects/${projectDetails.id_proyecto}/members`,
                      )
                    }
                  >
                    <FiCheckSquare /> Lista de usuarios
                  </button>
                  <button
                    className="btn btn-outline-primary acceso-btn"
                    onClick={() =>
                      navigate(
                        `/projects/${projectDetails.id_proyecto}/documents`,
                      )
                    }
                  >
                    <FiFileText /> Documentos
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Documentos moved to its own page */}

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
