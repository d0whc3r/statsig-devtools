---
inclusion: fileMatch
fileMatchPattern: ['**/*.test.ts', '**/*.test.tsx', '**/test/**/*', '**/tests/**/*']
---

# Testing Steering Document

## Testing Strategy Overview

### Testing Pyramid

- **Unit Tests (70%)**: Individual functions, components, hooks, and services
- **Integration Tests (20%)**: Service interactions, API flows, and configuration processing
- **E2E Tests (10%)**: Complete user workflows and extension interfaces

### Coverage Requirements

- **Minimum Coverage**: 90% for all metrics (enforced by Vitest)
- **Branches**: 90% branch coverage
- **Functions**: 90% function coverage
- **Lines**: 90% line coverage
- **Statements**: 90% statement coverage

## Testing Framework Stack

### Core Testing Tools

- **Vitest**: Fast unit testing framework with Vite integration and V8 coverage
- **React Testing Library**: Component testing with user-centric approach
- **@testing-library/jest-dom**: Additional DOM matchers with Vitest integration
- **@testing-library/user-event**: User interaction simulation
- **happy-dom**: Lightweight DOM implementation for tests (faster than jsdom)

### Browser Extension Testing

- **webextension-polyfill**: Mock browser APIs for testing
- **Chrome Extension Testing**: Mock chrome._ and browser._ APIs
- **Message Passing**: Mock inter-context communication
- **Storage Testing**: Mock browser.storage APIs with encryption support

### E2E Testing

- **Playwright**: Cross-browser E2E testing with extension support
- **Extension Loading**: Automated extension loading in Chrome/Firefox
- **Interface Testing**: Popup, sidepanel, and tab interface verification
- **API Mocking**: Statsig API mocking for consistent E2E tests

## Unit Testing Patterns

### Component Testing

```typescript
// Test user interactions, not implementation details
test('renders loading state', () => {
  mockUseActiveTab.mockReturnValue({
    tabInfo: { url: null, domain: null, canInject: false },
    isLoading: true,
    refreshTabInfo: vi.fn()
  })

  render(<ActiveTabInfo />)
  expect(screen.getByText('Loading tab information...')).toBeInTheDocument()
})

// Test different component states
test('renders injection not available state', () => {
  mockUseActiveTab.mockReturnValue({
    tabInfo: {
      url: 'https://example.com/path',
      domain: 'example.com',
      canInject: false,
      reason: 'Chrome internal page'
    },
    isLoading: false,
    refreshTabInfo: vi.fn()
  })

  render(<ActiveTabInfo />)
  expect(screen.getByText('Chrome internal page')).toBeInTheDocument()
})
```

### Hook Testing

```typescript
// Test custom hooks with comprehensive scenarios
test('should initialize with loading state and then set unauthenticated when no keys exist', async () => {
  const { result } = renderHook(() => useAuth())

  // Should start with loading state
  expect(result.current.authState.isLoading).toBe(true)
  expect(result.current.authState.isAuthenticated).toBe(false)

  await waitFor(() => {
    expect(result.current.authState.isLoading).toBe(false)
  })

  expect(result.current.authState.isAuthenticated).toBe(false)
  expect(mockStorageManager.initialize).toHaveBeenCalled()
})

// Test error handling
test('should handle initialization errors gracefully', async () => {
  const initError = new Error('Storage initialization failed')
  mockStorageManager.initialize.mockRejectedValue(initError)

  const { result } = renderHook(() => useAuth())

  await waitFor(() => {
    expect(result.current.authState.isLoading).toBe(false)
  })

  expect(result.current.authState.isAuthenticated).toBe(false)
  expect(result.current.authState.error).toBe('Failed to load authentication state')
})
```

### Service Testing

```typescript
// Test service functionality with comprehensive scenarios
describe('basic operations', () => {
  it('should store and retrieve values', () => {
    cache.set('key1', 'value1')
    expect(cache.get('key1')).toBe('value1')
  })

  it('should return undefined for non-existent keys', () => {
    expect(cache.get('nonexistent')).toBeUndefined()
  })
})

// Test edge cases and error conditions
describe('edge cases', () => {
  it('should handle setting same key multiple times', () => {
    cache.set('key1', 'value1')
    cache.set('key1', 'value2') // Overwrite

    expect(cache.get('key1')).toBe('value2')
    expect(cache.getStats().totalEntries).toBe(1)
  })
})
```

## Integration Testing Patterns

### Configuration Processing Integration

