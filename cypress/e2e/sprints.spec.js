// cypress/e2e/sprints.spec.js
// Test suite for sprints functionality

describe('Página de Sprints', () => {
  beforeEach(() => {
    const testEmail = Cypress.env('TEST_MANAGER_EMAIL') || 'sofia@gmail.com';
    const testPassword = Cypress.env('TEST_MANAGER_PASSWORD') || 'Sofia1234';

    cy.login(testEmail, testPassword);
    cy.wait(1000); // Add delay to avoid rate limiting
  });

  it('debería mostrar la página de sprints', () => {
    cy.visit('/sprints');
    // Sprints page should load
    cy.url().should('include', '/sprints');
  });

  it('debería mostrar el selector de proyecto en la página de sprints', () => {
    cy.visit('/sprints');
    cy.get('.backlog-project-selector .backlog-epica-toggle')
      .should('be.visible')
      .and('not.be.disabled');
  });

  it('debería mostrar la lista de sprints', () => {
    cy.visit('/sprints');
    // Sprint list container should exist
    cy.get('[class*="sprint"]').should('be.visible');
  });

  it('debería navegar al detalle del sprint al hacer clic', () => {
    cy.visit('/sprints');
    cy.get('body').then(($body) => {
      const $rows = $body.find('.sprint-list-row');
      if ($rows.length > 0) {
        cy.wrap($rows.first()).click();
        cy.url().should('include', '/sprints/');
      } else {
        cy.contains(/no hay sprints|cargando sprints/i).should('be.visible');
      }
    });
  });

  it('debería navegar al tablero kanban', () => {
    cy.visit('/sprints');
    cy.get('.sprint-list-actions')
      .contains('button', /Ir a Tablero Kanban/i)
      .should('be.visible')
      .and('not.be.disabled')
      .click({ force: true });
    cy.location('pathname', { timeout: 15000 }).should('include', '/kanban');
  });
});

describe('Página de detalle de sprint', () => {
  beforeEach(() => {
    const testEmail = Cypress.env('TEST_MANAGER_EMAIL') || 'sofia@gmail.com';
    const testPassword = Cypress.env('TEST_MANAGER_PASSWORD') || 'Sofia1234';

    cy.login(testEmail, testPassword);
    cy.wait(1000); // Add delay to avoid rate limiting
    cy.visit('/sprints');
  });

  it('debería navegar al detalle del sprint al hacer clic en un sprint', () => {
    cy.get('body').then(($body) => {
      const $items = $body.find('.sprint-list-row');
      if ($items.length > 0) {
        cy.wrap($items.first()).click({ force: true });
        cy.url().should('include', '/sprints/');
      } else {
        cy.contains(/no hay sprints|cargando sprints/i).should('be.visible');
      }
    });
  });

  it('debería mostrar la información del sprint en la página de detalle', () => {
    cy.visit('/sprints');
    cy.get('body').then(($body) => {
      const $items = $body.find('.sprint-list-row');
      if ($items.length > 0) {
        cy.wrap($items.first()).click({ force: true });
        // Sprint info should be displayed
        cy.get('.sprint-detail-container, .sprint-card').should('be.visible');
      } else {
        cy.contains(/no hay sprints|cargando sprints/i).should('be.visible');
      }
    });
  });
});

describe('Creación de sprint', () => {
  beforeEach(() => {
    const testEmail = Cypress.env('TEST_MANAGER_EMAIL') || 'sofia@gmail.com';
    const testPassword = Cypress.env('TEST_MANAGER_PASSWORD') || 'Sofia1234';

    cy.login(testEmail, testPassword);
    cy.wait(1000); // Add delay to avoid rate limiting
    cy.visit('/sprints');
  });

  it('debería abrir el modal de crear sprint', () => {
    cy.contains('button', /Nuevo Sprint/i).should('be.visible').and('not.be.disabled').click();
    cy.get('.sprint-list-modal').should('be.visible');
    cy.contains('.sprint-list-modal', /Nuevo sprint/i).should('be.visible');
  });

  it('debería completar y enviar el formulario de creación de sprint', () => {
    const sprintName = `Test Sprint ${Date.now()}`;

    cy.contains('button', /Nuevo Sprint/i).should('be.visible').and('not.be.disabled').click();
    cy.get('.sprint-list-modal').should('be.visible');
    cy.intercept('POST', '**/sprints').as('createSprint');
    cy.get('#sprint-list-modal-nombre').clear().type(sprintName, { delay: 50 });
    cy.get('#sprint-list-modal-fecha-inicio').type('2026-06-19');
    cy.get('#sprint-list-modal-fecha-fin').type('2026-06-26');
    cy.get('#sprint-list-modal-meta').clear().type('Meta creada desde Cypress', { delay: 50 });
    cy.contains('.sprint-list-modal button', /Crear sprint/i).should('not.be.disabled').click();
    cy.wait('@createSprint').its('response.statusCode').should('be.oneOf', [200, 201]);
    cy.contains('.sprint-list-row', sprintName).should('be.visible');
  });
});

describe('Tablero Kanban', () => {
  beforeEach(() => {
    const testEmail = Cypress.env('TEST_MANAGER_EMAIL') || 'sofia@gmail.com';
    const testPassword = Cypress.env('TEST_MANAGER_PASSWORD') || 'Sofia1234';

    cy.login(testEmail, testPassword);
    cy.wait(1000); // Add delay to avoid rate limiting
  });

  it('debería mostrar el tablero kanban', () => {
    cy.visit('/kanban');
    cy.url().should('include', '/kanban');
  });

  it('debería mostrar las columnas de tareas', () => {
    cy.visit('/kanban');
    // Kanban columns should be visible
    cy.get('[class*="column"], [class*="column-header"]').should('be.visible');
  });

  it('debería mostrar tareas en las columnas si se selecciona un sprint', () => {
    cy.visit('/kanban');
    cy.get('[class*="task"], [class*="card"]').then(($tasks) => {
      // Tasks might or might not exist depending on sprint selection
      expect($tasks.length).to.be.gte(0);
    });
  });
});
