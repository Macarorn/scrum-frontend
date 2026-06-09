import React, { useState, useEffect, useRef } from 'react';
import { Modal, Spinner } from 'react-bootstrap';
import * as pdfjsLib from 'pdfjs-dist';
import { FiChevronLeft, FiChevronRight, FiZoomIn, FiZoomOut, FiDownload } from 'react-icons/fi';

// Configurar el worker de PDF.js para Vite
import pdfWorker from 'pdfjs-dist/build/pdf.worker.min.mjs?url';
pdfjsLib.GlobalWorkerOptions.workerSrc = pdfWorker;

const PdfViewerModal = ({ show, onHide, url, documentName }) => {
  const [pdf, setPdf] = useState(null);
  const [pageNum, setPageNum] = useState(1);
  const [numPages, setNumPages] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [scale, setScale] = useState(1.2);
  const canvasRef = useRef(null);
  const renderTaskRef = useRef(null);

  useEffect(() => {
    if (show && url) {
      setLoading(true);
      setError(null);
      
      const loadingTask = pdfjsLib.getDocument({ url });
      
      loadingTask.promise.then(
        (loadedPdf) => {
          setPdf(loadedPdf);
          setNumPages(loadedPdf.numPages);
          setPageNum(1);
          setLoading(false);
        },
        (err) => {
          console.error('Error loading PDF:', err);
          setError('No se pudo cargar el documento PDF.');
          setLoading(false);
        }
      );
    } else {
      setPdf(null);
      setPageNum(1);
      setNumPages(0);
      setScale(1.2);
    }
  }, [show, url]);

  useEffect(() => {
    if (pdf && canvasRef.current) {
      renderPage(pageNum);
    }
  }, [pdf, pageNum, scale]);

  const renderPage = (num) => {
    if (!pdf) return;

    pdf.getPage(num).then((page) => {
      const viewport = page.getViewport({ scale });
      const canvas = canvasRef.current;
      
      if (!canvas) return;
      
      const context = canvas.getContext('2d');
      canvas.height = viewport.height;
      canvas.width = viewport.width;

      const renderContext = {
        canvasContext: context,
        viewport: viewport,
      };

      // Cancelar renderizado anterior si existe
      if (renderTaskRef.current) {
        renderTaskRef.current.cancel();
      }

      try {
        const renderTask = page.render(renderContext);
        renderTaskRef.current = renderTask;
        renderTask.promise.catch(err => {
          if (err.name !== 'RenderingCancelledException') {
            console.error('Render error:', err);
          }
        });
      } catch (err) {
        console.error('Error in renderTask:', err);
      }
    });
  };

  const handlePrevPage = () => {
    if (pageNum <= 1) return;
    setPageNum(pageNum - 1);
  };

  const handleNextPage = () => {
    if (pageNum >= numPages) return;
    setPageNum(pageNum + 1);
  };

  const handleZoomIn = () => setScale(prev => Math.min(prev + 0.2, 3));
  const handleZoomOut = () => setScale(prev => Math.max(prev - 0.2, 0.5));

  const handleDownload = () => {
    window.open(url, '_blank');
  };

  return (
    <Modal show={show} onHide={onHide} size="xl" centered>
      <Modal.Header closeButton className="bg-dark text-white border-bottom-0">
        <Modal.Title className="fs-5 text-truncate" style={{ maxWidth: '80%' }}>
          {documentName || 'Visor PDF'}
        </Modal.Title>
      </Modal.Header>
      
      {pdf && !loading && !error && (
        <div className="pdf-controls">
          <div className="d-flex align-items-center gap-2">
            <button onClick={handlePrevPage} disabled={pageNum <= 1} title="Página anterior">
              <FiChevronLeft size={20} />
            </button>
            <span>{pageNum} / {numPages}</span>
            <button onClick={handleNextPage} disabled={pageNum >= numPages} title="Página siguiente">
              <FiChevronRight size={20} />
            </button>
          </div>
          
          <div className="d-flex align-items-center gap-2">
            <button onClick={handleZoomOut} disabled={scale <= 0.5} title="Alejar">
              <FiZoomOut size={18} />
            </button>
            <span style={{ minWidth: '40px', textAlign: 'center' }}>{Math.round(scale * 100)}%</span>
            <button onClick={handleZoomIn} disabled={scale >= 3} title="Acercar">
              <FiZoomIn size={18} />
            </button>
          </div>
          
          <div>
            <button onClick={handleDownload} title="Descargar">
              <FiDownload size={18} className="me-2" /> Descargar original
            </button>
          </div>
        </div>
      )}
      
      <Modal.Body className="p-0">
        <div className="pdf-viewer-container">
          {loading && (
            <div className="d-flex flex-column align-items-center justify-content-center h-100 text-white">
              <Spinner animation="border" className="mb-3" />
              <p>Cargando documento...</p>
            </div>
          )}
          
          {error && (
            <div className="d-flex flex-column align-items-center justify-content-center h-100 text-white">
              <p className="text-danger mb-3">{error}</p>
              <button className="btn btn-outline-light" onClick={handleDownload}>
                Descargar directamente
              </button>
            </div>
          )}
          
          <canvas ref={canvasRef} style={{ display: (loading || error) ? 'none' : 'block' }}></canvas>
        </div>
      </Modal.Body>
    </Modal>
  );
};

export default PdfViewerModal;
