/**
 * ANÁLISIS DE CONTENEDORES DE GRÁFICAS - DASHBOARD SCRUM
 * 
 * Análisis exhaustivo de los contenedores Recharts en el Dashboard
 * Sin modificar código - Solo análisis estructural
 * 
 * @file ANALISIS_CONTENEDORES_GRAFICAS.md
 */

# 📊 Análisis de Contenedores de Gráficas - Dashboard

## Resumen Ejecutivo

| Elemento | Cantidad | Ubicación |
|----------|----------|-----------|
| **Gráficas Recharts** | 4 | `PowerBICharts.jsx` |
| **Tarjetas KPI** | 6 | `Dashboard.jsx` |
| **Contenedor Principal** | 1 | `.powerbi-charts-container` |
| **Grid Layout** | 2x2 | Bootstrap responsive |

---

## 📐 ESTRUCTURA DE LAYOUT

### Jerarquía Visual

```
Dashboard.jsx
└── dash-v2-container (max-width: 1200px, flexDirection: column, gap: 24px)
    ├── dash-v2-header (Saludo + Search + Botón)
    ├── dash-actions-row (Quick Actions)
    ├── dash-v2-card (Mis Proyectos Activos)
    └── dash-v2-card (Indicadores de Power BI)
        ├── Tarjeta 1: KPI Proyectos
        ├── Tarjeta 2: KPI Sprints
        ├── Tarjeta 3: KPI Épicas
        ├── Tarjeta 4: KPI Historias
        ├── Tarjeta 5: KPI Tareas
        ├── Tarjeta 6: KPI Usuarios
        │
        └── PowerBICharts.jsx (margin-top: 32px)
            └── .powerbi-charts-container (Bootstrap Grid)
                ├── Row 1 (mb-4)
                │   ├── Col lg={6} md={12} mb-4
                │   │   └── GRÁFICA 1: Tareas por Estado
                │   └── Col lg={6} md={12} mb-4
                │       └── GRÁFICA 2: Historias por Sprint
                │
                └── Row 2 (mb-4)
                    ├── Col lg={6} md={12} mb-4
                    │   └── GRÁFICA 3: Tareas por Asignado
                    └── Col lg={6} md={12} mb-4
                        └── GRÁFICA 4: Épicas con Historias
```

---

## 🎯 TARJETAS KPI (6 UNIDADES)

### Ubicación
- **Archivo**: `src/pages/Dashboard/Dashboard.jsx`
- **Línea**: Aproximadamente línea 130-180
- **Contenedor CSS**: `.dash-v2-small-cards`

### Estructura de Grid

**Primera Fila de KPIs**
```css
display: grid
grid-template-columns: repeat(3, minmax(0, 1fr))
gap: 20px
```

**Segunda Fila de KPIs**
```css
display: grid
grid-template-columns: repeat(3, minmax(0, 1fr))
gap: 20px
margin-top: 20px
```

### KPI 1: Proyectos

| Propiedad | Valor |
|-----------|-------|
| **Título** | "Proyectos" |
| **Ícono** | 📁 |
| **Valor** | `powerbiData?.proyectos?.length ?? 0` |
| **Clase CSS** | `.mini-card` |
| **Padding** | 24px |
| **Border Radius** | 24px |
| **Background** | #ffffff |
| **Box Shadow** | 0 8px 30px rgba(0,0,0,0.05) |
| **Posición Grid** | Fila 1, Col 1 |

**Estructura HTML**
```html
<div class="mini-card" style="padding: 24px; border-radius: 24px; background: #ffffff; box-shadow: 0 8px 30px rgba(0,0,0,0.05)">
  <div class="mini-card-text">
    <h3>Proyectos</h3>
    <p>{value} proyectos registrados</p>
  </div>
  <div class="pencil-icon">📁</div>
</div>
```

---

### KPI 2: Sprints

