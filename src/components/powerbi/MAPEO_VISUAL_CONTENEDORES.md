/**
 * MAPEO VISUAL DE CONTENEDORES - DASHBOARD
 * 
 * Documento visual mostrando exactamente dónde están
 * los contenedores de gráficas y cómo se verán al reemplazarlos
 */

# 🎨 Mapeo Visual de Contenedores - Dashboard

## Representación Visual del Layout Actual

```
┌─────────────────────────────────────────────────────────────────┐
│                    DASHBOARD (Métricas)                         │
│                     src/pages/Dashboard/                        │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│  Header: "¡Hola, {Usuario}!"  + Búsqueda + "Nuevo Proyecto"    │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│  Quick Actions: [ Nuevo Proyecto ] [ Ver Proyectos ] [ Notif. ] │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│               Mis Proyectos Activos (Max 5)                     │
│  [Proyecto 1]  [Proyecto 2]  [Proyecto 3]  [Proyecto 4] ...    │
│  └─ Ver todos los proyectos                                     │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│              Indicadores de Power BI                            │
├─────────────────────────────────────────────────────────────────┤
│                    TARJETAS KPI (6 UNIDADES)                    │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐          │
│  │ 📁 Proyectos │  │ ⏱️  Sprints  │  │ 🏷️  Épicas   │          │
│  │    15        │  │      5       │  │      8       │          │
│  └──────────────┘  └──────────────┘  └──────────────┘          │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐          │
│  │ 📘 Historias │  │ ✅ Tareas    │  │ 👥 Usuarios  │          │
│  │     42       │  │      89      │  │      12      │          │
│  └──────────────┘  └──────────────┘  └──────────────┘          │
│                                                                 │
├─────────────────────────────────────────────────────────────────┤
│         GRÁFICAS RECHARTS (2x2 Grid Layout)                     │
│                                                                 │
│  ┌──────────────────────────┐ ┌──────────────────────────┐    │
│  │ Tareas por Estado        │ │ Historias por Sprint     │    │
│  │ (PieChart)               │ │ (BarChart)               │    │
│  │ 300px altura             │ │ 300px altura             │    │
│  │                          │ │                          │    │
│  │  [Pie Gráfica]           │ │  [Bar Gráfica]           │    │
│  │                          │ │                          │    │
│  └──────────────────────────┘ └──────────────────────────┘    │
│                                                                 │
│  ┌──────────────────────────┐ ┌──────────────────────────┐    │
│  │ Tareas por Asignado      │ │ Épicas con Historias     │    │
│  │ (BarChart Horizontal)    │ │ (LineChart)              │    │
│  │ 300px altura             │ │ 300px altura             │    │
│  │                          │ │                          │    │
│  │  [Bar Gráfica H]         │ │  [Line Gráfica]          │    │
│  │                          │ │                          │    │
│  └──────────────────────────┘ └──────────────────────────┘    │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

---

## 📊 TABLA DETALLADA DE CONTENEDORES

### CONTENEDOR 1️⃣ - TAREAS POR ESTADO (PIE CHART)

```
┌─────────────────────────────────────────────────────────────────┐
│  Tareas por Estado                              [Minimize] [X]  │
│  Componente: PieChart | Recharts                                │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│              ╭─────────────╮                                    │
│              │             │                                    │
│          ╱───╯   En Prog   ╰───╲                               │
│        ╱           (12)          ╲                              │
│      ╱                             ╲                            │
│     │      Completada   Pendiente   │                          │
│     │        (28)          (15)     │                          │
│      ╲                             ╱                            │
│        ╲                         ╱                              │
│          ╲───╮             ╭───╱                               │
│              │             │                                    │
│              ╰─────────────╯                                    │
│                                                                  │
├─────────────────────────────────────────────────────────────────┤
│ Ubicación: PowerBICharts.jsx, Row 1, Col 1                     │
│ Altura: 300px | Ancho: 50% (lg), 100% (md)                    │
│ Datos: Tareas agrupadas por estado (cantidad)                 │
│ Reemplazo: Power BI Pie Chart                                  │
└─────────────────────────────────────────────────────────────────┘
```

**Características Clave:**
- ✅ Muestra distribución de estados
- ✅ Colores variados (6 colores)
- ✅ Etiquetas con nombre y cantidad
- ✅ Header color primario (azul)

---

### CONTENEDOR 2️⃣ - HISTORIAS POR SPRINT (BAR CHART)

```
┌─────────────────────────────────────────────────────────────────┐
│  Historias por Sprint                            [Minimize] [X] │
│  Componente: BarChart | Recharts                                │
├─────────────────────────────────────────────────────────────────┤
│  30│                                                             │
│  25│   ┌────┐                                                    │
│  20│   │    │     ┌────┐                                        │
│  15│   │    │     │    │     ┌────┐                            │
│  10│   │    │     │    │     │    │     ┌────┐                │
│   5│   │    │     │    │     │    │     │    │     ┌────┐    │
│   0├───┼────┼─────┼────┼─────┼────┼─────┼────┼─────┼────┤    │
│     Sprint Sprint Sprint Sprint Sprint                          │
│       1      2      3      4      5                             │
├─────────────────────────────────────────────────────────────────┤
│ Ubicación: PowerBICharts.jsx, Row 1, Col 2                     │
│ Altura: 300px | Ancho: 50% (lg), 100% (md)                    │
│ Datos: Historias por sprint (count)                           │
│ Reemplazo: Power BI Column Chart                              │
└─────────────────────────────────────────────────────────────────┘
```

**Características Clave:**
- ✅ Barras verticales (columnas)
- ✅ Color verde aguamarina
- ✅ Etiquetas de sprint rotadas -45°
- ✅ Header color éxito (verde)

---

### CONTENEDOR 3️⃣ - TAREAS POR ASIGNADO (HORIZONTAL BAR CHART)

```
┌─────────────────────────────────────────────────────────────────┐
│  Tareas por Asignado                           [Minimize] [X]  │
│  Componente: BarChart (Layout: Vertical) | Recharts             │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  Juan García      ├─────────────────────────────────────┤ 18    │
│  María López      ├──────────────────────────┤ 14              │
│  Carlos Ruiz      ├─────────────────────┤ 12                  │
│  Ana Martínez     ├──────────────────┤ 10                      │
│  Pedro Silva      ├──────────────┤ 8                          │
│  Rosa Fernández   ├─────────┤ 6                                │
│  José Moreno      ├────┤ 4                                     │
│  Laura Sánchez    ├──┤ 2                                       │
│                                                                  │
│  0        5       10      15      20      25      30            │
│          (Cantidad de Tareas)                                   │
│                                                                  │
├─────────────────────────────────────────────────────────────────┤
│ Ubicación: PowerBICharts.jsx, Row 2, Col 1                     │
│ Altura: 300px | Ancho: 50% (lg), 100% (md)                    │
│ Datos: Top 8 usuarios con más tareas                          │
│ Reemplazo: Power BI Horizontal Bar Chart                      │
└─────────────────────────────────────────────────────────────────┘
```

**Características Clave:**
- ✅ Barras horizontales
- ✅ Color amarillo/naranja
- ✅ Margen izquierdo 150px para nombres
- ✅ Máximo 8 usuarios (top list)
- ✅ Header color advertencia (amarillo)

---

### CONTENEDOR 4️⃣ - ÉPICAS CON HISTORIAS (LINE CHART)

```
┌─────────────────────────────────────────────────────────────────┐
│  Épicas con Historias                          [Minimize] [X]  │
│  Componente: LineChart | Recharts                               │
├─────────────────────────────────────────────────────────────────┤
│  25│                                                             │
│  20│        ●                                ●                  │
│  15│    ●       ╲                       ●         ╲  ●          │
│  10│●       ╲       ●               ●               ╲      ●   │
│   5│╲           ╲       ●       ●                                 │
│   0└───────────────────────────────────────────────────────     │
│      Épica API  Épica UI  Épica DB  Épica Auth  Épica Report    │
│                                                                  │
│ ● Punto visible al pasar cursor (r: 5px normal, r: 7px hover) │
│                                                                  │
├─────────────────────────────────────────────────────────────────┤
│ Ubicación: PowerBICharts.jsx, Row 2, Col 2                     │
│ Altura: 300px | Ancho: 50% (lg), 100% (md)                    │
│ Datos: Top 6 épicas con historias (count)                     │
│ Reemplazo: Power BI Line Chart                                │
└─────────────────────────────────────────────────────────────────┘
```

**Características Clave:**
- ✅ Línea suave (monotone)
- ✅ Color naranja/rojo
- ✅ Puntos visibles (dot: r=5, activeDot: r=7)
- ✅ Etiquetas rotadas -45°
- ✅ Máximo 6 épicas
- ✅ Header color peligro (rojo)

---

## 📌 ESPECIFICACIONES TÉCNICAS POR CONTENEDOR

### GRÁFICA 1: Tareas por Estado

```javascript
Tipo: PieChart
Fuente: src/components/powerbi/PowerBICharts.jsx línea 40-90
Archivo Render: scrum-frontend/src/components/powerbi/PowerBICharts.jsx

