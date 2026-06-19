/**
 * INTEGRACIÓN POWER BI - REFERENCIA RÁPIDA
 * 
 * Documento de referencia para desarrolladores sobre la capa de integración
 * Power BI preparada sin modificar la UI existente.
 * 
 * @file POWERBI_INTEGRATION_QUICK_REFERENCE.md
 */

# ⚡ Power BI Integration - Quick Reference

## 📦 ¿Qué se ha creado?

Se ha implementado una **capa de integración completa** lista para usar con Power BI Embedded, sin modificar nada de la UI actual.

### Archivos Nuevos

```
✨ Config:    src/config/powerbiConfig.js
✨ Service:   src/services/powerbiService.js
✨ Component: src/components/powerbi/PowerBIReport.jsx
✨ Styles:    src/components/powerbi/PowerBIReport.css
```

---

## 🎯 Características Implementadas

| Característica | Descripción | Estado |
|---|---|---|
| **Configuración Centralizada** | Variables de entorno, embedding, seguridad, display | ✅ |
| **Servicio HTTP** | Cliente axios con timeouts y reintentos | ✅ |
| **Gestión de Tokens** | Obtención, refresco y monitoreo de expiración | ✅ |
| **Filtros** | Aplicar y limpiar filtros de Power BI | ✅ |
| **Row-Level Security (RLS)** | Identidades y roles para seguridad a nivel de fila | ✅ |
| **Logging de Eventos** | Registro de acciones para auditoría | ✅ |
| **Reintentos Automáticos** | Reintenta si falla (configurable) | ✅ |
| **Monitoreo de Token** | Alerta y refresco automático antes de expirar | ✅ |
| **Modo Standby** | No interfiere con UI actual | ✅ |
| **Validación** | Verificar completitud de configuración | ✅ |

---

## 🔌 Importar y Usar

### Opción 1: Solo Servicio (Recomendado ahora)
```javascript
import powerbiService from '@/services/powerbiService';

// Validar
powerbiService.validateConfig();

// Estado
powerbiService.getStatus();

// Aplicar filtros
powerbiService.applyFilters([...]);
```

### Opción 2: Componente (Cuando Power BI esté activo)
```javascript
import PowerBIReport from '@/components/powerbi/PowerBIReport';

// Modo standby (actual - no muestra nada raro)
<PowerBIReport isStandby={true} />

// Modo activo (futuro)
<PowerBIReport 
  reportId="..." 
  embedUrl="..." 
  isStandby={false}
/>
```

### Opción 3: Config Directamente
```javascript
import powerbiConfig from '@/config/powerbiConfig';

// Obtener configuración
const config = powerbiConfig.getEmbedConfig();

// Actualizar
powerbiConfig.update({ ... });

// Validar
powerbiConfig.validate();
```

---

## 📋 API del Servicio

### Métodos de Configuración

```javascript
// Obtener configuración actual
powerbiService.getConfig()
→ { type, id, embedUrl, accessToken, settings, filters }

// Validar que está configurado
powerbiService.validateConfig()
→ { isValid, status: {...}, message }

// Establecer reportId y embedUrl
powerbiService.setReportConfig({ reportId, embedUrl })
→ { success, config }

// Establecer token manualmente
powerbiService.setAccessToken(token, expiresIn)
→ { success, message, expiresIn }
```

### Métodos de Tokens

```javascript
// Obtener token desde backend
await powerbiService.getAccessToken(options)
→ { success, token, expiresIn, refreshIn }

// Refrescar token
await powerbiService.refreshAccessToken()
→ { success, token, expiresIn }
```

### Métodos de Configuración del Reporte

```javascript
// Obtener config desde backend
await powerbiService.getReportConfig(reportId)
→ { success, data }
```

### Métodos de Filtros

```javascript
// Aplicar filtros
powerbiService.applyFilters(filters)
→ { success, appliedFilters }

// Limpiar filtros
powerbiService.clearFilters()
→ { success, message }
```

### Métodos de Seguridad RLS

```javascript
// Habilitar RLS
powerbiService.enableRLS(identities, roles)
→ { success, rlsEnabled, roles }

// Deshabilitar RLS
powerbiService.disableRLS()
→ { success, rlsEnabled }
```

### Métodos Utility

```javascript
// Registrar evento
await powerbiService.logEvent(eventData)
→ { success, message, data }

// Obtener estado actual
powerbiService.getStatus()
→ { configured, hasToken, reportId, embedUrl, rlsEnabled, filters }

// Resetear todo
powerbiService.reset()
→ { success, message }
```

---

## 🔧 Variables de Entorno

```env
# Básicas
VITE_POWERBI_REPORT_ID=your-report-id
VITE_POWERBI_EMBED_URL=your-embed-url

# Opcionales (con defaults)
VITE_POWERBI_ENVIRONMENT=public
VITE_POWERBI_TOKEN_TYPE=Aad
VITE_POWERBI_ENABLE_RLS=false
VITE_POWERBI_SHOW_HEADER=true
VITE_POWERBI_ALLOW_EXPORT=true
VITE_POWERBI_MODE=view
VITE_POWERBI_LOAD_TIMEOUT=30000
VITE_POWERBI_MAX_RETRIES=3
VITE_POWERBI_RETRY_DELAY=1000
```

---

## 🚀 Cómo Activar (Cuando esté listo)

