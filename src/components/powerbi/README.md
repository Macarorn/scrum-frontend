# 📊 Dashboard Power BI - Módulo de Indicadores Scrum

## 📋 Descripción

Módulo completo de React para visualizar indicadores de un proyecto Scrum. Incluye un dashboard con tarjetas de métricas y gráficas interactivas construidas con Recharts. Este es un módulo de demostración antes de integrar Power BI embebido oficial.

## 🎯 Características

### Componentes Implementados

- **DashboardPowerBI.jsx**: Componente principal que orquesta toda la funcionalidad
- **PowerBICharts.jsx**: Componente de gráficas con 4 visualizaciones diferentes
- **powerbiService.js**: Servicio de API con funciones para consumir endpoints

### Funcionalidades

✅ Carga de datos en tiempo real desde backend Node.js  
✅ 6 tarjetas de métricas principales  
✅ 4 gráficas interactivas (pastel, barras, líneas)  
✅ Estados de carga y error  
✅ Botón de actualización manual  
✅ Diseño responsivo (mobile-first)  
✅ Estilos modernos con Bootstrap y CSS personalizado  
✅ Manejo automático del header x-api-key  
✅ Llamadas paralelas a endpoints para mejor rendimiento  

## 🚀 Instalación

### 1. Dependencias ya instaladas
```bash
# En scrum-frontend/
npm install axios recharts  # Ya instalado ✓
```

### 2. Archivos creados

```
src/components/powerbi/
├── DashboardPowerBI.jsx          (Componente principal)
├── DashboardPowerBI.css          (Estilos)
├── powerbiService.js             (Servicio de API)
├── PowerBICharts.jsx             (Gráficas)
├── INTEGRATION_GUIDE.js          (Guía de integración)
└── README.md                     (Este archivo)
```

## 📝 Configuración

### 1. Variable de entorno

Crea un archivo `.env` en la raíz de `scrum-frontend/`:

```env
# Para Create React App
REACT_APP_API_KEY=TU_API_KEY_AQUI

# Para Vite (si lo usas)
VITE_API_KEY=TU_API_KEY_AQUI
```

**Nota**: El servicio actualmente usa `process.env.REACT_APP_API_KEY`. Si tu proyecto usa Vite, cambia la línea en `powerbiService.js`:

```javascript
// De:
const API_KEY = process.env.REACT_APP_API_KEY || 'TU_API_KEY';

// A:
const API_KEY = import.meta.env.VITE_API_KEY || 'TU_API_KEY';
```

### 2. URL del backend

Verifica que la URL en `powerbiService.js` sea correcta:

```javascript
const API_BASE_URL = 'http://localhost:3000/api/powerbi';
```

## 🔌 Endpoints del Backend Requeridos

Tu backend Node.js debe exponer los siguientes endpoints:

| Endpoint | Método | Header Requerido |
|----------|--------|------------------|
| `/api/powerbi/proyectos` | GET | x-api-key |
| `/api/powerbi/sprints` | GET | x-api-key |
| `/api/powerbi/epicas` | GET | x-api-key |
| `/api/powerbi/historias` | GET | x-api-key |
| `/api/powerbi/tareas` | GET | x-api-key |
| `/api/powerbi/usuarios` | GET | x-api-key |

### Formato esperado de respuesta

```json
[
  {
    "id": 1,
    "nombre": "Proyecto 1",
    ...
  }
]
```

## 💻 Uso

### Importar en tu aplicación

**Opción 1: En un archivo de rutas**

```javascript
import DashboardPowerBI from './components/powerbi/DashboardPowerBI';

// En tus rutas
<Route path="/dashboard-powerbi" element={<DashboardPowerBI />} />
```

**Opción 2: Directamente en un componente**

```javascript
import DashboardPowerBI from './components/powerbi/DashboardPowerBI';

function App() {
  return <DashboardPowerBI />;
}
```

**Opción 3: Importación dinámica (Lazy Loading)**

```javascript
import { lazy, Suspense } from 'react';
import { Spinner } from 'react-bootstrap';

const DashboardPowerBI = lazy(() => import('./components/powerbi/DashboardPowerBI'));

function App() {
  return (
    <Suspense fallback={<Spinner animation="border" />}>
      <DashboardPowerBI />
    </Suspense>
  );
}
```

## 📊 Gráficas incluidas

### 1. Tareas por Estado
- **Tipo**: Gráfica de pastel (Pie Chart)
- **Datos**: Agrupa tareas por su estado
- **Color**: Azul primario

### 2. Historias por Sprint
- **Tipo**: Gráfica de barras (Bar Chart)
- **Datos**: Cuenta historias por cada sprint
- **Color**: Verde

### 3. Tareas por Asignado
- **Tipo**: Gráfica de barras horizontal
- **Datos**: Muestra quién tiene más tareas asignadas
- **Color**: Amarillo

### 4. Épicas con Historias
- **Tipo**: Gráfica de líneas (Line Chart)
- **Datos**: Cantidad de historias por épica
- **Color**: Rojo

## 🎨 Personalización

### Cambiar colores de gráficas

En `PowerBICharts.jsx`, modifica el array `COLORS`:

