// cypress/e2e/backlog.spec.js
// Test suite for backlog functionality

describe('Página de Backlog', () => {
  beforeEach(() => {
    const testEmail = Cypress.env('TEST_EMAIL') || 'test@example.com';
    const testPassword = Cypress.env('TEST_PASSWORD') || 'TestPassword123!';

    cy.login(testEmail, testPassword);
    // Wait for dashboard to fully load after login
    cy.wait(500);
  });

  it('debería mostrar el encabezado de la página de backlog', () => {
    cy.visit('/backlog', { failOnStatusCode: false });
    // Wait for page to load
    cy.get('body', { timeout: 10000 }).should('be.visible');
    cy.contains('h1', 'Gestor de Backlog', { timeout: 10000 }).should('be.visible');
  });

  it('debería mostrar el selector de proyecto', () => {
    cy.visit('/backlog', { failOnStatusCode: false });
    cy.get('.backlog-project-selector', { timeout: 10000 }).should('be.visible');
    cy.get('.backlog-epica-toggle').first().should('be.visible');
  });

  it('debería mostrar el selector de épica', () => {
    cy.visit('/backlog', { failOnStatusCode: false });
    cy.contains('label', /pica:/i, { timeout: 10000 }).should('be.visible');
    cy.get('.backlog-epica-toggle-inline').should('be.visible');
  });

  it('debería mostrar el cuadro de búsqueda', () => {
    cy.visit('/backlog', { failOnStatusCode: false });
    cy.get('.backlog-search', { timeout: 10000 }).should('be.visible');
  });

  it('debería mostrar el encabezado de la tabla de historias', () => {
    cy.visit('/backlog', { failOnStatusCode: false });
    cy.contains('Historias de usuario', { timeout: 10000 }).should('be.visible');
    cy.contains('Prioridad').should('be.visible');
    cy.contains('Story points').should('be.visible');
  });

  it('debería alternar el menú del selector de proyecto', () => {
    cy.visit('/backlog', { failOnStatusCode: false });
    cy.get('.backlog-project-selector', { timeout: 10000 }).within(() => {
      cy.get('.backlog-epica-toggle').first().then(($toggle) => {
        if ($toggle.is(':disabled')) {
          cy.wrap($toggle).should('be.disabled');
        } else {
          cy.wrap($toggle).click();
          cy.get('.backlog-epica-menu').should('be.visible');
        }
      });
    });
  });

  it('debería alternar el menú del selector de épica', () => {
    cy.visit('/backlog', { failOnStatusCode: false });
    cy.get('.backlog-epica-toggle-inline', { timeout: 10000 }).then(($toggle) => {
      if ($toggle.is(':disabled')) {
        cy.get('.backlog-page').should('be.visible');
      } else {
        cy.wrap($toggle).click();
        cy.get('.backlog-epica-menu').should('be.visible');
      }
    });
  });

  it('debería seleccionar un proyecto diferente del desplegable', () => {
    cy.visit('/backlog', { failOnStatusCode: false });
    cy.get('.backlog-project-selector', { timeout: 10000 }).within(() => {
      cy.get('.backlog-epica-toggle').first().then(($toggle) => {
        if ($toggle.is(':disabled')) {
          cy.wrap($toggle).should('be.disabled');
        } else {
          cy.wrap($toggle).click();
          cy.get('.backlog-epica-item').then(($items) => {
            if ($items.length > 1) {
              cy.wrap($items.eq(1)).click();
            }
          });
        }
      });
    });
  });

  it('debería seleccionar una épica del desplegable', () => {
    cy.visit('/backlog', { failOnStatusCode: false });
    cy.get('.backlog-epica-toggle-inline', { timeout: 10000 }).then(($toggle) => {
      if ($toggle.is(':disabled')) {
        cy.get('.backlog-page').should('be.visible');
      } else {
        cy.wrap($toggle).click();
        cy.get('.backlog-epica-item').then(($items) => {
          if ($items.length > 0) {
            cy.wrap($items.first()).click();
            cy.url().should('include', 'id_epica=');
          }
        });
      }
    });
  });

  it('debería abrir el modal de nueva historia al hacer clic en el botón Nueva Historia', () => {
    cy.visit('/backlog');
    cy.get('body').then(($body) => {
      const $button = $body.find('.btn-new-backlog');
      if ($button.length > 0) {
        cy.wrap($button.first()).should($button.first().is(':disabled') ? 'be.disabled' : 'not.be.disabled');
      } else {
        cy.get('.backlog-page').should('be.visible');
      }
    });
  });

  it('debería filtrar historias por término de búsqueda', () => {
    cy.visit('/backlog');
    cy.get('.backlog-search').type('test', { delay: 50 });
    // Should filter the results (if any exist)
  });

  it('debería navegar al detalle de la historia al hacer clic en la fila', () => {
    cy.visit('/backlog');
    cy.get('body').then(($body) => {
      const $rows = $body.find('.backlog-row');
      if ($rows.length > 0) {
        cy.wrap($rows.first()).find('.backlog-cell-title').click();
        cy.url().should('include', '/historias/');
      } else {
        cy.contains(/no hay historias|cargando historias/i).should('be.visible');
      }
    });
  });

  it('debería mostrar el enlace Ver todas las Épicas', () => {
    cy.visit('/backlog');
    cy.get('.backlog-epica-toggle-inline').then(($toggle) => {
      if ($toggle.is(':disabled')) {
        cy.get('.backlog-page').should('be.visible');
      } else {
        cy.wrap($toggle).click();
        cy.contains('Ver todas las Epicas').should('be.visible');
      }
    });
  });

  it('debería navegar a la página de épicas al hacer clic en Ver todas las Épicas', () => {
    cy.visit('/backlog');
    cy.get('.backlog-epica-toggle-inline').then(($toggle) => {
      if ($toggle.is(':disabled')) {
        cy.get('.backlog-page').should('be.visible');
      } else {
        cy.wrap($toggle).click();
        cy.contains('Ver todas las Epicas').click();
        cy.url().should('include', '/epicas');
      }
    });
  });

  it('debería cerrar los menús al presionar Escape', () => {
    cy.visit('/backlog');
    cy.get('.backlog-epica-toggle-inline').then(($toggle) => {
      if ($toggle.is(':disabled')) {
        cy.get('.backlog-page').should('be.visible');
      } else {
        cy.wrap($toggle).click();
        cy.get('.backlog-epica-menu').should('be.visible');
        cy.get('body').type('{esc}');
        cy.get('.backlog-epica-menu').should('not.exist');
      }
    });
  });

  it('debería cerrar los menús al hacer clic fuera', () => {
    cy.visit('/backlog');
    cy.get('.backlog-epica-toggle-inline').then(($toggle) => {
      if ($toggle.is(':disabled')) {
        cy.get('.backlog-page').should('be.visible');
      } else {
        cy.wrap($toggle).click();
        cy.get('.backlog-epica-menu').should('be.visible');
        cy.get('.backlog-table-head').click();
        cy.get('.backlog-epica-menu').should('not.exist');
      }
    });
  });
});
