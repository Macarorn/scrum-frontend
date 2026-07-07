// cypress/e2e/login.spec.js
// Test suite for login functionality

describe('Página de inicio de sesión', () => {
  beforeEach(() => {
    cy.visit('/login');
  });

  it('debería mostrar el formulario de inicio de sesión con correo y contraseña', () => {
    cy.get('#correo').should('be.visible');
    cy.get('#password').should('be.visible');
    cy.get('.login-btn').should('be.visible').and('contain', 'Iniciar');
  });

  it('debería mostrar errores de validación para campos vacíos', () => {
    cy.get('.login-btn').click();
    cy.get('.invalid-feedback').should('be.visible');
  });

  it('debería mostrar error para formato de correo inválido', () => {
    cy.get('#correo').type('invalidemail', { delay: 50 });
    cy.get('#password').type('password123', { delay: 50 });
    cy.get('.login-btn').click();
    // Expect error message or validation
  });

  it('debería alternar la visibilidad de la contraseña', () => {
    cy.get('#password').should('have.attr', 'type', 'password');
    cy.get('.toggle-password').click();
    cy.get('#password').should('have.attr', 'type', 'text');
    cy.get('.toggle-password').click();
    cy.get('#password').should('have.attr', 'type', 'password');
  });

  it('debería navegar a la página de registro al hacer clic', () => {
    cy.contains('.register-link', 'Registro').click();
    cy.url().should('include', '/register');
  });

  it('debería navegar a la página de contraseña olvidada al hacer clic', () => {
    cy.contains('.register-link', /olvidaste tu contrase/i).click();
    cy.url().should('include', '/forgot-password');
  });

  // This test requires valid credentials configured in test environment
  it('debería iniciar sesión correctamente con credenciales válidas', () => {
    const testEmail = Cypress.env('TEST_EMAIL') || 'test@example.com';
    const testPassword = Cypress.env('TEST_PASSWORD') || 'TestPassword123!';

    cy.login(testEmail, testPassword);
    cy.url().should('include', '/perfil');
    cy.contains(/Mi perfil|Perfil/i).should('be.visible');
  });

  it('debería mostrar mensaje de error para credenciales inválidas', () => {
    cy.get('#correo').type('nonexistent@example.com', { delay: 50 });
    cy.get('#password').type('wrongpassword', { delay: 50 });
    cy.get('.login-btn').click();
    // Error toast should appear
    cy.get('[role="status"], .Toastify__toast, .alert').should('be.visible');
  });
});
