// cypress/e2e/historias.spec.js
// Test suite for historias (user stories) functionality

describe('Historia Detail Page', () => {
  beforeEach(() => {
    const testEmail = Cypress.env('TEST_MANAGER_EMAIL') || 'sofia@gmail.com';
    const testPassword = Cypress.env('TEST_MANAGER_PASSWORD') || 'Sofia1234';

    cy.login(testEmail, testPassword);
  });

  it('should navigate to historia detail from backlog', () => {
    cy.visit('/backlog');

    cy.get('body').then(($body) => {
      const $rows = $body.find('.backlog-row');
      if ($rows.length > 0) {
        cy.wrap($rows.first()).find('.backlog-cell-title').click();
        cy.url().should('include', '/historias/');
        cy.get('[role="main"]').should('be.visible');
      } else {
        cy.contains(/no hay historias|cargando historias|sin proyecto|sin proyectos/i).should('be.visible');
      }
    });
  });

  it('should display historia information', () => {
    cy.visit('/backlog');

    cy.get('body').then(($body) => {
      const $rows = $body.find('.backlog-row');
      if ($rows.length > 0) {
        cy.wrap($rows.first()).find('.backlog-cell-title').click();
        cy.url().should('include', '/historias/');
        cy.get('[class*="historia"], [class*="detail"]').should('be.visible');
      } else {
        cy.contains(/no hay historias|cargando historias|sin proyecto|sin proyectos/i).should('be.visible');
      }
    });
  });

  it('should display acceptance criteria', () => {
    cy.visit('/backlog');

    cy.get('body').then(($body) => {
      const $rows = $body.find('.backlog-row');
      if ($rows.length > 0) {
        cy.wrap($rows.first()).find('.backlog-cell-title').click();
        cy.get('[class*="criteria"], [class*="requirement"]').should('exist');
      } else {
        cy.contains(/no hay historias|cargando historias|sin proyecto|sin proyectos/i).should('be.visible');
      }
    });
  });

  it('should display tasks/subtasks for historia', () => {
    cy.visit('/backlog');

    cy.get('body').then(($body) => {
      const $rows = $body.find('.backlog-row');
      if ($rows.length > 0) {
        cy.wrap($rows.first()).find('.backlog-cell-title').click();
        cy.get('[class*="tarea"], [class*="task"]').should('exist');
      } else {
        cy.contains(/no hay historias|cargando historias|sin proyecto|sin proyectos/i).should('be.visible');
      }
    });
  });

  it('should allow navigation back to backlog', () => {
    cy.visit('/backlog');

    cy.get('body').then(($body) => {
      const $rows = $body.find('.backlog-row');
      if ($rows.length > 0) {
        cy.wrap($rows.first()).find('.backlog-cell-title').click();
        cy.url().should('include', '/historias/');

        cy.contains('button', 'Volver').then(($button) => {
          if ($button.length > 0) {
            cy.wrap($button).click();
            cy.url().should('include', '/backlog');
          }
        });
      } else {
        cy.contains(/no hay historias|cargando historias|sin proyecto|sin proyectos/i).should('be.visible');
      }
    });
  });
});

