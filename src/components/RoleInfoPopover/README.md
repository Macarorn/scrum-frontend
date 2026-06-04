# RoleInfoPopover - Sistema de Ayuda Visual para Roles Scrum

## Descripción

Sistema de información contextual similar a Clash of Clans que muestra detalles sobre roles Scrum en toda la aplicación. Componentes reutilizables, responsive, y sin dependencias externas.

## 📦 Componentes Incluidos

### 1. **RoleInfoPopover.jsx**
Popover flotante que muestra información detallada de un rol.

**Props:**
- `roleName` (string, requerido): Nombre del rol (ej: "Scrum Master")
- `position` (string, default: "bottom"): Posición del popover ("top", "bottom", "left", "right")
- `showIcon` (boolean, default: true): Mostrar ícono ⓘ
- `iconClassName` (string): Clases CSS adicionales para el ícono
- `onOpen` (function): Callback cuando se abre
- `onClose` (function): Callback cuando se cierra

**Ejemplo:**
```jsx
<RoleInfoPopover
  roleName="Product Owner"
  position="bottom"
  showIcon={true}
  onOpen={() => console.log("Abierto")}
/>
```

### 2. **RoleDisplay.jsx** ⭐ RECOMENDADO
Componente que combina el nombre del rol + popover de información.

**Props:**
- `roleName` (string, requerido): Nombre del rol
- `variant` (string, default: "badge"): Estilo visual ("badge", "pill", "text")
- `showIcon` (boolean, default: true): Mostrar ícono información
- `className` (string): Clases CSS adicionales
- `popoverPosition` (string, default: "bottom"): Posición del popover
- `onOpenPopover` (function): Callback al abrir
- `onClosePopover` (function): Callback al cerrar

**Ejemplo:**
```jsx
<RoleDisplay
  roleName="Scrum Master"
  variant="badge"
  showIcon={true}
  popoverPosition="bottom"
/>
```

## 🎨 Variantes Visuales

### Variant: "badge"
Badge compacto con fondo coloreado. Ideal para tablas y listados.
```
┌─────────────────┐
│ 🔵 Scrum Master │ ⓘ
└─────────────────┘
```

### Variant: "pill"
Badge redondeado tipo píldora. Ideal para perfiles.
```
┌─────────────────────┐
│ 🔵 Scrum Master │ ⓘ  │
└─────────────────────┘
```

### Variant: "text"
Solo texto coloreado. Ideal para contextos inline.
```
Eres un 🔵 Scrum Master ⓘ en este proyecto
```

## 📍 Posiciones del Popover

- **bottom**: Debajo del ícono (default)
- **top**: Encima del ícono
- **left**: A la izquierda del ícono
- **right**: A la derecha del ícono

## 📋 Roles Soportados

Todos los roles están centralizados en `src/constants/scrumRoles.js`:

