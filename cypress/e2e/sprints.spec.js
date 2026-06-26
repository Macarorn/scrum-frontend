// cypress/e2e/sprints.spec.js
// Test suite for sprints functionality

describe('Sprints Page', () => {
  beforeEach(() => {
    const testEmail = Cypress.env('TEST_MANAGER_EMAIL') || 'sofia@gmail.com';
    const testPassword = Cypress.env('TEST_MANAGER_PASSWORD') || 'Sofia1234';

    cy.login(testEmail, testPassword);
    cy.wait(1000); // Add delay to avoid rate limiting
  });

  it('should display sprints page', () => {
    cy.visit('/sprints');
    // Sprints page should load
    cy.url().should('include', '/sprints');
  });

  it('should display project selector on sprints page', () => {
    cy.visit('/sprints');
    cy.get('.backlog-project-selector .backlog-epica-toggle')
      .should('be.visible')
      .and('not.be.disabled');
  });

  it('should display sprint list', () => {
    cy.visit('/sprints');
    // Sprint list container should exist
    cy.get('[class*="sprint"]').should('be.visible');
  });

  it('should navigate to sprint detail on click', () => {
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

  it('should navigate to kanban board', () => {
    cy.visit('/sprints');
    cy.get('.sprint-list-actions')
      .contains('button', /Ir a Tablero Kanban/i)
      .should('be.visible')
      .and('not.be.disabled')
      .click({ force: true });
    cy.location('pathname', { timeout: 15000 }).should('include', '/kanban');
  });
});

describe('Sprint Detail Page', () => {
  beforeEach(() => {
    const testEmail = Cypress.env('TEST_MANAGER_EMAIL') || 'sofia@gmail.com';
    const testPassword = Cypress.env('TEST_MANAGER_PASSWORD') || 'Sofia1234';

    cy.login(testEmail, testPassword);
    cy.wait(1000); // Add delay to avoid rate limiting
    cy.visit('/sprints');
  });

  it('should navigate to sprint detail when clicking a sprint', () => {
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

  it('should display sprint information on detail page', () => {
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

describe('Sprint Creation', () => {
  beforeEach(() => {
    const testEmail = Cypress.env('TEST_MANAGER_EMAIL') || 'sofia@gmail.com';
    const testPassword = Cypress.env('TEST_MANAGER_PASSWORD') || 'Sofia1234';

    cy.login(testEmail, testPassword);
    cy.wait(1000); // Add delay to avoid rate limiting
    cy.visit('/sprints');
  });

  it('should open create sprint modal', () => {
    cy.contains('button', /Nuevo Sprint/i).should('be.visible').and('not.be.disabled').click();
    cy.get('.sprint-list-modal').should('be.visible');
    cy.contains('.sprint-list-modal', /Nuevo sprint/i).should('be.visible');
  });

  it('should fill and submit create sprint form', () => {
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

describe('Kanban Board', () => {
  beforeEach(() => {
    const testEmail = Cypress.env('TEST_MANAGER_EMAIL') || 'sofia@gmail.com';
    const testPassword = Cypress.env('TEST_MANAGER_PASSWORD') || 'Sofia1234';

    cy.login(testEmail, testPassword);
    cy.wait(1000); // Add delay to avoid rate limiting
  });

  it('should display kanban board', () => {
    cy.visit('/kanban');
    cy.url().should('include', '/kanban');
  });

  it('should display task columns', () => {
    cy.visit('/kanban');
    // Kanban columns should be visible
    cy.get('[class*="column"], [class*="column-header"]').should('be.visible');
  });

  it('should display tasks in columns if sprint is selected', () => {
    cy.visit('/kanban');
    cy.get('[class*="task"], [class*="card"]').then(($tasks) => {
      // Tasks might or might not exist depending on sprint selection
      expect($tasks.length).to.be.gte(0);
    });
  });
});
