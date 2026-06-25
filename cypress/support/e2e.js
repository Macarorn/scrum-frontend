// cypress/support/e2e.js
// Cypress support file

// Import commands
import './commands';

// Global test data
export const TEST_USER = {
  email: 'test@example.com',
  password: 'TestPassword123!',
  nombre: 'Test User'
};

// Global helper functions
export const waitForApi = () => {
  cy.intercept('GET', '**/api/**').as('apiGet');
  cy.intercept('POST', '**/api/**').as('apiPost');
  cy.wait('@apiGet');
};

// Cypress configuration
Cypress.on('uncaught:exception', (err) => {
  // Ignore errors we don't want to fail the test
  if (err.message.includes('ResizeObserver loop limit exceeded')) {
    return false;
  }
  return true;
});