| Propiedad | Valor |
|-----------|-------|
| **Título** | "Sprints" |
| **Ícono** | ⏱️ |
| **Valor** | `powerbiData?.sprints?.length ?? 0` |
| **Clase CSS** | `.mini-card` |
| **Padding** | 24px |
| **Border Radius** | 24px |
| **Background** | #ffffff |
| **Box Shadow** | 0 8px 30px rgba(0,0,0,0.05) |
| **Posición Grid** | Fila 1, Col 2 |

---

### KPI 3: Épicas

| Propiedad | Valor |
|-----------|-------|
| **Título** | "Épicas" |
| **Ícono** | 🏷️ |
| **Valor** | `powerbiData?.epicas?.length ?? 0` |
| **Clase CSS** | `.mini-card` |
| **Padding** | 24px |
| **Border Radius** | 24px |
| **Background** | #ffffff |
| **Box Shadow** | 0 8px 30px rgba(0,0,0,0.05) |
| **Posición Grid** | Fila 1, Col 3 |

---

### KPI 4: Historias

| Propiedad | Valor |
|-----------|-------|
| **Título** | "Historias" |
| **Ícono** | 📘 |
| **Valor** | `powerbiData?.historias?.length ?? 0` |
| **Clase CSS** | `.mini-card` |
| **Padding** | 24px |
| **Border Radius** | 24px |
| **Background** | #ffffff |
| **Box Shadow** | 0 8px 30px rgba(0,0,0,0.05) |
| **Posición Grid** | Fila 2, Col 1 |

---

### KPI 5: Tareas

| Propiedad | Valor |
|-----------|-------|
| **Título** | "Tareas" |
| **Ícono** | ✅ |
| **Valor** | `powerbiData?.tareas?.length ?? 0` |
| **Clase CSS** | `.mini-card` |
| **Padding** | 24px |
| **Border Radius** | 24px |
| **Background** | #ffffff |
| **Box Shadow** | 0 8px 30px rgba(0,0,0,0.05) |
| **Posición Grid** | Fila 2, Col 2 |

---

### KPI 6: Usuarios

| Propiedad | Valor |
|-----------|-------|
| **Título** | "Usuarios" |
| **Ícono** | 👥 |
| **Valor** | `powerbiData?.usuarios?.length ?? 0` |
| **Clase CSS** | `.mini-card` |
| **Padding** | 24px |
| **Border Radius** | 24px |
| **Background** | #ffffff |
| **Box Shadow** | 0 8px 30px rgba(0,0,0,0.05) |
| **Posición Grid** | Fila 2, Col 3 |

---

## 📊 GRÁFICAS RECHARTS (4 CONTENEDORES)

### Ubicación General
- **Archivo**: `src/components/powerbi/PowerBICharts.jsx`
- **Contenedor**: `.powerbi-charts-container`
- **Layout**: Grid Bootstrap 2x2
- **Margin Inferior**: `mb-4` entre filas (1.5rem)

### Prop General
```javascript
<PowerBICharts 
  data={powerbiData}      // { proyectos, sprints, épicas, historias, tareas, usuarios }
  loading={powerbiLoading}  // boolean
  error={powerbiError}      // string|null
/>
```

---

## 🔵 GRÁFICA 1: TAREAS POR ESTADO

### Información General

| Propiedad | Valor |
|-----------|-------|
| **Nombre Componente** | Card + PieChart |
| **Tipo de Gráfica** | PieChart (Pie Chart - Gráfica de Pastel) |
| **Ubicación Archivo** | `src/components/powerbi/PowerBICharts.jsx` línea ~40-90 |
| **Posición en Grid** | Fila 1, Columna 1 (ROW 1, COL 1) |
| **Clase CSS Container** | `.powerbi-card`, `.h-100` |
| **Bootstrap Props** | `lg={6} md={12} mb={4}` |

### Dimensiones Visuales

| Propiedad | Valor |
|-----------|-------|
| **Altura (height)** | 300px |
| **Ancho (width)** | 50% en lg, 100% en md y menores |
| **ResponsiveContainer** | width="100%", height={300} |
| **Padding Card.Body** | 16px (Bootstrap default) |
| **Border Radius** | 4px (Bootstrap Card default) |
| **Outer Radius (Pie)** | 100px |

