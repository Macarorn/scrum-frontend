/**
 * Exportador centralizado de módulo Power BI
 * 
 * Facilita las importaciones desde cualquier parte del proyecto
 * 
 * Ejemplos de uso:
 * import { powerbiService, powerbiConfig, PowerBIReport } from '@/components/powerbi';
 * 
 * O importaciones individuales:
 * import powerbiService from '@/services/powerbiService';
 * import powerbiConfig from '@/config/powerbiConfig';
 */

// Importar componente
import PowerBIReport from './PowerBIReport';

// Importar servicio
import powerbiService from '../../services/powerbiService';

// Importar configuración
import powerbiConfig from '../../config/powerbiConfig';

// Re-exportar todo
export { PowerBIReport, powerbiService, powerbiConfig };

// Exportar como default (contenedor)
export default {
  PowerBIReport,
  powerbiService,
  powerbiConfig,
};
