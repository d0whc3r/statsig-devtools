# Testing Steering Document

## Testing Strategy Overview

### Testing Pyramid
- **Unit Tests (70%)**: Individual functions and components
- **Integration Tests (20%)**: Service interactions and API calls
- **E2E Tests (10%)**: Complete user workflows

### Coverage Requirements
- **Minimum Coverage**: 90% for all metrics
- **Branches**: 90% branch coverage
- **Functions**: 90% function coverage
- **Lines**: 90% line coverage
- **Statements**: 90% statement coverage

## Testing Framework Stack

### Core Testing Tools
- **Vitest**: Fast unit testing framework with Vite integration
- **React Testing Library**: Component testing with user-centric approach
- **@testing-library/jest-dom**: Additional DOM matchers
- **@testing-library/user-event**: User interaction simulation
- **happy-dom**: Lightweight DOM implementation for tests

### Browser Extension Testing
- **webextension-polyfill**: Mock browser APIs for testing
- **Chrome Extension Testing**: Mock chrome.* APIs
- **Message Passing**: Mock inter-context communication
- **Storage Testing**: Mock browser.storage APIs

## Unit Testing Patterns

### Component Testing
```typescript
// Test user interactions, not implementation details
test('should display configurations when loaded', async () => {
  render(<ConfigurationList configurations={mockConfigs} />)
  expect(screen.getByText('Feature Gate 1')).toBeInTheDocument()
})

// Test error states
test('should show error message when loading fails', async () => {
  render(<ConfigurationList error="Failed to load" />)
  expect(screen.getByText(/failed to load/i)).toBeInTheDocument()
})
```

### Hook Testing
```typescript
// Test custom hooks with renderHook
test('useAuth should handle authentication flow', async () => {
  const { result } = renderHook(() => useAuth())
  
  act(() => {
    result.current.login('api-key')
  })
  
  await waitFor(() => {
    expect(result.current.isAuthenticated).toBe(true)
  })
})
```

### Service Testing
```typescript
// Mock external dependencies
vi.mock('../services/statsig-api')

test('should validate API key format', async () => {
  const result = await validateConsoleApiKey('')
  expect(result).toEqual({
    isValid: false,
    error: 'Console API key is required'
  })
})
```

## Integration Testing Patterns

### API Integration
- **Mock HTTP Responses**: Use MSW or fetch mocks
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
└── test/
    ├── setup.ts
    ├── mocks/
    └── utils/
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
      remove: vi.fn()
    }
  },
  runtime: {
    sendMessage: vi.fn(),
    onMessage: {
      addListener: vi.fn()
    }
  }
}

global.browser = mockBrowser
```

### External Services
```typescript
// Mock Statsig API responses
vi.mock('@statsig/js-client', () => ({
  StatsigClient: vi.fn().mockImplementation(() => ({
    initialize: vi.fn().mockResolvedValue(true),
    checkGate: vi.fn().mockReturnValue(true),
    getConfig: vi.fn().mockReturnValue({ value: 'test' })
  }))
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
