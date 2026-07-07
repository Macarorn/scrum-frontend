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
Cypress.on('uncaught:exception', (err, runnable) => {
  // Ignore ResizeObserver errors and document access errors
  if (err.message.includes('ResizeObserver loop limit exceeded') || 
      err.message.includes('Cannot read properties of null')) {
    return false;
  }
  return true;
});

// Ensure overlay-removal runs for every new page/window (covers cy.visit)
Cypress.on('window:before:load', (win) => {
  try {
    const doc = win?.document;
    if (!doc) return; // Exit if document is not available
    
    // Inject CSS
    if (!doc.getElementById('cypress-hide-welcome')) {
      const style = doc.createElement('style');
      style.id = 'cypress-hide-welcome';
      style.innerHTML = '.welcome-modal-overlay{display:none !important;pointer-events:none !important;opacity:0 !important;}';
      doc.head.appendChild(style);
    }

    const removeOverlay = () => {
      try {
        const el = doc.querySelector('.welcome-modal-overlay');
        if (el && el.parentNode) el.parentNode.removeChild(el);
        const skip = doc.querySelector('.btn-skip');
        if (skip && typeof skip.click === 'function') skip.click();
        const start = doc.querySelector('.btn-start');
        if (start && typeof start.click === 'function') start.click();
      } catch (e) {
        // Silently ignore
      }
    };

    // Observe DOM and remove when present
    const observer = new win.MutationObserver(removeOverlay);
    // wait for body to exist
    const waitBody = () => {
      if (doc.body) {
        observer.observe(doc.body, { childList: true, subtree: true });
        // attempt immediate removal after short delays
        setTimeout(removeOverlay, 100);
        setTimeout(removeOverlay, 500);
      } else {
        setTimeout(waitBody, 50);
      }
    };
    waitBody();
    win.__cypressWelcomeObserver = observer;
  } catch (e) {
    // ignore all errors in this hook
  }
});

// Remove the welcome modal overlay if it appears so it doesn't block interactions
beforeEach(() => {
  // Try to handle welcome overlay, but don't fail the test if it doesn't exist
  cy.window({ log: false }).then((win) => {
    try {
      const doc = win.document;
      if (!doc || !doc.head || !doc.body) {
        return; // Exit gracefully if document isn't ready
      }
      
      // Inject CSS to ensure the overlay cannot block interactions
      if (!doc.getElementById('cypress-hide-welcome')) {
        const style = doc.createElement('style');
        style.id = 'cypress-hide-welcome';
        style.innerHTML = '.welcome-modal-overlay{display:none !important;pointer-events:none !important;opacity:0 !important;}';
        doc.head.appendChild(style);
      }
      
      const removeOverlay = () => {
        const el = doc.querySelector('.welcome-modal-overlay');
        if (el && el.parentNode) el.parentNode.removeChild(el);
      };

      // Remove now if present
      removeOverlay();

      // Observe DOM mutations and remove overlay if it appears later
      const observer = new MutationObserver(removeOverlay);
      observer.observe(doc.body, { childList: true, subtree: true });

      // Store observer on window so we can disconnect in afterEach
      win.__cypressWelcomeObserver = observer;
    } catch (e) {
      // Silently ignore any errors
    }
  });

  // Try to click modal buttons if they exist
  cy.get('body', { log: false }).then(($body) => {
    try {
      if ($body && $body.length > 0) {
        const $skip = $body.find('.btn-skip');
        const $start = $body.find('.btn-start');
        if ($skip.length > 0) $skip.click();
        if ($start.length > 0) $start.click();
      }
    } catch (e) {
      // Silently ignore
    }
  });
  
  // short pause to allow UI to update
  cy.wait(150);
});

afterEach(() => {
  // Defensive cleanup - handle cases where window might not be available
  try {
    cy.window({ log: false }).then((win) => {
      try {
        if (win && win.__cypressWelcomeObserver) {
          win.__cypressWelcomeObserver.disconnect();
          win.__cypressWelcomeObserver = null;
        }
      } catch (e) {
        // Silently ignore cleanup errors
      }
    });
  } catch (e) {
    // Silently ignore if window access fails
  }
});
