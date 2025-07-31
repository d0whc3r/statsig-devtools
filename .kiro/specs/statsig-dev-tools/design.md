# Design Document

## Overview

The Statsig Developer Tools extension is architected as a modern browser extension using React, TypeScript, and the WXT framework for cross-browser compatibility. The design emphasizes security, performance, and developer experience while providing a clean, intuitive interface for testing Statsig configurations.

The extension follows a modular architecture with clear separation between the popup UI, background service worker, content scripts, and API integration layer. This design ensures maintainability, testability, and scalability while adhering to browser extension security best practices.

## Architecture

### High-Level Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    Browser Extension                        │
├─────────────────────────────────────────────────────────────┤
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────────────┐  │
│  │   Popup UI  │  │ Background  │  │   Content Script    │  │
│  │   (React)   │  │   Worker    │  │   (Storage Inject)  │  │
│  └─────────────┘  └─────────────┘  └─────────────────────┘  │
├─────────────────────────────────────────────────────────────┤
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────────────┐  │
│  │  Statsig    │  │   Storage   │  │   Message Passing   │  │
│  │ Integration │  │  Manager    │  │     System          │  │
│  └─────────────┘  └─────────────┘  └─────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
                    ┌─────────────────┐
                    │   Statsig APIs  │
                    │ Console + Client│
                    └─────────────────┘
```

### Dual API Integration Strategy

The extension uses a dual API approach to provide comprehensive Statsig functionality:

1. **Console API**: Used for fetching configuration metadata (feature gates, experiments, dynamic configs) and their rules. This requires a Console API key with read permissions.

2. **Client SDK**: Used for real-time evaluation of configurations with current user context. This requires a Client SDK key and provides the actual evaluation logic.

This approach allows the extension to:

- Display all available configurations and their targeting rules
- Perform real-time evaluations with user overrides
- Show accurate pass/fail states based on current conditions
- Provide debugging information for rule evaluation

### Component Architecture

The extension is built using a component-based architecture with the following key modules:

1. **Popup Application**: React-based UI with TypeScript for type safety
2. **Background Service Worker**: Handles API calls, storage management, and cross-tab communication
3. **Content Script**: Injected into web pages for localStorage/sessionStorage manipulation
4. **API Client**: Abstraction layer for Statsig Console API interactions
5. **Storage Manager**: Secure handling of API keys and configuration caching
6. **Message System**: Communication bridge between extension components

## Components and Interfaces

### Popup UI Components

#### Main Application Container

```typescript
interface AppProps {
  initialState?: ExtensionState
}

const App: React.FC<AppProps> = ({ initialState }) => {
  // Main application logic
}
```

#### Authentication Component

```typescript
interface AuthComponentProps {
  onAuthenticated: (apiKey: string) => void
  isLoading: boolean
  error?: string
}

const AuthComponent: React.FC<AuthComponentProps> = ({ onAuthenticated, isLoading, error }) => {
  // API key input and validation
}
```

#### Configuration List Component

```typescript
interface ConfigurationListProps {
  configurations: StatsigConfiguration[]
  onConfigurationSelect: (config: StatsigConfiguration) => void
  searchQuery: string
  filterType: ConfigurationType
}

const ConfigurationList: React.FC<ConfigurationListProps> = ({
  configurations,
  onConfigurationSelect,
  searchQuery,
  filterType,
}) => {
  // Virtual scrolling list with search and filter
}
```

#### Rule Detail Component

```typescript
interface RuleDetailProps {
  configuration: StatsigConfiguration
  evaluationResult: EvaluationResult
  onOverrideCreate: (override: StorageOverride) => void
}

const RuleDetail: React.FC<RuleDetailProps> = ({ configuration, evaluationResult, onOverrideCreate }) => {
  // Rule display and override creation
}
```

### Background Service Worker

#### Statsig Integration Service

```typescript
class StatsigIntegrationService {
  private clientSDK: StatsigClient | null = null
  private consoleApiKey: string
  private clientApiKey: string
  private baseUrl = 'https://statsigapi.net/console/v1'

