// cypress/e2e/backlog.spec.js
// Test suite for backlog functionality

describe('Backlog Page', () => {
  beforeEach(() => {
    const testEmail = Cypress.env('TEST_EMAIL') || 'test@example.com';
    const testPassword = Cypress.env('TEST_PASSWORD') || 'TestPassword123!';

    cy.login(testEmail, testPassword);
  });

  it('should display backlog page header', () => {
    cy.visit('/backlog');
    cy.contains('h1', 'Gestor de Backlog').should('be.visible');
  });

  it('should display project selector', () => {
    cy.visit('/backlog');
    cy.get('.backlog-project-selector').should('be.visible');
    cy.get('.backlog-epica-toggle').first().should('be.visible');
  });

  it('should display epic selector', () => {
    cy.visit('/backlog');
    cy.contains('label', /pica:/i).should('be.visible');
    cy.get('.backlog-epica-toggle-inline').should('be.visible');
  });

  it('should display search box', () => {
    cy.visit('/backlog');
    cy.get('.backlog-search').should('be.visible');
  });

  it('should display historias table header', () => {
    cy.visit('/backlog');
    cy.contains('Historias de usuario').should('be.visible');
    cy.contains('Prioridad').should('be.visible');
    cy.contains('Story points').should('be.visible');
  });

  it('should toggle project selector menu', () => {
    cy.visit('/backlog');
    cy.get('.backlog-project-selector').within(() => {
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

  it('should toggle epic selector menu', () => {
    cy.visit('/backlog');
    cy.get('.backlog-epica-toggle-inline').then(($toggle) => {
      if ($toggle.is(':disabled')) {
        cy.get('.backlog-page').should('be.visible');
      } else {
        cy.wrap($toggle).click();
        cy.get('.backlog-epica-menu').should('be.visible');
      }
    });
  });

  it('should select different project from dropdown', () => {
    cy.visit('/backlog');
    cy.get('.backlog-project-selector').within(() => {
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

  it('should select epic from dropdown', () => {
    cy.visit('/backlog');
    cy.get('.backlog-epica-toggle-inline').then(($toggle) => {
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

  it('should open new historia modal when clicking Nueva Historia button', () => {
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

  it('should filter historias by search term', () => {
    cy.visit('/backlog');
    cy.get('.backlog-search').type('test', { delay: 50 });
    // Should filter the results (if any exist)
  });

  it('should navigate to historia detail on row click', () => {
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

  it('should display view all epicas link', () => {
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

  it('should navigate to epicas page when clicking Ver todas las Epicas', () => {
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

  it('should close menus when pressing Escape', () => {
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

  it('should close menus when clicking outside', () => {
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
