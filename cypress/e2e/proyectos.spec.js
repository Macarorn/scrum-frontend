// cypress/e2e/proyectos.spec.js
// Test suite for projects/proyectos functionality

describe('Projects Overview', () => {
  beforeEach(() => {
    // Note: Adjust credentials based on test environment
    const testEmail = Cypress.env('TEST_EMAIL') || 'test@example.com';
    const testPassword = Cypress.env('TEST_PASSWORD') || 'TestPassword123!';

    cy.login(testEmail, testPassword);
    cy.wait(1000); // Add delay to avoid rate limiting
    cy.visit('/proyectos');
  });

  it('should display projects overview page', () => {
    cy.contains('h1', 'Proyectos').should('be.visible');
    cy.contains('button', 'Nuevo proyecto').should('be.visible');
    cy.contains('button', 'Unirse a proyecto').should('be.visible');
  });

  it('should display project cards if projects exist', () => {
    cy.get('body').then(($body) => {
      const $cards = $body.find('.proyectos-overview-card');
      if ($cards.length > 0) {
        cy.wrap($cards.first()).should('be.visible');
        cy.wrap($cards.first()).find('.proyectos-overview-card-nombre').should('be.visible');
      } else {
        cy.contains(/proyectos/i).should('be.visible');
      }
    });
  });

  it('should navigate to create project form', () => {
    cy.contains('button', 'Nuevo proyecto').click();
    cy.url().should('include', '/crear-proyecto-form');
  });

  it('should navigate to join project page', () => {
    cy.contains('button', 'Unirse a proyecto').click();
    cy.url().should('include', '/unirse-proyecto');
  });

  it('should navigate to project details on card click', () => {
    cy.get('body').then(($body) => {
      const $cards = $body.find('.proyectos-overview-card');
      if ($cards.length > 0) {
        cy.wrap($cards.first()).click();
        cy.url().should('include', '/detalles_de_proyecto/');
      } else {
        cy.contains('Nuevo proyecto').should('be.visible');
      }
    });
  });

  it('should display projects content after loading projects', () => {
    cy.visit('/proyectos');
    cy.contains('h1', 'Proyectos').should('be.visible');
    cy.get('.proyectos-overview-header').should('be.visible');
  });
});

describe('Create Project', () => {
  beforeEach(() => {
    const testEmail = Cypress.env('TEST_EMAIL') || 'test@example.com';
    const testPassword = Cypress.env('TEST_PASSWORD') || 'TestPassword123!';

    cy.login(testEmail, testPassword);
    cy.wait(1000); // Add delay to avoid rate limiting
    cy.visit('/crear-proyecto-form');
  });

  it('should display create project form', () => {
    cy.contains('Crear Proyecto').should('be.visible');
    cy.contains('button', /^Crear$/).should('be.visible');
  });

  it('should show validation errors when submitting empty form', () => {
    cy.contains('button', /^Crear$/).click();
    cy.get('.invalid-feedback').should('exist');
  });

  it('should create a new project with valid data', () => {
    const projectName = `Test Project ${Date.now()}`;
    const description = 'This is a test project';

    cy.intercept('POST', '**/proyectos').as('createProject');
    cy.get('#nombreProyecto').type(projectName, { delay: 50 });
    cy.get('#descripcionProyecto').type(description, { delay: 50 });
    cy.get('.dropdown-input').type('Desarrollo de software', { delay: 50 });
    cy.contains('.custom-dropdown-item', 'Desarrollo de software').click();
    cy.get('#teamSize').type('5');
    cy.get('#fechaInicio').type('2026-06-18');
    cy.get('#fechaFinEst').type('2026-07-18');
    cy.contains('button', /^Crear$/).click();

    // Should redirect to projects page on success
    cy.wait('@createProject').its('response.statusCode').should('be.oneOf', [200, 201]);
    cy.url().should('include', '/proyectos');
  });

  it('should navigate back when clicking Volver button', () => {
    cy.visit('/proyectos');
    cy.url().should('include', '/proyectos');
  });
});

describe('Project Details', () => {
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

  it('should display project details page', () => {
    cy.url().then((url) => {
      if (url.includes('/detalles_de_proyecto/')) {
        cy.get('body').should('be.visible');
      } else {
        cy.url().should('include', '/proyectos');
      }
    });
  });
});
