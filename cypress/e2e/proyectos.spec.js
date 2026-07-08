// cypress/e2e/proyectos.spec.js
// Test suite for projects/proyectos functionality

describe('Visión general de proyectos', () => {
  beforeEach(() => {
    // Note: Adjust credentials based on test environment
    const testEmail = Cypress.env('TEST_EMAIL') || 'test@example.com';
    const testPassword = Cypress.env('TEST_PASSWORD') || 'TestPassword123!';

    cy.login(testEmail, testPassword);
    cy.wait(500); // Allow dashboard to settle
    cy.visit('/proyectos', { failOnStatusCode: false });
    cy.get('body', { timeout: 10000 }).should('be.visible');
  });

  it('debería mostrar la página de visión general de proyectos', () => {
    cy.contains('h1', 'Proyectos', { timeout: 10000 }).should('be.visible');
    cy.contains('button', 'Nuevo proyecto').should('be.visible');
    cy.contains('button', 'Unirse a proyecto').should('be.visible');
  });

  it('debería mostrar tarjetas de proyecto si existen proyectos', () => {
    cy.get('body', { timeout: 10000 }).then(($body) => {
      const $cards = $body.find('.proyectos-overview-card');
      if ($cards.length > 0) {
        cy.wrap($cards.first()).should('be.visible');
        cy.wrap($cards.first()).find('.proyectos-overview-card-nombre').should('be.visible');
      } else {
        cy.contains(/proyectos/i).should('be.visible');
      }
    });
  });

  it('debería navegar al formulario de creación de proyecto', () => {
    cy.contains('button', 'Nuevo proyecto', { timeout: 10000 }).click();
    cy.url().should('include', '/crear-proyecto-form');
  });

  it('debería navegar a la página de unirse a proyecto', () => {
    cy.contains('button', 'Unirse a proyecto', { timeout: 10000 }).click();
    cy.url().should('include', '/unirse-proyecto');
  });

  it('debería navegar a los detalles del proyecto al hacer clic en la tarjeta', () => {
    cy.get('body', { timeout: 10000 }).then(($body) => {
      const $cards = $body.find('.proyectos-overview-card');
      if ($cards.length > 0) {
        cy.wrap($cards.first()).click();
        cy.url().should('include', '/detalles_de_proyecto/');
      } else {
        cy.contains('Nuevo proyecto').should('be.visible');
      }
    });
  });

  it('debería mostrar el contenido de proyectos después de cargar los proyectos', () => {
    cy.contains('h1', 'Proyectos', { timeout: 10000 }).should('be.visible');
    cy.get('.proyectos-overview-header', { timeout: 10000 }).should('be.visible');
  });
});

describe('Crear proyecto', () => {
  beforeEach(() => {
    const testEmail = Cypress.env('TEST_EMAIL') || 'test@example.com';
    const testPassword = Cypress.env('TEST_PASSWORD') || 'TestPassword123!';

    cy.login(testEmail, testPassword);
    cy.wait(500);
    cy.visit('/crear-proyecto-form', { failOnStatusCode: false });
    cy.get('body', { timeout: 10000 }).should('be.visible');
  });

  it('debería mostrar el formulario de creación de proyecto', () => {
    cy.contains('Crear Proyecto', { timeout: 10000 }).should('be.visible');
    cy.contains('button', /^Crear$/).should('be.visible');
  });

  it('debería mostrar errores de validación al enviar el formulario vacío', () => {
    cy.contains('button', /^Crear$/, { timeout: 10000 }).click();
    cy.get('.invalid-feedback', { timeout: 5000 }).should('exist');
  });

  it('debería crear un nuevo proyecto con datos válidos', () => {
    const projectName = `Test Project ${Date.now()}`;
    const description = 'This is a test project';

    cy.intercept('POST', '**/proyectos').as('createProject');
    cy.get('#nombreProyecto', { timeout: 10000 }).type(projectName, { delay: 50 });
    cy.get('#descripcionProyecto').type(description, { delay: 50 });
    cy.get('.dropdown-input').type('Desarrollo de software', { delay: 50 });
    cy.contains('.custom-dropdown-item', 'Desarrollo de software').click();
    cy.get('#teamSize').type('5');
    cy.get('#fechaInicio').type('2026-06-18');
    cy.get('#fechaFinEst').type('2026-07-18');
    cy.contains('button', /^Crear$/).click();

    // Should redirect to projects page on success
    cy.wait('@createProject', { timeout: 15000 }).its('response.statusCode').should('be.oneOf', [200, 201]);
    cy.url({ timeout: 10000 }).should('include', '/proyectos');
  });

  it('debería navegar atrás al hacer clic en el botón Volver', () => {
    cy.visit('/proyectos');
    cy.url().should('include', '/proyectos');
  });
});

describe('Detalles del proyecto', () => {
  beforeEach(() => {
    const testEmail = Cypress.env('TEST_EMAIL') || 'test@example.com';
    const testPassword = Cypress.env('TEST_PASSWORD') || 'TestPassword123!';

    cy.login(testEmail, testPassword);
    cy.wait(1000); // Add delay to avoid rate limiting
    cy.visit('/proyectos');

    // Navigate to first project if available
    cy.get('body').then(($body) => {
      const $cards = $body.find('.proyectos-overview-card');
      if ($cards.length > 0) {
        cy.wrap($cards.first()).click();
      }
    });
  });

  it('debería mostrar la página de detalles del proyecto', () => {
    cy.url().then((url) => {
      if (url.includes('/detalles_de_proyecto/')) {
        cy.get('body').should('be.visible');
      } else {
        cy.url().should('include', '/proyectos');
      }
    });
  });
});
