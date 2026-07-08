// cypress/e2e/calendario.spec.js
// Pruebas para la vista de Calendario / Centro de Reuniones

describe('Calendario - Centro de Reuniones', () => {
  const testEmail = Cypress.env('TEST_MANAGER_EMAIL') || 'sofia@gmail.com';
  const testPassword = Cypress.env('TEST_MANAGER_PASSWORD') || 'Sofia1234';

  beforeEach(() => {
    cy.login(testEmail, testPassword);
  });

  it('debería mostrar la página de Centro de Reuniones', () => {
    cy.visit('/calendario', { failOnStatusCode: false });
    cy.get('h1.page-title', { timeout: 15000 }).should('contain.text', 'Centro de Reuniones');
    cy.contains('Aquí tienes tu agenda y próximas reuniones.').should('be.visible');
  });

  it('debería mostrar el selector de proyecto y el botón Agregar reunión', () => {
    cy.visit('/calendario', { failOnStatusCode: false });
    cy.get('button.backlog-epica-toggle', { timeout: 15000 }).should('be.visible');
    cy.get('#add-event-btn').should('be.visible');
    cy.contains('button', 'Agregar reunión').should('be.visible');
  });

  it('debería mostrar los resúmenes de eventos urgentes y de hoy', () => {
    cy.visit('/calendario', { failOnStatusCode: false });
    cy.contains('span', 'Eventos urgentes').should('be.visible');
    cy.contains('span', 'Eventos de hoy').should('be.visible');
  });

  it('debería cambiar de pestaña entre Calendario y Próximos cuando el selector móvil es visible', () => {
    cy.visit('/calendario', { failOnStatusCode: false });
    cy.get('.calendar-mobile-tabs').then(($tabs) => {
      if ($tabs.is(':visible')) {
        cy.wrap($tabs).contains('button', 'Próximos').click();
        cy.contains('h2', 'Eventos').should('be.visible');
        cy.wrap($tabs).contains('button', 'Calendario').click();
        cy.get('#calendar-current-title').should('be.visible');
      } else {
        cy.log('La vista móvil de pestañas no está visible; probando que el calendario principal se muestre correctamente');
        cy.get('#calendar-current-title').should('be.visible');
        cy.contains('h2', 'Eventos').should('be.visible');
      }
    });
  });

  it('debería abrir el selector de mes y año y usar el botón Hoy', () => {
    cy.visit('/calendario', { failOnStatusCode: false });
    cy.get('#calendar-picker-btn').click();
    cy.get('#calendar-month').should('be.visible');
    cy.get('#calendar-year').should('be.visible');
    cy.contains('button', 'Hoy').click();
    cy.get('#calendar-current-title').should('be.visible');
  });

  it('debería abrir el menú del proyecto y buscar eventos', () => {
    cy.visit('/calendario', { failOnStatusCode: false });
    cy.get('button.backlog-epica-toggle', { timeout: 15000 }).click();
    cy.get('.backlog-epica-menu').should('be.visible');
    cy.get('.backlog-epica-item').then(($items) => {
      if ($items.length > 1) {
        cy.wrap($items.eq(1)).click();
      }
    });
    cy.get('.calendar-search-bar input').type('reunión', { delay: 50 });
    cy.get('.calendar-search-bar input').should('have.value', 'reunión');
  });

  it('debería crear una nueva reunión desde el modal de calendario cuando hay proyecto gestionable', () => {
    cy.visit('/calendario', { failOnStatusCode: false });
    cy.get('button#add-event-btn', { timeout: 15000 }).should('be.visible').click();
    cy.get('#modal-reunion').should('be.visible');

    cy.get('#modal-reunion select').first().then(($select) => {
      const proyectosDisponibles = $select.find('option').length;
      if (proyectosDisponibles <= 1) {
        cy.log('No hay proyectos gestionables disponibles para crear reunión');
        return;
      }

      cy.wrap($select).select($select.find('option').eq(1).val());
      cy.get('#reunion-titulo').type('Reunión de prueba Cypress', { delay: 20 });
      cy.get('#reunion-desc').type('Descripción de prueba para calendario.', { delay: 20 });

      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      const fecha = tomorrow.toISOString().slice(0, 10);
      cy.get('#modal-reunion input[type="date"]').clear().type(fecha);
      cy.get('#modal-reunion input[type="time"]').first().clear().type('10:00');

      cy.get('#guardar-reunion').click();
      cy.get('#modal-reunion', { timeout: 20000 }).should('not.exist');
      cy.get('body').then(($body) => {
        if ($body.find('.Toastify__toast').length > 0) {
          cy.get('.Toastify__toast').contains('Reunión creada con éxito').should('be.visible');
        }
      });
    });
  });

  it('debería mostrar el popover de eventos cuando se selecciona un día con evento', () => {
    cy.visit('/calendario', { failOnStatusCode: false });
    cy.get('td').then(($cells) => {
      const cellsWithDot = $cells.filter((_, el) => el.querySelector('.calendar-dot'));
      if (cellsWithDot.length > 0) {
        cy.wrap(cellsWithDot.first()).click();
        cy.get('.day-popover').should('be.visible');
        cy.get('.popover-close').click();
        cy.get('.day-popover').should('not.exist');
      } else {
        cy.contains('No hay reuniones ni hitos de proyectos.').should('be.visible');
      }
    });
  });
});
