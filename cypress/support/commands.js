// cypress/support/commands.js
// Custom Cypress commands for ScrumTrack

// Login command using a fresh browser state for each authentication attempt
Cypress.Commands.add('login', (email, password) => {
  cy.clearCookies();
  cy.clearLocalStorage();
  cy.window().then((win) => win.sessionStorage.clear());

  cy.intercept('POST', '**/auth/login').as('loginRequest');
  cy.visit('/login');
  cy.get('#correo').clear().type(email, { delay: 50 });
  cy.get('#password').clear().type(password, { delay: 50 });
  cy.get('.login-btn').click();
  cy.wait('@loginRequest').its('response.statusCode').should('be.oneOf', [200, 201]);
  cy.location('pathname', { timeout: 10000 }).should('eq', '/perfil');
});

// Logout command
Cypress.Commands.add('logout', () => {
  // This would need to be implemented based on the logout UI
  cy.visit('/login');
  localStorage.clear();
  sessionStorage.clear();
});

// Create project command
Cypress.Commands.add('createProject', (projectName, description = '') => {
  cy.visit('/crear-proyecto-form');
  cy.contains('Crear Proyecto').should('be.visible');
  cy.get('#nombreProyecto').type(projectName, { delay: 50 });
  cy.get('#descripcionProyecto').type(description || 'Proyecto creado desde Cypress', { delay: 50 });
  cy.get('.dropdown-input').type('Desarrollo de software', { delay: 50 });
  cy.contains('.custom-dropdown-item', 'Desarrollo de software').click();
  cy.get('#teamSize').type('5');
  cy.get('#fechaInicio').type('2026-06-18');
  cy.get('#fechaFinEst').type('2026-07-18');
  cy.contains('button', /^Crear$/).click();
  cy.url().should('include', '/proyectos');
});

// Navigate to backlog command
Cypress.Commands.add('goToBacklog', (projectId = null) => {
  if (projectId) {
    cy.visit(`/backlog?id_proyecto=${projectId}`);
  } else {
    cy.visit('/backlog');
  }
});

// Navigate to sprints command
Cypress.Commands.add('goToSprints', (projectId = null) => {
  if (projectId) {
    cy.visit(`/sprints?id_proyecto=${projectId}`);
  } else {
    cy.visit('/sprints');
  }
});

// Select project command
Cypress.Commands.add('selectProject', (projectName) => {
  cy.contains('button', projectName).should('be.visible').click({ force: true });
});
