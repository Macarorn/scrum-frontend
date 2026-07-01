import React, { useState, useRef, useEffect } from 'react';
import { Modal, Form, Button, Spinner } from 'react-bootstrap';
import { FiUploadCloud, FiFile, FiX } from 'react-icons/fi';
import { subirDocumento, actualizarDocumento } from '../../services/documentos.service';
import { showError, showSuccess, showWarning } from '../../utils/alerts';

const MAX_FILE_SIZE = 25 * 1024 * 1024; // 25 MB
const ALLOWED_EXTENSIONS = ['.pdf', '.doc', '.docx', '.xls', '.xlsx', '.ppt', '.pptx'];

const SubirDocumentoModal = ({ show, onHide, proyectoId, documentoParaActualizar = null, onDocumentoGuardado }) => {
  const [file, setFile] = useState(null);
  const [nombre, setNombre] = useState('');
  const [comentario, setComentario] = useState('');
  const [isDragging, setIsDragging] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const fileInputRef = useRef(null);

  const isUpdate = !!documentoParaActualizar;

  useEffect(() => {
    if (show) {
      setFile(null);
      setNombre(documentoParaActualizar ? documentoParaActualizar.nombre : '');
      setComentario('');
      setIsDragging(false);
      setIsSubmitting(false);
    }
  }, [show, documentoParaActualizar]);

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const validarArchivo = (selectedFile) => {
    if (!selectedFile) return false;

    if (selectedFile.size > MAX_FILE_SIZE) {
      showWarning("El archivo excede el tamaño máximo permitido de 25 MB.");
      return false;
    }

    const ext = selectedFile.name.substring(selectedFile.name.lastIndexOf('.')).toLowerCase();
    if (!ALLOWED_EXTENSIONS.includes(ext)) {
      showWarning(`El formato de archivo "${ext}" no está permitido. Solo se admiten archivos PDF, Word, Excel y PowerPoint.`);
      return false;
    }

    return true;
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const droppedFile = e.dataTransfer.files[0];
      if (validarArchivo(droppedFile)) {
        setFile(droppedFile);
        if (!isUpdate && !nombre) {
          const nameWithoutExt = droppedFile.name.substring(0, droppedFile.name.lastIndexOf('.'));
          setNombre(nameWithoutExt);
        }
      }
    }
  };

  const handleFileSelect = (e) => {
    if (e.target.files && e.target.files.length > 0) {
      const selectedFile = e.target.files[0];
      if (validarArchivo(selectedFile)) {
        setFile(selectedFile);
        if (!isUpdate && !nombre) {
          const nameWithoutExt = selectedFile.name.substring(0, selectedFile.name.lastIndexOf('.'));
          setNombre(nameWithoutExt);
        }
      }
    }
  };

  const handleRemoveFile = () => {
    setFile(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!file) {
      showWarning("Por favor selecciona o arrastra un archivo para subir.");
      return;
    }

    if (!isUpdate && !nombre.trim()) {
      showWarning("Por favor ingresa el nombre del documento.");
      return;
    }

    if (isUpdate && !comentario.trim()) {
      showWarning("Por favor escribe un comentario para describir los cambios de esta versión.");
      return;
    }

    try {
      setIsSubmitting(true);
      
      if (isUpdate) {
        await actualizarDocumento(proyectoId, documentoParaActualizar.id_documento, file, comentario.trim());
        showSuccess("Nueva versión subida correctamente.");
      } else {
        await subirDocumento(proyectoId, file, nombre.trim(), comentario.trim());
        showSuccess("Documento subido correctamente.");
      }
      
      onDocumentoGuardado();
      onHide();
    } catch (error) {
      showError(error.message || "Ocurrió un error al subir el archivo.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal show={show} onHide={onHide} centered backdrop="static">
      <Modal.Header closeButton>
        <Modal.Title>{isUpdate ? 'Subir Nueva Versión' : 'Subir Nuevo Documento'}</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <Form onSubmit={handleSubmit}>
          {!isUpdate && (
            <Form.Group className="mb-3">
              <Form.Label>Nombre del Documento <span className="text-danger">*</span></Form.Label>
              <Form.Control
                type="text"
                placeholder="Ej. Requerimientos Funcionales"
                value={nombre}
                onChange={(e) => setNombre(e.target.value)}
                disabled={isSubmitting}
                maxLength={200}
              />
            </Form.Group>
          )}

          {isUpdate && (
            <div className="mb-3">
              <p className="text-muted mb-1">Documento actual:</p>
              <p className="fw-bold">{documentoParaActualizar.nombre}</p>
            </div>
          )}

          <Form.Group className="mb-4">
            <Form.Label>Archivo <span className="text-danger">*</span></Form.Label>
            
            {!file ? (
              <div 
                className={`upload-zone ${isDragging ? 'drag-active' : ''}`}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current.click()}
              >
                <FiUploadCloud />
                <p>Arrastra tu archivo aquí o haz clic para buscar</p>
                <span>Formatos soportados: PDF, DOC, DOCX, XLS, XLSX, PPT, PPTX (Max 25 MB)</span>
                <input 
                  type="file" 
                  className="d-none" 
                  ref={fileInputRef}
                  onChange={handleFileSelect}
                  accept=".pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx"
                  disabled={isSubmitting}
                />
              </div>
            ) : (
              <div className="selected-file">
                <FiFile className="text-primary fs-3" />
                <div className="selected-file-info">
                  <span className="selected-file-name text-truncate" style={{ maxWidth: '300px' }}>
                    {file.name}
                  </span>
                  <span className="selected-file-size">
                    {(file.size / 1024 / 1024).toFixed(2)} MB
                  </span>
                </div>
                {!isSubmitting && (
                  <button type="button" className="remove-file-btn" onClick={handleRemoveFile}>
                    <FiX />
                  </button>
                )}
              </div>
            )}
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>
              Comentario de Versión {isUpdate && <span className="text-danger">*</span>}
            </Form.Label>
            <Form.Control
              as="textarea"
              rows={2}
              placeholder={isUpdate ? "Describe los cambios realizados en esta versión..." : "Comentario opcional de la versión inicial..."}
              value={comentario}
              onChange={(e) => setComentario(e.target.value)}
              disabled={isSubmitting}
              maxLength={500}
            />
          </Form.Group>

          <div className="d-flex justify-content-end gap-2 mt-4">
            <Button variant="outline-secondary" onClick={onHide} disabled={isSubmitting}>
              Cancelar
            </Button>
            <Button variant="success" className="btn-add-member" type="submit" disabled={isSubmitting || !file}>
              {isSubmitting ? (
                <>
                  <Spinner as="span" animation="border" size="sm" role="status" aria-hidden="true" className="me-2" />
                  Subiendo...
                </>
              ) : (
                isUpdate ? 'Actualizar Documento' : 'Subir Documento'
              )}
            </Button>
          </div>
        </Form>
      </Modal.Body>
    </Modal>
  );
};

export default SubirDocumentoModal;