```typescript
// Integration tests for complete configuration processing flow
describe('Configuration Processing Integration', () => {
  const mockApiResponse = {
    feature_gates: [
      {
        id: 'gate-1',
        name: 'test_feature_gate',
        isEnabled: true,
        description: 'Test feature gate for integration testing',
        rules: [
          /* rule definitions */
        ],
        tags: ['test', 'integration'],
        lastModifierName: 'Test User',
        createdTime: 1640995200000,
      },
    ],
    // ... dynamic_configs and experiments
  }

  it('should process API response correctly', () => {
    const processed = processConfigurations(mockApiResponse)

    expect(processed.totalConfigurations).toBe(3)
    expect(processed.enabledConfigurations).toBe(2)
    expect(processed.configurationsByType).toEqual({
      feature_gates: 1,
      dynamic_configs: 1,
      experiments: 1,
    })
  })
})
```

### API Integration

- **Mock HTTP Responses**: Use fetch mocks for API calls
- **Error Scenarios**: Test network failures and API errors
- **Rate Limiting**: Test rate limit handling
- **Authentication**: Test API key validation flows

### Storage Integration

- **Browser Storage**: Test localStorage/sessionStorage operations
- **Extension Storage**: Test browser.storage.local operations
- **Data Persistence**: Test data persistence across sessions
- **Storage Limits**: Test storage quota handling

### Message Passing

- **Background-Content**: Test background to content script communication
- **Content-Page**: Test content script to page communication
- **Error Handling**: Test message passing failures
- **Timeout Handling**: Test message timeout scenarios

## Test Organization

### File Structure

```
src/
├── components/
│   ├── Component.tsx
│   └── Component.test.tsx
├── hooks/
│   ├── useHook.ts
│   └── useHook.test.ts
├── services/
│   ├── service.ts
│   └── service.test.ts
├── integration/
│   ├── configuration-processing.test.ts
│   └── __snapshots__/
├── utils/
│   ├── utility.ts
│   └── utility.test.ts
└── test/
    └── setup.ts
e2e/
├── extension-interfaces.spec.ts
├── feature-flags.spec.ts
├── fixtures/
│   ├── extension-verification.ts
│   ├── mock-data.ts
│   └── playwright-commands.ts
├── global-setup.ts
└── global-teardown.ts
```

### Test Categories

- **Unit Tests**: `.test.ts` suffix for individual units
- **Integration Tests**: `.integration.test.ts` for service integration
- **Component Tests**: `.test.tsx` for React components
- **E2E Tests**: Separate `e2e/` directory for end-to-end tests

## Mocking Strategies

### Browser APIs

```typescript
// Mock browser extension APIs
const mockBrowser = {
  storage: {
    local: {
      get: vi.fn(),
      set: vi.fn(),
      remove: vi.fn(),
      clear: vi.fn(),
    },
    sync: {
      get: vi.fn(),
      set: vi.fn(),
      remove: vi.fn(),
      clear: vi.fn(),
    },
  },
  cookies: {
    get: vi.fn(),
    set: vi.fn(),
    remove: vi.fn(),
  },
  tabs: {
    query: vi.fn(),
    sendMessage: vi.fn(),
  },
  runtime: {
    sendMessage: vi.fn(),
    onMessage: {
      addListener: vi.fn(),
      removeListener: vi.fn(),
    },
  },
}

// @ts-expect-error - Mocking global browser API
global.browser = mockBrowser
// @ts-expect-error - Mocking global chrome API
global.chrome = mockBrowser
```

### External Services

```typescript
// Mock Statsig API responses
vi.mock('@statsig/js-client', () => ({
  StatsigClient: vi.fn().mockImplementation(() => ({
    initialize: vi.fn().mockResolvedValue(true),
    checkGate: vi.fn().mockReturnValue(true),
    getConfig: vi.fn().mockReturnValue({ value: 'test' }),
  })),
}))
```

### Component Dependencies

```typescript
// Mock complex child components
vi.mock('./ComplexComponent', () => ({
  ComplexComponent: ({ onAction }: { onAction: () => void }) => (
    <button onClick={onAction}>Mock Component</button>
  )
}))
```

### Crypto API Mocking

```typescript
// Mock crypto API for encryption tests
Object.defineProperty(globalThis, 'crypto', {
  value: {
    subtle: {
      generateKey: vi.fn(),
      exportKey: vi.fn(),
      importKey: vi.fn(),
      encrypt: vi.fn(),
      decrypt: vi.fn(),
    },
    getRandomValues: vi.fn((arr: Uint8Array) => {
      for (let i = 0; i < arr.length; i++) {
        arr[i] = Math.floor(Math.random() * 256)
      }
      return arr
    }),
  },
})
```

## Test Data Management

### Mock Data

- **Consistent Fixtures**: Reusable test data across tests
- **Factory Functions**: Generate test data programmatically
- **Realistic Data**: Use realistic data that matches production
- **Edge Cases**: Include edge cases and boundary conditions

### Test Utilities

```typescript
// Test utilities for common operations
export const createMockConfiguration = (overrides = {}) => ({
  id: 'test-config',
  name: 'Test Configuration',
  type: 'feature_gate',
  enabled: true,
  ...overrides
})

export const renderWithProviders = (ui: ReactElement) => {
  return render(ui, {
    wrapper: ({ children }) => (
      <ErrorBoundary>{children}</ErrorBoundary>
    )
  })
}
```

