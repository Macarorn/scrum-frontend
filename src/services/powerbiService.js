/**
 * Servicio de Power BI
 * 
 * Este servicio proporciona métodos para interactuar con Power BI Embedded,
 * obtener tokens de acceso, cargar reportes y manejar eventos.
 * 
 * @module powerbiService
 */

import axios from 'axios';
import powerbiConfig from '../config/powerbiConfig';

/**
 * Cliente HTTP personalizado para Power BI
 */
const powerbiClient = axios.create({
  timeout: powerbiConfig.network.loadTimeout,
  headers: {
    'Content-Type': 'application/json',
  },
});

/**
 * Servicio de Power BI
 * Centraliza toda la lógica de integración con Power BI Embedded
 */
const powerbiService = {
  /**
   * Obtener la configuración actual de Power BI
   * @returns {Object} Configuración actual
   */
  getConfig() {
    return powerbiConfig.getEmbedConfig();
  },

  /**
   * Validar que la configuración está lista para usar
   * @returns {Object} Objeto con estado de validación
   */
  validateConfig() {
    const validation = powerbiConfig.validate();
    return {
      isValid: validation.isConfigured,
      status: {
        hasReportId: validation.hasReportId,
        hasEmbedUrl: validation.hasEmbedUrl,
        hasAccessToken: !!powerbiConfig.embedding.accessToken,
        isConfigured: validation.isConfigured,
      },
      message: validation.isConfigured
        ? 'Configuración de Power BI lista'
        : 'Configuración de Power BI incompleta - falta reportId o embedUrl',
    };
  },

  /**
   * Obtener token de acceso desde el backend
   * El token NUNCA debe estar en el frontend
   * @param {Object} options - Opciones de configuración
   * @returns {Promise<Object>} Respuesta con token y información
   * @throws {Error} Si no se puede obtener el token
   */
  async getAccessToken(options = {}) {
    try {
      const response = await powerbiClient.post(
        powerbiConfig.api.tokenEndpoint,
        {
          reportId: options.reportId || powerbiConfig.embedding.reportId,
          embedUrl: options.embedUrl || powerbiConfig.embedding.embedUrl,
          identities: options.identities || null,
          roles: options.roles || [],
        }
      );

      // Actualizar token en configuración
      if (response.data && response.data.accessToken) {
        powerbiConfig.embedding.accessToken = response.data.accessToken;
        powerbiConfig.embedding.reportId = response.data.reportId || powerbiConfig.embedding.reportId;
        powerbiConfig.embedding.embedUrl = response.data.embedUrl || powerbiConfig.embedding.embedUrl;

        return {
          success: true,
          token: response.data.accessToken,
          expiresIn: response.data.expiresIn,
          refreshIn: response.data.refreshIn,
        };
      }

      throw new Error('No se recibió token en la respuesta');
    } catch (error) {
      console.error('Error al obtener token de Power BI:', error);
      return {
        success: false,
        error: error.message || 'Error desconocido al obtener token',
        errorCode: error.response?.status,
      };
    }
  },

  /**
   * Obtener configuración del reporte desde el backend
   * @param {string} reportId - ID del reporte (opcional)
   * @returns {Promise<Object>} Configuración del reporte
   * @throws {Error} Si no se puede obtener la configuración
   */
  async getReportConfig(reportId = null) {
    try {
      const id = reportId || powerbiConfig.embedding.reportId;

      if (!id) {
        throw new Error('No hay reportId disponible');
      }

      const response = await powerbiClient.get(
        `${powerbiConfig.api.configEndpoint}/${id}`
      );

      if (response.data) {
        // Actualizar configuración con los datos del servidor
        powerbiConfig.update({
          embedding: {
            reportId: response.data.reportId,
            embedUrl: response.data.embedUrl,
          },
          security: {
            enableRLS: response.data.enableRLS,
            roles: response.data.roles || [],
          },
          display: {
            showHeader: response.data.showHeader !== false,
            allowExport: response.data.allowExport !== false,
            mode: response.data.mode || 'view',
          },
        });

        return {
          success: true,
          data: response.data,
        };
      }

      throw new Error('Respuesta vacía del servidor');
    } catch (error) {
      console.error('Error al obtener configuración de Power BI:', error);
      return {
        success: false,
        error: error.message || 'Error desconocido',
      };
    }
  },

  /**
   * Establecer reportId y embedUrl manualmente
   * Útil para pruebas o cuando vienen de fuentes dinámicas
   * @param {Object} config - Objeto con reportId y embedUrl
   * @returns {Object} Configuración actualizada
   */
  setReportConfig(config) {
    if (config.reportId && config.embedUrl) {
      powerbiConfig.update({
        embedding: {
          reportId: config.reportId,
          embedUrl: config.embedUrl,
        },
      });

      return {
        success: true,
        config: powerbiConfig.getEmbedConfig(),
      };
    }

    return {
      success: false,
      error: 'Se requieren reportId y embedUrl',
    };
  },

  /**
   * Establecer token de acceso manualmente
   * @param {string} token - Token JWT de Power BI
   * @param {number} expiresIn - Tiempo de expiración en segundos (opcional)
   * @returns {Object} Resultado de la operación
   */
  setAccessToken(token, expiresIn = null) {
    if (!token) {
      return {
        success: false,
        error: 'Token no puede estar vacío',
      };
    }

    powerbiConfig.embedding.accessToken = token;

    // Si se proporciona tiempo de expiración, establecer alerta
    if (expiresIn) {
      const expiryTime = new Date(Date.now() + expiresIn * 1000);
      console.log(`Token de Power BI expirará en: ${expiryTime}`);
    }

    return {
      success: true,
      message: 'Token actualizado exitosamente',
      expiresIn,
    };
  },

  /**
   * Refrescar token de acceso
   * Llamar cuando el token esté por expirar
   * @returns {Promise<Object>} Nuevo token
   */
  async refreshAccessToken() {
    return this.getAccessToken();
  },

  /**
   * Aplicar filtros a un reporte
   * @param {Array} filters - Array de objetos de filtro
   * @returns {Object} Resultado de la operación
   */
  applyFilters(filters) {
    if (!Array.isArray(filters)) {
      return {
        success: false,
        error: 'Filtros debe ser un array',
      };
    }

    powerbiConfig.update({
      filters: {
        predefinedFilters: filters,
      },
    });

    return {
      success: true,
      appliedFilters: filters.length,
    };
  },

  /**
   * Limpiar todos los filtros
   * @returns {Object} Resultado de la operación
   */
  clearFilters() {
    powerbiConfig.update({
      filters: {
        predefinedFilters: [],
      },
    });

    return {
      success: true,
      message: 'Filtros eliminados',
    };
  },

  /**
   * Habilitar Row-Level Security (RLS)
   * @param {Object} identities - Objeto con información de identidad del usuario
   * @param {Array} roles - Array de roles para RLS
   * @returns {Object} Resultado de la operación
   */
  enableRLS(identities, roles = []) {
    if (!identities) {
      return {
        success: false,
        error: 'Se requiere objeto de identidades',
      };
    }

    powerbiConfig.update({
      security: {
        enableRLS: true,
        identities,
        roles,
      },
    });

    return {
      success: true,
      rlsEnabled: true,
      roles: roles.length,
    };
  },

  /**
   * Deshabilitar Row-Level Security (RLS)
   * @returns {Object} Resultado de la operación
   */
  disableRLS() {
    powerbiConfig.update({
      security: {
        enableRLS: false,
        identities: null,
        roles: [],
      },
    });

    return {
      success: true,
      rlsEnabled: false,
    };
  },

  /**
   * Registrar evento de Power BI en el backend
   * Útil para auditoría y analytics
   * @param {Object} eventData - Datos del evento
   * @returns {Promise<Object>} Respuesta del servidor
   */
  async logEvent(eventData) {
    try {
      if (!eventData || typeof eventData !== 'object') {
        throw new Error('eventData debe ser un objeto');
      }

      const response = await powerbiClient.post(
        powerbiConfig.api.eventsEndpoint,
        {
          timestamp: new Date().toISOString(),
          reportId: powerbiConfig.embedding.reportId,
          ...eventData,
        }
      );

      return {
        success: true,
        message: 'Evento registrado',
        data: response.data,
      };
    } catch (error) {
      console.error('Error al registrar evento:', error);
      return {
        success: false,
        error: error.message,
      };
    }
  },

  /**
   * Resetear servicio a estado inicial
   */
  reset() {
    powerbiConfig.reset();
    return {
      success: true,
      message: 'Servicio de Power BI reseteado',
    };
  },

  /**
   * Obtener estado completo del servicio
   * @returns {Object} Estado actual
   */
  getStatus() {
    const validation = this.validateConfig();
    return {
      configured: validation.isValid,
      hasToken: !!powerbiConfig.embedding.accessToken,
      reportId: powerbiConfig.embedding.reportId,
      embedUrl: powerbiConfig.embedding.embedUrl,
      rlsEnabled: powerbiConfig.security.enableRLS,
      filters: powerbiConfig.filters.predefinedFilters.length,
      validation: validation.status,
    };
  },

  /**
   * Obtener referencia a la configuración (solo lectura recomendada)
   * @returns {Object} Configuración de Power BI
   */
  getConfigReference() {
    return { ...powerbiConfig };
  },
};

export default powerbiService;
