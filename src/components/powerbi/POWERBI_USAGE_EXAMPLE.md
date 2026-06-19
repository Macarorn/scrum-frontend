/**
 * Ejemplo de Uso - PowerBIReport Integration Layer
 * 
 * Este archivo muestra cómo usar la capa de integración de Power BI
 * preparada para uso futuro.
 * 
 * IMPORTANTE: Este archivo es solo referencial. No está integrado al proyecto.
 * 
 * @file POWERBI_USAGE_EXAMPLE.md
 */

# 🚀 Guía de Uso: PowerBIReport Integration Layer

## 📋 Descripción

La capa de integración Power BI está completamente preparada pero en **modo standby**.
Todos los componentes están listos para ser activados sin modificar la UI existente.

---

## 🎯 Componentes Creados

### 1. **Config: `src/config/powerbiConfig.js`**
Configuración centralizada de Power BI con:
- Variables de entorno
- Ajustes de embedding
- Seguridad y filtros
- URLs de API
- Métodos de validación y actualización

```javascript
import powerbiConfig from '@/config/powerbiConfig';

// Obtener configuración actual
const config = powerbiConfig.getEmbedConfig();

// Validar configuración
const validation = powerbiConfig.validate();

// Actualizar dinámicamente
powerbiConfig.update({
  embedding: {
    reportId: 'new-report-id',
    embedUrl: 'new-embed-url'
  }
});
```

### 2. **Service: `src/services/powerbiService.js`**
Servicio que proporciona toda la lógica de integración:
- Obtención de tokens (desde backend)
- Gestión de configuración
- Aplicación de filtros
- Row-Level Security (RLS)
- Logging de eventos
- Reintentos automáticos

```javascript
import powerbiService from '@/services/powerbiService';

// Validar configuración
const validation = powerbiService.validateConfig();

// Obtener token desde backend
const tokenResult = await powerbiService.getAccessToken();

// Aplicar filtros
powerbiService.applyFilters([
  { 
    $schema: 'http://powerbi.com/product/schema#basic',
    target: { table: 'Sales', column: 'Region' },
    operator: 'In',
    values: ['North', 'South']
  }
]);

// Habilitar RLS
powerbiService.enableRLS(
  { username: 'user@company.com' },
  ['Role1', 'Role2']
);

// Registrar evento
await powerbiService.logEvent({
  eventType: 'report_opened',
  reportName: 'Sales Dashboard'
});

// Obtener estado
const status = powerbiService.getStatus();
```

### 3. **Component: `src/components/powerbi/PowerBIReport.jsx`**
Componente React preparado para embedar reportes con:
- Manejo de estados (carga, error, listo)
- Validación de configuración
- Reintentos automáticos
- Monitoreo de expiración de tokens
- Logging de eventos
- Modo standby (no rompe UI existente)

```javascript
import PowerBIReport from '@/components/powerbi/PowerBIReport';

// Uso básico (Modo Standby)
<PowerBIReport isStandby={true} />

// Uso avanzado (Cuando esté listo)
<PowerBIReport
  reportId="your-report-id"
  embedUrl="your-embed-url"
  filters={[...]}
  security={{
    identities: { username: 'user@company.com' },
    roles: ['Admin', 'Manager']
  }}
  onReady={(status) => console.log('Listo:', status)}
  onError={(error) => console.error('Error:', error)}
  onLoadingChange={(isLoading) => console.log('Cargando:', isLoading)}
  height="800px"
/>
```

### 4. **Styles: `src/components/powerbi/PowerBIReport.css`**
Estilos completos y responsivos para:
- Contenedor del reporte
- Estados de carga y error
- Placeholder standby
- Barra de herramientas
- Panel de filtros
- Información de depuración
- Animaciones

---

## 🔧 Variables de Entorno

```env
# .env (Configuración de Power BI)

# Ambiente
VITE_POWERBI_ENVIRONMENT=public

# Reporte
VITE_POWERBI_REPORT_ID=your-report-id
VITE_POWERBI_EMBED_URL=https://app.powerbi.com/reportEmbed?...
VITE_POWERBI_TOKEN_TYPE=Aad

# Seguridad
VITE_POWERBI_ENABLE_RLS=false
VITE_POWERBI_CROSS_FILTERS=true

# Visualización
VITE_POWERBI_SHOW_HEADER=true
VITE_POWERBI_ALLOW_EXPORT=true
VITE_POWERBI_MODE=view
VITE_POWERBI_ALLOW_INTERACTION=true
VITE_POWERBI_NAV_PANE=true

# Timeouts y Reintentos
VITE_POWERBI_LOAD_TIMEOUT=30000
VITE_POWERBI_MAX_RETRIES=3
VITE_POWERBI_RETRY_DELAY=1000

# API
VITE_API_URL=http://localhost:3000/api
```

---

## 📡 Endpoints Esperados del Backend

El servicio de Power BI espera estos endpoints:

### 1. **Obtener Configuración**
```
GET /api/powerbi/config/:reportId
```
**Response:**
```json
{
  "reportId": "report-id",
  "embedUrl": "https://app.powerbi.com/...",
  "enableRLS": false,
  "roles": [],
  "showHeader": true,
  "allowExport": true,
  "mode": "view"
}
```