### E2E Mock Data

```typescript
// Realistic mock responses for E2E tests
export const mockStatsigResponses = {
  featureGates: {
    data: [
      {
        id: 'feature_gate_1',
        name: 'new_checkout_flow',
        isEnabled: true,
        description: 'Enable the new checkout flow for better conversion',
        rules: [
          /* realistic rule definitions */
        ],
        tags: ['checkout', 'conversion'],
        lastModifierName: 'Product Team',
        createdTime: 1640995200000,
      },
    ],
  },
  experiments: {
    data: [
      /* experiment definitions */
    ],
  },
  dynamicConfigs: {
    data: [
      /* config definitions */
    ],
  },
}
```

## E2E Testing with Playwright

### Extension Testing Setup

```typescript
// Playwright configuration for extension testing
export default defineConfig({
  testDir: './e2e',
  fullyParallel: true,
  workers: process.env.CI ? 2 : 1, // Extension tests need single worker
  projects: [
    {
      name: 'chromium-extension',
      use: {
        ...devices['Desktop Chrome'],
        headless: false, // Extensions require non-headless mode
        launchOptions: {
          args: [
            '--disable-extensions-except=./.output/chrome-mv3',
            '--load-extension=./.output/chrome-mv3',
            '--disable-web-security',
            '--no-sandbox',
          ],
        },
      },
    },
  ],
})
```

### Extension Interface Testing

```typescript
// Test extension interfaces (popup, sidepanel, tab)
test('should verify extension loading and interface accessibility', async () => {
  const browser = await chromium.launch({
    /* extension args */
  })
  const context = await browser.newContext()
  const commands = new StatsigPlaywrightCommands(page, context)

  // Setup API mocking
  await commands.setupStatsigApiMocking()

  // Test popup interface
  const popupPage = await commands.openExtensionPopup()
  const rootElement = popupPage.locator('#root')
  await expect(rootElement).toBeVisible()

  // Test tab interface
  const tabPage = await commands.openExtensionTab()
  const tabRootElement = tabPage.locator('#root')
  await expect(tabRootElement).toBeVisible()
})
```

### Extension Verification

```typescript
// Verify extension build and structure
export class ExtensionVerification {
  static async verifyExtensionFilesExist(): Promise<void> {
    const requiredFiles = ['manifest.json', 'popup.html', 'sidepanel.html', 'tab.html']
    for (const file of requiredFiles) {
      const filePath = join('./.output/chrome-mv3', file)
      expect(existsSync(filePath)).toBe(true)
    }
  }

  static async verifyManifestStructure(): Promise<void> {
    const manifest = JSON.parse(readFileSync(manifestPath, 'utf8'))
    expect(manifest.name).toBe('Statsig DevTools')
    expect(manifest.manifest_version).toBe(3)

    const requiredPermissions = ['storage', 'activeTab', 'cookies', 'scripting']
    for (const permission of requiredPermissions) {
      expect(manifest.permissions).toContain(permission)
    }
  }
}
```

## Snapshot Testing

### Integration Snapshots

```typescript
// Use snapshots for complex integration flows
it('should match complete integration flow snapshot', () => {
  const processed = processConfigurations(mockApiResponse)
  const integrationResult = {
    summary: {
      totalConfigurations: processed.totalConfigurations,
      enabledConfigurations: processed.enabledConfigurations,
      configurationsByType: processed.configurationsByType,
    },
    configurations: processed.configurations.map((config) => ({
      id: config.id,
      name: config.name,
      type: config.type,
      isEnabled: config.isEnabled,
      formattedName: config.formattedName,
      overrideSuggestions: generateOverrideSuggestions(config),
    })),
  }

  expect(integrationResult).toMatchSnapshot('complete-integration-flow')
})
```

## Performance Testing

### Bundle Size Testing

- **Size Limits**: Enforce maximum bundle sizes
- **Bundle Analysis**: Regular bundle composition analysis
- **Tree Shaking**: Verify unused code elimination
- **Code Splitting**: Test dynamic import functionality

### Runtime Performance

- **Memory Usage**: Monitor memory consumption in tests
- **Render Performance**: Test component render times
- **API Response Times**: Test API call performance
- **Storage Operations**: Test storage operation speed

## Continuous Integration

### Test Automation

- **Pre-commit Hooks**: Run tests before commits
- **Pull Request Checks**: Automated testing on PRs
- **Coverage Reports**: Generate and track coverage reports
- **Cross-browser Testing**: Test on multiple browsers

### Test Reporting

- **Coverage Reports**: HTML and JSON coverage reports
- **Test Results**: JUnit XML for CI integration
- **Performance Metrics**: Track test execution times
- **Flaky Test Detection**: Identify and fix unstable tests
