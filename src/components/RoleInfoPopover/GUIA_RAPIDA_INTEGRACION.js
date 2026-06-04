/**
 * GUÍA RÁPIDA - Cómo Integrar RoleDisplay en Nueva Página
 * 
 * Sigue estos pasos para agregar el sistema de información de roles
 * en cualquier nuevo componente.
 */

// ============================================================================
// PASO 1: Importar el componente
// ============================================================================

// En la parte superior de tu archivo JSX, agrega:
import { RoleDisplay } from "../../components/RoleInfoPopover";

// O si necesitas solo el popover sin el nombre del rol:
import { RoleInfoPopover } from "../../components/RoleInfoPopover";

// ============================================================================
// PASO 2: Usar en tu componente
// ============================================================================

// OPCIÓN A: Mostrar rol completo (RECOMENDADO)
<RoleDisplay
  roleName={nombreDelRol}
  variant="badge"        // O "pill", "text"
  showIcon={true}
  popoverPosition="bottom"
/>

// OPCIÓN B: Solo el popover sin nombre
<RoleInfoPopover
  roleName={nombreDelRol}
  position="bottom"      // O "top", "left", "right"
  showIcon={true}
/>

// OPCIÓN C: Con callbacks
<RoleDisplay
  roleName={nombreDelRol}
  variant="badge"
  showIcon={true}
  onOpenPopover={() => console.log("Abierto")}
  onClosePopover={() => console.log("Cerrado")}
/>

// ============================================================================
// PASO 3: Asegurar que el rol sea válido
// ============================================================================

// Roles soportados (coincidencia exacta):
// - "Scrum Master"
// - "Product Owner"
// - "Product Manager"
// - "Developer"
// - "Designer"
// - "Stakeholder"

// Si el rol viene de una API, asegúrate de que coincida exactamente.
// Ejemplo:
const rolAPI = "Scrum Master";  // ✅ Correcto
const rolAPI = "scrum master";  // ❌ Incorrecto (minúsculas)
const rolAPI = "SM";            // ❌ Incorrecto (abreviación)

// Para validar un rol:
import { isValidRole } from "../../constants/scrumRoles";

if (isValidRole(miRol)) {
  return <RoleDisplay roleName={miRol} />;
}

// ============================================================================
// PASO 4: Ejemplos en diferentes contextos
// ============================================================================

// En una tabla
<table>
  <tbody>
    {usuarios.map((usuario) => (
      <tr key={usuario.id}>
        <td>{usuario.nombre}</td>
        <td>
          <RoleDisplay roleName={usuario.rol} variant="badge" />
        </td>
      </tr>
    ))}
  </tbody>
</table>

// En un modal de selección
<div className="d-flex flex-column gap-2">
  {rolesDisponibles.map((rol) => (
    <label key={rol.id}>
      <input type="radio" name="rol" value={rol.nombre} />
      <RoleDisplay roleName={rol.nombre} variant="badge" />
    </label>
  ))}
</div>

// En un card de perfil
<Card>
  <Card.Body>
    <h4>
      Rol actual
      <RoleDisplay roleName={usuario.rol} variant="text" />
    </h4>
  </Card.Body>
</Card>

// En un listado con información
<div className="d-flex align-items-center gap-2">
  <span>Responsable:</span>
  <RoleDisplay
    roleName={responsable.rol}
    variant="pill"
    showIcon={true}
  />
</div>

// ============================================================================
// PASO 5: Personalización
// ============================================================================

// Cambiar colores de un rol
// Edita: src/constants/scrumRoles.js
export const SCRUM_ROLES = {
  "Scrum Master": {
    color: "#FF0000",          // Cambiar color aquí
    backgroundColor: "#FFE0E0", // Y aquí
    // ...resto de propiedades
  },
};

// Cambiar estilos del popover
// Edita: src/components/RoleInfoPopover/RoleInfoPopover.css
.role-info-popover {
  background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%);
  // Ajusta estilos aquí
}

// Agregar más variantes
// Edita: src/components/RoleInfoPopover/RoleDisplay.css
.role-display-custom {
  // Tus estilos personalizados
}

// ============================================================================
// PASO 6: Troubleshooting
// ============================================================================

// ❌ El popover no aparece
// → Verifica que roleName sea exacto (respeta mayúsculas)
// → Asegúrate de que el rol exista en scrumRoles.js
// → Abre la consola para ver errores

// ❌ El ícono no se ve bien
// → Cambia el popoverPosition a "left" o "right"
// → Ajusta el z-index en RoleInfoPopover.css si es necesario

// ❌ El color no es correcto
// → Verifica el color en scrumRoles.js
// → Limpia el cache del navegador (Ctrl+Shift+Del)

// ❌ No se cierra al hacer clic fuera
// → Verifica que no haya z-index muy alto conflictivo
// → Abre la consola para ver errores de JavaScript

// ============================================================================
// PASO 7: Test de integración
// ============================================================================

// Crea un componente de prueba para verificar la integración:
function PruebaRoleDisplay() {
  return (
    <div style={{ padding: "20px" }}>
      <h2>Prueba RoleDisplay</h2>
      
      <h3>Variante Badge</h3>
      <RoleDisplay roleName="Scrum Master" variant="badge" />
      <RoleDisplay roleName="Product Owner" variant="badge" />
      <RoleDisplay roleName="Developer" variant="badge" />
      
      <h3>Variante Pill</h3>
      <RoleDisplay roleName="Scrum Master" variant="pill" />
      
      <h3>Variante Text</h3>
      <p>Eres un <RoleDisplay roleName="Scrum Master" variant="text" /> en este proyecto</p>
      
      <h3>Diferentes posiciones</h3>
      <RoleDisplay roleName="Scrum Master" popoverPosition="top" />
      <RoleDisplay roleName="Scrum Master" popoverPosition="right" />
      <RoleDisplay roleName="Scrum Master" popoverPosition="left" />
      <RoleDisplay roleName="Scrum Master" popoverPosition="bottom" />
    </div>
  );
}

// ============================================================================
// REFERENCIAS
// ============================================================================

/*
Documentación:
  - src/components/RoleInfoPopover/README.md
  - src/components/RoleInfoPopover/EJEMPLOS_USO.jsx
  - src/constants/scrumRoles.js

Archivos modificados:
  - src/pages/ListaUsuarios/ListaUsuarios.jsx
  - src/pages/Notificaciones/Notificaciones.jsx
  - src/pages/PerfilUsuario/PerfilUsuario.jsx

Memoria:
  - /memories/repo/scrum-roles-help-system.md
  - /memories/session/scrum-roles-implementation-summary.md
*/
