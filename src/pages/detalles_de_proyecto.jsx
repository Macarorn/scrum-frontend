import "bootstrap/dist/css/bootstrap.min.css";
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import "../assets/detalles_de_proyecto.css";
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
    estado: "",
    fecha_inicio: "",
    fecha_fin_est: "",
  });
  const [actionMessage, setActionMessage] = useState("");
  const [actionType, setActionType] = useState("");

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
          tipo: proyectoCombinado.tipo || "",
          estado: proyectoCombinado.estado || "",
          fecha_inicio: formatearFechaInput(proyectoCombinado.fecha_inicio),
          fecha_fin_est: formatearFechaInput(proyectoCombinado.fecha_fin_est),
        });
      } catch (err) {
        setError(err.message || "Error cargando el proyecto");
      }
    };

    cargarDatos();
  }, [id]);

  // 🔴 Estados de carga / error
  if (error) {
    return <div>{error}</div>;
  }

  if (!projectDetails) {
    return <div>Cargando...</div>;
  }

  const sesionUsuario = getSesionUsuarioDesdeToken();
  const userRole = sesionUsuario.rol || projectDetails.rol_principal || "";
  const esCreadorDelProyecto =
    sesionUsuario.id_usuario &&
    String(projectDetails.creado_por) === String(sesionUsuario.id_usuario);
  const canEdit =
    esCreadorDelProyecto || ROLES_CON_PERMISO_EDICION.includes(userRole);

  const limpiarMensaje = () => {
    setActionMessage("");
    setActionType("");
  };

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
        tipo: projectDetails.tipo || "",
        estado: projectDetails.estado || "",
        fecha_inicio: formatearFechaInput(projectDetails.fecha_inicio),
        fecha_fin_est: formatearFechaInput(projectDetails.fecha_fin_est),
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
      tipo: projectDetails.tipo || "",
      estado: projectDetails.estado || "",
      fecha_inicio: formatearFechaInput(projectDetails.fecha_inicio),
      fecha_fin_est: formatearFechaInput(projectDetails.fecha_fin_est),
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

    try {
      setIsSaving(true);
      const token = getAccessToken();
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
        tipo: updatedProject.tipo || "",
        estado: updatedProject.estado || "",
        fecha_inicio: formatearFechaInput(updatedProject.fecha_inicio),
        fecha_fin_est: formatearFechaInput(updatedProject.fecha_fin_est),
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

  return (
    <div className="detalles-container">
      {/* MAIN */}
      <main className="main-container">
        {/* HEADER */}
        <div className="page-header">
          <h1>Detalles del Proyecto</h1>
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
                <input
                  type="text"
                  name="tipo"
                  className={`project-field ${isEditing ? "is-editable" : "is-readonly"}`}
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
                  <button className="btn btn-outline-primary acceso-btn">
                    <i className="bx bx-list-ul"></i> Backlog
                  </button>
                  <button className="btn btn-outline-primary acceso-btn">
                    <i className="bx bx-bookmark"></i> Épicas
                  </button>
                  <button className="btn btn-outline-primary acceso-btn">
                    <i className="bx bx-run"></i> Sprints operativos
                  </button>
                  <button className="btn btn-outline-primary acceso-btn" onClick={() => navigate("/lista-usuarios")}>
                    <i className="bx bx-user"></i> Lista de usuarios
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
