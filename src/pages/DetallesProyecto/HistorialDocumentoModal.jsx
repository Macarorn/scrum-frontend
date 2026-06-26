import React, { useState, useEffect } from 'react';
import { Modal, Spinner } from 'react-bootstrap';
import { FiDownload } from 'react-icons/fi';
import { obtenerHistorial, obtenerUrlDescarga } from '../../services/documentos.service';
import { showError, showSuccess } from '../../utils/alerts';

const formatearFecha = (fechaStr) => {
  if (!fechaStr) return '';
  const fecha = new Date(fechaStr);
  return fecha.toLocaleDateString('es-ES', { 
    year: 'numeric', month: 'short', day: 'numeric',
    hour: '2-digit', minute: '2-digit'
  });
};

const HistorialDocumentoModal = ({ show, onHide, proyectoId, documento }) => {
  const [historial, setHistorial] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (show && documento) {
      cargarHistorial();
    } else {
      setHistorial([]);
    }
  }, [show, documento]);

  const cargarHistorial = async () => {
    try {
      setLoading(true);
      const data = await obtenerHistorial(proyectoId, documento.id_documento);
      setHistorial(data);
    } catch (error) {
      showError(error.message || "No se pudo cargar el historial del documento.");
    } finally {
      setLoading(false);
    }
  };

  const handleDescargarVersion = async (version) => {
    try {
      const data = await obtenerUrlDescarga(proyectoId, documento.id_documento, version);
      window.open(data.url, '_blank');
    } catch (error) {
      showError(error.message || "Error al generar enlace de descarga.");
    }
  };

  if (!documento) return null;

  return (
    <Modal show={show} onHide={onHide} size="lg" centered>
      <Modal.Header closeButton>
        <Modal.Title>
          Historial de Versiones: <span className="text-primary">{documento.nombre}</span>
        </Modal.Title>
      </Modal.Header>
      <Modal.Body className="p-4">
        {loading ? (
          <div className="text-center py-5">
            <Spinner animation="border" variant="primary" />
            <p className="mt-2 text-muted">Cargando historial...</p>
          </div>
        ) : historial.length === 0 ? (
          <div className="text-center text-muted py-4">
            No hay versiones registradas para este documento.
          </div>
        ) : (
          <div className="historial-timeline">
            {historial.map((version, index) => (
              <div 
                key={version.id_version} 
                className={`historial-item ${index === 0 ? 'current' : ''}`}
              >
                <div className="historial-dot"></div>
                <div className="historial-content">
                  <div className="historial-header">
                    <div>
                      <strong>Versión {version.numero_version}</strong>
                      {index === 0 && <span className="badge bg-primary ms-2">Actual</span>}
                    </div>
                    <button 
                      className="btn btn-sm btn-outline-primary"
                      onClick={() => handleDescargarVersion(version.numero_version)}
                      title="Descargar esta versión"
                    >
                      <FiDownload />
                    </button>
                  </div>
                  <div className="historial-meta mb-2">
                    Subido por <strong>{version.usuario_nombre}</strong> el {formatearFecha(version.fecha_creacion)}
                    <br />
                    <small>Archivo: {version.nombre_archivo} ({(version.tamano_bytes / 1024 / 1024).toFixed(2)} MB)</small>
                  </div>
                  <div className="historial-comment">
                    <em>"{version.comentario}"</em>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </Modal.Body>
    </Modal>
  );
};

export default HistorialDocumentoModal;
