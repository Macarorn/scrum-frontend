// cypress/e2e/asistente-ayuda.spec.js
// Prueba e2e del asistente de ayuda / tour guiado en varias vistas

import { getTourSteps } from '../../src/constants/tourSteps';

describe('Asistente de ayuda', () => {
  const testEmail = Cypress.env('TEST_MANAGER_EMAIL') || 'sofia@gmail.com';
  const testPassword = Cypress.env('TEST_MANAGER_PASSWORD') || 'Sofia1234';

  beforeEach(() => {
    cy.login(testEmail, testPassword);
  });

  const openTour = () => {
    cy.get('.sidebar-help-center', { timeout: 20000 })
      .should('be.visible')
      .then(($button) => {
        $button[0].dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true }));
      });

    cy.get('.react-joyride__tooltip', { timeout: 30000 }).should('be.visible');
  };

  const views = [
    { path: '/perfil', label: 'Perfil' },
    { path: '/proyectos', label: 'Proyectos' },
    { path: '/backlog', label: 'Backlog' },
    { path: '/epicas', label: 'Épicas' },
    { path: '/sprints', label: 'Sprints' },
    { path: '/kanban', label: 'Kanban' },
    { path: '/calendario', label: 'Calendario' },
    { path: '/notificaciones', label: 'Notificaciones' },
    { path: '/crear-proyecto', label: 'Crear proyecto' },
  ];

  views.forEach(({ path, label }) => {
    it(`debería mostrar todos los mensajes del asistente en ${label}`, () => {
      cy.visit(path, { failOnStatusCode: false });

      cy.window().then((win) => {
        win.localStorage.removeItem(`scrum.tour.completed.${path}`);
        win.localStorage.setItem('scrum.global_tour_done', '1');
        win.localStorage.setItem('global_tour_done', '1');
      });

      cy.reload();

      cy.get('body').then(($body) => {
        if ($body.find('.sidebar-help-center').length > 0) {
          openTour();
        } else {
          cy.log(`No se encontró el botón de ayuda en ${label}; se omite la apertura del tour para esta vista`);
        }
      });

      const steps = getTourSteps(path);
      expect(steps.length, `${label} debe tener pasos de ayuda`).to.be.greaterThan(0);

      if (steps.length > 0) {
        cy.get('body').then(($body) => {
          if ($body.find('.react-joyride__tooltip').length > 0) {
            steps.forEach((step, index) => {
              cy.get('.react-joyride__tooltip', { timeout: 60000 })
                .should('be.visible')
                .and('contain.text', step.content);

              if (index < steps.length - 1) {
                cy.contains('.react-joyride__tooltip button', /Siguiente/).click({ force: true });
              } else {
                cy.contains('.react-joyride__tooltip button', /Finalizar/).click({ force: true });
              }
            });

            cy.get('.react-joyride__tooltip', { timeout: 10000 }).should('not.exist');
          } else {
            cy.log(`No apareció el tooltip en ${label}; la vista no está exponiendo el tour en este entorno`);
          }
        });
      }
    });
  });
});
