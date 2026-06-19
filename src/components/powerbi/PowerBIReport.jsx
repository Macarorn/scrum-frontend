/**
 * Componente PowerBIReport
 * 
 * Componente React preparado para embedar reportes de Power BI.
 * Este componente está diseñado para funcionar como capa de integración
 * futura sin modificar la UI existente.
 * 
 * Actualmente en estado STANDBY - Preparado pero no activo.
 * 
 * Uso futuro:
 * <PowerBIReport
 *   reportId="your-report-id"
 *   embedUrl="your-embed-url"
 *   onReady={handleReady}
 *   onError={handleError}
 *   filters={[...]}
 * />
 * 
 * @component
 */

import React, { useState, useEffect, useRef, useCallback } from 'react';
import PropTypes from 'prop-types';
import { Container, Row, Col, Alert, Spinner } from 'react-bootstrap';
import { PowerBIEmbed } from 'powerbi-client-react';
import { models } from 'powerbi-client';
import powerbiService from '../../services/powerbiService';
import powerbiConfig from '../../config/powerbiConfig';
import './PowerBIReport.css';

/**
 * Componente PowerBIReport
 * 
 * @param {Object} props - Props del componente
 * @param {string} props.reportId - ID del reporte Power BI (opcional)
 * @param {string} props.embedUrl - URL de embedding del reporte (opcional)
 * @param {Array} props.filters - Filtros a aplicar al reporte (opcional)
 * @param {Object} props.security - Configuración de seguridad RLS (opcional)
 * @param {Function} props.onReady - Callback cuando el reporte está listo
 * @param {Function} props.onError - Callback cuando hay un error
 * @param {Function} props.onLoadingChange - Callback cuando cambia el estado de carga
 * @param {string} props.height - Altura del contenedor (default: '600px')
 * @param {Object} props.displaySettings - Configuración de visualización
 * @param {boolean} props.isStandby - Modo standby (default: true)
 * 
 * @returns {React.ReactElement} Componente renderizado
 */
