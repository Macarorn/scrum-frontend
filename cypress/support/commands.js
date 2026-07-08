// cypress/support/commands.js
// Custom Cypress commands for ScrumTrack

// Login command - always perform fresh authentication for consistency
Cypress.Commands.add('login', (email, password) => {
  cy.log('Performing fresh login for ' + email);
  
  // Always clear storage to ensure fresh session
  cy.window().then((win) => {
    win.localStorage.clear();
    win.sessionStorage.clear();
  });
  cy.clearCookies();

  cy.intercept('POST', '**/auth/login').as('loginRequest');
  cy.visit('/login', { failOnStatusCode: false });
  
  // Wait for login page to be fully loaded with generous timeout
  cy.get('#correo', { timeout: 15000 }).should('be.visible').then(() => {
    // Use alias pattern to avoid requery issues
    cy.get('#correo').as('emailField');
    cy.get('@emailField').clear();
    cy.get('@emailField').type(email, { delay: 100 });
  });

  cy.get('#password', { timeout: 10000 }).as('passwordField');
  cy.get('@passwordField').clear();
  cy.get('@passwordField').type(password, { delay: 100 });
  
  cy.get('.login-btn', { timeout: 10000 }).click();
  
  // Wait for login request and validate response
  cy.wait('@loginRequest', { timeout: 20000 })
    .its('response.statusCode')
    .should('be.oneOf', [200, 201]);
  
  // Wait for redirect to profile page
  cy.location('pathname', { timeout: 15000 }).should('eq', '/perfil');
  
  // Wait for profile page to be fully loaded
  cy.get('body', { timeout: 10000 }).should('be.visible');
  
  // Extra wait to ensure all API calls are done
  cy.wait(1000);
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
