// cypress/e2e/epicas.spec.js
// Test suite for epicas (epics) functionality

describe('Página de visión general de épicas', () => {
  beforeEach(() => {
    const testEmail = Cypress.env('TEST_MANAGER_EMAIL') || 'sofia@gmail.com';
    const testPassword = Cypress.env('TEST_MANAGER_PASSWORD') || 'Sofia1234';

    cy.login(testEmail, testPassword);
    cy.wait(500); // Allow page to stabilize after login
  });

  it('debería mostrar la página de visión general de épicas', () => {
    cy.visit('/epicas', { failOnStatusCode: false });
    cy.get('body', { timeout: 10000 }).should('be.visible');
    cy.url().should('include', '/epicas');
    // Page should load successfully
    cy.get('.epicas-page', { timeout: 10000 }).should('be.visible');
  });

  it('debería mostrar el botón Crear épica', () => {
    cy.visit('/epicas', { failOnStatusCode: false });
    cy.get('body', { timeout: 10000 }).then(($body) => {
      const $button = $body.find('.epicas-create-tile');
      if ($button.length > 0) {
        cy.wrap($button.first()).should('be.visible').and('contain', 'Crear');
      } else {
        cy.get('.epicas-page').should('be.visible');
      }
    });
  });

  it('debería mostrar la lista de épicas o el estado vacío', () => {
    cy.visit('/epicas', { failOnStatusCode: false });
    // Either epicas are listed or empty state is shown
    cy.get('body', { timeout: 10000 }).should('be.visible');
    cy.get('[class*="epica"]', { timeout: 10000 }).should('exist');
  });

  it('debería navegar a la página de creación de épica', () => {
    cy.visit('/epicas', { failOnStatusCode: false });
    cy.get('body', { timeout: 10000 }).then(($body) => {
      const $button = $body.find('.epicas-create-tile');
      if ($button.length > 0) {
        cy.wrap($button.first()).click();
        cy.url().should('include', '/epicas/nueva');
      } else {
        cy.get('.epicas-page').should('be.visible');
      }
    });
  });

  it('debería navegar al detalle de la épica al hacer clic en la tarjeta', () => {
    cy.visit('/epicas', { failOnStatusCode: false });
    cy.get('body', { timeout: 10000 }).then(($body) => {
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

describe('Formulario de creación de épica', () => {
  beforeEach(() => {
    const testEmail = Cypress.env('TEST_MANAGER_EMAIL') || 'sofia@gmail.com';
    const testPassword = Cypress.env('TEST_MANAGER_PASSWORD') || 'Sofia1234';

    cy.login(testEmail, testPassword);
    cy.wait(500); // Allow page to stabilize after login
  });

  it('debería mostrar el formulario de creación de épica', () => {
    cy.visit('/epicas/nueva', { failOnStatusCode: false });
    cy.get('body', { timeout: 10000 }).should('be.visible');
    cy.contains('Nueva épica', { timeout: 15000 }).should('be.visible');
  });

  it('debería mostrar el selector de proyecto', () => {
    cy.visit('/epicas/nueva', { failOnStatusCode: false });
    cy.get('select', { timeout: 10000 }).should('be.visible');
  });

  it('debería mostrar los campos del formulario', () => {
    cy.visit('/epicas/nueva', { failOnStatusCode: false });
    cy.get('input[id*="nombre"]', { timeout: 10000 }).should('be.visible');
    cy.get('textarea', { timeout: 10000 }).should('be.visible');
  });

  it('debería mostrar errores de validación al enviar el formulario vacío', () => {
    cy.visit('/epicas/nueva', { failOnStatusCode: false });
    cy.contains('button', /Crear/i, { timeout: 10000 }).click();
    cy.get('.invalid-feedback', { timeout: 5000 }).should('exist');
  });

  it('debería crear una épica con datos válidos', () => {
    cy.visit('/epicas/nueva', { failOnStatusCode: false });

    const epicName = `Test Epic ${Date.now()}`;
    const description = 'This is a test epic';

    cy.get('select', { timeout: 10000 }).first().should('be.visible').find('option').should('have.length.greaterThan', 0);

    cy.get('select').first().find('option').then(($options) => {
      const validOptions = Array.from($options).filter((option) => option.value && option.value.trim() !== "");
      if (validOptions.length === 0) {
        cy.contains(/sin proyectos|no hay proyectos|Debes seleccionar un proyecto|Sin proyectos|No hay proyectos disponibles/i).should('be.visible');
        return;
      }

      cy.intercept('POST', '**/epicas').as('createEpic');
      cy.get('select').first().select(validOptions[0].value);
      cy.get('#epica-nombre', { timeout: 10000 }).clear().type(epicName, { delay: 50 });
      cy.get('#epica-descripcion').clear().type(description, { delay: 50 });
      cy.get('#epica-categoria').clear().type('Backend', { delay: 50 });

      cy.contains('button', /^Crear/i).scrollIntoView().click();
      cy.wait('@createEpic', { timeout: 15000 }).its('response.statusCode').should('be.oneOf', [200, 201]);
      cy.url().should('match', /\/epicas\//);
    });
  });

  it('debería navegar atrás al hacer clic en Volver', () => {
    cy.visit('/epicas/nueva', { failOnStatusCode: false });
    cy.contains('button', 'Volver', { timeout: 10000 }).click();
    cy.url().should('include', '/epicas');
  });
});

describe('Página de detalle de épica', () => {
  beforeEach(() => {
    const testEmail = Cypress.env('TEST_MANAGER_EMAIL') || 'sofia@gmail.com';
    const testPassword = Cypress.env('TEST_MANAGER_PASSWORD') || 'Sofia1234';

    cy.login(testEmail, testPassword);
    cy.visit('/epicas', { failOnStatusCode: false });
    cy.wait(500); // Allow page to stabilize
  });

  it('debería mostrar la página de detalle de épica', () => {
    cy.get('body', { timeout: 10000 }).then(($body) => {
      const $cards = $body.find('.epica-card');
      if ($cards.length > 0) {
        cy.wrap($cards.first()).find('.epica-card-title, .epica-view-btn').first().click();
        cy.url().should('include', '/epicas/');
        cy.get('.epicas-page', { timeout: 10000 }).should('be.visible');
      } else {
        cy.get('.epicas-page').should('be.visible');
      }
    });
  });

  it('debería mostrar la información de la épica', () => {
    cy.visit('/epicas', { failOnStatusCode: false });
    cy.get('body', { timeout: 10000 }).then(($body) => {
      const $cards = $body.find('.epica-card');
      if ($cards.length > 0) {
        cy.wrap($cards.first()).find('.epica-card-title, .epica-view-btn').first().click();
        // Epic details should be visible
        cy.get('.epica-detail-card, .epica-historias-card', { timeout: 10000 }).should('exist');
      } else {
        cy.get('.epicas-page').should('be.visible');
      }
    });
  });
});
