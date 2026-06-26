import { defineConfig } from "cypress";

export default defineConfig({
  e2e: {
    baseUrl: "http://localhost:5173",
    viewportWidth: 1280,
    viewportHeight: 720,
    defaultCommandTimeout: 10000,
    requestTimeout: 10000,
    responseTimeout: 10000,
    taskTimeout: 30000,
    specPattern: "cypress/e2e/**/*.spec.js",
    supportFile: "cypress/support/e2e.js",
    screenshotOnRunFailure: true,
    video: true,
    // Preserve session between tests to avoid rate limiting
    sessionAffinity: 'single',
    setupNodeEvents(on, config) {
      // Add node event handlers here
      // Increase test timeout for slower systems
      config.defaultCommandTimeout = 15000;
      return config;
    },
  },
  component: {
    devServer: {
      framework: "react",
      bundler: "vite",
    },
  },
  // Env configuration
  env: {
    TEST_EMAIL: 'test@example.com',
    TEST_PASSWORD: 'TestPassword123!',
  },
});