  // Console API methods for fetching configurations
  async authenticateConsoleAPI(consoleApiKey: string): Promise<boolean>
  async getFeatureGatesFromConsole(): Promise<FeatureGate[]>
  async getExperimentsFromConsole(): Promise<Experiment[]>
  async getDynamicConfigsFromConsole(): Promise<DynamicConfig[]>

  // Client SDK methods for evaluation
  async initializeClientSDK(clientApiKey: string, user: StatsigUser): Promise<void>
  async evaluateFeatureGate(gateName: string): Promise<boolean>
  async getExperimentValue(experimentName: string, parameterName: string, defaultValue: any): Promise<any>
  async getDynamicConfigValue(configName: string, parameterName: string, defaultValue: any): Promise<any>
  async updateUser(user: StatsigUser): Promise<void>

  // Utility methods
  private async makeConsoleAPIRequest(endpoint: string, options?: RequestInit): Promise<any>
  private buildUserContext(overrides: StorageOverride[]): StatsigUser
}
```

#### Storage Manager

```typescript
class StorageManager {
  async storeApiKey(apiKey: string): Promise<void>
  async getApiKey(): Promise<string | null>
  async clearApiKey(): Promise<void>
  async cacheConfigurations(configs: StatsigConfiguration[]): Promise<void>
  async getCachedConfigurations(): Promise<StatsigConfiguration[] | null>
  async clearCache(): Promise<void>
}
```

#### Message Handler

```typescript
interface MessageHandler {
  handlePopupMessage(message: PopupMessage): Promise<any>
  handleContentScriptMessage(message: ContentScriptMessage): Promise<any>
  broadcastConfigurationUpdate(configs: StatsigConfiguration[]): void
}
```

### Content Script Interface

#### Storage Injection Service

```typescript
class StorageInjectionService {
  async setCookie(name: string, value: string, options?: CookieOptions): Promise<boolean>
  async setLocalStorage(key: string, value: string): Promise<boolean>
  async setSessionStorage(key: string, value: string): Promise<boolean>
  async getCurrentStorageState(): Promise<StorageState>
}
```

## Data Models

### Core Statsig Types

```typescript
// Console API Response Types
interface StatsigConfiguration {
  id: string
  name: string
  type: 'feature_gate' | 'experiment' | 'dynamic_config'
  status: 'active' | 'disabled' | 'stale'
  rules: Rule[]
  defaultValue?: any
  createdAt: string
  updatedAt: string
  description?: string
  tags?: string[]
}

interface Rule {
  id: string
  name: string
  passPercentage: number
  conditions: Condition[]
  returnValue?: any
  groupName?: string
  salt?: string
}

interface Condition {
  type:
    | 'public'
    | 'user_field'
    | 'custom_field'
    | 'cookie'
    | 'user_agent'
    | 'ip_address'
    | 'browser_name'
    | 'browser_version'
  operator: 'eq' | 'neq' | 'gt' | 'gte' | 'lt' | 'lte' | 'contains' | 'not_contains' | 'in' | 'not_in' | 'any'
  field?: string
  targetValue: any
}

// Client SDK Types (from @statsig/js-client)
interface StatsigUser {
  userID?: string
  email?: string
  ip?: string
  userAgent?: string
  country?: string
  locale?: string
  appVersion?: string
  custom?: Record<string, any>
  privateAttributes?: Record<string, any>
}

interface FeatureGate {
  name: string
  value: boolean
  ruleID: string
  secondaryExposures: SecondaryExposure[]
  details: EvaluationDetails
}

interface DynamicConfig {
  name: string
  value: Record<string, any>
  ruleID: string
  secondaryExposures: SecondaryExposure[]
  details: EvaluationDetails
  get(key: string, defaultValue?: any): any
}

