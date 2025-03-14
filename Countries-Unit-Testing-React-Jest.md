# Setting Up React Testing with Vitest

This document outlines the steps to set up and implement testing for a React application using Vitest and React Testing Library. These instructions are specific to the Countries Fullstack project but can be adapted for similar React projects.

## Table of Contents

1. [Prerequisites](#prerequisites)
2. [Installation](#installation)
3. [Configuration](#configuration)
4. [Test Structure](#test-structure)
5. [Writing Tests](#writing-tests)
   - [Component Tests](#component-tests)
   - [API Service Tests](#api-service-tests)
6. [Running Tests](#running-tests)
7. [Best Practices](#best-practices)
8. [Troubleshooting](#troubleshooting)
9. [Understanding Key Mocking Strategies](#understanding-key-mocking-strategies)

## Prerequisites

- Node.js (v14 or higher)
- npm or yarn
- A React project (preferably using Vite)
- TypeScript (optional but recommended)

## Installation

Install the necessary testing packages:

```bash
cd frontend
npm install --save-dev vitest jsdom @testing-library/react @testing-library/jest-dom @testing-library/user-event
```

## Configuration

### 1. Update Vite Configuration

Modify your `vite.config.ts` file to include Vitest configuration:

```typescript
import react from "@vitejs/plugin-react-swc";
import { defineConfig } from "vite";

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5180,
  },
  test: {
    globals: true,
    environment: "jsdom",
    setupFiles: ["./src/setupTests.ts"],
    css: false,
  },
});
```

### 2. Create Setup File

Create a `setupTests.ts` file in the `src` directory:

```typescript
// src/setupTests.ts
import "@testing-library/jest-dom";
import { cleanup } from "@testing-library/react";
import { afterEach } from "vitest";

// Run cleanup after each test case (e.g. clearing jsdom)
afterEach(() => {
  cleanup();
});

// Mock the matchMedia function for tests
window.matchMedia =
  window.matchMedia ||
  function () {
    return {
      matches: false,
      addListener: function () {},
      removeListener: function () {},
      addEventListener: function () {},
      removeEventListener: function () {},
      dispatchEvent: function () {
        return true;
      },
    };
  };
```

### 3. Update Package.json Scripts

Add test scripts to your `package.json`:

```json
"scripts": {
  "dev": "vite",
  "build": "tsc -b && vite build",
  "lint": "eslint .",
  "preview": "vite preview",
  "test": "vitest run",
  "test:watch": "vitest",
  "test:coverage": "vitest run --coverage"
}
```

## Test Structure

Organize your tests in a structured way:

```
src/
├── components/
│   ├── __tests__/
│   │   └── ComponentName.test.tsx
│   └── ComponentName.tsx
├── api/
│   ├── services/
│   │   ├── __tests__/
│   │   │   └── serviceName.test.ts
│   │   └── serviceName.ts
```

## Writing Tests

### Component Tests

#### Basic Component Test

Here's an example of a basic component test:

```typescript
// src/components/__tests__/Navigation.test.tsx
import { render, screen } from "@testing-library/react";
import { BrowserRouter } from "react-router-dom";
import { beforeEach, describe, expect, test, vi } from "vitest";
import { useAuth } from "../../context/AuthContext";
import { Navigation } from "../Navigation";

// Define the type for the auth context value
interface AuthContextValue {
  user: { email: string } | null;
  signOut: () => void;
}

// Define the type for the mocked useAuth function
type MockedUseAuth = ReturnType<typeof vi.fn> & {
  mockReturnValue: (value: AuthContextValue) => void;
};

// Mock the useAuth hook
vi.mock("../../context/AuthContext", () => ({
  useAuth: vi.fn(),
}));

describe("Navigation Component", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  test("renders navigation links when user is not logged in", () => {
    // Mock the useAuth hook to return a user who is not logged in
    (useAuth as MockedUseAuth).mockReturnValue({
      user: null,
      signOut: vi.fn(),
    });

    render(
      <BrowserRouter>
        <Navigation />
      </BrowserRouter>
    );

    // Check if navigation links are rendered
    expect(screen.getByText("Countries")).toBeInTheDocument();
    expect(screen.getByText("Home")).toBeInTheDocument();
    expect(screen.getByText("Public Data")).toBeInTheDocument();
    expect(screen.getByText("Protected Data")).toBeInTheDocument();

    // Check if login button is rendered
    expect(screen.getByText("Login")).toBeInTheDocument();

    // Check if favorites link is not rendered when user is not logged in
    expect(screen.queryByText("Favorites")).not.toBeInTheDocument();
  });

  test("renders navigation links when user is logged in", () => {
    const mockSignOut = vi.fn();

    // Mock the useAuth hook to return a logged in user
    (useAuth as MockedUseAuth).mockReturnValue({
      user: { email: "test@example.com" },
      signOut: mockSignOut,
    });

    render(
      <BrowserRouter>
        <Navigation />
      </BrowserRouter>
    );

    // Check if navigation links are rendered
    expect(screen.getByText("Countries")).toBeInTheDocument();
    expect(screen.getByText("Home")).toBeInTheDocument();
    expect(screen.getByText("Public Data")).toBeInTheDocument();
    expect(screen.getByText("Protected Data")).toBeInTheDocument();

    // Check if favorites link is rendered when user is logged in
    expect(screen.getByText("Favorites")).toBeInTheDocument();

    // Check if logout button is rendered with user email
    expect(screen.getByText("Logout (test@example.com)")).toBeInTheDocument();
  });

  test("calls signOut when logout button is clicked", () => {
    const mockSignOut = vi.fn();

    // Mock the useAuth hook to return a logged in user
    (useAuth as MockedUseAuth).mockReturnValue({
      user: { email: "test@example.com" },
      signOut: mockSignOut,
    });

    render(
      <BrowserRouter>
        <Navigation />
      </BrowserRouter>
    );

    // Click the logout button
    screen.getByText("Logout (test@example.com)").click();

    // Check if signOut function was called
    expect(mockSignOut).toHaveBeenCalledTimes(1);
  });
});
```

#### Component with Router Mocking

When testing components that use React Router hooks like `useNavigate`:

```typescript
// src/components/Countries/__tests__/CountryCard.test.tsx
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { BrowserRouter } from "react-router-dom";
import { beforeEach, describe, expect, test, vi } from "vitest";
import { Country } from "../../../types/country";
import { CountryCard } from "../CountryCard";

// Mock the useNavigate hook
const mockNavigate = vi.fn();

// Properly mock react-router-dom
vi.mock("react-router-dom", async () => {
  const actual = await vi.importActual("react-router-dom");
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

// Mock the FavoriteButton component
vi.mock("../FavoriteButton", () => ({
  FavoriteButton: ({ country }: { country: Country }) => (
    <button data-testid="favorite-button">
      Favorite {country.name.common}
    </button>
  ),
}));

describe("CountryCard Component", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  const mockCountry: Country = {
    name: {
      common: "Finland",
      official: "Republic of Finland",
    },
    capital: ["Helsinki"],
    region: "Europe",
    subregion: "Northern Europe",
    population: 5530719,
    flags: {
      png: "https://flagcdn.com/w320/fi.png",
      svg: "https://flagcdn.com/fi.svg",
      alt: "The flag of Finland has a white field with a blue cross that extends to the edges of the flag.",
    },
    cca3: "FIN",
    currencies: {
      EUR: {
        name: "Euro",
        symbol: "€",
      },
    },
  };

  test("renders country information correctly", () => {
    render(
      <BrowserRouter>
        <CountryCard country={mockCountry} />
      </BrowserRouter>
    );

    // Check if country name is rendered
    expect(screen.getByText("Finland")).toBeInTheDocument();

    // Check if region and subregion are rendered
    expect(screen.getByText("Europe (Northern Europe)")).toBeInTheDocument();

    // Check if capital is rendered
    expect(screen.getByText("Helsinki")).toBeInTheDocument();

    // Check if population is rendered
    expect(screen.getByText("5,530,719")).toBeInTheDocument();

    // Check if currency is rendered
    expect(screen.getByText("Euro (€)")).toBeInTheDocument();

    // Check if favorite button is rendered
    expect(screen.getByTestId("favorite-button")).toBeInTheDocument();
  });

  test("navigates to country detail page when clicked", async () => {
    const user = userEvent.setup();

    render(
      <BrowserRouter>
        <CountryCard country={mockCountry} />
      </BrowserRouter>
    );

    // Click on the card
    await user.click(screen.getByText("Finland"));

    // Check if navigate was called with the correct path
    expect(mockNavigate).toHaveBeenCalledWith("/countries/finland");
  });

  // Additional tests...
});
```

#### Component with API Interactions

For components that interact with APIs:

```typescript
// src/components/Countries/__tests__/FavoriteButton.test.tsx
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, test, vi } from "vitest";
import { favoritesApi } from "../../../api/services/favorites";
import { useAuth } from "../../../context/AuthContext";
import { Country } from "../../../types/country";
import { CountryFavorite } from "../../../types/favorite";
import { FavoriteButton } from "../FavoriteButton";

// Define the type for the auth context value
interface AuthContextValue {
  user: { id: string } | null;
}

// Define the type for the mocked useAuth function
type MockedUseAuth = ReturnType<typeof vi.fn> & {
  mockReturnValue: (value: AuthContextValue) => void;
};

// Define the type for the mocked API functions
interface ApiResponses {
  addFavorite: CountryFavorite;
  isFavorite: boolean;
}

type MockedApiFunction<T extends keyof ApiResponses> = ReturnType<
  typeof vi.fn
> & {
  mockResolvedValue: (value: ApiResponses[T]) => void;
};

// Mock the useAuth hook
vi.mock("../../../context/AuthContext", () => ({
  useAuth: vi.fn(),
}));

// Mock the favoritesApi
vi.mock("../../../api/services/favorites", () => {
  return {
    favoritesApi: {
      addFavorite: vi.fn(),
      removeFavorite: vi.fn(),
      getFavorites: vi.fn().mockResolvedValue([]),
      isFavorite: vi.fn().mockResolvedValue(false),
    },
  };
});

describe("FavoriteButton Component", () => {
  const mockCountry: Country = {
    // Mock country data...
  };

  beforeEach(() => {
    vi.clearAllMocks();

    // Mock the useAuth hook to return a logged in user
    (useAuth as MockedUseAuth).mockReturnValue({
      user: { id: "user123" },
    });
  });

  test("renders favorite button when user is logged in", async () => {
    render(<FavoriteButton country={mockCountry} />);

    // Check if the favorite button is rendered
    expect(screen.getByRole("button")).toBeInTheDocument();
  });

  test("adds country to favorites when clicked", async () => {
    const user = userEvent.setup();

    // Mock the addFavorite function to return success
    (
      favoritesApi.addFavorite as MockedApiFunction<"addFavorite">
    ).mockResolvedValue({
      id: "fav123",
      country_code: "FIN",
      country_name: "Finland",
      country_flag: "https://flagcdn.com/w320/fi.png",
      created_at: new Date().toISOString(),
      user_id: "user123",
    });

    render(<FavoriteButton country={mockCountry} />);

    // Click the favorite button
    await user.click(screen.getByRole("button"));

    // Check if addFavorite was called with the correct parameters
    expect(favoritesApi.addFavorite).toHaveBeenCalledWith(mockCountry);
  });

  // Additional tests...
});
```

### API Service Tests

For testing API services:

```typescript
// src/api/services/__tests__/countries.test.ts
import { beforeEach, describe, expect, test, vi } from "vitest";
import { Country } from "../../../types/country";
import { api } from "../../axios";
import { countriesApi } from "../countries";

// Define the type for the mocked API function
type MockedApiFunction<T> = ReturnType<typeof vi.fn> & {
  mockResolvedValue: (value: T) => void;
  mockRejectedValue: (error: Error) => void;
};

// Mock the axios instance
vi.mock("../../axios", () => ({
  api: {
    get: vi.fn(),
  },
}));

describe("Countries API Service", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  test("getAllCountries calls the correct endpoint", async () => {
    // Mock the API response with a minimal country object
    const mockResponse = [
      {
        name: {
          common: "Finland",
          official: "Republic of Finland",
        },
        capital: ["Helsinki"],
        region: "Europe",
        population: 5530719,
        flags: {
          png: "https://flagcdn.com/w320/fi.png",
          svg: "https://flagcdn.com/fi.svg",
        },
        cca3: "FIN",
      },
    ];

    (api.get as MockedApiFunction<Country[]>).mockResolvedValue(
      mockResponse as Country[]
    );

    // Call the API function
    const result = await countriesApi.getAllCountries();

    // Check if the API was called with the correct URL
    expect(api.get).toHaveBeenCalledWith("https://restcountries.com/v3.1/all");

    // Check if the result is correct
    expect(result).toEqual(mockResponse);
  });

  test("getCountryByCode calls the correct endpoint", async () => {
    // Mock the API response with a minimal country object
    const mockResponse = {
      name: {
        common: "Finland",
        official: "Republic of Finland",
      },
      capital: ["Helsinki"],
      region: "Europe",
      population: 5530719,
      flags: {
        png: "https://flagcdn.com/w320/fi.png",
        svg: "https://flagcdn.com/fi.svg",
      },
      cca3: "FIN",
    };

    (api.get as MockedApiFunction<Country>).mockResolvedValue(
      mockResponse as Country
    );

    // Call the API function
    const result = await countriesApi.getCountryByCode("FIN");

    // Check if the API was called with the correct URL
    expect(api.get).toHaveBeenCalledWith(
      "https://restcountries.com/v3.1/alpha/FIN"
    );

    // Check if the result is correct
    expect(result).toEqual(mockResponse);
  });

  test("handles API errors", async () => {
    // Mock the API error
    const mockError = new Error("API Error");
    (api.get as MockedApiFunction<never>).mockRejectedValue(mockError);

    // Call the API function and expect it to throw an error
    await expect(countriesApi.getAllCountries()).rejects.toThrow("API Error");
  });
});
```

## Running Tests

Run tests using the npm scripts:

```bash
# Run all tests once
npm test

# Run tests in watch mode (re-runs when files change)
npm run test:watch

# Run tests with coverage report
npm run test:coverage
```

## Best Practices

### 1. Test Organization

- Place tests in `__tests__` directories next to the components they test
- Use descriptive test names that explain what's being tested
- Group related tests using `describe` blocks

### 2. Mocking

- Mock external dependencies (APIs, contexts, etc.)
- Use proper typing for mocks to catch type errors
- Reset mocks between tests using `beforeEach(() => { vi.clearAllMocks(); })`

### 3. Test Coverage

- Aim to test all components, especially those with complex logic
- Focus on testing user interactions and edge cases
- Use `npm run test:coverage` to identify untested code

### 4. Testing Patterns

- Test rendering: Verify components render correctly with different props
- Test user interactions: Verify components respond correctly to user actions
- Test edge cases: Verify components handle edge cases (empty data, errors, etc.)
- Test API interactions: Verify components interact correctly with APIs

## Troubleshooting

### Common Issues

1. **"Cannot find module" errors**

   - Make sure all dependencies are installed
   - Check import paths for typos

2. **React state updates not wrapped in act(...)**

   - This warning occurs when state updates happen outside of test assertions
   - Use `await waitFor(() => { ... })` to wait for state updates to complete

3. **Mock function not called**

   - Check that the mock is set up correctly
   - Verify that the component is actually calling the function
   - Use `vi.clearAllMocks()` in `beforeEach` to reset mocks between tests

4. **TypeScript errors in tests**
   - Define proper types for mocked functions and values
   - Use type assertions (`as`) when necessary, but try to avoid them when possible

### Debugging Tests

- Use `console.log` or `console.debug` to print values during tests
- Use `screen.debug()` to print the current DOM state
- Run tests in watch mode (`npm run test:watch`) for faster feedback
- Use breakpoints in your IDE to step through test code

## Understanding Key Mocking Strategies

### Why Mock the `matchMedia` Function?

The `window.matchMedia` function is mocked in the `setupTests.ts` file for several important reasons:

1. **JSDOM Environment Limitation**: The JSDOM testing environment used by Vitest doesn't implement the `window.matchMedia` function by default. Without this mock, components that use media queries would throw errors during tests.

2. **Preventing Test Failures**: Components that use CSS media queries or JavaScript media query detection (for responsive designs or dark mode features) would fail in the test environment without this mock.

3. **Consistent Test Environment**: By providing a mock implementation that always returns `matches: false`, you ensure that all tests run in a consistent environment regardless of media queries.

4. **Avoiding Browser-Specific Behavior**: This mock ensures tests don't depend on browser-specific implementations of media queries, making tests more reliable across different environments.

### Why Mock the `useAuth` Function?

Mocking authentication hooks like `useAuth` is a critical testing strategy:

1. **Isolation**: By mocking the authentication context, you isolate the component under test from the actual authentication system. This means you're testing just the component's behavior, not the authentication logic.

2. **Control Over Test Scenarios**: The mock allows you to simulate different authentication states easily:

   ```typescript
   // Test with logged-out user
   (useAuth as MockedUseAuth).mockReturnValue({
     user: null,
     signOut: vi.fn(),
   });

   // Test with logged-in user
   (useAuth as MockedUseAuth).mockReturnValue({
     user: { email: "test@example.com" },
     signOut: mockSignOut,
   });
   ```

3. **Avoiding External Dependencies**: Your real authentication system might depend on external services (like Supabase). Mocking prevents tests from making actual API calls to these services.

4. **Testing Conditional Rendering**: Many components render differently based on authentication state (like showing different navigation links). Mocking allows you to test both scenarios easily.

5. **Testing Event Handlers**: You can verify that functions like `signOut` are called correctly when user interactions occur, without actually signing out a real user.

6. **Type Safety with TypeScript**: Using TypeScript types for mocks ensures type safety and prevents errors where you might mock the hook with incorrect properties or types:

   ```typescript
   interface AuthContextValue {
     user: { email: string } | null;
     signOut: () => void;
   }

   type MockedUseAuth = ReturnType<typeof vi.fn> & {
     mockReturnValue: (value: AuthContextValue) => void;
   };
   ```

By understanding these mocking strategies, you can write more effective, reliable, and comprehensive tests for your React components.
