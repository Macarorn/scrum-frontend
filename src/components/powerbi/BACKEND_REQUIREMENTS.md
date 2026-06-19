# 🔧 Requisitos del Backend - Dashboard Power BI

## 📌 Resumen

El Dashboard Power BI de React requiere que tu backend Node.js exponga 6 endpoints específicos bajo la ruta base `/api/powerbi`. Todos los endpoints deben:

1. Aceptar peticiones GET
2. Requerir el header `x-api-key` para autenticación
3. Retornar un array JSON con los datos

---

## 🔌 Endpoints Requeridos

### 1. GET /api/powerbi/proyectos

**Descripción**: Obtiene la lista de todos los proyectos

**Headers requeridos**:
```
x-api-key: TU_API_KEY
Content-Type: application/json
```

**Respuesta esperada** (200 OK):
```json
[
  {
    "id": 1,
    "nombre": "Proyecto A",
    "descripcion": "Descripción del proyecto",
    "estado": "Activo",
    "created_at": "2024-01-15T10:00:00Z",
    "updated_at": "2024-01-20T15:30:00Z"
  },
  {
    "id": 2,
    "nombre": "Proyecto B",
    "descripcion": "Descripción del proyecto",
    "estado": "En pausa",
    "created_at": "2024-01-10T08:00:00Z",
    "updated_at": "2024-01-18T12:00:00Z"
  }
]
```

**Campos mínimos requeridos**: `id`, `nombre`

**Ejemplo Node.js/Express**:
```javascript
router.get('/proyectos', verifyApiKey, async (req, res) => {
  try {
    const proyectos = await db.query('SELECT * FROM proyectos');
    res.json(proyectos.rows);
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener proyectos' });
  }
});
```

---

### 2. GET /api/powerbi/sprints

**Descripción**: Obtiene la lista de todos los sprints

**Headers requeridos**: `x-api-key`

**Respuesta esperada** (200 OK):
```json
[
  {
    "id": 1,
    "nombre": "Sprint 1",
    "estado": "Completado",
    "fecha_inicio": "2024-01-01",
    "fecha_fin": "2024-01-14",
    "proyecto_id": 1
  },
  {
    "id": 2,
    "nombre": "Sprint 2",
    "estado": "En Progreso",
    "fecha_inicio": "2024-01-15",
    "fecha_fin": "2024-01-28",
    "proyecto_id": 1
  }
]
```

**Campos mínimos requeridos**: `id`, `nombre`, `proyecto_id` (opcional pero recomendado)

---

### 3. GET /api/powerbi/epicas

**Descripción**: Obtiene la lista de todas las épicas

**Headers requeridos**: `x-api-key`

**Respuesta esperada** (200 OK):
```json
[
  {
    "id": 1,
    "nombre": "Autenticación de usuarios",
    "descripcion": "Sistema de login y registro",
    "estado": "En Progreso",
    "proyecto_id": 1
  },
  {
    "id": 2,
    "nombre": "Dashboard administrativo",
    "descripcion": "Interfaz para administradores",
    "estado": "Planificado",
    "proyecto_id": 1
  }
]
```

**Campos mínimos requeridos**: `id`, `nombre`, `proyecto_id` (opcional)

---

### 4. GET /api/powerbi/historias

**Descripción**: Obtiene la lista de todas las historias de usuario

**Headers requeridos**: `x-api-key`

**Respuesta esperada** (200 OK):
```json
[
  {
    "id": 1,
    "titulo": "Crear página de login",
    "descripcion": "Como usuario quiero poder iniciar sesión",
    "estado": "Completado",
    "sprint_id": 1,
    "epica_id": 1,
    "prioridad": "Alta",
    "created_at": "2024-01-05T10:00:00Z"
  },
  {
    "id": 2,
    "titulo": "Validación de correo",
    "descripcion": "Enviar correo de confirmación",
    "estado": "En Progreso",
    "sprint_id": 2,
    "epica_id": 1,
    "prioridad": "Media",
    "created_at": "2024-01-15T09:30:00Z"
  }
]
```

**Campos mínimos requeridos**: `id`, `titulo`, `sprint_id` (opcional), `epica_id` (opcional), `estado`

---

### 5. GET /api/powerbi/tareas

**Descripción**: Obtiene la lista de todas las tareas

**Headers requeridos**: `x-api-key`

