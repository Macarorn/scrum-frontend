// cypress/e2e/login.spec.js
// Test suite for login functionality

describe('Login Page', () => {
  beforeEach(() => {
    cy.visit('/login');
  });

  it('should display login form with email and password fields', () => {
    cy.get('#correo').should('be.visible');
    cy.get('#password').should('be.visible');
    cy.get('.login-btn').should('be.visible').and('contain', 'Iniciar');
  });

  it('should show validation errors for empty fields', () => {
    cy.get('.login-btn').click();
    cy.get('.invalid-feedback').should('be.visible');
  });

  it('should show error for invalid email format', () => {
    cy.get('#correo').type('invalidemail', { delay: 50 });
    cy.get('#password').type('password123', { delay: 50 });
    cy.get('.login-btn').click();
    // Expect error message or validation
  });

  it('should toggle password visibility', () => {
    cy.get('#password').should('have.attr', 'type', 'password');
    cy.get('.toggle-password').click();
    cy.get('#password').should('have.attr', 'type', 'text');
    cy.get('.toggle-password').click();
    cy.get('#password').should('have.attr', 'type', 'password');
  });

  it('should navigate to register page on click', () => {
    cy.contains('.register-link', 'Registro').click();
    cy.url().should('include', '/register');
  });

  it('should navigate to forgot password page on click', () => {
    cy.contains('.register-link', /olvidaste tu contrase/i).click();
    cy.url().should('include', '/forgot-password');
  });

  // This test requires valid credentials configured in test environment
  it('should successfully login with valid credentials', () => {
    const testEmail = Cypress.env('TEST_EMAIL') || 'test@example.com';
    const testPassword = Cypress.env('TEST_PASSWORD') || 'TestPassword123!';

    cy.login(testEmail, testPassword);
    cy.url().should('include', '/perfil');
    cy.contains(/Mi perfil|Perfil/i).should('be.visible');
  });

  it('should show error message for invalid credentials', () => {
    cy.get('#correo').type('nonexistent@example.com', { delay: 50 });
    cy.get('#password').type('wrongpassword', { delay: 50 });
    cy.get('.login-btn').click();
    // Error toast should appear
    cy.get('[role="status"], .Toastify__toast, .alert').should('be.visible');
  });
});
