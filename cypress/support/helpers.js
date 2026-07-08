// cypress/support/helpers.js
// Helper functions for debugging and common test operations

/**
 * Get token from localStorage for debugging auth
 */
export const getStoredToken = () => {
  return cy.window().then((win) => win.localStorage.getItem('token'));
};

/**
 * Get refresh token from localStorage
 */
export const getRefreshToken = () => {
  return cy.window().then((win) => win.localStorage.getItem('refreshToken'));
};

/**
 * Clear all auth tokens
 */
export const clearTokens = () => {
  cy.window().then((win) => {
    win.localStorage.removeItem('token');
    win.localStorage.removeItem('refreshToken');
  });
};

/**
 * Wait for API call and get response
 */
export const waitForApi = (method, url, alias) => {
  cy.intercept(method, url).as(alias);
  cy.wait(`@${alias}`).then((interception) => {
    console.log(`API ${method} ${url}:`, interception.response.body);
  });
};

/**
 * Check if user is authenticated
 */
export const isAuthenticated = () => {
  return cy.window().then((win) => {
    const token = win.localStorage.getItem('token');
    return !!token;
  });
};

/**
 * Take screenshot with timestamp
 */
export const takeScreenshotWithTimestamp = (name) => {
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  cy.screenshot(`${name}-${timestamp}`);
};

/**
 * Log current state for debugging
 */
export const logState = () => {
  cy.window().then((win) => {
    console.log('=== Current State ===');
    console.log('URL:', win.location.href);
    console.log('Token:', win.localStorage.getItem('token')?.substring(0, 20) + '...');
    console.log('User ID:', JSON.parse(win.localStorage.getItem('token') || '{}').id_usuario);
    console.log('Local Storage:', Object.keys(win.localStorage).filter(k => k.startsWith('scrum.')));
  });
};

/**
 * Verify element is clickable and visible
 */
export const verifyClickable = (selector) => {
  cy.get(selector).should('be.visible').should('not.be.disabled');
};

/**
 * Wait for form to be ready
 */
export const waitForForm = () => {
  cy.get('form, [role="dialog"]').should('be.visible');
  cy.get('button[type="submit"], button:contains("Crear"), button:contains("Guardar")').should('exist');
};

/**
 * Fill form field by label
 */
export const fillFormField = (label, value) => {
  cy.contains('label', label).then(($label) => {
    cy.wrap($label).parent().find('input, textarea, select').type(value, { delay: 50 });
  });
};

/**
 * Submit form and wait for navigation or response
 */
export const submitForm = () => {
  cy.get('button[type="submit"], button:contains("Crear"), button:contains("Guardar")').first().click();
  cy.wait(500); // Give it time to process
};

/**
 * Verify navigation to path
 */
export const verifyNavigation = (path) => {
  cy.url().should('include', path);
};

/**
 * Check for error messages
 */
export const hasError = (text) => {
  cy.get('[role="status"], .alert, .toast, .invalid-feedback').should('contain', text);
};

/**
 * Check for success message
 */
export const hasSuccess = (text) => {
  cy.get('[role="status"], .alert-success, .toast').should('contain', text);
};

/**
 * Debug network requests
 */
export const debugNetwork = () => {
  cy.intercept('**').as('allRequests');
  cy.wait('@allRequests').then((interception) => {
    console.log('Request:', {
      method: interception.request.method,
      url: interception.request.url,
      status: interception.response.statusCode,
    });
  });
};

/**
 * Wait for specific element to disappear (useful for loading states)
 */
export const waitForLoadingToComplete = () => {
  cy.get('[class*="loading"], [class*="spinner"], .spinner-border').should('not.exist');
};

/**
 * Get data-testid element
 */
export const getByTestId = (testId) => {
  return cy.get(`[data-testid="${testId}"]`);
};

/**
 * Get by aria-label
 */
export const getByAriaLabel = (label) => {
  return cy.get(`[aria-label="${label}"]`);
};

/**
 * Navigate without waiting
 */
export const quickNavigate = (url) => {
  cy.visit(url);
};

/**
 * Verify element text
 */
export const verifyText = (selector, text) => {
  cy.get(selector).should('contain', text);
};

/**
 * Get element count
 */
export const getElementCount = (selector) => {
  return cy.get(selector).then(($elements) => {
    return $elements.length;
  });
};

/**
 * Retry API call on failure
 */
export const retryApi = (method, url, maxRetries = 3) => {
  let attempts = 0;
  const tryRequest = () => {
    cy.request({
      method,
      url,
      failOnStatusCode: false,
    }).then((response) => {
      if (response.status >= 400 && attempts < maxRetries) {
        attempts++;
        cy.wait(500);
        tryRequest();
      }
    });
  };
  tryRequest();
};