**Respuesta esperada** (200 OK):
```json
[
  {
    "id": 1,
    "titulo": "Diseñar interfaz de login",
    "descripcion": "Crear mockup en Figma",
    "estado": "Completado",
    "historia_id": 1,
    "asignado_a": "Juan Pérez",
    "prioridad": "Alta",
    "fecha_vencimiento": "2024-01-10",
    "created_at": "2024-01-05T10:00:00Z"
  },
  {
    "id": 2,
    "titulo": "Implementar backend de login",
    "descripcion": "Crear endpoints POST /login y /register",
    "estado": "En Progreso",
    "historia_id": 1,
    "asignado_a": "María González",
    "prioridad": "Alta",
    "fecha_vencimiento": "2024-01-12",
    "created_at": "2024-01-05T10:15:00Z"
  }
]
```

**Campos mínimos requeridos**: `id`, `titulo`, `estado`, `asignado_a` (opcional)

---

### 6. GET /api/powerbi/usuarios

**Descripción**: Obtiene la lista de todos los usuarios del proyecto

**Headers requeridos**: `x-api-key`

**Respuesta esperada** (200 OK):
```json
[
  {
    "id": 1,
    "nombre": "Juan Pérez",
    "email": "juan@example.com",
    "rol": "Product Owner",
    "estado": "Activo",
    "created_at": "2024-01-01T00:00:00Z"
  },
  {
    "id": 2,
    "nombre": "María González",
    "email": "maria@example.com",
    "rol": "Developer",
    "estado": "Activo",
    "created_at": "2024-01-02T00:00:00Z"
  },
  {
    "id": 3,
    "nombre": "Carlos López",
    "email": "carlos@example.com",
    "rol": "Scrum Master",
    "estado": "Activo",
    "created_at": "2024-01-03T00:00:00Z"
  }
]
```

**Campos mínimos requeridos**: `id`, `nombre`, `email` (opcional), `rol` (opcional)

---

## 🔐 Autenticación

### Header x-api-key

Todos los endpoints requieren el header `x-api-key` para autenticación. 

**Implementación recomendada en Express**:

```javascript
// middleware/apiKeyAuth.js
function verifyApiKey(req, res, next) {
  const apiKey = req.headers['x-api-key'];
  
  if (!apiKey) {
    return res.status(401).json({ error: 'API key requerida' });
  }
  
  // Comparar con tu clave almacenada (idealmente en variable de entorno)
  const validApiKey = process.env.API_KEY || 'TU_API_KEY';
  
  if (apiKey !== validApiKey) {
    return res.status(403).json({ error: 'API key inválida' });
  }
  
  next();
}

module.exports = verifyApiKey;

// routes/powerbi.routes.js
const express = require('express');
const router = express.Router();
const verifyApiKey = require('../middleware/apiKeyAuth');

router.get('/proyectos', verifyApiKey, async (req, res) => {
  // Tu implementación aquí
});

router.get('/sprints', verifyApiKey, async (req, res) => {
  // Tu implementación aquí
});

// ... más rutas
```

---

## 📊 Estructura de Carpeta Recomendada

```
scrum-backend/
├── src/
│   ├── routes/
│   │   ├── powerbi.routes.js         ← Nuevas rutas
│   │   └── ... otras rutas
│   ├── controllers/
│   │   ├── powerbi.controller.js     ← Nuevo controlador (opcional)
│   │   └── ... otros controladores
│   ├── middleware/
│   │   ├── apiKeyAuth.js             ← Middleware de autenticación
│   │   └── ...
│   └── app.js                         ← Registrar rutas
└── ...
```

---

## 🔌 Ejemplo Completo de Implementación

### 1. Crear archivo de rutas

**src/routes/powerbi.routes.js**:
```javascript
const express = require('express');
const router = express.Router();
const verifyApiKey = require('../middleware/auth.middleware');
const { 
  getProyectos, 
  getSprints, 
  getEpicas, 
  getHistorias, 
  getTareas, 
  getUsuarios 
} = require('../controllers/powerbi.controller');

// Todas las rutas requieren x-api-key
router.use(verifyApiKey);

router.get('/proyectos', getProyectos);
router.get('/sprints', getSprints);
router.get('/epicas', getEpicas);
router.get('/historias', getHistorias);
router.get('/tareas', getTareas);
router.get('/usuarios', getUsuarios);

module.exports = router;
```

### 2. Crear controlador

