import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { FiArrowLeft, FiFileText, FiPlus } from "react-icons/fi";
import { obtenerMiRolEnProyecto } from "../../services/proyectos.service";
import DocumentosProyecto from "../DetallesProyecto/DocumentosProyecto";
import "../../styles/documentos.css";

const DocumentosProyectoPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [userRoleInProject, setUserRoleInProject] = useState("");
  const [newDocTrigger, setNewDocTrigger] = useState(0);

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
    <div className="doc-page">
      <div className="documentos-page-header">
        <div className="documentos-page-header-left">
          <span className="documentos-page-icon"><FiFileText /></span>
          <h1 className="documentos-page-title">Documentos del proyecto</h1>
        </div>
        <div className="documentos-page-header-right">
          <button className="btn btn-main btn-sm d-flex align-items-center gap-1" onClick={() => setNewDocTrigger(prev => prev + 1)}>
            <FiPlus /> Nuevo Documento
          </button>
          <button 
            className="btn btn-main btn-sm d-flex align-items-center gap-1" 
            style={{ backgroundColor: "#9ca3af", borderColor: "#9ca3af" }} 
            onClick={() => navigate(`/detalles_de_proyecto/${id}`)}
          >
            <FiArrowLeft /> Volver
          </button>
        </div>
      </div>
      
      <div className="doc-card">
        <DocumentosProyecto projectId={id} userRoleInProject={userRoleInProject} newDocTrigger={newDocTrigger} />
      </div>
    </div>
  );
};

export default DocumentosProyectoPage;
