/**
 * GUÍA DE INTEGRACIÓN - Dashboard Power BI
 * 
 * Este archivo muestra cómo integrar el Dashboard de Power BI en tu aplicación React
 */

// ============================================================================
// PASO 1: Importar el componente en tu archivo de rutas o App.jsx
// ============================================================================

import DashboardPowerBI from './components/powerbi/DashboardPowerBI';

// ============================================================================
// PASO 2: Agregar la ruta en tu router (si usas React Router)
// ============================================================================

// Ejemplo con React Router DOM:
/*
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/dashboard-powerbi" element={<DashboardPowerBI />} />
        // ... otras rutas
      </Routes>
    </Router>
  );
}
*/

// ============================================================================
// PASO 3: Usar el componente directamente (sin rutas)
// ============================================================================

/*
function App() {
  return (
    <div>
      <DashboardPowerBI />
    </div>
  );
}
*/

// ============================================================================
// CONFIGURACIÓN DE VARIABLES DE ENTORNO
// ============================================================================

/*
Crea un archivo .env en la raíz de tu proyecto frontend:

REACT_APP_API_KEY=TU_API_KEY_AQUI

Luego, el servicio powerbiService.js utilizará automáticamente esta variable.
Si no la proporcionas, usará el valor por defecto 'TU_API_KEY'.

Nota: Las variables de entorno en React (Vite) deben estar prefijadas con VITE_
Para usarlas con Vite, cambia el prefijo en powerbiService.js:
- De: process.env.REACT_APP_API_KEY
- A: import.meta.env.VITE_API_KEY
*/

// ============================================================================
// ESTRUCTURA DE ARCHIVOS CREADOS
// ============================================================================

/*
src/
 └── components/
      └── powerbi/
            ├── DashboardPowerBI.jsx          ← Componente principal
            ├── DashboardPowerBI.css          ← Estilos
            ├── powerbiService.js             ← Servicio de API
            └── PowerBICharts.jsx             ← Componente de gráficas
*/

// ============================================================================
// CARACTERÍSTICAS IMPLEMENTADAS
// ============================================================================

/*
✓ Servicio powerbiService.js con:
  - 6 funciones para consumir endpoints (getProyectos, getSprints, etc.)
  - 1 función getAllData() que carga todo en paralelo
  - Manejo automático del header x-api-key
  - Manejo de errores con try/catch

✓ Componente DashboardPowerBI.jsx con:
  - Carga de datos al montar con useEffect
  - Estado de carga (loading)
  - Estado de error con mensajes amigables
  - Botón para actualizar datos (refresh)
  - 6 tarjetas de métricas principales
  - Integración con PowerBICharts

✓ Componente PowerBICharts.jsx con 4 gráficas:
  - Gráfica de pastel: Tareas por Estado
  - Gráfica de barras: Historias por Sprint
  - Gráfica de barras horizontal: Tareas por Asignado
  - Gráfica de líneas: Épicas con Historias

✓ Estilos en DashboardPowerBI.css:
  - Diseño responsivo
  - Animaciones suaves
  - Gradientes y sombras
  - Adaptable a mobile (sm, md, lg, xl)
*/

// ============================================================================
// ENDPOINTS CONSUMIDOS
// ============================================================================

/*
El servicio consume los siguientes endpoints de tu backend:

Base URL: http://localhost:3000/api/powerbi
Header requerido: x-api-key: TU_API_KEY

Endpoints:
  GET /proyectos   → Lista de proyectos
  GET /sprints     → Lista de sprints
  GET /epicas      → Lista de épicas
  GET /historias   → Lista de historias de usuario
  GET /tareas      → Lista de tareas
  GET /usuarios    → Lista de usuarios

Todos los endpoints deben retornar un array JSON.
Ejemplo de respuesta esperada:
{
  "data": [
    { "id": 1, "nombre": "Proyecto 1", ... },
    { "id": 2, "nombre": "Proyecto 2", ... }
  ]
}
*/

// ============================================================================
// USO DEL SERVICIO DE FORMA MANUAL
// ============================================================================

/*
Si necesitas usar el servicio directamente en otros componentes:

import powerbiService from './components/powerbi/powerbiService';

// Obtener datos individuales
const proyectos = await powerbiService.getProyectos();
const sprints = await powerbiService.getSprints();

// Obtener todos los datos de una vez (en paralelo)
const allData = await powerbiService.getAllData();
console.log(allData.proyectos);
console.log(allData.sprints);
*/

// ============================================================================
// PERSONALIZACIÓN
// ============================================================================

/*
Para personalizar el dashboard, puedes:

1. Cambiar colores: Edita las variables COLORS en PowerBICharts.jsx
2. Cambiar el título: Edita la línea en DashboardPowerBI.jsx:
   <h1>📊 Dashboard de Indicadores Scrum</h1>
   
3. Agregar más gráficas: Crea nuevas funciones en PowerBICharts.jsx
4. Cambiar estilos: Modifica DashboardPowerBI.css

5. Para integrar Power BI embebido real:
   - El componente powerbi-client-react ya está instalado
   - Crea un nuevo componente que use PowerBIEmbed
   - Reemplaza PowerBICharts con el nuevo componente
*/

// ============================================================================
// SOLUCIÓN DE PROBLEMAS
// ============================================================================

/*
PROBLEMA: "Error: No se recibió respuesta del servidor"
SOLUCIÓN: Verifica que el backend esté corriendo en http://localhost:3000

PROBLEMA: "Error 403: Forbidden"
SOLUCIÓN: Verifica que el header x-api-key sea correcto en powerbiService.js

PROBLEMA: "Las gráficas no muestran datos"
SOLUCIÓN: Verifica que los endpoints del backend retornen arrays con la estructura correcta

PROBLEMA: Los estilos no se cargan correctamente
SOLUCIÓN: Verifica que DashboardPowerBI.css esté en la misma carpeta que DashboardPowerBI.jsx
*/

// ============================================================================
// PRÓXIMOS PASOS
// ============================================================================

/*
1. Integra el componente en tu App.jsx o sistema de rutas
2. Prueba los endpoints del backend con Postman
3. Verifica que el header x-api-key sea correcto
4. Si todo funciona, integra Power BI embebido oficial usando powerbi-client-react
5. Considera agregar caché de datos para mejorar el rendimiento
6. Implementa autenticación / autorización si es necesario
*/

export default {};