**src/controllers/powerbi.controller.js**:
```javascript
const db = require('../config/database');

exports.getProyectos = async (req, res) => {
  try {
    const result = await db.query('SELECT * FROM proyectos');
    res.json(result.rows);
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: 'Error al obtener proyectos' });
  }
};

exports.getSprints = async (req, res) => {
  try {
    const result = await db.query('SELECT * FROM sprints');
    res.json(result.rows);
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: 'Error al obtener sprints' });
  }
};

exports.getEpicas = async (req, res) => {
  try {
    const result = await db.query('SELECT * FROM epicas');
    res.json(result.rows);
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: 'Error al obtener épicas' });
  }
};

exports.getHistorias = async (req, res) => {
  try {
    const result = await db.query('SELECT * FROM historias');
    res.json(result.rows);
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: 'Error al obtener historias' });
  }
};

exports.getTareas = async (req, res) => {
  try {
    const result = await db.query('SELECT * FROM tareas');
    res.json(result.rows);
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: 'Error al obtener tareas' });
  }
};

exports.getUsuarios = async (req, res) => {
  try {
    const result = await db.query('SELECT * FROM usuarios');
    res.json(result.rows);
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: 'Error al obtener usuarios' });
  }
};
```

### 3. Registrar rutas en app.js

**src/app.js**:
```javascript
const powerbiRoutes = require('./routes/powerbi.routes');

// Registrar rutas
app.use('/api/powerbi', powerbiRoutes);
```

---

## ✅ Checklist de Implementación

- [ ] Crear archivo de rutas `/api/powerbi`
- [ ] Crear middleware de autenticación `x-api-key`
- [ ] Implementar endpoint GET `/proyectos`
- [ ] Implementar endpoint GET `/sprints`
- [ ] Implementar endpoint GET `/epicas`
- [ ] Implementar endpoint GET `/historias`
- [ ] Implementar endpoint GET `/tareas`
- [ ] Implementar endpoint GET `/usuarios`
- [ ] Probar endpoints con Postman
- [ ] Verificar que todos retornan arrays
- [ ] Asignar API key válida en variable de entorno
- [ ] Documentar API key en README del backend

---

## 🧪 Pruebas con Postman

### Crear request

1. **Método**: GET
2. **URL**: `http://localhost:3000/api/powerbi/proyectos`
3. **Headers**:
   - Key: `x-api-key`
   - Value: `TU_API_KEY`

### Ejemplo cURL

```bash
curl -X GET http://localhost:3000/api/powerbi/proyectos \
  -H "x-api-key: TU_API_KEY" \
  -H "Content-Type: application/json"
```

---

## 🚨 Códigos de Error Esperados

| Código | Descripción |
|--------|-------------|
| 200 | OK - Datos obtenidos correctamente |
| 400 | Bad Request - Parámetros inválidos |
| 401 | Unauthorized - Falta header x-api-key |
| 403 | Forbidden - API key inválida |
| 500 | Internal Server Error - Error en el servidor |

---

## 📈 Rendimiento

### Recomendaciones

1. **Paginación**: Para grandes volúmenes de datos, considera paginación
2. **Caché**: Implementa caché en frontend con 5-10 minutos de TTL
3. **Índices**: Crea índices en la base de datos para queries frecuentes
4. **Throttling**: Limita las peticiones por IP (rate limiting)

### Ejemplo con paginación

```javascript
router.get('/tareas', verifyApiKey, async (req, res) => {
  const page = req.query.page || 1;
  const limit = req.query.limit || 20;
  const offset = (page - 1) * limit;
  
  const result = await db.query(
    'SELECT * FROM tareas LIMIT $1 OFFSET $2',
    [limit, offset]
  );
  
  res.json({
    data: result.rows,
    page,
    limit,
    total: result.rowCount
  });
});
```

---

## 🔗 Variables de Entorno Backend

Agrega a tu `.env` del backend:

```env
# API Key para acceso a endpoints PowerBI
API_KEY=TU_API_KEY_SEGURA_AQUI

# Tiempo de caché (en segundos)
POWERBI_CACHE_TIME=300

# Límite de resultados por defecto
POWERBI_LIMIT=500
```

---

## 📞 Contacto y Soporte

Para problemas o preguntas sobre los endpoints, verifica:

1. ¿El backend está corriendo en el puerto correcto?
2. ¿El header x-api-key es correcto?
3. ¿Los endpoints retornan arrays válidos?
4. ¿Hay errores en la consola del backend?

---

**Versión**: 1.0.0  
**Última actualización**: 2026-06-17