```javascript
const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8', '#82CA9D'];
```

### Cambiar estilos

Edita `DashboardPowerBI.css` para personalizar la apariencia.

### Cambiar la URL del API

En `powerbiService.js`:

```javascript
const API_BASE_URL = 'https://tu-api.com/api/powerbi';
```

## 🔍 Consumir el servicio manualmente

Si necesitas usar el servicio en otros componentes:

```javascript
import powerbiService from './components/powerbi/powerbiService';

// Obtener datos individuales
async function loadData() {
  try {
    const proyectos = await powerbiService.getProyectos();
    const sprints = await powerbiService.getSprints();
    
    console.log('Proyectos:', proyectos);
    console.log('Sprints:', sprints);
  } catch (error) {
    console.error('Error:', error.message);
  }
}

// Obtener todo en paralelo
async function loadAllData() {
  try {
    const data = await powerbiService.getAllData();
    console.log('Todos los datos:', data);
  } catch (error) {
    console.error('Error:', error.message);
  }
}
```

## 🚨 Solución de Problemas

### Error: "No se recibió respuesta del servidor"

1. Verifica que el backend esté corriendo: `http://localhost:3000`
2. Comprueba que los endpoints estén disponibles
3. Revisa la consola del navegador para más detalles

### Error: "Error 403: Forbidden"

1. Verifica el header `x-api-key` en `powerbiService.js`
2. Comprueba que la API key sea válida en tu backend
3. Asegúrate de que el endpoint requiera este header

### Las gráficas no muestran datos

1. Abre la consola (F12) y verifica si hay errores
2. Comprueba que los endpoints retornen datos válidos
3. Verifica la estructura de los datos en la respuesta
4. Usa el Network tab para ver las peticiones HTTP

### Los estilos no se aplican correctamente

1. Verifica que `DashboardPowerBI.css` esté en la misma carpeta
2. Revisa que Bootstrap esté importado en tu app principal
3. Comprueba que no haya conflictos de CSS con otros estilos

## 📈 Próximos Pasos

### Integración con Power BI oficial

Cuando estés listo para integrar Power BI embebido:

```javascript
import { PowerBIEmbed } from 'powerbi-client-react';
import { models } from 'powerbi-client';

function PowerBIReport() {
  return (
    <PowerBIEmbed
      embedConfig={{
        type: 'report',
        id: '<Tu Report ID>',
        embedUrl: '<Tu Embed URL>',
        accessToken: '<Tu Access Token>',
        tokenType: models.TokenType.Aad,
        settings: {
          paginatedReportsEnabled: true,
          extensions: models.Extensions.Allow
        }
      }}
      eventHandlers={new Map()}
      cssClassName="powerbi-report-container"
    />
  );
}
```

### Mejoras sugeridas

1. **Caché de datos**: Implementa caché para reducir llamadas al backend
2. **Filtros**: Agrega filtros para limitar datos por proyecto o sprint
3. **Exportación**: Agrega botón para exportar datos a CSV/Excel
4. **Notificaciones**: Usa react-toastify para alertas mejor diseñadas
5. **Autenticación**: Integra con tu sistema de autenticación
6. **Base de datos local**: Usa IndexedDB para persistencia

## 📚 Recursos

- [Recharts Documentación](https://recharts.org/)
- [React Bootstrap Componentes](https://react-bootstrap.github.io/)
- [Axios Documentación](https://axios-http.com/)
- [Power BI Client React](https://github.com/microsoft/PowerBI-JavaScript/wiki/Create-a-Power-BI-Embed-for-your-customers)

## 📄 Archivos

- `DashboardPowerBI.jsx`: Componente principal (210 líneas)
- `PowerBICharts.jsx`: Gráficas (260 líneas)
- `powerbiService.js`: Servicio API (110 líneas)
- `DashboardPowerBI.css`: Estilos (280 líneas)
- `INTEGRATION_GUIDE.js`: Guía de integración (240 líneas)
- `README.md`: Este archivo

## ✅ Checklist de implementación

- [ ] Backend Node.js expone endpoints en `/api/powerbi`
- [ ] Endpoints retornan arrays de datos
- [ ] Header `x-api-key` está configurado en backend
- [ ] Variable de entorno `REACT_APP_API_KEY` está en `.env`
- [ ] Dependencias (`axios`, `recharts`) están instaladas
- [ ] Componente está integrado en la aplicación
- [ ] Dashboard se carga sin errores
- [ ] Gráficas muestran datos correctamente
- [ ] Responsivo funciona en mobile
- [ ] Botón de actualización funciona

## 🤝 Contribuciones

Para mejorar este módulo, puedes:

1. Agregar más tipos de gráficas
2. Mejorar manejo de errores
3. Agregar validación de datos
4. Implementar caché
5. Agregar más métricas

## 📝 Notas

- Este módulo es una demostración antes de integrar Power BI oficial
- Los datos se cargan al montar el componente
- Usa llamadas paralelas para mejor rendimiento
- Es completamente responsivo y funciona en mobile
- Todos los estilos usan Bootstrap + CSS personalizado

---

**Versión**: 1.0.0  
**Última actualización**: 2026-06-17  
**Autor**: Dashboard Power BI Module