const PowerBIReport = ({
  reportId = null,
  embedUrl = null,
  filters = [],
  security = null,
  onReady = null,
  onError = null,
  onLoadingChange = null,
  height = '600px',
  displaySettings = {},
  isStandby = true,
}) => {
  // Estados
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [reportConfig, setReportConfig] = useState(null);
  const [isInitialized, setIsInitialized] = useState(false);
  const [tokenExpiry, setTokenExpiry] = useState(null);

  // Refs
  const reportContainerRef = useRef(null);
  const reportRef = useRef(null);
  const retryCountRef = useRef(0);

  /**
   * Callback para actualizar estado de carga
   */
  const updateLoadingState = useCallback((isLoading) => {
    setLoading(isLoading);
    if (onLoadingChange) {
      onLoadingChange(isLoading);
    }
  }, [onLoadingChange]);

  /**
   * Callback para manejar errores
   */
  const handleError = useCallback((errorMsg, errorObj = null) => {
    console.error('PowerBIReport Error:', errorMsg, errorObj);
    setError(errorMsg);

    if (onError) {
      onError({
        message: errorMsg,
        code: errorObj?.code,
        timestamp: new Date().toISOString(),
      });
    }

    // Registrar evento en backend
    powerbiService.logEvent({
      eventType: 'error',
      message: errorMsg,
      component: 'PowerBIReport',
    }).catch(err => console.warn('No se pudo registrar error:', err));
  }, [onError]);

  /**
   * Inicializar configuración del reporte
   */
  const initializeReport = useCallback(async () => {
    try {
      updateLoadingState(true);
      setError(null);

      // Si se proporcionan reportId y embedUrl, establecerlos
      if (reportId && embedUrl) {
        const result = powerbiService.setReportConfig({
          reportId,
          embedUrl,
        });

        if (!result.success) {
          throw new Error(result.error);
        }
      }

      // Validar configuración
      const validation = powerbiService.validateConfig();
      if (!validation.isValid) {
        throw new Error(validation.message);
      }

      // Obtener configuración del servidor (futuro)
      const configResult = await powerbiService.getReportConfig();
      if (configResult.success) {
        setReportConfig(configResult.data);
      }

      // Aplicar filtros si existen
      if (filters && filters.length > 0) {
        powerbiService.applyFilters(filters);
      }

      // Aplicar seguridad RLS si existe
      if (security && security.identities) {
        powerbiService.enableRLS(security.identities, security.roles);
      }

      // Intentar obtener token (futuro - backend)
      try {
        const tokenResult = await powerbiService.getAccessToken();
        if (tokenResult.success) {
          setTokenExpiry(new Date(Date.now() + tokenResult.expiresIn * 1000));
          retryCountRef.current = 0;
        } else {
          console.warn('No se pudo obtener token:', tokenResult.error);
        }
      } catch (tokenError) {
        console.warn('Error en obtención de token:', tokenError);
      }

      setIsInitialized(true);
      if (onReady) {
        onReady(powerbiService.getStatus());
      }

      // Registrar evento de inicialización
      await powerbiService.logEvent({
        eventType: 'initialized',
        status: 'success',
      });
    } catch (err) {
      handleError(err.message || 'Error al inicializar reporte', err);
      
      // Reintentar si no hemos alcanzado el límite
      if (retryCountRef.current < powerbiConfig.network.maxRetries) {
        retryCountRef.current += 1;
        console.log(`Reintentando... (${retryCountRef.current}/${powerbiConfig.network.maxRetries})`);
        
        setTimeout(() => {
          initializeReport();
        }, powerbiConfig.network.retryDelay);
      }
    } finally {
      updateLoadingState(false);
    }
  }, [reportId, embedUrl, filters, security, onReady, updateLoadingState, handleError]);

  /**
   * Effect para inicializar cuando el componente monta
   */
  useEffect(() => {
    if (!isStandby) {
      initializeReport();
    }
  }, [isStandby, initializeReport]);

  /**
   * Effect para monitorear expiración del token
   */
  useEffect(() => {
    if (!tokenExpiry) return;

    const checkTokenExpiry = setInterval(() => {
      const now = new Date();
      const timeUntilExpiry = tokenExpiry - now;
      const fiveMinutes = 5 * 60 * 1000;

      if (timeUntilExpiry < fiveMinutes && timeUntilExpiry > 0) {
        console.log('Token expirando pronto, refrescando...');
        powerbiService.refreshAccessToken().catch(err => {
          console.error('Error al refrescar token:', err);
        });
      }
    }, 60000); // Verificar cada minuto

    return () => clearInterval(checkTokenExpiry);
  }, [tokenExpiry]);

  /**
   * Manejar limpieza al desmontar
   */
  useEffect(() => {
    return () => {
      // Limpiar referencias
      reportRef.current = null;
    };
  }, []);

  /**
   * Actualizar filtros
   */
  const updateFilters = useCallback((newFilters) => {
    if (!Array.isArray(newFilters)) {
      console.error('Filtros deben ser un array');
      return;
    }

    powerbiService.applyFilters(newFilters);
    powerbiService.logEvent({
      eventType: 'filter_applied',
      filterCount: newFilters.length,
    });
  }, []);

  /**
   * Obtener estado actual
   */
  const getStatus = useCallback(() => {
    return powerbiService.getStatus();
  }, []);

  /**
   * Resetear componente
   */
  const reset = useCallback(() => {
    powerbiService.reset();
    setIsInitialized(false);
    setError(null);
    setReportConfig(null);
    setTokenExpiry(null);
    retryCountRef.current = 0;
  }, []);

  // En modo standby, mostrar mensaje informativo
  if (isStandby) {
    return (
      <Container className="powerbi-report-standby py-5">
        <Row className="justify-content-center">
          <Col lg={8}>
            <Alert variant="info" className="text-center">
              <h5>Componente Power BI en Modo Standby</h5>
              <p className="mb-0">
                Este componente está preparado para integración futura con Power BI Embedded.
                Actualmente en fase de configuración.
              </p>
            </Alert>
          </Col>
        </Row>
      </Container>
    );
  }

  // Estado de carga
  if (loading) {
    return (
      <Container className="powerbi-report-loading" style={{ height }}>
        <Row className="h-100 justify-content-center align-items-center">
          <Col lg={4} className="text-center">
            <Spinner animation="border" variant="primary" className="mb-3" />
            <p>Cargando reporte de Power BI...</p>
          </Col>
        </Row>
      </Container>
    );
  }

  // Estado de error
  if (error) {
    return (
      <Container className="powerbi-report-error py-4">
        <Row>
          <Col>
            <Alert variant="danger" dismissible onClose={() => setError(null)}>
              <Alert.Heading>Error en Power BI</Alert.Heading>
              <p>{error}</p>
              <hr />
              <div>
                <button
                  className="btn btn-sm btn-danger me-2"
                  onClick={initializeReport}
                >
                  Reintentar
                </button>
                <button
                  className="btn btn-sm btn-secondary"
                  onClick={reset}
                >
                  Resetear
                </button>
              </div>
            </Alert>
          </Col>
        </Row>
      </Container>
    );
  }

  // Estado listo - Placeholder para reporte futuro
  if (isInitialized && !error) {
    const embedConfig = powerbiService.getConfig();
    const canRenderPowerBI = !!(
      embedConfig?.id &&
      embedConfig?.embedUrl &&
      embedConfig?.accessToken
    );

    return (
      <Container className="powerbi-report-container" style={{ height }}>
        <Row className="h-100">
          <Col xs={12} className="position-relative">
            <div
              ref={reportContainerRef}
              id="powerbi-report-container"
              className="powerbi-report-content"
              style={{ height: '100%', width: '100%' }}
            >
              {canRenderPowerBI ? (
                <PowerBIEmbed
                  embedConfig={{
                    ...embedConfig,
                    tokenType: models.TokenType.Embed,
                  }}
                  eventHandlers={
                    new Map([
                      ['loaded', () => {
                        powerbiService.logEvent({
                          eventType: 'loaded',
                          status: 'success',
                        });
                      }],
                      ['rendered', () => {
                        powerbiService.logEvent({
                          eventType: 'rendered',
                          status: 'success',
                        });
                      }],
                      ['error', (event) => {
                        const detail = event?.detail;
                        handleError(
                          detail?.message || 'Error al renderizar reporte de Power BI',
                          detail
                        );
                      }],
                    ])
                  }
                  cssClassName="powerbi-report-embed"
                  getEmbeddedComponent={(embeddedReport) => {
                    reportRef.current = embeddedReport;
                  }}
                />
              ) : (
                <div className="powerbi-placeholder">
                  <h5>Área de Reporte Power BI</h5>
                  <p className="text-muted">
                    {reportConfig
                      ? `Reporte listo: ${reportConfig.reportId}`
                      : 'Esperando configuración de reporte'}
                  </p>
                  <small className="text-secondary d-block mt-3">
                    Estado: {getStatus().configured ? '✓ Configurado' : '✗ No configurado'}
                  </small>
                </div>
              )}
            </div>
          </Col>
        </Row>

        {/* Debug info (remover en producción) */}
        {process.env.NODE_ENV === 'development' && (
          <Row className="mt-3">
            <Col xs={12}>
              <details className="powerbi-debug-info">
                <summary>Información de Depuración</summary>
                <pre className="small">
                  {JSON.stringify(
                    {
                      initialized: isInitialized,
                      hasToken: !!powerbiService.getStatus().hasToken,
                      reportId: powerbiService.getStatus().reportId,
                      embedUrl: powerbiService.getStatus().embedUrl,
                      rlsEnabled: powerbiService.getStatus().rlsEnabled,
                      tokenExpiry: tokenExpiry?.toISOString(),
                    },
                    null,
                    2
                  )}
                </pre>
              </details>
            </Col>
          </Row>
        )}
      </Container>
    );
  }

  // Fallback
  return (
    <Container>
      <Row>
        <Col>
          <Alert variant="warning">
            No se pudo cargar el reporte de Power BI
          </Alert>
        </Col>
      </Row>
    </Container>
  );
};

/**
 * Validación de props
 */
PowerBIReport.propTypes = {
  reportId: PropTypes.string,
  embedUrl: PropTypes.string,
  filters: PropTypes.arrayOf(PropTypes.object),
  security: PropTypes.shape({
    identities: PropTypes.object,
    roles: PropTypes.arrayOf(PropTypes.string),
  }),
  onReady: PropTypes.func,
  onError: PropTypes.func,
  onLoadingChange: PropTypes.func,
  height: PropTypes.string,
  displaySettings: PropTypes.object,
  isStandby: PropTypes.bool,
};

export default PowerBIReport;