describe('Create Historia', () => {
  beforeEach(() => {
    const testEmail = Cypress.env('TEST_MANAGER_EMAIL') || 'sofia@gmail.com';
    const testPassword = Cypress.env('TEST_MANAGER_PASSWORD') || 'Sofia1234';

    cy.login(testEmail, testPassword);
  });

  it('should open create historia modal from backlog', () => {
    cy.visit('/backlog');

    cy.get('.backlog-epica-toggle-inline', { timeout: 20000 })
      .should('not.be.disabled')
      .click();

    cy.get('.backlog-epica-item', { timeout: 20000 })
      .first()
      .click();

    cy.get('.btn-new-backlog', { timeout: 20000 })
      .should('not.be.disabled')
      .click();

    cy.get('.backlog-modal', { timeout: 10000 }).should('be.visible');
    cy.contains('.backlog-modal', /Nueva historia/i).should('be.visible');
  });

  it('should fill and submit create historia form', () => {
    cy.visit('/backlog');

    cy.get('body').then(($body) => {
      const openForm = () => {
        cy.get('.btn-new-backlog').should('not.be.disabled').click();
      };

      if ($body.find('.btn-new-backlog:not(:disabled)').length > 0) {
        openForm();
      } else if ($body.find('.backlog-epica-toggle-inline:not(:disabled), .backlog-epica-toggle:not(:disabled)').length > 0) {
        cy.get('.backlog-epica-toggle-inline, .backlog-epica-toggle').first().click();
        cy.get('.backlog-epica-item', { timeout: 10000 }).first().click();
        openForm();
      } else {
        cy.contains(/no hay epicas|sin epicas|cargando epicas|Sin proyecto|No hay proyectos disponibles|No hay historias para mostrar|Crea la primera épica de tu proyecto/i).should('be.visible');
        return;
      }

      const historiaName = `Test Historia ${Date.now()}`;
      const description = 'As a user, I want to test this feature';

      cy.get('.backlog-modal').should('be.visible');
      cy.intercept('POST', '**/historias').as('createHistoria');
      cy.get('#historia-nombre').clear().type(historiaName, { delay: 50 });
      cy.get('#historia-descripcion').clear().type(description, { delay: 50 });
      cy.contains('.backlog-modal button', /^Guardar$/).should('not.be.disabled').click();
      cy.wait('@createHistoria').its('response.statusCode').should('be.oneOf', [200, 201]);
      cy.contains('.backlog-row, .backlog-list, body', historiaName).should('be.visible');
    });
  });
});

describe('Edit Historia', () => {
  beforeEach(() => {
    const testEmail = Cypress.env('TEST_MANAGER_EMAIL') || 'sofia@gmail.com';
    const testPassword = Cypress.env('TEST_MANAGER_PASSWORD') || 'Sofia1234';

    cy.login(testEmail, testPassword);
  });

  it('should display edit button on historia detail', () => {
    cy.visit('/backlog');

    cy.get('body').then(($body) => {
      const $rows = $body.find('.backlog-row');
      if ($rows.length > 0) {
        cy.wrap($rows.first()).find('.backlog-cell-title').click();
        cy.url().should('include', '/historias/');
        cy.contains('button', 'Editar').should('exist');
      } else {
        cy.contains(/no hay historias|cargando historias|sin proyecto|sin proyectos/i).should('be.visible');
      }
    });
  });

  it('should enable edit mode when clicking edit button', () => {
    cy.visit('/backlog');

    cy.get('body').then(($body) => {
      const $rows = $body.find('.backlog-row');
      if ($rows.length > 0) {
        cy.wrap($rows.first()).find('.backlog-cell-title').click();
        cy.contains('button', 'Editar').then(($button) => {
          if ($button.length > 0) {
            cy.wrap($button).click();
            cy.get('input, textarea').first().should('not.be.disabled');
          }
        });
      } else {
        cy.contains(/no hay historias|cargando historias|sin proyecto|sin proyectos/i).should('be.visible');
      }
    });
  });
});

describe('Historia Priority and Story Points', () => {
  beforeEach(() => {
    const testEmail = Cypress.env('TEST_MANAGER_EMAIL') || 'sofia@gmail.com';
    const testPassword = Cypress.env('TEST_MANAGER_PASSWORD') || 'Sofia1234';

    cy.login(testEmail, testPassword);
  });

  it('should display priority in backlog list', () => {
    cy.visit('/backlog');

    cy.get('body').then(($body) => {
      const $rows = $body.find('.backlog-row');
      if ($rows.length > 0) {
        cy.wrap($rows.first()).find('.backlog-pill-priority').should('be.visible');
      } else {
        cy.contains(/no hay historias|cargando historias|sin proyecto|sin proyectos/i).should('be.visible');
      }
    });
  });

  it('should display story points in backlog list', () => {
    cy.visit('/backlog');

    cy.get('body').then(($body) => {
      const $rows = $body.find('.backlog-row');
      if ($rows.length > 0) {
        cy.wrap($rows.first()).find('.backlog-pill-points').should('be.visible');
      } else {
        cy.contains(/no hay historias|cargando historias|sin proyecto|sin proyectos/i).should('be.visible');
      }
    });
  });
});