interface EvaluationDetails {
  configSyncTime: number
  initTime: number
  reason: string
}

interface SecondaryExposure {
  gate: string
  gateValue: string
  ruleID: string
}

// Extension-specific evaluation result
interface ExtensionEvaluationResult {
  configurationId: string
  configurationName: string
  type: 'feature_gate' | 'experiment' | 'dynamic_config'
  passed: boolean
  ruleId?: string
  value?: any
  reason: string
  debugInfo?: DebugInfo
}

interface DebugInfo {
  evaluatedRules: RuleEvaluation[]
  userContext: UserContext
  timestamp: string
}
```

### Extension State Types

```typescript
interface ExtensionState {
  // Authentication
  isAuthenticated: boolean
  consoleApiKey?: string
  clientApiKey?: string

  // Configuration data
  configurations: StatsigConfiguration[]
  selectedConfiguration?: StatsigConfiguration
  evaluationResults: Map<string, ExtensionEvaluationResult>

  // UI state
  searchQuery: string
  filterType: ConfigurationType
  isLoading: boolean
  error?: string

  // User context and overrides
  currentUser: StatsigUser
  activeOverrides: StorageOverride[]

  // SDK state
  isClientSDKInitialized: boolean
  lastSyncTime?: string
}

interface StorageOverride {
  type: 'cookie' | 'localStorage' | 'sessionStorage'
  key: string
  value: string
  domain?: string
  path?: string
}

interface UserContext {
  userID?: string
  email?: string
  customFields: Record<string, any>
  cookies: Record<string, string>
  localStorage: Record<string, string>
  sessionStorage: Record<string, string>
}
```

### Message Types

```typescript
interface PopupMessage {
  type: 'authenticate' | 'fetch_configurations' | 'evaluate_configuration' | 'create_override'
  payload: any
}

interface ContentScriptMessage {
  type: 'set_storage' | 'get_storage_state'
  payload: StorageOverride | null
}

interface BackgroundMessage {
  type: 'configuration_updated' | 'evaluation_result' | 'error'
  payload: any
}
```

## Error Handling

### Error Classification

The extension implements a comprehensive error handling strategy with the following error categories:

1. **Authentication Errors**: Invalid API keys, expired tokens, network failures
2. **API Errors**: Rate limiting, server errors, malformed responses
3. **Storage Errors**: Quota exceeded, permission denied, corruption
4. **Injection Errors**: Content script failures, cross-origin restrictions
5. **Validation Errors**: Invalid user input, malformed data

### Error Handling Strategy

```typescript
class ErrorHandler {
  static handleApiError(error: ApiError): UserFriendlyError {
    switch (error.code) {
      case 401:
        return new UserFriendlyError('Invalid API key. Please check your credentials.')
      case 429:
        return new UserFriendlyError('Rate limit exceeded. Please wait before trying again.')
      case 500:
        return new UserFriendlyError('Statsig service is temporarily unavailable.')
      default:
        return new UserFriendlyError('An unexpected error occurred. Please try again.')
    }
  }