Función Datos:
  getTareasPorEstado() → { name: string, value: number }[]

Estructura JSX:
  <Card className="powerbi-card h-100">
    <Card.Header className="bg-primary text-white">
      <Card.Title>Tareas por Estado</Card.Title>
    </Card.Header>
    <Card.Body>
      <ResponsiveContainer width="100%" height={300}>
        <PieChart>
          <Pie dataKey="value" outerRadius={100} ... />
          ...
        </PieChart>
      </ResponsiveContainer>
    </Card.Body>
  </Card>

Props Recharts:
  - cx: "50%", cy: "50%"
  - outerRadius: 100
  - labelLine: false
  - label: `${name}: ${value}`
  - fill: #8884d8 (default)
  - dataKey: "value"

Colores: #0088FE, #00C49F, #FFBB28, #FF8042, #8884D8, #82CA9D
```

---

### GRÁFICA 2: Historias por Sprint

```javascript
Tipo: BarChart (Vertical)
Fuente: src/components/powerbi/PowerBICharts.jsx línea 91-140
Archivo Render: scrum-frontend/src/components/powerbi/PowerBICharts.jsx

Función Datos:
  getHistoriasPorSprint() → { name: string, historias: number }[]

Estructura JSX:
  <Card className="powerbi-card h-100">
    <Card.Header className="bg-success text-white">
      <Card.Title>Historias por Sprint</Card.Title>
    </Card.Header>
    <Card.Body>
      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={data}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="name" angle={-45} textAnchor="end" height={80} />
          <YAxis />
          <Tooltip />
          <Bar dataKey="historias" fill="#00C49F" />
        </BarChart>
      </ResponsiveContainer>
    </Card.Body>
  </Card>

