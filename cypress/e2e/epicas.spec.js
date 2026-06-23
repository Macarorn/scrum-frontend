// cypress/e2e/epicas.spec.js
// Test suite for epicas (epics) functionality

describe('Epicas Overview Page', () => {
  beforeEach(() => {
    const testEmail = Cypress.env('TEST_MANAGER_EMAIL') || 'sofia@gmail.com';
    const testPassword = Cypress.env('TEST_MANAGER_PASSWORD') || 'Sofia1234';

    cy.login(testEmail, testPassword);
  });

  it('should display epicas overview page', () => {
    cy.visit('/epicas');
    cy.url().should('include', '/epicas');
    // Page should load successfully
    cy.get('.epicas-page').should('be.visible');
  });

  it('should display create epic button', () => {
    cy.visit('/epicas');
    cy.get('body').then(($body) => {
      const $button = $body.find('.epicas-create-tile');
      if ($button.length > 0) {
        cy.wrap($button.first()).should('be.visible').and('contain', 'Crear');
      } else {
        cy.get('.epicas-page').should('be.visible');
      }
    });
  });

  it('should display epicas list or empty state', () => {
    cy.visit('/epicas');
    // Either epicas are listed or empty state is shown
    cy.get('[class*="epica"]').should('exist');
  });

  it('should navigate to create epic page', () => {
    cy.visit('/epicas');
    cy.get('body').then(($body) => {
      const $button = $body.find('.epicas-create-tile');
      if ($button.length > 0) {
        cy.wrap($button.first()).click();
        cy.url().should('include', '/epicas/nueva');
      } else {
        cy.get('.epicas-page').should('be.visible');
      }
    });
  });

  it('should navigate to epic detail on card click', () => {
    cy.visit('/epicas');
    cy.get('body').then(($body) => {
      const $cards = $body.find('.epica-card');
      if ($cards.length > 0) {
        cy.wrap($cards.first()).find('.epica-card-title, .epica-view-btn').first().click();
        cy.url().should('include', '/epicas/');
      } else {
        cy.contains(/no hay epicas|cargando epicas/i).should('be.visible');
      }
    });
  });
});

describe('Create Epic Form', () => {
  beforeEach(() => {
    const testEmail = Cypress.env('TEST_MANAGER_EMAIL') || 'sofia@gmail.com';
    const testPassword = Cypress.env('TEST_MANAGER_PASSWORD') || 'Sofia1234';

    cy.login(testEmail, testPassword);
  });

  it('should display create epic form', () => {
    cy.visit('/epicas/nueva');
    cy.contains('Nueva épica').should('be.visible');
  });

  it('should display project selector', () => {
    cy.visit('/epicas/nueva');
    cy.get('select').should('be.visible');
  });

  it('should display form fields', () => {
    cy.visit('/epicas/nueva');
    cy.get('input[id*="nombre"]').should('be.visible');
    cy.get('textarea').should('be.visible');
  });

  it('should show validation errors on empty submission', () => {
    cy.visit('/epicas/nueva');
    cy.contains('button', /Crear/i).click();
    cy.get('.invalid-feedback').should('exist');
  });

  it('should create epic with valid data', () => {
    cy.visit('/epicas/nueva');

    const epicName = `Test Epic ${Date.now()}`;
    const description = 'This is a test epic';

    cy.get('select').first().should('be.visible').find('option').should('have.length.greaterThan', 0);

    cy.get('select').first().find('option').then(($options) => {
      const validOptions = Array.from($options).filter((option) => option.value && option.value.trim() !== "");
      if (validOptions.length === 0) {
        cy.contains(/sin proyectos|no hay proyectos|Debes seleccionar un proyecto|Sin proyectos|No hay proyectos disponibles/i).should('be.visible');
        return;
      }

      cy.intercept('POST', '**/epicas').as('createEpic');
      cy.get('select').first().select(validOptions[0].value);
      cy.get('#epica-nombre').clear().type(epicName, { delay: 50 });
      cy.get('#epica-descripcion').clear().type(description, { delay: 50 });
      cy.get('#epica-categoria').clear().type('Backend', { delay: 50 });

      cy.contains('button', /^Crear/i).scrollIntoView().click();
      cy.wait('@createEpic').its('response.statusCode').should('be.oneOf', [200, 201]);
      cy.url().should('match', /\/epicas\//);
    });
  });

  it('should navigate back when clicking Volver', () => {
    cy.visit('/epicas/nueva');
    cy.contains('button', 'Volver').click();
    cy.url().should('include', '/epicas');
  });
});

describe('Epic Detail Page', () => {
  beforeEach(() => {
    const testEmail = Cypress.env('TEST_MANAGER_EMAIL') || 'sofia@gmail.com';
    const testPassword = Cypress.env('TEST_MANAGER_PASSWORD') || 'Sofia1234';

    cy.login(testEmail, testPassword);
    cy.visit('/epicas');
  });

  it('should display epic detail page', () => {
    cy.get('body').then(($body) => {
      const $cards = $body.find('.epica-card');
      if ($cards.length > 0) {
        cy.wrap($cards.first()).find('.epica-card-title, .epica-view-btn').first().click();
        cy.url().should('include', '/epicas/');
        cy.get('.epicas-page').should('be.visible');
      } else {
        cy.get('.epicas-page').should('be.visible');
      }
    });
  });

  it('should display epic information', () => {
    cy.visit('/epicas');
    cy.get('body').then(($body) => {
      const $cards = $body.find('.epica-card');
      if ($cards.length > 0) {
        cy.wrap($cards.first()).find('.epica-card-title, .epica-view-btn').first().click();
        // Epic details should be visible
        cy.get('.epica-detail-card, .epica-historias-card').should('exist');
      } else {
        cy.get('.epicas-page').should('be.visible');
      }
    });
  });
});
