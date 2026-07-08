# Quick Start: Cypress E2E Tests

## 🚀 Getting Started

### Prerequisites
- Node.js and npm installed
- Frontend dev server running: `npm run dev` (port 5173)
- Backend running on port 3000

### Step 1: Configure Test Credentials
Edit `cypress.env.json`:
```json
{
  "TEST_EMAIL": "your-test-account@example.com",
  "TEST_PASSWORD": "your-password"
}
```

### Step 2: Run Tests

**Interactive Mode (Recommended)**
```bash
npm run cypress:open
```
Then select "E2E Testing" and choose a test file.

**Headless Mode**
```bash
npm run test:e2e
```

**Specific Browser**
```bash
npm run test:e2e:chrome
npm run test:e2e:firefox
```

**Single Test File**
```bash
npx cypress run --spec "cypress/e2e/login.spec.js"
```

## 📋 Test Suites

| Suite | Tests | Covers |
|-------|-------|--------|
| **login.spec.js** | 7 | Authentication, validation |
| **proyectos.spec.js** | 9 | Project CRUD, navigation |
| **backlog.spec.js** | 12 | Backlog UI, filters, selection |
| **sprints.spec.js** | 8 | Sprint management, Kanban |
| **epicas.spec.js** | 7 | Epic creation, detail |
| **historias.spec.js** | 8 | User stories, tasks, editing |

**Total: 51 tests**

## 🛠️ Useful Commands

```bash
# Open test runner
npm run cypress:open

# Run all tests
npm run test:e2e

# Run with debug output
DEBUG=cypress:* npm run test:e2e

# Run specific test
npx cypress run --spec "cypress/e2e/login.spec.js"

# Run with video
npx cypress run --record

# Run headed (browser visible)
npx cypress run --headed
```

## 📝 Custom Commands

Use in your tests:

```javascript
// Login
cy.login('email@test.com', 'password');

// Create project
cy.createProject('My Project', 'Description');

// Navigate
cy.goToBacklog(projectId);
cy.goToSprints(projectId);
```

## 🐛 Debugging

### In Browser Test Runner
1. Run `npm run cypress:open`
2. Click on any test file
3. Use browser DevTools (F12) to inspect elements
4. Click "Step through" to debug line-by-line

### Command Line Debug
```bash
DEBUG=cypress:* npx cypress run
```

### Inspect Elements in Test
```javascript
// Pause test and open DevTools
cy.debug();

// Print to console
cy.then(() => console.log('Debug info'));
```

## ⚠️ Common Issues

### Tests timeout
- Ensure backend is running on port 3000
- Check frontend is running on port 5173
- Increase timeout in `cypress.config.js`

### Login fails
- Verify credentials in `cypress.env.json`
- Check user exists in database
- Verify backend auth endpoint is working

### Can't find elements
- Use Cypress Inspector to find selectors
- Check if element is visible/enabled
- Wait for API calls: `cy.intercept().as('api'); cy.wait('@api');`

## 📚 More Resources

- [Full Setup Guide](CYPRESS_SETUP.md)
- [Cypress Docs](https://docs.cypress.io)
- [Test Files](cypress/e2e/)

---

**Last Updated**: January 2024
