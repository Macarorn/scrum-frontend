import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { FiArrowLeft } from "react-icons/fi";
import { obtenerMiRolEnProyecto } from "../../services/proyectos.service";
import DocumentosProyecto from "../DetallesProyecto/DocumentosProyecto";
import "../../styles/detalles-proyecto.css";

const DocumentosProyectoPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [userRoleInProject, setUserRoleInProject] = useState("");

  useEffect(() => {
    const fetchRole = async () => {
      try {
        const roleData = await obtenerMiRolEnProyecto(id);
        setUserRoleInProject(roleData.rol);
      } catch (error) {
        console.error("Error al obtener el rol en el proyecto:", error);
      }
    };
    if (id) {
      fetchRole();
    }
  }, [id]);

  return (
    <div className="detalles-container">
      <main className="main-container">
        <div className="page-header d-flex align-items-center gap-3">
          <button 
            className="btn btn-link text-dark p-0 text-decoration-none" 
            onClick={() => navigate(`/detalles_de_proyecto/${id}`)}
          >
            <FiArrowLeft size={24} />
          </button>
          <h1 className="m-0">Documentos del proyecto</h1>
        </div>
        
        <div className="project-card p-4">
          <DocumentosProyecto projectId={id} userRoleInProject={userRoleInProject} />
        </div>
      </main>
    </div>
  );
};

export default DocumentosProyectoPage;