### Información Mostrada

| Elemento | Descripción |
|----------|-------------|
| **Header** | "Tareas por Estado" |
| **Header Color** | bg-primary text-white (#0066cc fondo, blanco texto) |
| **Datos** | Agrupa todas las tareas por su estado |
| **Formato de Etiqueta** | "${estado}: ${cantidad}" ej: "En Progreso: 5" |
| **Fuente de Datos** | `getTareasPorEstado()` |

### Función de Transformación de Datos

```javascript
getTareasPorEstado() {
  // Agrupa tareas por estado
  const tareasPorEstado = {};
  
  (data.tareas || []).forEach(tarea => {
    const estado = tarea.estado || 'Sin estado';
    tareasPorEstado[estado] = (tareasPorEstado[estado] || 0) + 1;
  });

  return Object.entries(tareasPorEstado).map(([name, value]) => ({
    name,
    value
  }));
}
```

### Estructura Recharts

```jsx
<ResponsiveContainer width="100%" height={300}>
  <PieChart>
    <Pie
      data={tareasPorEstado}
      cx="50%"
      cy="50%"
      labelLine={false}
      label={({ name, value }) => `${name}: ${value}`}
      outerRadius={100}
      fill="#8884d8"
      dataKey="value"
    >
      {tareasPorEstado.map((entry, index) => (
        <Cell 
          key={`cell-${index}`} 
          fill={COLORS[index % COLORS.length]} 
        />
      ))}
    </Pie>
    <Tooltip />
  </PieChart>
</ResponsiveContainer>
```

### Paleta de Colores

```javascript
COLORS = [
  '#0088FE',  // Azul primario
  '#00C49F',  // Verde aguamarina
  '#FFBB28',  // Amarillo/Naranja
  '#FF8042',  // Naranja/Rojo
  '#8884D8',  // Azul lavanda
  '#82CA9D'   // Verde claro
]
```

### Estructura HTML Completa

```jsx
<Card className="powerbi-card h-100">
  <Card.Header className="bg-primary text-white">
    <Card.Title className="mb-0">Tareas por Estado</Card.Title>
  </Card.Header>
  <Card.Body>
    <ResponsiveContainer width="100%" height={300}>
      <PieChart>
        {/* PieChart content */}
      </PieChart>
    </ResponsiveContainer>
  </Card.Body>
</Card>
```

### Componente Power BI de Reemplazo

**Tipo Recomendado**: Power BI **Pie Chart** (Gráfica de Pastel)

**Características que debe tener**:
- Mostrar estados en leyenda
- Valores de cantidad visible
- Colores consistentes
- Mismo tamaño visual (300px altura)
- Tooltip al pasar cursor

---

## 🟢 GRÁFICA 2: HISTORIAS POR SPRINT

### Información General

| Propiedad | Valor |
|-----------|-------|
| **Nombre Componente** | Card + BarChart |
| **Tipo de Gráfica** | BarChart Vertical (Gráfica de Barras) |
| **Ubicación Archivo** | `src/components/powerbi/PowerBICharts.jsx` línea ~91-140 |
| **Posición en Grid** | Fila 1, Columna 2 (ROW 1, COL 2) |
| **Clase CSS Container** | `.powerbi-card`, `.h-100` |
| **Bootstrap Props** | `lg={6} md={12} mb={4}` |

### Dimensiones Visuales

| Propiedad | Valor |
|-----------|-------|
| **Altura (height)** | 300px |
| **Ancho (width)** | 50% en lg, 100% en md y menores |
| **ResponsiveContainer** | width="100%", height={300} |
| **XAxis Label Angle** | -45° (rotado) |
| **XAxis Height** | 80px (para etiquetas rotadas) |
| **Color de Barras** | #00C49F (verde aguamarina) |
| **Stroke Width** | 2 |

### Información Mostrada

| Elemento | Descripción |
|----------|-------------|
| **Header** | "Historias por Sprint" |
| **Header Color** | bg-success text-white (#28a745 fondo, blanco texto) |
| **Datos** | Cuenta de historias agrupadas por sprint |
| **Eje X** | Nombre del sprint (ej: "Sprint 1", "Sprint 2") |
| **Eje Y** | Cantidad de historias |
| **Fuente de Datos** | `getHistoriasPorSprint()` |

### Función de Transformación de Datos

```javascript
getHistoriasPorSprint() {
  // Agrupa historias por sprint_id
  const historiasPorSprint = {};
  
  (data.historias || []).forEach(historia => {
    const sprintId = historia.sprint_id || 'Sin Sprint';
    // Buscar nombre de sprint
    const sprint = data.sprints?.find(s => s.id === sprintId);
    const sprintName = sprint?.nombre || `Sprint ${sprintId}`;
    
    historiasPorSprint[sprintName] = (historiasPorSprint[sprintName] || 0) + 1;
  });

  return Object.entries(historiasPorSprint).map(([name, historias]) => ({
    name,
    historias
  }));
}
```

### Estructura Recharts

```jsx
<ResponsiveContainer width="100%" height={300}>
  <BarChart data={historiasPorSprint}>
    <CartesianGrid strokeDasharray="3 3" />
    <XAxis 
      dataKey="name" 
      angle={-45} 
      textAnchor="end" 
      height={80} 
    />
    <YAxis />
    <Tooltip />
    <Bar dataKey="historias" fill="#00C49F" />
  </BarChart>
</ResponsiveContainer>
```

### Estructura HTML Completa

```jsx
<Card className="powerbi-card h-100">
  <Card.Header className="bg-success text-white">
    <Card.Title className="mb-0">Historias por Sprint</Card.Title>
  </Card.Header>
  <Card.Body>
    <ResponsiveContainer width="100%" height={300}>
      <BarChart data={historiasPorSprint}>
        {/* BarChart content */}
      </BarChart>
    </ResponsiveContainer>
  </Card.Body>
</Card>
```

### Componente Power BI de Reemplazo

**Tipo Recomendado**: Power BI **Column Chart** (Gráfica de Columnas)

**Características que debe tener**:
- Eje X: Nombre de sprint
- Eje Y: Cantidad de historias
- Color verde aguamarina (#00C49F)
- Etiquetas rotadas -45°
- Mismo tamaño visual (300px altura)
- Grid lines punteadas

---

## 🟡 GRÁFICA 3: TAREAS POR ASIGNADO

### Información General

| Propiedad | Valor |
|-----------|-------|
| **Nombre Componente** | Card + BarChart (Horizontal) |
| **Tipo de Gráfica** | BarChart Horizontal / Horizontal Bar Chart |
| **Ubicación Archivo** | `src/components/powerbi/PowerBICharts.jsx` línea ~141-200 |
| **Posición en Grid** | Fila 2, Columna 1 (ROW 2, COL 1) |
| **Clase CSS Container** | `.powerbi-card`, `.h-100` |
| **Bootstrap Props** | `lg={6} md={12} mb={4}` |
| **Especial** | Layout vertical (barras horizontales) |

### Dimensiones Visuales

| Propiedad | Valor |
|-----------|-------|
| **Altura (height)** | 300px |
| **Ancho (width)** | 50% en lg, 100% en md y menores |
| **ResponsiveContainer** | width="100%", height={300} |
| **Layout** | "vertical" (BarChart prop) |
| **Margin Left** | 150px (para nombres de usuarios largos) |
| **Color de Barras** | #FFBB28 (amarillo/naranja) |
| **YAxis Width** | 140px |
| **Type YAxis** | "category" |

### Información Mostrada

| Elemento | Descripción |
|----------|-------------|
| **Header** | "Tareas por Asignado" |
| **Header Color** | bg-warning text-dark (#ffc107 fondo, texto oscuro) |
| **Datos** | Cantidad de tareas por usuario asignado |
| **Límite de Usuarios** | Máximo 8 usuarios (top 8) |
| **Eje Y (Vertical)** | Nombre del usuario |
| **Eje X (Horizontal)** | Cantidad de tareas |
| **Fuente de Datos** | `getTareasPorAsignado()` - limitado a 8 |

### Función de Transformación de Datos

```javascript
getTareasPorAsignado() {
  // Agrupa tareas por usuario asignado
  const tareasPorAsignado = {};
  
  (data.tareas || []).forEach(tarea => {
    const usuarioId = tarea.asignado_a || 'Sin Asignar';
    // Buscar nombre de usuario
    const usuario = data.usuarios?.find(u => u.id === usuarioId);
    const userName = usuario?.nombre || `Usuario ${usuarioId}`;
    
    tareasPorAsignado[userName] = (tareasPorAsignado[userName] || 0) + 1;
  });

  // Ordenar y limitar a 8
  return Object.entries(tareasPorAsignado)
    .map(([name, tareas]) => ({ name, tareas }))
    .sort((a, b) => b.tareas - a.tareas)
    .slice(0, 8);
}
```

### Estructura Recharts

```jsx
<ResponsiveContainer width="100%" height={300}>
  <BarChart
    data={tareasPorAsignado}
    layout="vertical"
    margin={{ top: 5, right: 30, left: 150 }}
  >
    <CartesianGrid strokeDasharray="3 3" />
    <XAxis type="number" />
    <YAxis 
      dataKey="name" 
      type="category" 
      width={140} 
    />
    <Tooltip />
    <Bar dataKey="tareas" fill="#FFBB28" />
  </BarChart>
</ResponsiveContainer>
```

### Estructura HTML Completa

```jsx
<Card className="powerbi-card h-100">
  <Card.Header className="bg-warning text-dark">
    <Card.Title className="mb-0">Tareas por Asignado</Card.Title>
  </Card.Header>
  <Card.Body>
    <ResponsiveContainer width="100%" height={300}>
      <BarChart
        data={tareasPorAsignado}
        layout="vertical"
        margin={{ top: 5, right: 30, left: 150 }}
      >
        {/* BarChart content */}
      </BarChart>
    </ResponsiveContainer>
  </Card.Body>
</Card>
```

### Componente Power BI de Reemplazo

**Tipo Recomendado**: Power BI **Horizontal Bar Chart** (Gráfica de Barras Horizontal)

**Características que debe tener**:
- Eje Y: Nombre del usuario
- Eje X: Cantidad de tareas
- Color amarillo/naranja (#FFBB28)
- Top 8 usuarios
- Margen izquierdo amplio para nombres
- Mismo tamaño visual (300px altura)
- Grid lines punteadas

---

## 🔴 GRÁFICA 4: ÉPICAS CON HISTORIAS

### Información General

| Propiedad | Valor |
|-----------|-------|
| **Nombre Componente** | Card + LineChart |
| **Tipo de Gráfica** | LineChart (Gráfica de Líneas) |
| **Ubicación Archivo** | `src/components/powerbi/PowerBICharts.jsx` línea ~201-260 |
| **Posición en Grid** | Fila 2, Columna 2 (ROW 2, COL 2) |
| **Clase CSS Container** | `.powerbi-card`, `.h-100` |
| **Bootstrap Props** | `lg={6} md={12} mb={4}` |

### Dimensiones Visuales

| Propiedad | Valor |
|-----------|-------|
| **Altura (height)** | 300px |
| **Ancho (width)** | 50% en lg, 100% en md y menores |
| **ResponsiveContainer** | width="100%", height={300} |
| **XAxis Label Angle** | -45° (rotado) |
| **XAxis Height** | 80px (para etiquetas rotadas) |
| **Stroke Width** | 2 |
| **Dot Radius** | 5px (normal), 7px (hover/active) |
| **Color Línea** | #FF8042 (naranja/rojo) |
| **Color Puntos** | #FF8042 |

### Información Mostrada

| Elemento | Descripción |
|----------|-------------|
| **Header** | "Épicas con Historias" |
| **Header Color** | bg-danger text-white (#dc3545 fondo, blanco texto) |
| **Datos** | Cantidad de historias por épica |
| **Límite de Épicas** | Máximo 6 épicas |
| **Eje X** | Nombre de la épica |
| **Eje Y** | Cantidad de historias |
| **Fuente de Datos** | `getEpicasConHistorias()` - limitado a 6 |

### Función de Transformación de Datos

```javascript
getEpicasConHistorias() {
  // Cuenta historias por épica
  const epicasConHistorias = {};
  
  (data.historias || []).forEach(historia => {
    const epicaId = historia.epica_id || 'Sin Épica';
    epicasConHistorias[epicaId] = (epicasConHistorias[epicaId] || 0) + 1;
  });

  // Mapear épicas con sus nombres
  return (data.epicas || [])
    .map(epica => ({
      name: epica.nombre || `Épica ${epica.id}`,
      historias: epicasConHistorias[epica.id] || 0
    }))
    .slice(0, 6); // Limitar a 6 épicas
}
```

### Estructura Recharts

```jsx
<ResponsiveContainer width="100%" height={300}>
  <LineChart data={epicasConHistorias}>
    <CartesianGrid strokeDasharray="3 3" />
    <XAxis 
      dataKey="name" 
      angle={-45} 
      textAnchor="end" 
      height={80} 
    />
    <YAxis />
    <Tooltip />
    <Line
      type="monotone"
      dataKey="historias"
      stroke="#FF8042"
      strokeWidth={2}
      dot={{ fill: '#FF8042', r: 5 }}
      activeDot={{ r: 7 }}
    />
  </LineChart>
</ResponsiveContainer>
```

### Estructura HTML Completa

```jsx
<Card className="powerbi-card h-100">
  <Card.Header className="bg-danger text-white">
    <Card.Title className="mb-0">Épicas con Historias</Card.Title>
  </Card.Header>
  <Card.Body>
    <ResponsiveContainer width="100%" height={300}>
      <LineChart data={epicasConHistorias}>
        {/* LineChart content */}
      </LineChart>
    </ResponsiveContainer>
  </Card.Body>
</Card>
```

### Características de la Línea

| Propiedad | Valor |
|-----------|-------|
| **Tipo de Línea** | "monotone" (suave) |
| **Color** | #FF8042 (naranja/rojo) |
| **Ancho** | 2px |
| **Puntos Normales** | radio 5px, relleno #FF8042 |
| **Puntos Hover** | radio 7px (activados al pasar cursor) |
| **Grid Lines** | Punteadas (strokeDasharray: "3 3") |

### Componente Power BI de Reemplazo

**Tipo Recomendado**: Power BI **Line Chart** (Gráfica de Líneas)

**Características que debe tener**:
- Eje X: Nombre de la épica
- Eje Y: Cantidad de historias
- Color naranja/rojo (#FF8042)
- Línea suave (monotone)
- Puntos visibles en cada dato
- Etiquetas rotadas -45°
- Mismo tamaño visual (300px altura)
- Grid lines punteadas
- Top 6 épicas

---

## 📋 TABLA RESUMEN DE CONTENEDORES

| Gráfica | Tipo | Posición | Props | Alto | Datos | Color | Header |
|---------|------|----------|-------|------|-------|-------|--------|
| **1. Tareas por Estado** | PieChart | R1C1 | lg=6 | 300px | getTareasPorEstado() | COLORS | bg-primary |
| **2. Historias por Sprint** | BarChart | R1C2 | lg=6 | 300px | getHistoriasPorSprint() | #00C49F | bg-success |
| **3. Tareas por Asignado** | BarChart (H) | R2C1 | lg=6 | 300px | getTareasPorAsignado() (max 8) | #FFBB28 | bg-warning |
| **4. Épicas con Historias** | LineChart | R2C2 | lg=6 | 300px | getEpicasConHistorias() (max 6) | #FF8042 | bg-danger |

**Nota**: R=Row, C=Column, H=Horizontal

---

## 🔄 MAPA DE REEMPLAZO POWER BI

| Contenedor Recharts | Reemplazo Power BI Recomendado | Datos Compatibles |
|---------------------|--------------------------------|-------------------|
| **Tareas por Estado (Pie)** | Power BI Pie Chart | ✅ Estados, Cantidad |
| **Historias por Sprint (Bar)** | Power BI Column Chart | ✅ Sprint Name, Cantidad |
| **Tareas por Asignado (Bar H)** | Power BI Horizontal Bar Chart | ✅ Usuario, Cantidad (max 8) |
| **Épicas con Historias (Line)** | Power BI Line Chart | ✅ Épica Name, Cantidad (max 6) |

**KPIs**: No se reemplazan, se mantienen idénticos

---

## 🎨 COLORES Y ESTILOS

### Paleta Principal (COLORS array)
```
#0088FE  - Azul primario (Pie Chart)
#00C49F  - Verde aguamarina (Bar Chart 1)
#FFBB28  - Amarillo/Naranja (Bar Chart 2)
#FF8042  - Naranja/Rojo (Line Chart)
#8884D8  - Azul lavanda (alternativo)
#82CA9D  - Verde claro (alternativo)
```

### Colores de Headers (Bootstrap)
```
bg-primary    - #0066cc (Tareas por Estado)
bg-success    - #28a745 (Historias por Sprint)
bg-warning    - #ffc107 (Tareas por Asignado)
bg-danger     - #dc3545 (Épicas con Historias)
```

---

## 📁 REFERENCIAS DE ARCHIVOS

### Archivos Principales
- [Dashboard.jsx](scrum-frontend/src/pages/Dashboard/Dashboard.jsx) - Página principal
- [PowerBICharts.jsx](scrum-frontend/src/components/powerbi/PowerBICharts.jsx) - Componente de gráficas
- [DashboardPowerBI.jsx](scrum-frontend/src/components/powerbi/DashboardPowerBI.jsx) - Versión alternativa

### Archivos de Estilos
- `src/styles/Dashboard.css` - Estilos dashboard
- `src/components/powerbi/DashboardPowerBI.css` - Estilos Power BI

### Archivos de Servicios
- `src/components/powerbi/powerbiService.js` - Servicio API

---

## ⚠️ NOTAS IMPORTANTES

### No Modificar (Protegido)
- ✅ Estructura visual de grid
- ✅ Tamaños de gráficas (300px)
- ✅ Colores de headers
- ✅ Datos mostrados
- ✅ Tarjetas KPI
- ✅ Responsive breakpoints

### Mantener al Reemplazar
- ✅ Posiciones en grid (2x2)
- ✅ Alturas (300px)
- ✅ Tipos de datos
- ✅ Límites (max 8 usuarios, max 6 épicas)
- ✅ Ejes y etiquetas
- ✅ Colores temáticos

---

## 📐 LAYOUT RESPONSIVO

### En Pantalla Grande (lg ≥ 992px)
```
[Gráfica 1: 50%]  [Gráfica 2: 50%]
[Gráfica 3: 50%]  [Gráfica 4: 50%]
```

### En Pantalla Mediana (md 768px-991px)
```
[Gráfica 1: 100%]
[Gráfica 2: 100%]
[Gráfica 3: 100%]
[Gráfica 4: 100%]
```

### En Pantalla Pequeña (sm < 768px)
```
[Gráfica 1: 100%]
[Gráfica 2: 100%]
[Gráfica 3: 100%]
[Gráfica 4: 100%]
```

---

## 🎯 CONCLUSIÓN

Este análisis identifica:

1. ✅ **4 contenedores de gráficas Recharts** listos para reemplazo
2. ✅ **6 tarjetas KPI** a mantener intactas
3. ✅ **Estructura completa de layout** con grid 2x2
4. ✅ **Propiedades exactas** de cada componente
5. ✅ **Funciones de transformación** de datos
6. ✅ **Componentes Power BI recomendados** para reemplazo

**ESTADO**: Análisis completo - Sin modificaciones de código