Props Recharts:
  - XAxis angle: -45°
  - XAxis height: 80px
  - Bar fill: #00C49F
  - CartesianGrid: dashed
```

---

### GRÁFICA 3: Tareas por Asignado

```javascript
Tipo: BarChart (Horizontal / Layout: Vertical)
Fuente: src/components/powerbi/PowerBICharts.jsx línea 141-200
Archivo Render: scrum-frontend/src/components/powerbi/PowerBICharts.jsx

Función Datos:
  getTareasPorAsignado() → { name: string, tareas: number }[]
  Limitado a 8 resultados

Estructura JSX:
  <Card className="powerbi-card h-100">
    <Card.Header className="bg-warning text-dark">
      <Card.Title>Tareas por Asignado</Card.Title>
    </Card.Header>
    <Card.Body>
      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={data} layout="vertical" margin={{ top: 5, right: 30, left: 150 }}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis type="number" />
          <YAxis dataKey="name" type="category" width={140} />
          <Tooltip />
          <Bar dataKey="tareas" fill="#FFBB28" />
        </BarChart>
      </ResponsiveContainer>
    </Card.Body>
  </Card>

Props Recharts:
  - layout: "vertical" (hace que sea horizontal)
  - YAxis width: 140px
  - margin.left: 150px
  - Bar fill: #FFBB28
  - CartesianGrid: dashed
```

---

### GRÁFICA 4: Épicas con Historias

```javascript
Tipo: LineChart
Fuente: src/components/powerbi/PowerBICharts.jsx línea 201-260
Archivo Render: scrum-frontend/src/components/powerbi/PowerBICharts.jsx

Función Datos:
  getEpicasConHistorias() → { name: string, historias: number }[]
  Limitado a 6 resultados

Estructura JSX:
  <Card className="powerbi-card h-100">
    <Card.Header className="bg-danger text-white">
      <Card.Title>Épicas con Historias</Card.Title>
    </Card.Header>
    <Card.Body>
      <ResponsiveContainer width="100%" height={300}>
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="name" angle={-45} textAnchor="end" height={80} />
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
    </Card.Body>
  </Card>

Props Recharts:
  - type: "monotone" (línea suave)
  - stroke: #FF8042
  - strokeWidth: 2
  - dot.r: 5px
  - activeDot.r: 7px
  - XAxis angle: -45°
  - XAxis height: 80px
