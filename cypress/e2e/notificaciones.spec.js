// cypress/e2e/notificaciones.spec.js
// Pruebas para la vista de Notificaciones

describe('Notificaciones', () => {
  const testEmail = Cypress.env('TEST_EMAIL') || 'test@example.com';
  const testPassword = Cypress.env('TEST_PASSWORD') || 'TestPassword123!';

  beforeEach(() => {
    cy.login(testEmail, testPassword);
  });

  it('debería mostrar el centro de notificaciones', () => {
    cy.visit('/notificaciones', { failOnStatusCode: false });
    cy.contains('h1', 'Centro de notificaciones', { timeout: 15000 }).should('be.visible');
    cy.contains('Solicitudes de ingreso, notificaciones del sistema y cambios de estado con actualización automática.').should('be.visible');
  });

  it('debería mostrar la sección Notificaciones recientes', () => {
    cy.visit('/notificaciones', { failOnStatusCode: false });
    cy.contains('h2', 'Notificaciones recientes').should('be.visible');
  });

  it('debería mostrar la sección Solicitudes por aprobar', () => {
    cy.visit('/notificaciones', { failOnStatusCode: false });
    cy.contains('h2', 'Solicitudes por aprobar').should('be.visible');
    cy.contains('label', 'Proyecto').should('be.visible');
  });

  it('debería abrir el selector de proyecto en notificaciones', () => {
    cy.visit('/notificaciones', { failOnStatusCode: false });
    cy.get('.notif-picker-toggle').click();
    cy.get('.notif-picker-menu').should('be.visible');
    cy.get('.notif-picker-item').then(($items) => {
      if ($items.length > 0) {
        cy.wrap($items.first()).click();
      }
    });
  });

  it('debería aprobar una solicitud pendiente usando el modal de aprobación cuando esté disponible', () => {
    cy.visit('/notificaciones', { failOnStatusCode: false });
    cy.get('body').then(($body) => {
      const approveBtns = $body.find('button.btn-action-soft.btn-aprobar').filter((_, el) =>
        Cypress.$(el).text().trim().startsWith('Aprobar')
      );

      if (approveBtns.length === 0) {
        cy.log('No hay solicitudes pendientes disponibles para aprobar');
        return;
      }

      cy.wrap(approveBtns.first()).click();
      cy.get('.modal-content', { timeout: 15000 }).should('be.visible').within(() => {
        cy.contains('Aprobar solicitud').should('be.visible');
        cy.get('input[type="radio"]').then(($radios) => {
          if ($radios.length > 0) {
            cy.wrap($radios.first()).check({ force: true });
          }
        });
        cy.contains('button', 'Aprobar solicitud').should('not.be.disabled').click();
      });
      cy.get('.modal-content').should('not.exist');
      cy.get('.Toastify__toast').then(($toast) => {
        if ($toast.length > 0) {
          const text = $toast.text();
          expect(text).to.match(/Solicitud aprobada|Invitación aceptada/);
        }
      });
    });
  });

  it('debería rechazar una solicitud o invitación con motivo usando el modal de rechazo cuando esté disponible', () => {
    cy.visit('/notificaciones', { failOnStatusCode: false });
    cy.get('body').then(($body) => {
      const rejectBtns = $body.find('button.btn-action-soft.btn-rechazar');
      if (rejectBtns.length === 0) {
        cy.log('No hay botones de rechazo disponibles en notificaciones');
        return;
      }

      cy.wrap(rejectBtns.first()).click();
      cy.get('.modal-content', { timeout: 15000 }).should('be.visible').within(() => {
        cy.contains(/Rechazar invitación|Rechazar solicitud/).should('be.visible');
        cy.get('textarea').type('Motivo de rechazo de prueba Cypress.', { delay: 20 });
        cy.contains('button', /Rechazar solicitud|Rechazar/).click();
      });
      cy.get('.modal-content').should('not.exist');
      cy.get('body').then(($bodyAfter) => {
        if ($bodyAfter.find('.Toastify__toast').length > 0) {
          cy.get('.Toastify__toast').should('contain.text', 'rechazada');
        }
      });
    });
  });

  it('debería abrir el modal de aprobación o rechazo de solicitudes si hay solicitudes pendientes', () => {
    cy.visit('/notificaciones', { failOnStatusCode: false });
    cy.get('body').then(($body) => {
      const aprobarBtns = $body.find('button.btn-aprobar');
      const rechazarBtns = $body.find('button.btn-rechazar');

      if (aprobarBtns.length > 0) {
        cy.wrap(aprobarBtns.first()).click();
        cy.contains('Aprobar solicitud').should('be.visible');
        cy.contains('button', 'Cancelar').click();
        cy.contains('Aprobar solicitud').should('not.exist');
      }

      if (rechazarBtns.length > 0) {
        cy.wrap(rechazarBtns.first()).click();
        cy.contains(/Rechazar invitación|Rechazar solicitud/).should('be.visible');
        cy.contains('button', 'Cancelar').click();
        cy.contains(/Rechazar invitación|Rechazar solicitud/).should('not.exist');
      }
    });
  });

  it('debería mostrar la sección Mis solicitudes', () => {
    cy.visit('/notificaciones', { failOnStatusCode: false });
    cy.contains('h2', 'Mis solicitudes').should('be.visible');
  });
});
