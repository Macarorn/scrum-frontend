/**
 * Tour steps for React Joyride, organized by route.
 *
 * Each key is a pathname (or prefix) and each value is an array of
 * Joyride step objects.  The `target` values reference CSS selectors
 * that already exist in the codebase – no extra classes needed.
 */

const TOUR_STEPS = {
  /* ─── Inicio / Bienvenida ─── */
  "/crear-proyecto": [
    {
      target: "#app-sidebar",
      content:
        "Este es el menú de navegación. Desde aquí puedes acceder a todas las secciones de la aplicación: proyectos, backlog, épicas, sprints y más.",
      placement: "right",
      disableBeacon: true,
    },
    {
      target: ".welcome-header",
      content:
        "¡Bienvenido a ScrumTrack! Esta es la pantalla de inicio donde podrás empezar a trabajar con tu equipo.",
      placement: "bottom",
    },
    {
      target: ".botones-container",
      content:
        "Aquí tienes las acciones principales: crear un nuevo proyecto, unirte a uno existente o ir a tu perfil.",
      placement: "top",
    },
  ],

  /* ─── Proyectos Overview ─── */
  "/proyectos": [
    {
      target: ".proyectos-overview-title",
      content:
        "Esta es la vista general de tus proyectos. Aquí puedes ver todos los proyectos en los que participas.",
      placement: "bottom",
      disableBeacon: true,
    },
    {
      target: ".proyectos-overview-actions",
      content:
        "Usa estos botones para crear un nuevo proyecto o unirte a uno existente mediante un código de invitación.",
      placement: "left",
    },
    {
      target: ".proyectos-overview-cards-grid",
      content:
        "Tus proyectos aparecen como tarjetas. Haz clic en cualquiera para ver sus detalles, épicas y sprints.",
      placement: "top",
    },
  ],

  /* ─── Backlog ─── */
  "/backlog": [
    {
      target: ".backlog-title",
      content:
        "El Backlog es donde gestionas todas las historias de usuario de tu proyecto. Es el corazón de la planificación ágil.",
      placement: "bottom",
      disableBeacon: true,
    },
    {
      target: ".backlog-project-selector",
      content:
        "Selecciona el proyecto del cual quieres ver el backlog. Si participas en varios proyectos, puedes cambiar entre ellos aquí.",
      placement: "bottom",
    },
    {
      target: ".backlog-epica-picker-inline",
      content:
        "Filtra las historias de usuario por épica. Las épicas agrupan historias relacionadas bajo un mismo objetivo.",
      placement: "bottom",
    },
    {
      target: ".backlog-actions",
      content:
        "Desde aquí puedes crear nuevas historias de usuario y buscar entre las existentes.",
      placement: "left",
    },
  ],

  /* ─── Épicas ─── */
  "/epicas": [
    {
      target: ".sprint-title",
      content:
        "Las Épicas son grandes objetivos que se dividen en múltiples historias de usuario. Aquí gestionas todas las épicas de tu proyecto.",
      placement: "bottom",
      disableBeacon: true,
    },
    {
      target: ".backlog-project-selector",
      content:
        "Selecciona el proyecto para ver sus épicas. Cada proyecto tiene sus propias épicas independientes.",
      placement: "bottom",
    },
    {
      target: ".epicas-grid-wrap",
      content:
        "Aquí puedes ver las épicas existentes, crear nuevas y acceder a los detalles de cada una haciendo clic en 'Ver detalles'.",
      placement: "top",
    },
  ],

  /* ─── Sprint List ─── */
  "/sprints": [
    {
      target: ".sprint-list-title",
      content:
        "El Gestor de Sprints te permite planificar y organizar las iteraciones de trabajo de tu equipo.",
      placement: "bottom",
      disableBeacon: true,
    },
    {
      target: ".sprint-list-actions",
      content:
        "Crea nuevos sprints o accede directamente al tablero Kanban desde estos botones.",
      placement: "left",
    },
    {
      target: ".sprint-list-table-card",
      content:
        "Aquí verás todos los sprints del proyecto con su estado, épicas asociadas y fechas. Haz clic en un sprint para ver sus detalles.",
      placement: "top",
    },
  ],

  /* ─── Kanban / Sprint Board ─── */
  "/kanban": [
    {
      target: ".sprint-title",
      content:
        "El Tablero Kanban visualiza las tareas del sprint en columnas según su estado. Es ideal para hacer seguimiento del progreso diario.",
      placement: "bottom",
      disableBeacon: true,
    },
    {
      target: ".sprint-actions",
      content:
        "Selecciona el sprint que deseas visualizar en el tablero. Puedes cambiar entre sprints activos y pasados.",
      placement: "bottom",
    },
    {
      target: ".board-columns",
      content:
        "Las tareas están organizadas en columnas: Por Hacer, En Progreso, En Revisión y Terminado. ¡Arrastra las tarjetas para cambiar su estado!",
      placement: "top",
    },
  ],

  /* ─── Calendario ─── */
  "/calendario": [
    {
      target: "#app-sidebar",
      content:
        "Estás en el Calendario. Desde el menú lateral puedes navegar a las demás secciones de la aplicación.",
      placement: "right",
      disableBeacon: true,
    },
  ],

  /* ─── Notificaciones ─── */
  "/notificaciones": [
    {
      target: "#app-sidebar",
      content:
        "Aquí recibirás todas las notificaciones de tus proyectos. Usa el menú lateral para navegar a otras secciones.",
      placement: "right",
      disableBeacon: true,
    },
  ],

  /* ─── Perfil ─── */
  "/perfil": [
    {
      target: "#app-sidebar",
      content:
        "¡Bienvenido a ScrumTrack! 🎉 Este es el menú de navegación. Desde aquí puedes acceder a todas las secciones: proyectos, backlog, épicas, sprints y más.",
      placement: "right",
      disableBeacon: true,
    },
    {
      target: ".perfil-page-header",
      content:
        "Este es tu perfil de usuario. Aquí puedes ver tu información personal, roles y permisos de acceso.",
      placement: "bottom",
    },
    {
      target: ".perfil-cover",
      content:
        "Tu tarjeta de perfil muestra tu avatar, nombre, correo y un resumen de tus roles y permisos.",
      placement: "bottom",
    },
    {
      target: "#sidebar-toggle",
      content:
        "Usa este botón (☰) para abrir o cerrar el menú lateral en cualquier momento. ¡Dentro del menú también encontrarás un botón de Ayuda para repetir este tour!",
      placement: "bottom",
    },
  ],
};

/**
 * Returns the tour steps for a given pathname.
 * Tries an exact match first, then falls back to prefix matching.
 */
export function getTourSteps(pathname) {
  // Exact match
  if (TOUR_STEPS[pathname]) {
    return TOUR_STEPS[pathname];
  }

  // Prefix match (e.g. /sprints/123 → /sprints)
  const match = Object.keys(TOUR_STEPS)
    .filter((key) => pathname.startsWith(key))
    .sort((a, b) => b.length - a.length)[0];

  return match ? TOUR_STEPS[match] : [];
}

export default TOUR_STEPS;