### Paso 1: Configurar Backend
Crear estos endpoints:
```
POST /api/powerbi/token      → Devuelve token
GET  /api/powerbi/config/:id → Devuelve config
POST /api/powerbi/events     → Registra eventos
```

### Paso 2: Establecer Credenciales
```env
VITE_POWERBI_REPORT_ID=abc123
VITE_POWERBI_EMBED_URL=https://app.powerbi.com/...
```

### Paso 3: Cambiar isStandby
```javascript
<PowerBIReport 
  reportId="abc123"
  embedUrl="https://..."
  isStandby={false}  // ← Cambiar a false
/>
```

### Paso 4: Testar
```javascript
// En console
import powerbiService from '@/services/powerbiService';
powerbiService.getStatus();
// Debe mostrar { configured: true, hasToken: true, ... }
```

---

## 🔐 Seguridad Garantizada

✅ **Tokens NUNCA hardcodeados**
- Obtenidos dinámicamente del backend
- Con tiempo de expiración
- Refrescados automáticamente

✅ **Row-Level Security**
- Identidades validadas en servidor
- Roles controlados por backend
- Auditoría de acceso

✅ **Logging de Eventos**
- Todos los accesos registrados
- Timestamps automáticos
- Fácil auditoría

---

## 📊 Estructura del Componente PowerBIReport

```
PowerBIReport
├── Modo Standby (isStandby=true)
│   └── Muestra mensaje informativo sin romperpués nada
│
├── Estados
│   ├── Loading → Spinner de carga
│   ├── Error → Alert con retry
│   ├── Initialized → Reporte listo
│   └── Placeholder → Área preparada para Power BI
│
├── Funcionalidades
│   ├── Validación automática
│   ├── Reintentos (hasta 3 veces)
│   ├── Monitoreo de token
│   ├── Aplicación de filtros
│   └── Logging de eventos
│
└── Callbacks
    ├── onReady(status)
    ├── onError(error)
    └── onLoadingChange(isLoading)
```

---

## 🧪 Testing en Consola

```javascript
// 1. Importar servicio
import powerbiService from '@/services/powerbiService';

// 2. Validar estado actual
powerbiService.validateConfig();
// Output: { isValid: false, ... } (sin config aún)

// 3. Simular configuración
powerbiService.setReportConfig({
  reportId: 'test-123',
  embedUrl: 'https://example.com'
});

// 4. Verificar
powerbiService.getStatus();
// Output: { configured: true, reportId: 'test-123', ... }

// 5. Aplicar filtros de prueba
powerbiService.applyFilters([
  {
    $schema: 'http://powerbi.com/product/schema#basic',
    target: { table: 'test' },
    operator: 'In',
    values: ['value1']
  }
]);

// 6. Verificar estado final
powerbiService.getStatus();
```

---

## ❌ Lo que NO se modificó

- ✅ **Dashboard.jsx** - Sin cambios
- ✅ **PowerBICharts.jsx** - Sin cambios (Recharts sigue funcionando)
- ✅ **Rutas** - Sin cambios
- ✅ **Estilos existentes** - Sin cambios
- ✅ **Componentes UI** - Sin cambios
- ✅ **Services existentes** - Sin cambios
- ✅ **Package.json** - No se agregaron dependencias nuevas
  - powerbi-client ✅ Ya estaba
  - powerbi-client-react ✅ Ya estaba

---

## ✅ Lo que se agregó

| Tipo | Archivo | Propósito |
|------|---------|----------|
| Config | `src/config/powerbiConfig.js` | Configuración centralizada |
| Service | `src/services/powerbiService.js` | Lógica de integración |
| Component | `src/components/powerbi/PowerBIReport.jsx` | Componente React |
| Styles | `src/components/powerbi/PowerBIReport.css` | Estilos responsivos |
| Doc | `POWERBI_USAGE_EXAMPLE.md` | Guía de uso |

**TOTAL: 5 archivos nuevos, 0 archivos modificados**

---

## 📈 Próximos Pasos

### Cuando el backend esté listo:
1. ✅ Crear endpoints `/api/powerbi/*`
2. ✅ Obtener credenciales de Power BI
3. ✅ Cambiar `isStandby={false}` en Dashboard
4. ✅ Establecer variables de entorno
5. ✅ Testar en desarrollo
6. ✅ Validar en QA
7. ✅ Deploy a producción

### Migración de Recharts:
1. Usar feature flag para testing paralelo
2. Validar con usuarios
3. Cuando aprobado, reemplazar PowerBICharts
4. Eliminar recharts del package.json

---

## 💡 Tips

- **Para debugging**: `NODE_ENV=development` muestra panel de debug
- **Para testing**: Usa `setReportConfig()` sin backend
- **Para productionn**: Siempre obtener tokens del backend
- **Para mantenimiento**: Todo está bien documentado en el código

---

## 🆘 Ayuda Rápida

```javascript
// ¿Está todo configurado?
powerbiService.validateConfig()

// ¿Cuál es el estado actual?
powerbiService.getStatus()

// ¿Cómo aplicar filtros?
powerbiService.applyFilters([...])

// ¿Cómo habilitar RLS?
powerbiService.enableRLS({username: '...'}, ['role1'])

// ¿Cómo refrescar token?
await powerbiService.refreshAccessToken()

// ¿Cómo resetear?
powerbiService.reset()
```

---

**Versión**: 1.0.0 (Integration Layer Ready)  
**Fecha**: 2026-06-18  
**Estado**: ✅ Preparado | ⏳ Pendiente de activación