```

---

## 🎯 MATRIZ DE COMPATIBILIDAD VISUAL

```
RECHARTS vs POWER BI
┌────────────────────┬──────────────────────┬─────────────────┐
│ Recharts           │ Power BI Visual      │ Compatibilidad  │
├────────────────────┼──────────────────────┼─────────────────┤
│ PieChart           │ Pie Chart            │ ✅ 100%         │
│ BarChart (vert)    │ Column Chart         │ ✅ 100%         │
│ BarChart (horiz)   │ Horizontal Bar Chart │ ✅ 100%         │
│ LineChart          │ Line Chart           │ ✅ 100%         │
└────────────────────┴──────────────────────┴─────────────────┘

PROPIEDADES A MANTENER
┌─────────────────────────────────────┬──────────────────────┐
│ Propiedad                           │ Valor                │
├─────────────────────────────────────┼──────────────────────┤
│ Altura de gráfica                   │ 300px (todos)        │
│ Ancho en pantalla grande             │ 50% (lg)            │
│ Ancho en pantalla pequeña            │ 100% (md, sm, xs)   │
│ Grid layout                         │ 2 columnas           │
│ Total de gráficas                   │ 4                    │
│ Límites de datos                    │ max 8, max 6        │
│ Colores temáticos                   │ Mantener paleta     │
└─────────────────────────────────────┴──────────────────────┘
```

---

## 🔄 PLAN DE MIGRACIÓN (Sin modificar ahora)

### Fase 1: Preparación (Actual)
```
✅ Análisis completado
✅ Componentes identificados
✅ Capa Power BI creada (standby)
⏳ Esperando: Backend endpoints
⏳ Esperando: Credenciales Power BI
```

### Fase 2: Integración (Futuro)
```
1. Crear endpoints backend
   POST /api/powerbi/token → accesToken
   GET  /api/powerbi/config → configuración

2. Obtener credenciales Power BI
   - Report IDs
   - Embed URLs
   - Autorización

3. En PowerBIReport.jsx:
   - Activar (cambiar isStandby={false})
   - Pasar props reportId, embedUrl
   - Conectar a servicio powerbiService

4. En PowerBICharts.jsx:
   - Reemplazar Recharts con Power BI visuales
   O usar feature flag para ambas versiones
```

### Fase 3: Validación
```
- Testing en desarrollo
- Validación con usuarios
- Comparativa Recharts vs Power BI
- Aprobación para producción
```

### Fase 4: Producción
```
- Deploy con Power BI activado
- Monitoreo de performance
- Posible rollback a Recharts si es necesario
```

---

## ✅ CHECKLIST ANTES DE REEMPLAZAR

```
PREPARACIÓN TÉCNICA
[ ] Backend endpoints configurados
[ ] Credenciales Power BI obtenidas
[ ] Report IDs validados
[ ] Embed URLs funcionando
[ ] Tokens generándose correctamente

TESTING
[ ] Gráficas cargan sin errores
[ ] Datos correctos
[ ] Responsivo (mobile, tablet, desktop)
[ ] Performance aceptable
[ ] Colores y estilos correctos

VALIDACIÓN
[ ] Usuarios aprueban
[ ] Datos coinciden con Recharts
[ ] Sin regression en UI
[ ] Fallback plan en lugar

DOCUMENTACIÓN
[ ] Guías actualizadas
[ ] Troubleshooting documentado
[ ] Roll-back procedures claros
```

---

## 📊 RESUMEN EJECUTIVO

| Aspecto | Detalle |
|---------|---------|
| **Contenedores de Gráficas** | 4 (PieChart, BarChart x2, LineChart) |
| **Tarjetas KPI** | 6 (sin cambios) |
| **Layout Grid** | 2x2 responsivo |
| **Altura Gráficas** | 300px todas |
| **Archivos Afectados** | PowerBICharts.jsx principalmente |
| **Complejidad Reemplazo** | Media (4 gráficas, datos compatibles) |
| **Riesgo** | Bajo (datos, props, UI conocidas) |
| **Tiempo Estimado** | 2-3 horas (cuando backend esté listo) |

---

**Documento**: Análisis Completo de Contenedores  
**Fecha**: 2026-06-18  
**Estado**: ✅ Análisis Completado - Sin Modificaciones  
**Siguiente**: Esperar Backend + Credenciales Power BI
