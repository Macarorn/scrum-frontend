/**
 * EJEMPLOS DE USO - Sistema de Ayuda Visual para Roles Scrum
 * 
 * Este archivo documenta cómo usar los componentes RoleDisplay y RoleInfoPopover
 * en diferentes contextos de la aplicación.
 */

// ============================================================================
// EJEMPLO 1: Mostrar rol en un listado/tabla (IMPLEMENTADO)
// ============================================================================

import { RoleDisplay } from "../../components/RoleInfoPopover";

function ListaUsuarios() {
  const users = [
    { id: 1, name: "Juan", role: "Scrum Master" },
    { id: 2, name: "María", role: "Product Owner" },
    { id: 3, name: "Carlos", role: "Developer" },
  ];

  return (
    <table>
      <thead>
        <tr>
          <th>Nombre</th>
          <th>Rol</th>
        </tr>
      </thead>
      <tbody>
        {users.map((user) => (
          <tr key={user.id}>
            <td>{user.name}</td>
            <td>
              <RoleDisplay
                roleName={user.role}
                variant="badge"
                showIcon={true}
                popoverPosition="bottom"
              />
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

// ============================================================================
// EJEMPLO 2: Modal de selección de rol (IMPLEMENTADO)
// ============================================================================

function AprobacionSolicitud() {
  const [rolSeleccionado, setRolSeleccionado] = useState("Scrum Master");

  const rolesDisponibles = [
    { id: 3, nombre: "Product Owner" },
    { id: 4, nombre: "Scrum Master" },
    { id: 5, nombre: "Developer" },
  ];

  return (
    <div>
      <label>Selecciona el rol a asignar:</label>
      <div className="d-flex flex-column gap-2">
        {rolesDisponibles.map((rol) => (
          <label key={rol.id} className="d-flex align-items-center">
            <input
              type="radio"
              name="rol"
              value={rol.nombre}
              checked={rolSeleccionado === rol.nombre}
              onChange={(e) => setRolSeleccionado(e.target.value)}
            />
            <RoleDisplay
              roleName={rol.nombre}
              variant="badge"
              showIcon={true}
              popoverPosition="right"
            />
          </label>
        ))}
      </div>
    </div>
  );
}

// ============================================================================
// EJEMPLO 3: Perfil de usuario (IMPLEMENTADO)
// ============================================================================

function PerfilUsuario() {
  const usuario = {
    nombre: "Ana García",
    roles: [
      { id_rol: 3, nombre_rol: "Product Owner" },
      { id_rol: 4, nombre_rol: "Scrum Master" },
    ],
  };

  return (
    <div>
      <h3>Roles asignados</h3>
      <div className="d-flex flex-wrap gap-2">
        {usuario.roles.map((rol) => (
          <RoleDisplay
            key={rol.id_rol}
            roleName={rol.nombre_rol}
            variant="pill"
            showIcon={true}
            popoverPosition="bottom"
          />
        ))}
      </div>
    </div>
  );
}

// ============================================================================
// EJEMPLO 4: Solo ícono de información (sin texto del rol)
// ============================================================================

import { RoleInfoPopover } from "../../components/RoleInfoPopover";

function CardEquipo() {
  return (
    <div className="card">
      <h4>
        Scrum Master
        <RoleInfoPopover
          roleName="Scrum Master"
          position="right"
          showIcon={true}
        />
      </h4>
    </div>
  );
}

// ============================================================================
// EJEMPLO 5: Múltiples variantes en la misma página
// ============================================================================

function Dashboard() {
  return (
    <div>
      {/* Variante Badge para listados */}
      <h3>Tabla de miembros</h3>
      <div>
        <RoleDisplay
          roleName="Product Owner"
          variant="badge"
          showIcon={true}
        />
        <RoleDisplay
          roleName="Scrum Master"
          variant="badge"
          showIcon={true}
        />
      </div>

      {/* Variante Pill para perfiles */}
      <h3>Equipo actual</h3>
      <div>
        <RoleDisplay
          roleName="Developer"
          variant="pill"
          showIcon={true}
        />
        <RoleDisplay
          roleName="Designer"
          variant="pill"
          showIcon={true}
        />
      </div>

      {/* Variante Text para contexto */}
      <h3>Rol actual</h3>
      <p>
        Eres un
        <RoleDisplay
          roleName="Scrum Master"
          variant="text"
          showIcon={true}
        />
        en este proyecto
      </p>
    </div>
  );
}

// ============================================================================
// EJEMPLO 6: Con callbacks (si necesita ejecutar código al abrir/cerrar)
// ============================================================================

function ComponenteAvanzado() {
  const handlePopoverOpen = () => {
    console.log("Popover abierto");
    // Analytics, tracking, etc.
  };

  const handlePopoverClose = () => {
    console.log("Popover cerrado");
  };

  return (
    <RoleDisplay
      roleName="Scrum Master"
      variant="badge"
      showIcon={true}
      popoverPosition="bottom"
      onOpenPopover={handlePopoverOpen}
      onClosePopover={handlePopoverClose}
    />
  );
}

// ============================================================================
// NOTA: Cómo agregar más características
// ============================================================================

/*
Si en el futuro necesitas:

1. Agregar más roles:
   - Edita src/constants/scrumRoles.js
   - Agrega el rol al objeto SCRUM_ROLES
   
2. Cambiar colores/estilos:
   - Modifica src/components/RoleInfoPopover/RoleInfoPopover.css
   - O cambia los colores en scrumRoles.js
   
3. Cambiar contenido del popover:
   - Edita el componente RoleInfoPopover.jsx
   - O modifica la información en scrumRoles.js

4. Agregar más variantes:
   - Agrega nuevas clases CSS en RoleDisplay.css
   - Modifica RoleDisplay.jsx para soportar la nueva variante
   
5. Integrar en otra página:
   - Importa { RoleDisplay } from "../../components/RoleInfoPopover"
   - Usa <RoleDisplay roleName={rol} variant="badge" showIcon={true} />
*/
