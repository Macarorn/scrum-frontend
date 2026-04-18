import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import "../assets/detalles_de_proyecto.css";
import "bootstrap/dist/css/bootstrap.min.css";
import API_URL from "../services/api";
import { getAccessToken } from "../services/auth.service";

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


const DetallesDeProyecto = () => {
  const { id } = useParams();

  const [projectDetails, setProjectDetails] = useState(null);
  const [error, setError] = useState(false);
  const [allProjects, setAllProjects] = useState([]);

  // Proyecto actual
  useEffect(() => {
    const token = getAccessToken();
    fetch(`${API_URL}/proyectos/${id}`, {
      headers: {
        "Authorization": `Bearer ${token}`,
        "Content-Type": "application/json"
      }
    })
      .then((response) => {
        if (!response.ok) {
          throw new Error("Error en la respuesta del servidor");
        }
        return response.json();
      })
      .then((data) => {
        setProjectDetails(data.data || data);
      })
      .catch((error) => {
        setError(true);
      });
  }, [id]);

  // Todos los proyectos para el carrusel
  useEffect(() => {
    const token = getAccessToken();
    fetch(`${API_URL}/proyectos`, {
      headers: {
        "Authorization": `Bearer ${token}`,
        "Content-Type": "application/json"
      }
    })
      .then((response) => {
        if (!response.ok) {
          throw new Error("Error en la respuesta del servidor");
        }
        return response.json();
      })
      .then((data) => {
        // Si el backend devuelve {data: [...]}
        setAllProjects(data.data || data);
      })
      .catch(() => {});
  }, []);

  // 🔴 Estados de carga / error
  if (error) {
    return <div>Error cargando el proyecto</div>;
  }

  if (!projectDetails) {
    return <div>Cargando...</div>;
  }

  return (
    <div className="detalles-container">
      {/* MAIN */}
      <main className="main-container">
        
        {/* HEADER */}
        <div className="page-header">
          <h1>Detalles del Proyecto</h1>
        </div>

        <div className="project-card">
          <button className="edit-btn">
            <i className="bx bxs-pencil"></i>
          </button>

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
                  value={projectDetails.nombre || ""}
                  readOnly
                />
              </div>

              <div className="info-field">
                <label>Fecha inicio</label>
                <input
                  type="text"
                  value={formatearFecha(projectDetails.fecha_inicio)}
                  readOnly
                />
              </div>

              <div className="info-field">
                <label>Rol asignado</label>
                <input
                  type="text"
                  value={projectDetails.rol_principal || ""}
                  readOnly
                />
              </div>

            </div>
          </div>

          {/* BODY */}
          <div className="project-body">
            
            {/* PROGRESO */}
            <div style={{ minWidth: 180, minHeight: 160 }}></div>

            {/* EQUIPO */}
            <div className="team-section">
              <h3>Equipo</h3>

              <div className="team-members">
                {projectDetails.equipo?.map((member, index) => (
                  <div className="member" key={index}>
                    <img
                      src={member.avatar || "https://via.placeholder.com/50"}
                      alt={member.nombre}
                    />
                    <span>{member.nombre}</span>
                  </div>
                ))}

                <Link
                  to="/equipo"
                  className="team-more-btn"
                  title="Ver equipo completo"
                >
                  <i className="bx bx-chevron-right"></i>
                </Link>
              </div>

              {/* Botones Agregar y Eliminar */}
              <div className="team-actions mt-3 d-flex gap-2">
                <button className="btn btn-success btn-sm d-flex align-items-center gap-1">
                  <i className="bx bx-plus"></i> Agregar
                </button>
                <button className="btn btn-outline-danger btn-sm d-flex align-items-center gap-1">
                  <i className="bx bx-trash"></i> Eliminar
                </button>
              </div>
            </div>

            {/* ACCESOS DIRECTOS alineado */}
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '32px' }}>
              <div style={{ minWidth: 0 }} />
              <div className="accesos-directos-section mt-0" style={{ marginTop: 0 }}>
                <h3 style={{ fontWeight: 500, fontSize: '2rem', color: '#183153', margin: 0, lineHeight: 1.2 }}>Accesos directos</h3>
                <div className="accesos-directos-buttons d-flex gap-3 mt-3">
                  <button className="btn btn-outline-primary acceso-btn">
                    <i className="bx bx-list-ul"></i> Backlog
                  </button>
                  <button className="btn btn-outline-primary acceso-btn">
                    <i className="bx bx-bookmark"></i> Épicas
                  </button>
                  <button className="btn btn-outline-primary acceso-btn">
                    <i className="bx bx-run"></i> Sprints operativos
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
          <div style={{ display: "flex", gap: "24px", flexWrap: "wrap" }}>
            {allProjects
              .filter((project) => String(project.id_proyecto) !== String(id))
              .map((project, idx) => (
                <div
                  key={idx}
                  className="small-card d-flex flex-column align-items-start"
                  style={{ minWidth: 260, minHeight: 120, cursor: 'pointer' }}
                  onClick={() => window.location.href = `/detalles_de_proyecto/${project.id_proyecto}`}
                >
                  {/* Aquí puedes agregar los avatares si tienes los datos */}
                  <p className="small-card-title mb-1" style={{ fontWeight: 600 }}>
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