# Cypress E2E Testing Setup

## Overview

Cypress configuration and E2E tests have been created for the ScrumTrack application. This provides automated testing for key user workflows.

## Setup

### Installation

Cypress is already installed as a dev dependency. If needed, install manually:

```bash
npm install --save-dev cypress
```

### Configuration

- **cypress.config.js** - Main Cypress configuration
  - Base URL: `http://localhost:5173` (frontend dev server)
  - Viewport: 1280x720
  - Command timeout: 10 seconds
  - Screenshot on failure: enabled
  - Video recording: enabled

- **cypress.env.json** - Environment variables
  - TEST_EMAIL: test@example.com (update with actual test credentials)
  - TEST_PASSWORD: TestPassword123! (update with actual test password)

## Running Tests

### Open Cypress Test Runner (Interactive)

```bash
npm run cypress:open
# or
npm run cypress:open -- --e2e
```

### Run Tests Headless

```bash
npm run test:e2e
# or
npm run cypress:run
```

### Run Tests with Specific Browser

```bash
npm run test:e2e:chrome
npm run test:e2e:firefox
```

### Run Specific Test File

```bash
npx cypress run --spec "cypress/e2e/login.spec.js"
```

## Test Files

### 1. **login.spec.js** - Login Functionality
- Login form display
- Email and password validation
- Password visibility toggle
- Invalid credentials error handling
- Navigation to register and forgot password pages
- Successful login flow

### 2. **proyectos.spec.js** - Projects Management
- Projects overview page
- Project card display
- Create new project
- Join existing project
- Project details navigation

### 3. **backlog.spec.js** - Backlog Management
- Backlog page structure
- Project selector
- Epic selector
- Search functionality
- Historia list display
- Create new historia
- Navigate to historia detail

### 4. **sprints.spec.js** - Sprint Management
- Sprints page display
- Sprint list
- Sprint detail navigation
- Sprint creation
- Kanban board display

### 5. **epicas.spec.js** - Epics Management
- Epicas overview
- Create epic form
- Epic detail page
- Form validation

### 6. **historias.spec.js** - User Stories
- Historia detail page
- Acceptance criteria display
- Tasks/subtasks display
- Edit historia
- Priority and story points

## Custom Commands

### Available Commands in `cypress/support/commands.js`

```javascript
// Login with credentials
cy.login(email, password);

// Logout (clears tokens and storage)
cy.logout();

// Create a project
cy.createProject(projectName, description);

// Navigate to backlog
cy.goToBacklog(projectId);

// Navigate to sprints
cy.goToSprints(projectId);

// Select project from dropdown
cy.selectProject(projectName);
```

## Environment Setup for Testing

### Prerequisites

1. **Frontend Running**: Start the frontend dev server on port 5173
   ```bash
   npm run dev
   ```

2. **Backend Running**: Start the backend on port 3000
   ```bash
   npm run dev
   ```

3. **Test User Account**: Create a test user or update `cypress.env.json` with valid credentials
   - Email: test@example.com
   - Password: TestPassword123!

### Setting Test Credentials

Edit `cypress.env.json`:

```json
{
  "TEST_EMAIL": "your-test-email@example.com",
  "TEST_PASSWORD": "your-test-password"
}
```

## Best Practices

### When Writing Tests

1. **Use semantic selectors** - Prefer data-testid, role attributes, or aria-labels
   ```javascript
   cy.get('[role="button"]').contains('Click me')
   cy.get('[aria-label="Project selector"]')
   ```

2. **Avoid hard-coded waits** - Use cy.intercept() for API calls
   ```javascript
   cy.intercept('GET', '/api/proyectos').as('getProjects');
   cy.wait('@getProjects');
   ```

3. **Keep tests focused** - One behavior per test
4. **Use beforeEach** - Set up test state consistently
5. **Clean up data** - Use afterEach if creating test data

### Test Data Management

- Tests should work with existing test data or create temporary data
- Clean up created data when possible
- Use timestamps in names to avoid conflicts: `Test Project ${Date.now()}`

## Debugging Tests

### Run Single Test

```bash
npx cypress run --spec "cypress/e2e/login.spec.js"
```

### Debug Mode

```bash
npx cypress open
# Then click on a test to run in browser debugger
```

### Print Debug Info

```javascript
cy.then(() => {
  console.log('Current URL:', cy.url());
  console.log('Local Storage:', window.localStorage);
});
```

### Enable Detailed Logging

```bash
npx cypress run --env DEBUG=true
```

## Troubleshooting

### Tests Timeout
- Increase `defaultCommandTimeout` in cypress.config.js
- Check if backend/frontend are running
- Verify network connectivity

### Login Fails
- Verify test credentials in cypress.env.json
- Check if backend auth endpoint is working
- Ensure token storage is not blocked

### Selectors Not Found
- Use Cypress Inspector (F12 in test runner)
- Verify element exists and is visible
- Check for dynamic class names or ID changes

### API Errors
- Check backend console for errors
- Verify API URLs match between frontend and tests
- Check CORS configuration if needed

## CI/CD Integration

For continuous integration:

```yaml
# Example GitHub Actions workflow
- name: Run E2E tests
  run: npm run test:e2e:headless
```

## Additional Resources

- [Cypress Documentation](https://docs.cypress.io)
- [Cypress Best Practices](https://docs.cypress.io/guides/references/best-practices)
- [ScrumTrack Frontend Routes](../src/App.jsx)
- [API Documentation](../../scrum-backend/README.md)

## Notes

- Tests are designed to work with the current frontend structure
- Some selectors may need adjustment if UI components change
- API base URL comes from `VITE_API_URL` env variable or defaults to `http://localhost:3000/api`
- Tests assume user has permissions for tested operations
