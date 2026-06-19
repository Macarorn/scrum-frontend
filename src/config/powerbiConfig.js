/**
 * Configuración de Power BI
 * 
 * Este archivo centraliza toda la configuración necesaria para la integración
 * con Power BI Embedded. Los valores pueden ser reemplazados dinámicamente
 * mediante variables de entorno o configuración en tiempo de ejecución.
 * 
 * @module powerbiConfig
 */

/**
 * Configuración base de Power BI
 * @type {Object}
 */
const powerbiConfig = {
  /**
   * Entorno de Power BI
   * Valores posibles: 'public' | 'sovereign' | 'custom'
   * @type {string}
   */
  environment: import.meta.env.VITE_POWERBI_ENVIRONMENT || 'public',

  /**
   * URL base de la autoridad de Azure AD
   * Se utiliza para obtener tokens de acceso
   * @type {string}
   */
  authorityUrl: import.meta.env.VITE_POWERBI_AUTHORITY_URL || 'https://login.microsoftonline.com/common',

  /**
   * Configuración de embedding
   * @type {Object}
   */
  embedding: {
    /**
     * ID del reporte Power BI
     * Será configurado dinámicamente al montar el componente
     * @type {string|null}
     */
    reportId: import.meta.env.VITE_POWERBI_REPORT_ID || null,

    /**
     * URL de embedding del reporte
     * Obtenida desde el backend o Azure
     * @type {string|null}
     */
    embedUrl: import.meta.env.VITE_POWERBI_EMBED_URL || null,

    /**
     * Token de acceso para embedding
     * NUNCA debe estar hardcodeado en producción
     * Debe ser obtenido del backend de manera segura
     * @type {string|null}
     */
    accessToken: null, // Siempre null - obtenido dinámicamente

    /**
     * Tipo de token
     * Valores: 'Aad' (Azure AD) | 'ServicePrincipal'
     * @type {string}
     */
    tokenType: import.meta.env.VITE_POWERBI_TOKEN_TYPE || 'Aad',
  },

  /**
   * Configuración de filtros
   * @type {Object}
   */
  filters: {
    /**
     * Habilitar filtros cross-report
     * @type {boolean}
     */
    enableCrossReportFiltering: import.meta.env.VITE_POWERBI_CROSS_FILTERS === 'true' || false,

    /**
     * Filtros predefinidos para aplicar al cargar
     * Formato: [{ $schema: 'http://powerbi.com/product/schema#basic', target: {...}, operator: 'In', values: [...] }]
     * @type {Array}
     */
    predefinedFilters: [],
  },

  /**
   * Configuración de seguridad
   * @type {Object}
   */
  security: {
    /**
     * Habilitar seguridad a nivel de fila (RLS)
     * @type {boolean}
     */
    enableRLS: import.meta.env.VITE_POWERBI_ENABLE_RLS === 'true' || false,

    /**
     * Identidad del usuario para RLS
     * Será configurada dinámicamente desde el backend
     * @type {string|null}
     */
    identities: null,

    /**
     * Roles de RLS a aplicar
     * @type {Array}
     */
    roles: [],
  },

  /**
   * Configuración de visualización
   * @type {Object}
   */
  display: {
    /**
     * Mostrar header del reporte
     * @type {boolean}
     */
    showHeader: import.meta.env.VITE_POWERBI_SHOW_HEADER === 'false' ? false : true,

    /**
     * Permitir exportar datos
     * @type {boolean}
     */
    allowExport: import.meta.env.VITE_POWERBI_ALLOW_EXPORT === 'false' ? false : true,

    /**
     * Modo de visualización
     * Valores: 'view' | 'edit'
     * @type {string}
     */
    mode: import.meta.env.VITE_POWERBI_MODE || 'view',

    /**
     * Permitir interacción con filtros
     * @type {boolean}
     */
    allowInteraction: import.meta.env.VITE_POWERBI_ALLOW_INTERACTION === 'false' ? false : true,

    /**
     * Mostrar página de navegación
     * @type {boolean}
     */
    navContentPaneEnabled: import.meta.env.VITE_POWERBI_NAV_PANE === 'false' ? false : true,
  },

  /**
   * Configuración de timeout y reintentos
   * @type {Object}
   */
  network: {
    /**
     * Timeout para cargar el reporte (ms)
     * @type {number}
     */
    loadTimeout: parseInt(import.meta.env.VITE_POWERBI_LOAD_TIMEOUT || '30000'),

    /**
     * Número de reintentos en caso de fallo
     * @type {number}
     */
    maxRetries: parseInt(import.meta.env.VITE_POWERBI_MAX_RETRIES || '3'),

    /**
     * Delay entre reintentos (ms)
     * @type {number}
     */
    retryDelay: parseInt(import.meta.env.VITE_POWERBI_RETRY_DELAY || '1000'),
  },

  /**
   * URLs de API
   * @type {Object}
   */
  api: {
    /**
     * Endpoint del backend para obtener configuración de Power BI
     * @type {string}
     */
    configEndpoint: import.meta.env.VITE_API_URL + '/powerbi/config' || 'http://localhost:3000/api/powerbi/config',

    /**
     * Endpoint para obtener token de acceso
     * @type {string}
     */
    tokenEndpoint: import.meta.env.VITE_API_URL + '/powerbi/token' || 'http://localhost:3000/api/powerbi/token',

    /**
     * Endpoint para registrar eventos de Power BI
     * @type {string}
     */
    eventsEndpoint: import.meta.env.VITE_API_URL + '/powerbi/events' || 'http://localhost:3000/api/powerbi/events',
  },

  /**
   * Validar que la configuración es completa
   * @returns {Object} Objeto con validaciones
   */
  validate() {
    return {
      hasReportId: !!this.embedding.reportId,
      hasEmbedUrl: !!this.embedding.embedUrl,
      isConfigured: !!this.embedding.reportId && !!this.embedding.embedUrl,
    };
  },

  /**
   * Obtener configuración de embedding completa
   * @returns {Object}
   */
  getEmbedConfig() {
    return {
      type: 'report',
      id: this.embedding.reportId,
      embedUrl: this.embedding.embedUrl,
      accessToken: this.embedding.accessToken,
      tokenType: this.embedding.tokenType,
      settings: {
        paginatedReportsEnabled: true,
        extensions: 'Allow',
        showHeader: this.display.showHeader,
        allowExport: this.display.allowExport,
        navContentPaneEnabled: this.display.navContentPaneEnabled,
        filterPaneEnabled: true,
        visualizationsPane: true,
        bookmarksPaneEnabled: true,
      },
      filters: this.filters.predefinedFilters,
      identities: this.security.identities ? [this.security.identities] : undefined,
    };
  },

  /**
   * Actualizar configuración dinámicamente
   * @param {Object} updates - Objeto con los valores a actualizar
   */
  update(updates) {
    if (!updates) return;

    if (updates.embedding) {
      this.embedding = { ...this.embedding, ...updates.embedding };
    }
    if (updates.filters) {
      this.filters = { ...this.filters, ...updates.filters };
    }
    if (updates.security) {
      this.security = { ...this.security, ...updates.security };
    }
    if (updates.display) {
      this.display = { ...this.display, ...updates.display };
    }
    if (updates.network) {
      this.network = { ...this.network, ...updates.network };
    }
  },

  /**
   * Resetear configuración a valores por defecto
   */
  reset() {
    this.embedding.accessToken = null;
    this.embedding.reportId = import.meta.env.VITE_POWERBI_REPORT_ID || null;
    this.embedding.embedUrl = import.meta.env.VITE_POWERBI_EMBED_URL || null;
    this.filters.predefinedFilters = [];
    this.security.identities = null;
    this.security.roles = [];
  },
};

export default powerbiConfig;