  static handleStorageError(error: StorageError): UserFriendlyError {
    if (error.name === 'QuotaExceededError') {
      return new UserFriendlyError('Storage quota exceeded. Please clear extension data.')
    }
    return new UserFriendlyError('Storage operation failed. Please try again.')
  }
}
```

### Retry Logic

```typescript
class RetryManager {
  static async withRetry<T>(operation: () => Promise<T>, maxRetries: number = 3, backoffMs: number = 1000): Promise<T> {
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        return await operation()
      } catch (error) {
        if (attempt === maxRetries || !this.isRetryableError(error)) {
          throw error
        }
        await this.delay(backoffMs * Math.pow(2, attempt - 1))
      }
    }
    throw new Error('Max retries exceeded')
  }
}
```

## Testing Strategy

### Unit Testing

- **Framework**: Vitest for fast, modern testing
- **Coverage Target**: 90% code coverage
- **Mock Strategy**: Mock browser APIs, Statsig API responses
- **Test Categories**: Component tests, service tests, utility tests

### Integration Testing

- **API Integration**: Test real Statsig API interactions with test keys
- **Storage Integration**: Test browser storage operations
- **Message Passing**: Test communication between extension components

### End-to-End Testing

- **Framework**: Playwright with browser extension support
- **Test Scenarios**:
  - Complete authentication flow
  - Configuration fetching and display
  - Rule evaluation with overrides
  - Cross-browser compatibility
  - Error handling scenarios

### Performance Testing

- **Bundle Size**: Monitor and enforce size limits
- **Load Time**: Measure extension startup performance
- **Memory Usage**: Profile memory consumption
- **API Response Time**: Monitor Statsig API performance

### Security Testing

- **Input Validation**: Test XSS and injection prevention
- **API Key Security**: Verify secure storage and transmission
- **Content Security Policy**: Validate CSP compliance
- **Permission Audit**: Ensure minimal required permissions

## Technical Implementation Strategy

### Statsig SDK Integration Approach

The extension leverages both Statsig APIs to provide comprehensive functionality:

1. **Console API Integration**:
   - Fetches configuration metadata using Console API key
   - Retrieves feature gates, experiments, and dynamic configs with their rules
   - Provides read-only access to project configurations
   - Endpoint: `https://statsigapi.net/console/v1/`

2. **Client SDK Integration**:
   - Uses `@statsig/js-client` for real-time evaluation
   - Initializes with Client SDK key for evaluation capabilities
   - Provides accurate pass/fail states based on user context
   - Supports real-time re-evaluation when overrides change

3. **Dual Key Management**:
   - Console API Key: Required for fetching configurations and rules
   - Client SDK Key: Required for evaluation (can be the same as console key if it has client permissions)
   - Both keys stored securely with encryption
   - Validation of both keys during authentication

### SDK Installation and Usage

```typescript
// Install Statsig JavaScript Client SDK
// npm install @statsig/js-client

import { StatsigClient, StatsigUser, LogLevel } from '@statsig/js-client'

// Initialize client for evaluation
const client = new StatsigClient(clientApiKey, user, {
  logLevel: LogLevel.Debug, // For development
  api: 'https://api.statsig.com/v1/', // Default endpoint
  initTimeoutMs: 3000,
  disableLocalStorage: false, // Allow caching
})

await client.initializeAsync()
```

### Content Security Policy Configuration

The extension must whitelist Statsig domains in its CSP:

```javascript
// Required CSP connect-src domains for Statsig
const statsigDomains = [
  'api.statsig.com',
  'featuregates.org',
  'statsigapi.net',
  'events.statsigapi.net',
  'api.statsigcdn.com',
  'featureassets.org',
  'assetsconfigcdn.org',
  'prodregistryv2.org',
]
```

## Implementation Considerations

### Cross-Browser Compatibility

- Use WXT framework for unified build process
- Implement webextension-polyfill for API consistency
- Test on both Chrome (Manifest V3) and Firefox (Manifest V2/V3)
- Handle browser-specific API differences gracefully

### Performance Optimization

- Implement virtual scrolling for large configuration lists
- Use React.memo and useMemo for expensive computations
- Implement efficient caching with TTL
- Lazy load configuration details
- Debounce search and filter operations

### Security Implementation

- Encrypt API keys using browser storage encryption
- Implement Content Security Policy
- Validate and sanitize all user inputs
- Use HTTPS exclusively for API communications
- Implement secure message passing between components

### Accessibility

- Follow WCAG 2.1 AA guidelines
- Implement proper ARIA labels and roles
- Ensure keyboard navigation support
- Provide screen reader compatibility
- Use semantic HTML elements

This design provides a solid foundation for implementing a secure, performant, and user-friendly Statsig Developer Tools extension that meets all the specified requirements while maintaining high code quality and cross-browser compatibility.
