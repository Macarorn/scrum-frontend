/**
 * Información centralizada de roles Scrum
 * Utilizado para mostrar información contextual en toda la aplicación
 */

export const SCRUM_ROLES = {
  "Scrum Master": {
    id: 4,
    nombre: "Scrum Master",
    descripcion: "Facilita y guía el proceso Scrum del equipo",
    resumen:
      "El Scrum Master es el guardián del proceso Scrum y protege al equipo de distracciones externas.",
    responsabilidades: [
      "Facilitar la ejecución de eventos Scrum (Sprint Planning, Daily Standup, Sprint Review, Retrospectiva)",
      "Resolver impedimentos y obstáculos del equipo",
      "Promover la mejora continua y las prácticas ágiles",
      "Proteger al equipo de interferencias externas",
      "Entrenar al equipo en Scrum y valores ágiles",
      "Servir como punto de contacto entre equipo y stakeholders",
    ],
    color: "#4A90E2",
    backgroundColor: "#EBF4FF",
    icon: "bi-shield-check",
  },
  "Product Owner": {
    id: 3,
    nombre: "Product Owner",
    descripcion: "Gestiona el backlog y define las prioridades del producto",
    resumen:
      "El Product Owner es responsable de maximizar el valor del producto y gestionar el backlog del proyecto.",
    responsabilidades: [
      "Crear y mantener el backlog del producto ordenado por prioridad",
      "Definir los criterios de aceptación y requisitos de las funcionalidades",
      "Maximizar el valor entregado en cada sprint",
      "Colaborar con stakeholders para recopilar requisitos",
      "Aceptar o rechazar el trabajo completado al final del sprint",
      "Comunicar la visión del producto al equipo",
    ],
    color: "#F5A623",
    backgroundColor: "#FFF5E6",
    icon: "bi-kanban-fill",
  },
  "Product Manager": {
    id: 6,
    nombre: "Product Manager",
    descripcion: "Define la estrategia y dirección del producto",
    resumen:
      "El Product Manager trabaja en la estrategia del producto y la experiencia del usuario.",
    responsabilidades: [
      "Definir la visión y estrategia del producto",
      "Analizar el mercado y las necesidades de los usuarios",
      "Colaborar en la priorización de características",
      "Evaluar el impacto del producto en el negocio",
      "Facilitar la comunicación entre equipos técnicos y negocio",
      "Validar decisiones de producto con datos",
    ],
    color: "#7ED321",
    backgroundColor: "#F3FF99",
    icon: "bi-bullseye",
  },
  Developer: {
    id: 5,
    nombre: "Developer",
    descripcion: "Implementa las tareas técnicas del sprint",
    resumen:
      "Los Developers son responsables de diseñar, construir y probar las funcionalidades del producto.",
    responsabilidades: [
      "Implementar funcionalidades según especificaciones",
      "Escribir código limpio, mantenible y bien documentado",
      "Realizar pruebas unitarias e integración",
      "Colaborar con otros developers en el código",
      "Estimar el esfuerzo requerido para tareas",
      "Participar activamente en la mejora técnica",
    ],
    color: "#BD10E0",
    backgroundColor: "#F8E6FF",
    icon: "bi-code-slash",
  },
  Designer: {
    id: 7,
    nombre: "Designer",
    descripcion: "Diseña la experiencia y interfaz del usuario",
    resumen:
      "El Designer es responsable de la experiencia del usuario y la interfaz visual del producto.",
    responsabilidades: [
      "Diseñar interfaces intuitivas y atractivas",
      "Realizar investigación de usuarios y UX",
      "Crear prototipos y validar conceptos",
      "Mantener la consistencia visual del producto",
      "Colaborar con developers en la implementación",
      "Iterar según feedback de usuarios",
    ],
    color: "#FF006E",
    backgroundColor: "#FFE5F0",
    icon: "bi-palette-fill",
  },
  Stakeholder: {
    id: 8,
    nombre: "Stakeholder",
    descripcion: "Parte interesada en el proyecto",
    resumen:
      "Un Stakeholder es cualquier persona interesada en el éxito del proyecto y sus resultados.",
    responsabilidades: [
      "Proporcionar feedback sobre el producto",
      "Validar que el producto cumple sus necesidades",
      "Participar en revisiones del sprint",
      "Apoyar la priorización de funcionalidades",
      "Comunicar cambios en los requisitos",
      "Aceptar la entrega de funcionalidades completadas",
    ],
    color: "#00B4D8",
    backgroundColor: "#E0F7FF",
    icon: "bi-people-fill",
  },
};

/**
 * Obtiene la información de un rol por su nombre
 * @param {string} roleName - Nombre del rol
 * @returns {object} Información del rol o objeto vacío si no existe
 */
export const getRoleInfo = (roleName) => {
  if (!roleName) return {};
  return SCRUM_ROLES[roleName] || {};
};

/**
 * Obtiene todos los roles disponibles
 * @returns {array} Array de roles
 */
export const getAllRoles = () => {
  return Object.values(SCRUM_ROLES);
};

/**
 * Valida si un rol es válido
 * @param {string} roleName - Nombre del rol
 * @returns {boolean}
 */
export const isValidRole = (roleName) => {
  return roleName in SCRUM_ROLES;
};

/**
 * Obtiene el color del rol
 * @param {string} roleName - Nombre del rol
 * @returns {string} Color hex del rol
 */
export const getRoleColor = (roleName) => {
  const role = SCRUM_ROLES[roleName];
  return role ? role.color : "#6C757D";
};

/**
 * Obtiene el color de fondo del rol
 * @param {string} roleName - Nombre del rol
 * @returns {string} Color hex de fondo
 */
export const getRoleBackgroundColor = (roleName) => {
  const role = SCRUM_ROLES[roleName];
  return role ? role.backgroundColor : "#E9ECEF";
};
