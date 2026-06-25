import React, { useState, useEffect } from 'react';
import { Spinner } from 'react-bootstrap';
import { FiPlus, FiDownload, FiEye, FiClock, FiUploadCloud, FiTrash2, FiFileText, FiFile } from 'react-icons/fi';
import { listarDocumentos, desactivarDocumento, obtenerUrlDescarga } from '../../services/documentos.service';
import { showError, showSuccess } from '../../utils/alerts';
import SubirDocumentoModal from './SubirDocumentoModal';
import HistorialDocumentoModal from './HistorialDocumentoModal';
import PdfViewerModal from './PdfViewerModal';
import '../../styles/documentos.css';

const formatearFecha = (fechaStr) => {
  if (!fechaStr) return '';
  const fecha = new Date(fechaStr);
  return fecha.toLocaleDateString('es-ES', { 
    year: 'numeric', month: 'short', day: 'numeric'
  });
};

const getIconClass = (tipo) => {
  switch (tipo) {
    case 'pdf': return 'pdf';
    case 'doc':
    case 'docx': return 'word';
    case 'xls':
    case 'xlsx': return 'excel';
    case 'ppt':
    case 'pptx': return 'powerpoint';
    default: return 'default';
  }
};

const DocumentosProyecto = ({ projectId, userRoleInProject }) => {
  const [documentos, setDocumentos] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Modals state
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [showHistoryModal, setShowHistoryModal] = useState(false);
  const [showPdfModal, setShowPdfModal] = useState(false);
  
  // Selected doc state
  const [selectedDoc, setSelectedDoc] = useState(null);
  const [pdfUrl, setPdfUrl] = useState('');

  // Permissions
  const canManageDocs = ['Product Owner', 'Scrum Master'].includes(userRoleInProject);

  const cargarDocumentos = async () => {
    try {
      setLoading(true);
      const data = await listarDocumentos(projectId);
      setDocumentos(data);
    } catch (error) {
      showError(error.message || "Error al cargar los documentos del proyecto.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (projectId) {
      cargarDocumentos();
    }
  }, [projectId]);

  const handleDescargar = async (doc) => {
    try {
      const data = await obtenerUrlDescarga(projectId, doc.id_documento);
      window.open(data.url, '_blank');
    } catch (error) {
      showError("Error al obtener el enlace de descarga.");
    }
  };

  const handleVerPdf = async (doc) => {
    if (doc.tipo_archivo !== 'pdf') {
      handleDescargar(doc);
      return;
    }
    
    try {
      const data = await obtenerUrlDescarga(projectId, doc.id_documento);
      setPdfUrl(data.url);
      setSelectedDoc(doc);
      setShowPdfModal(true);
    } catch (error) {
      showError("Error al cargar la vista previa del PDF.");
    }
  };

  const handleNuevaVersion = (doc) => {
    setSelectedDoc(doc);
    setShowUploadModal(true);
  };

  const handleVerHistorial = (doc) => {
    setSelectedDoc(doc);
    setShowHistoryModal(true);
  };

  const handleDesactivar = async (doc) => {
    if (window.confirm(`¿Estás seguro de eliminar el documento "${doc.nombre}"?`)) {
      try {
        await desactivarDocumento(projectId, doc.id_documento);
        showSuccess("Documento eliminado correctamente.");
        cargarDocumentos();
      } catch (error) {
        showError("Error al eliminar el documento.");
      }
    }
  };

  const openNewDocModal = () => {
    setSelectedDoc(null);
    setShowUploadModal(true);
  };

  return (
    <div className="documentos-section">
      <div className="documentos-header">
        <h2><FiFileText /> Documentos del Proyecto</h2>
        {canManageDocs && (
          <button className="btn btn-add-member d-flex align-items-center gap-2" onClick={openNewDocModal}>
            <FiPlus /> Nuevo Documento
          </button>
        )}
      </div>

      {loading ? (
        <div className="text-center py-5">
          <Spinner animation="border" variant="primary" />
        </div>
      ) : documentos.length === 0 ? (
        <div className="text-center text-muted py-5 border rounded bg-light">
          <FiFile size={48} className="mb-3 text-secondary opacity-50" />
          <h5>No hay documentos</h5>
          <p>Aún no se han subido documentos a este proyecto.</p>
        </div>
      ) : (
        <div className="documentos-table-container">
          <table className="documentos-table">
            <thead>
              <tr>
                <th>Nombre</th>
                <th>Versión</th>
                <th>Creado por</th>
                <th>Actualizado</th>
                <th className="text-end">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {documentos.map(doc => (
                <tr key={doc.id_documento}>
                  <td>
                    <div className="doc-name">
                      <span className={`doc-icon ${getIconClass(doc.tipo_archivo)}`}>
                        {doc.tipo_archivo.toUpperCase()}
                      </span>
                      {doc.nombre}
                    </div>
                  </td>
                  <td>
                    <span className="version-badge">v{doc.version_actual}</span>
                  </td>
                  <td>
                    <div className="d-flex flex-column">
                      <span>{doc.creador_nombre}</span>
                      <small className="text-muted">{formatearFecha(doc.fecha_creacion)}</small>
                    </div>
                  </td>
                  <td>
                    <div className="d-flex flex-column">
                      <span>{doc.modificador_nombre || doc.creador_nombre}</span>
                      <small className="text-muted">{formatearFecha(doc.fecha_modificacion || doc.fecha_creacion)}</small>
                    </div>
                  </td>
                  <td>
                    <div className="doc-actions justify-content-end">
                      {doc.tipo_archivo === 'pdf' ? (
                        <button className="doc-btn" onClick={() => handleVerPdf(doc)} title="Ver PDF">
                          <FiEye />
                        </button>
                      ) : (
                        <button className="doc-btn" onClick={() => handleDescargar(doc)} title="Descargar">
                          <FiDownload />
                        </button>
                      )}
                      
                      <button className="doc-btn" onClick={() => handleVerHistorial(doc)} title="Historial de versiones">
                        <FiClock />
                      </button>

                      {canManageDocs && (
                        <>
                          <button className="doc-btn" onClick={() => handleNuevaVersion(doc)} title="Subir nueva versión">
                            <FiUploadCloud />
                          </button>
                          <button className="doc-btn danger" onClick={() => handleDesactivar(doc)} title="Eliminar">
                            <FiTrash2 />
                          </button>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Modals */}
      <SubirDocumentoModal 
        show={showUploadModal} 
        onHide={() => setShowUploadModal(false)}
        proyectoId={projectId}
        documentoParaActualizar={selectedDoc}
        onDocumentoGuardado={cargarDocumentos}
      />

      <HistorialDocumentoModal
        show={showHistoryModal}
        onHide={() => setShowHistoryModal(false)}
        proyectoId={projectId}
        documento={selectedDoc}
      />

      <PdfViewerModal
        show={showPdfModal}
        onHide={() => {
          setShowPdfModal(false);
          setPdfUrl('');
        }}
        url={pdfUrl}
        documentName={selectedDoc?.nombre}
      />
    </div>
  );
};

export default DocumentosProyecto;
