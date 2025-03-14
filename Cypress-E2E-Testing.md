# Setting Up Cypress E2E Testing

This document outlines the steps to set up and implement end-to-end (E2E) testing for a React application using Cypress. These instructions are specific to the Countries Fullstack project but can be adapted for similar React projects.

## Table of Contents

1. [Prerequisites](#prerequisites)
2. [Installation](#installation)
3. [Configuration](#configuration)
4. [Running Tests](#running-tests)
5. [Writing Tests](#writing-tests)
6. [Verifying Setup](#verifying-setup)
7. [Testing Material-UI Components](#testing-material-ui-components)
8. [Best Practices](#best-practices)
9. [Troubleshooting](#troubleshooting)

## Prerequisites

- Node.js (v14 or higher)
- npm or yarn
- A React project (preferably using Vite)
- TypeScript (optional but recommended)

## Installation

Install Cypress and the start-server-and-test package:

```bash
cd frontend
npm install --save-dev cypress start-server-and-test
```

## Configuration

### 1. Update Package.json Scripts

Add Cypress scripts to your `package.json`:

```json
"scripts": {
  "dev": "vite",
  "build": "tsc -b && vite build",
  "lint": "eslint .",
  "preview": "vite preview",
  "test": "vitest run",
  "test:watch": "vitest",
  "test:coverage": "vitest run --coverage",
  "cypress:open": "cypress open",
  "cypress:run": "cypress run",
  "e2e": "cypress run",
  "e2e:dev": "start-server-and-test dev http://localhost:5180 cypress:run"
}
```

### 2. Create Cypress Configuration File

For projects using ES modules (`"type": "module"` in package.json), create a CommonJS configuration file named `cypress.config.cjs` in the root of your frontend directory:

```javascript
const { defineConfig } = require("cypress");

module.exports = defineConfig({
  e2e: {
    baseUrl: "http://localhost:5180",
    setupNodeEvents(on, config) {
      // implement node event listeners here
      return config;
    },
  },
});
```

> **Important Note**: Using the `.cjs` extension is crucial for projects with `"type": "module"` in package.json. This tells Node.js to treat this specific file as CommonJS despite the project's ES module setting. This resolves the "exports is not defined in ES module scope" error that can occur when using a `.ts` or `.js` extension.

### 3. Create TypeScript Configuration for Cypress

Create a `tsconfig.json` file in the `cypress` directory:

```json
{
  "compilerOptions": {
    "target": "es2022",
    "lib": ["es2022", "dom"],
    "types": ["cypress"],
    "moduleResolution": "node",
    "esModuleInterop": true
  },
  "include": ["**/*.ts"]
}
```

Additionally, create a Cypress-specific TypeScript configuration file in the root directory:

```json
// tsconfig.cypress.json
{
  "extends": "./tsconfig.json",
  "compilerOptions": {
    "types": ["cypress"],
    "isolatedModules": false
  },
  "include": ["cypress/**/*.ts"]
}
```

This helps TypeScript understand Cypress types while maintaining compatibility with your project's module system.

### 4. Create Directory Structure

Ensure you have the following directory structure:

```
frontend/
├── cypress/
│   ├── e2e/
│   │   └── home.cy.ts
│   ├── fixtures/
│   ├── support/
│   └── tsconfig.json
├── cypress.config.cjs
└── tsconfig.cypress.json
```

## Running Tests

Run Cypress tests using the npm scripts:

```bash
# Open Cypress in interactive mode
npm run cypress:open

# Run Cypress tests headlessly
npm run cypress:run

# Run Cypress tests with the development server
npm run e2e:dev
```

## Writing Tests

Create test files in the `cypress/e2e` directory with the `.cy.ts` extension. Here's an example test for the Countries application:

```typescript
// cypress/e2e/home.cy.ts
describe("Countries Application", () => {
  beforeEach(() => {
    // Visit the home page before each test
    cy.visit("/");

    // Wait for initial loading to complete
    cy.get("body").then(($body) => {
      if ($body.find(".MuiCircularProgress-root").length > 0) {
        cy.get(".MuiCircularProgress-root").should("not.exist", {
          timeout: 10000,
        });
      }
    });
  });

  it("displays the navigation bar correctly", () => {
    // Check if the AppBar is rendered
    cy.get(".MuiAppBar-root").should("exist");

    // Check if the app title is displayed
    cy.get(".MuiToolbar-root")
      .find("div.MuiTypography-root")
      .contains("My App")
      .should("be.visible");

    // Check if navigation links are displayed with exact text
    cy.get(".MuiButton-root").contains("Countries").should("be.visible");
    cy.get(".MuiButton-root").contains("Home").should("be.visible");
    cy.get(".MuiButton-root").contains("Public Data").should("be.visible");
    cy.get(".MuiButton-root").contains("Protected Data").should("be.visible");
    cy.get(".MuiButton-root").contains("Login").should("be.visible");
  });

  it("displays the countries list with correct heading", () => {
    // Check if the countries heading is displayed with exact text
    cy.get("h4").contains("Countries of the World").should("be.visible");

    // Check if country cards are loaded
    cy.get(".MuiCard-root", { timeout: 15000 }).should(
      "have.length.at.least",
      1
    );
  });

  it("shows country details when a country card is clicked", () => {
    // Wait for countries to load
    cy.get(".MuiCard-root", { timeout: 15000 }).should(
      "have.length.at.least",
      1
    );

    // Store the name of the first country before clicking
    let countryName;
    cy.get(".MuiCard-root")
      .first()
      .find("h5")
      .invoke("text")
      .then((text) => {
        countryName = text;
      });

    // Click the first country card
    cy.get(".MuiCard-root").first().click();

    // Verify we're on the country detail page
    cy.url().should("include", "/countries/");

    // Verify the country name is displayed in the detail view
    cy.get("h4").should(($h4) => {
      if (countryName) {
        expect($h4.text()).to.include(countryName);
      }
    });

    // Verify the back button exists
    cy.contains("Back to Countries").should("be.visible");
  });

  it("navigates back to countries list from detail page", () => {
    // Wait for countries to load
    cy.get(".MuiCard-root", { timeout: 15000 }).should(
      "have.length.at.least",
      1
    );

    // Click the first country card
    cy.get(".MuiCard-root").first().click();

    // Verify we're on the country detail page
    cy.url().should("include", "/countries/");

    // Click the back button
    cy.contains("Back to Countries").click();

    // Verify we're back on the countries list page
    cy.url().should("include", "/countries");
    cy.get("h4").contains("Countries of the World").should("be.visible");
  });
});
```

## Verifying Setup

To verify that your Cypress setup is working correctly:

1. **Start your development server**:

   ```bash
   npm run dev
   ```

2. **Open Cypress in interactive mode**:

   ```bash
   npm run cypress:open
   ```

3. **Select E2E Testing** in the Cypress interface.

4. **Choose a browser** (Chrome, Firefox, or Electron) to run your tests.

5. **Run the home.cy.ts test** by clicking on it in the Cypress test runner.

If everything is set up correctly, you should see:

- Cypress launching the selected browser
- The browser navigating to your application
- The test passing if your application has an h1 element with "Countries" text

If you encounter any issues:

- Check that your development server is running on the correct port (5180)
- Verify that the baseUrl in cypress.config.cjs matches your application URL
- Ensure your test is looking for elements that actually exist in your application

You can also run tests headlessly (without the UI) using:

```bash
npm run cypress:run
```

This is useful for continuous integration environments.

## Testing Material-UI Components

When testing applications that use Material-UI (MUI), there are some specific considerations to keep in mind:

### 1. Understanding Material-UI DOM Structure

Material-UI components have a specific DOM structure that's important to understand:

```html
<!-- Example of a Material-UI Button -->
<button
  class="MuiButtonBase-root MuiButton-root MuiButton-text MuiButton-textPrimary"
>
  <span class="MuiButton-label">Login</span>
</button>

<!-- Example of a Material-UI Typography -->
<h4 class="MuiTypography-root MuiTypography-h4">Countries of the World</h4>

<!-- Example of a Material-UI AppBar -->
<header
  class="MuiPaper-root MuiAppBar-root MuiAppBar-positionStatic MuiAppBar-colorPrimary"
>
  <div class="MuiToolbar-root">
    <!-- Toolbar content -->
  </div>
</header>
```

### 2. Selecting Material-UI Components

Use class-based selectors for reliable selection of MUI components:

```typescript
// Selecting MUI components by their class names
cy.get(".MuiAppBar-root"); // AppBar component
cy.get(".MuiButton-root"); // Button component
cy.get(".MuiCard-root"); // Card component
cy.get(".MuiTypography-h4"); // Typography with variant h4
```

### 3. Handling Loading States

Material-UI often uses CircularProgress for loading states. Handle them properly:

```typescript
// Wait for loading to complete
cy.get("body").then(($body) => {
  if ($body.find(".MuiCircularProgress-root").length > 0) {
    cy.get(".MuiCircularProgress-root").should("not.exist", { timeout: 10000 });
  }
});
```

### 4. Testing Text Content in MUI Components

When testing text content in MUI components, be specific about the component:

```typescript
// More specific and reliable selectors
cy.get(".MuiTypography-root").contains("Countries of the World");
cy.get(".MuiButton-root").contains("Login");
cy.get("h4").contains("Countries of the World");
```

### 5. Testing Navigation with MUI Components

For testing navigation with MUI components:

```typescript
// Click a MUI Button
cy.get(".MuiButton-root").contains("Countries").click();

// Click a MUI Card
cy.get(".MuiCard-root").first().click();

// Check URL after navigation
cy.url().should("include", "/countries");
```

### 6. Adding data-testid Attributes

For more reliable testing, consider adding data-testid attributes to your components:

```jsx
// In your React component
<Button data-testid="login-button">Login</Button>;

// In your Cypress test
cy.get('[data-testid="login-button"]').should("exist").click();
```

## Best Practices

1. **Test Organization**

   - Group related tests using `describe` blocks
   - Use descriptive test names that explain what's being tested
   - Keep tests independent of each other

2. **Selectors**

   - Use data-testid attributes for elements that are specifically for testing
   - Avoid using CSS selectors that are tied to styling
   - Use semantic selectors when possible (e.g., `cy.contains('button', 'Submit')`)

3. **Test Structure**

   - Follow the Arrange-Act-Assert pattern
   - Keep tests focused on a single feature or behavior
   - Use `beforeEach` for common setup steps

4. **Performance**
   - Avoid unnecessary page loads
   - Use `cy.session()` for preserving login state
   - Group related assertions to minimize DOM queries

## Troubleshooting

### Common Issues

1. **ES Module Compatibility**

   - For projects using ES modules (`"type": "module"` in package.json), use a `.cjs` extension for the Cypress configuration file
   - The CommonJS format (`module.exports = ...`) is required for Cypress configuration
   - Return the config object from `setupNodeEvents` function
   - If you see "exports is not defined in ES module scope" errors, ensure you're using the `.cjs` extension

2. **TypeScript Errors**

   - Ensure proper types are installed and configured
   - Use a separate `tsconfig.cypress.json` file to handle Cypress-specific TypeScript settings
   - Check that the tsconfig.json includes Cypress types

3. **Network Errors**

   - Verify the baseUrl is correct
   - Check that the development server is running
   - Use `cy.intercept()` to debug network requests

4. **Test Flakiness**
   - Add proper waiting mechanisms (`cy.wait()`, `cy.contains()`)
   - Increase default timeout if needed
   - Use retry mechanisms for assertions that might take time to become true
