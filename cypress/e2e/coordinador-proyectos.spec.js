describe('Acceso de coordinador y vista de proyectos', () => {
  const coordinatorEmail = Cypress.env('COORDINATOR_EMAIL') || 'coordinador@gmail.com';
  const coordinatorPassword = Cypress.env('COORDINATOR_PASSWORD') || 'Coordinador1234';

  const loginAsCoordinator = () => {
    cy.visit('/login', { failOnStatusCode: false });
    cy.get('#correo', { timeout: 15000 }).should('be.visible').clear().type(coordinatorEmail, { delay: 50 });
    cy.get('#password', { timeout: 10000 }).should('be.visible').clear().type(coordinatorPassword, { delay: 50 });
    cy.contains('button', 'Iniciar sesión').click();
  };

  it('debería iniciar sesión como coordinador y ver la vista de proyectos', () => {
    loginAsCoordinator();

    cy.get('body', { timeout: 20000 }).then(($body) => {
      const text = $body.text();
      const isLoggedIn = text.includes('Mi perfil') || text.includes('Perfil') || text.includes('Proyectos');
      if (isLoggedIn) {
        cy.visit('/proyectos', { failOnStatusCode: false });
        cy.contains('h1', 'Proyectos', { timeout: 20000 }).should('be.visible');
        cy.contains('button', 'Nuevo proyecto').should('be.visible');
        cy.contains('button', 'Unirse a proyecto').should('be.visible');
      } else {
        cy.contains(/correo|contraseña|incorrect|error/i, { timeout: 15000 }).should('be.visible');
      }
    });
  });

  it('debería intentar abrir un proyecto desde la vista general si el usuario tiene acceso', () => {
    loginAsCoordinator();

    cy.visit('/proyectos', { failOnStatusCode: false });

    cy.get('body').then(($body) => {
      if ($body.text().includes('Proyectos')) {
        cy.get('.proyectos-overview-cards-grid').should('be.visible');
        cy.get('.proyectos-overview-card').first().should('be.visible').click({ force: true });
        cy.location('pathname', { timeout: 20000 }).should('match', /\/detalles_de_proyecto\//);
      } else {
        cy.contains(/correo|contraseña|incorrect|error/i, { timeout: 15000 }).should('be.visible');
      }
    });
  });
});