| Rol | Descripción | Color |
|-----|-------------|-------|
| Scrum Master | Facilita el proceso Scrum | Azul (#4A90E2) |
| Product Owner | Gestiona backlog | Naranja (#F5A623) |
| Product Manager | Define estrategia | Verde (#7ED321) |
| Developer | Implementa tareas | Púrpura (#BD10E0) |
| Designer | Diseña interfaz | Rosa (#FF006E) |
| Stakeholder | Parte interesada | Cyan (#00B4D8) |

Cada rol incluye:
- Nombre y descripción
- Resumen
- Lista de 6 responsabilidades principales
- Color primario y secundario
- Ícono emoji

## 🎯 Dónde Usar

### ✅ Implementado
1. **Lista de Usuarios** - Tabla con roles en badge
2. **Notificaciones** - Modal de aprobación con selector de roles
3. **Perfil del Usuario** - Sección de roles asignados en pill

### 🔄 Próximas Mejoras
- Modal de asignación de miembros
- Vista de integrantes del proyecto
- Invitaciones de usuarios
- Cards de equipo

## 🚀 Instalación y Uso

### Paso 1: Importar
```jsx
import { RoleDisplay } from "../../components/RoleInfoPopover";
// O para solo el popover:
import { RoleInfoPopover } from "../../components/RoleInfoPopover";
```

### Paso 2: Usar en JSX
```jsx
function MiComponente() {
  return (
    <RoleDisplay
      roleName="Scrum Master"
      variant="badge"
      showIcon={true}
    />
  );
}
```

### Paso 3: Sin configuración adicional
Los estilos se cargan automáticamente desde los archivos `.css`.

## ⌨️ Interacción

El popover se abre/cierra con:
- **Clic** en el ícono ⓘ
- **Clic fuera** del popover (cierra)
- **Tecla ESC** (cierra)
- Volviendo a **hacer clic en el ícono** (toggle)

## 🎨 Personalización

### Cambiar color de un rol
En `src/constants/scrumRoles.js`:
```js
"Scrum Master": {
  color: "#FF0000",  // Rojo en lugar de azul
  backgroundColor: "#FFE0E0",
  // ...
}
```

### Cambiar contenido del popover
En `src/constants/scrumRoles.js`:
```js
"Scrum Master": {
  responsabilidades: [
    "Tu responsabilidad personalizada",
    // ...
  ]
}
```

### Cambiar estilos del popover
En `src/components/RoleInfoPopover/RoleInfoPopover.css`:
```css
.role-info-popover {
  background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%);
  /* Modifica los valores */
}
```

## 📱 Responsive

- ✅ Desktop (1024px+)
- ✅ Tablet (576px - 1023px)
- ✅ Mobile (< 576px)

El popover se adapta automáticamente al tamaño de pantalla.

## ♿ Accesibilidad

- ✅ Soporte para teclado (ESC para cerrar)
- ✅ ARIA labels descriptivos
- ✅ Contraste adecuado
- ✅ Respeta `prefers-reduced-motion`

## 📊 Archivo de Constantes

**Ubicación:** `src/constants/scrumRoles.js`

**Funciones disponibles:**
```js
// Obtener información completa de un rol
getRoleInfo(roleName)

// Obtener todos los roles
getAllRoles()

// Validar si un rol existe
isValidRole(roleName)

// Obtener color del rol
getRoleColor(roleName)

// Obtener color de fondo del rol
getRoleBackgroundColor(roleName)
```

## 🔧 Troubleshooting

### Popover no se muestra
- Verifica que el `roleName` sea exacto (respeta mayúsculas)
- Verifica que el rol exista en `scrumRoles.js`

### Colores no se ven bien
- Verifica el tema de la aplicación
- Ajusta colores en `scrumRoles.js`
- Modifica CSS en `RoleInfoPopover.css`

### Z-index incorrecto
- El popover usa `z-index: 10000`
- Ajusta en `RoleInfoPopover.css` si es necesario

## 📚 Estructura de Archivos

```
src/
├── components/
│   └── RoleInfoPopover/
│       ├── index.js                  # Exports principales
│       ├── RoleInfoPopover.jsx        # Componente popover
│       ├── RoleInfoPopover.css        # Estilos popover
│       ├── RoleDisplay.jsx            # Componente display
│       ├── RoleDisplay.css            # Estilos display
│       └── EJEMPLOS_USO.jsx           # Ejemplos de uso
└── constants/
    └── scrumRoles.js                 # Información de roles
```

## 🚀 Próximos Pasos

1. Agregar más roles si es necesario
2. Integrar en otros componentes (modales, cards)
3. Agregar persistencia de preferencias (si prefiere ver popover)
4. Analytics: rastrear qué roles consultan más

## 📝 Changelog

### v1.0.0 (2026-05-27)
- ✅ Componente RoleInfoPopover
- ✅ Componente RoleDisplay
- ✅ 6 roles Scrum completamente documentados
- ✅ 3 variantes visuales (badge, pill, text)
- ✅ 4 posiciones de popover
- ✅ Integración en Lista de Usuarios
- ✅ Integración en Notificaciones
- ✅ Integración en Perfil del Usuario
- ✅ Diseño responsive
- ✅ Accesibilidad

## 📞 Soporte

Para agregar nuevas funcionalidades o reportar problemas, consulta:
- Archivo de memoria: `/memories/repo/scrum-roles-help-system.md`
- Ejemplos: `src/components/RoleInfoPopover/EJEMPLOS_USO.jsx`
- Constantes: `src/constants/scrumRoles.js`