### 2. **Obtener Token**
```
POST /api/powerbi/token
```
**Body:**
```json
{
  "reportId": "report-id",
  "embedUrl": "embed-url",
  "identities": null,
  "roles": []
}
```
**Response:**
```json
{
  "accessToken": "eyJ...",
  "expiresIn": 3600,
  "refreshIn": 3000,
  "reportId": "report-id",
  "embedUrl": "embed-url"
}
```

### 3. **Registrar Eventos**
```
POST /api/powerbi/events
```
**Body:**
```json
{
  "timestamp": "2026-06-18T10:30:00Z",
  "reportId": "report-id",
  "eventType": "report_opened",
  "message": "Usuario abrió el reporte"
}
```

---

## 🎬 Flujo de Activación (Futuro)

### Fase 1: Preparación (Actual)
✅ Componentes creados y listos
✅ Servicio configurado
✅ Config centralizada
✅ No interfiere con UI actual

### Fase 2: Activación (Cuando se haya validado con backend)
1. Obtener credenciales de Power BI
2. Crear endpoints del backend
3. Cambiar `isStandby={true}` a `isStandby={false}` en el componente
4. Proporcionar `reportId` y `embedUrl`
5. Testar en desarrollo

### Fase 3: Validación
1. Verificar carga de reporte
2. Probar filtros
3. Validar RLS si aplica
4. Monitorear performance

### Fase 4: Deployment
1. Reemplazar Recharts por Power BI Embedded
2. Eliminar componente PowerBICharts.jsx (mantener standby como fallback)
3. Validar en producción

---

## 🔄 Migración de Recharts a Power BI

### Opción 1: Feature Flag (Recomendado)
```javascript
// En Dashboard.jsx
const USE_POWERBI = import.meta.env.VITE_USE_POWERBI === 'true';

return (
  <>
    {USE_POWERBI ? (
      <PowerBIReport
        reportId={...}
        embedUrl={...}
        isStandby={false}
      />
    ) : (
      <PowerBICharts data={powerbiData} />
    )}
  </>
);
```

### Opción 2: Reemplazo Gradual
1. Mantener Recharts visibles
2. Mostrar Power BI en tab separado
3. Cuando validado, ocultar Recharts

---

## 🧪 Testing Local

```javascript
// En console del navegador

import powerbiService from '@/services/powerbiService';

// 1. Validar configuración
powerbiService.validateConfig();
// Output: { isValid: false, status: {...}, message: "..." }

// 2. Establecer config manualmente (para testing)
powerbiService.setReportConfig({
  reportId: 'test-report-123',
  embedUrl: 'https://app.powerbi.com/test'
});

// 3. Obtener estado
powerbiService.getStatus();

// 4. Aplicar filtros
powerbiService.applyFilters([
  {
    $schema: 'http://powerbi.com/product/schema#basic',
    target: { table: 'Sales' },
    operator: 'In',
    values: ['Test']
  }
]);

// 5. Verificar cambios
powerbiService.getStatus();
```

---

## ⚠️ Notas de Seguridad

1. **Tokens NUNCA en Frontend**
   - Los tokens se obtienen del backend
   - Validados y firmados por servidor
   - Incluyen tiempo de expiración

2. **RLS (Row-Level Security)**
   - Proporciona seguridad a nivel de fila
   - Identidades validadas en backend
   - Roles controlados por servidor

3. **Logging de Eventos**
   - Registra acceso y uso
   - Auditoría de intentos de acceso
   - Monitoreo de errores

---

## 🐛 Troubleshooting

### "Configuración incompleta - falta reportId o embedUrl"
→ Establecer valores en `.env` o mediante `setReportConfig()`

### "Error al obtener token"
→ Verificar que endpoint `/api/powerbi/token` existe en backend

### "Token expirando pronto"
→ Automático - se refresca antes de expirar

### "Reporte no carga después de 3 reintentos"
→ Verificar credenciales y permisos de Power BI

---

## 📚 Archivos Creados

```
scrum-frontend/
├── src/
│   ├── config/
│   │   └── powerbiConfig.js           ✨ NUEVO
│   ├── services/
│   │   └── powerbiService.js          ✨ NUEVO
│   └── components/
│       └── powerbi/
│           ├── PowerBIReport.jsx      ✨ NUEVO
│           └── PowerBIReport.css      ✨ NUEVO
```

---

## ✅ Resumen

| Aspecto | Estado |
|--------|--------|
| **Configuración** | ✅ Completada |
| **Servicio** | ✅ Completado |
| **Componente** | ✅ Completado |
| **Estilos** | ✅ Completados |
| **UI Existente** | ✅ Sin cambios |
| **Funcionalidad Real** | ⏳ Pendiente (backend) |
| **Modo Standby** | ✅ Activo (sin romper UI) |
| **Listo para activar** | ✅ SÍ |

---

**Creado**: 2026-06-18
**Versión**: 1.0.0 (Standby)
**Estado**: Preparado para integración futura
