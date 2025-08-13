---
inclusion: always
---

# Best Practices Steering Document

## Code Quality Standards

### TypeScript Configuration

- **Strict Mode**: All strict TypeScript checks enabled in tsconfig.json
- **Unused Variables**: `noUnusedLocals` and `noUnusedParameters` enforced
- **Switch Statements**: `noFallthroughCasesInSwitch` prevents fallthrough bugs
- **Import Extensions**: `allowImportingTsExtensions` for better module resolution
- **Type Definitions**: Chrome and Node types included for extension development

### TypeScript Best Practices

- **Explicit Types**: Avoid `any`, use proper type definitions (ESLint warns on `any`)
- **Interface over Type**: Use interfaces for object shapes (`consistent-type-definitions`)
- **Type Imports**: Use `import type` for type-only imports (`consistent-type-imports`)
- **Generic Constraints**: Use bounded generics for reusability
- **Utility Types**: Leverage built-in utility types (Partial, Pick, etc.)
- **Optional Chaining**: Prefer `?.` over manual null checks

### React Best Practices

- **Functional Components**: Use hooks instead of class components
- **Function Declaration Pattern**: Use function declarations with explicit props typing instead of React.FC
- **Custom Hooks**: Extract reusable logic into custom hooks (see `useViewModeToggle`)
- **Memoization**: Use React.memo, useMemo, useCallback appropriately
- **Error Boundaries**: Wrap components with error boundaries
- **Key Props**: Always provide stable keys for list items

#### Component Declaration Pattern

**❌ Avoid React.FC:**

```typescript
export const MyComponent: React.FC<MyComponentProps> = ({ prop1, prop2 }) => {
  return <div>{prop1}</div>
}
```

**✅ Prefer function declarations with explicit typing:**

```typescript
interface MyComponentProps {
  prop1: string
  prop2?: number
}

export function MyComponent({ prop1, prop2 = 0 }: MyComponentProps) {
  return <div>{prop1}</div>
}
```

**Benefits of function declarations:**

- Better TypeScript inference
- Cleaner syntax without generic constraints
- More explicit prop typing
- Better debugging experience
- Consistent with modern React patterns

### State Management

#### Local State

- **Local State First**: Use useState for component-specific state
- **Lift State Up**: Share state at lowest common ancestor
- **Custom Hooks**: Encapsulate complex state logic

#### Global State with Zustand

- **Store Structure**: Separate stores for different domains (auth, configuration, override, ui)
- **Immer Middleware**: Use immer for immutable state updates with mutable syntax
- **Persist Middleware**: Automatic persistence for relevant state
- **Devtools Integration**: Enable Redux DevTools for debugging
- **Selectors**: Use selector functions for performance optimization
- **Direct Imports**: Import stores directly, no barrel exports

#### Zustand Best Practices

```typescript
// ✅ Good: Direct store import
import { useAuthStore } from '../stores/auth-store'

// ✅ Good: Selector usage for performance
const isAuthenticated = useAuthStore((state) => state.isAuthenticated)

// ✅ Good: Action usage
const login = useAuthStore((state) => state.login)

// ❌ Avoid: Barrel imports
import { useAuthStore } from '../stores'
```

#### State Updates

- **Immutable Updates**: Never mutate state directly (Immer handles this)
- **State Normalization**: Flatten nested state structures
- **Batch Updates**: Group related state changes together

### Performance Guidelines

- **Bundle Size**: Monitor and optimize bundle size
- **Lazy Loading**: Load components and data on demand
- **Virtual Scrolling**: Handle large lists efficiently
- **Debouncing**: Debounce user input and API calls
- **Caching**: Implement intelligent caching strategies

## Import/Export Conventions

### Import Organization (ESLint Enforced)

```typescript
// 1. External packages first
import React from 'react'
import { StatsigClient } from '@statsig/js-client'

// 2. Internal packages with @/ alias
import { logger } from '@/utils/logger'
import { errorHandler } from '@/services/error-handler'

// 3. Relative imports
import { ButtonConfig } from './types'
import { getButtonConfig } from '../utils/config'

// 4. Type imports (separated automatically)
import type { ViewMode } from '../services/view-mode'
import type { AuthState } from '../types'
```

### Export Patterns

- **Default Exports**: Components and main service classes
- **Named Exports**: Utilities, types, and helper functions
- **NO BARREL EXPORTS**: Barrel files (index.ts) are strictly prohibited
- **Direct Imports**: Always import directly from the source file
- **Absolute Imports**: Use `@/` alias for src directory

### Import Examples

**❌ Avoid barrel imports:**

```typescript
import { DebugButton, ErrorDisplay } from './components'
```

**✅ Use direct imports:**

```typescript
import { DebugButton } from './components/DebugButton'
import { ErrorDisplay } from './components/ErrorDisplay'
```

## Component Organization Patterns

### Modular Component Structure

- **Single Responsibility**: Each component has one clear purpose
- **Composition over Inheritance**: Build complex components from simple ones
- **Co-located Files**: Keep related files together (component + test + types)
- **Direct Imports**: No barrel exports, import directly from source files

### Component Refactoring Pattern

When components grow large (>200 lines), refactor into:

```
ComponentName/
├── ComponentName.tsx     # Main component (30-50 lines)
├── SubComponent1.tsx     # Focused sub-components
├── SubComponent2.tsx     # Each with single responsibility
├── types.ts             # Component-specific types
└── utils.ts             # Component-specific utilities
```

**Import pattern for refactored components:**

```typescript
import { ComponentName } from './ComponentName/ComponentName'
import { SubComponent1 } from './ComponentName/SubComponent1'
```

### Custom Hook Extraction

Extract complex logic into custom hooks:

```typescript
// Before: Logic mixed in component
export function ViewModeToggle({ currentMode }) {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState(null)
  // ... 50+ lines of logic
}

// After: Logic extracted to custom hook
export function useViewModeToggle(currentMode: ViewMode) {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState(null)
  // ... extracted logic
  return { isLoading, error, handleToggle, handleDebugTest }
}
```

## Security Best Practices

### API Security

- **Key Encryption**: Encrypt API keys in browser storage
- **HTTPS Only**: All API calls over secure connections
- **Input Validation**: Validate all user inputs
- **Rate Limiting**: Respect API rate limits (100 req/min for Statsig)
- **Error Handling**: Don't expose sensitive data in errors

### Extension Security

- **Minimal Permissions**: Request only necessary permissions
- **Content Security Policy**: Strict CSP for extension pages
- **Message Validation**: Validate all inter-context messages
- **Secure Storage**: Use browser.storage.local with encryption
- **XSS Prevention**: Sanitize all dynamic content

### Data Handling

- **Sensitive Data**: Never log API keys or user data
- **Data Retention**: Clear cached data appropriately
- **User Privacy**: Minimize data collection and storage
- **Secure Transmission**: Encrypt data in transit
- **Access Control**: Validate permissions before operations

## Error Handling Standards

### Error Categories

- **Authentication**: API key and auth-related errors
- **Network**: API communication failures
- **Validation**: Input validation errors
- **Storage**: Browser storage operation failures
- **Unknown**: Unexpected errors with fallback handling

### Error Response Pattern

```typescript
interface StatsigError {
  id: string
  category: ErrorCategory
  severity: ErrorSeverity
  message: string
  userMessage: string
  details?: unknown
  timestamp: string
  recoverable: boolean
  recoveryActions?: string[]
  originalError?: Error
}
```

### Centralized Error Handler

Use the `errorHandler` service for consistent error management:

```typescript
import { errorHandler } from '@/services/error-handler'

try {
  await riskyOperation()
} catch (error) {
  const statsigError = errorHandler.handleError(error, 'Operation context')
  // Error is automatically logged and categorized
  showUserError(statsigError.userMessage)
}
```

### User Experience

- **Graceful Degradation**: Provide fallback functionality
- **Clear Messages**: User-friendly error messages
- **Recovery Actions**: Suggest specific recovery steps
- **Loading States**: Show progress during operations
- **Retry Logic**: Automatic retry for transient failures

## Testing Standards

### Unit Testing

- **High Coverage**: Maintain >90% code coverage
- **Test Behavior**: Test what the code does, not how
- **Mock External Dependencies**: Mock APIs and browser APIs
- **Descriptive Names**: Clear test descriptions
- **Arrange-Act-Assert**: Structure tests consistently

### Integration Testing

- **API Integration**: Test real API interactions
- **Storage Operations**: Test browser storage functionality
- **Message Passing**: Test extension communication
- **Error Scenarios**: Test error handling paths
- **Cross-browser**: Test on multiple browsers

### Component Testing

- **React Testing Library**: Use RTL for component tests
- **User Interactions**: Test user workflows
- **Accessibility**: Test keyboard navigation and screen readers
- **Responsive Design**: Test different viewport sizes
- **Error States**: Test error boundary behavior

## Development Workflow

### Git Practices

- **Feature Branches**: One feature per branch
- **Conventional Commits**: Use conventional commit format
- **Small Commits**: Atomic commits with clear messages
- **Code Review**: All changes require review
- **Clean History**: Squash commits before merge

### Code Review Guidelines

- **Functionality**: Does the code work as intended?
- **Performance**: Are there performance implications?
- **Security**: Are there security vulnerabilities?
- **Maintainability**: Is the code readable and maintainable?
- **Testing**: Are there adequate tests?

### Documentation Standards

- **Code Comments**: Explain why, not what
- **JSDoc**: Document public APIs and complex functions
- **README**: Keep README up to date
- **Architecture Decisions**: Document significant decisions
- **API Documentation**: Document service interfaces

## Logging and Debugging

### Development Logging

Use the centralized logger for consistent logging:

```typescript
import { logger } from '@/utils/logger'

// Development-only logging
logger.info('Configuration loaded successfully')
logger.warn('Rate limit approaching')
logger.debug('User context updated', userContext)

// Always logged (errors)
logger.error('API request failed', error)

// Scoped logging
const apiLogger = logger.scope('API')
apiLogger.info('Making request to Statsig API')
```

### Logging Best Practices

- **Development Only**: Most logs only appear in development mode
- **Error Logging**: Always log errors, even in production
- **Structured Data**: Include relevant context in log messages
- **Scoped Loggers**: Use scoped loggers for different modules
- **No Sensitive Data**: Never log API keys or user data

## Code Quality Enforcement

### ESLint Configuration

The project uses comprehensive ESLint rules:

- **TypeScript Rules**: Strict TypeScript checking
- **React Rules**: React best practices and hooks rules
- **Import Rules**: Automatic import sorting and unused import removal
- **Accessibility Rules**: JSX accessibility checking
- **Code Quality**: Complexity limits and best practices

### Automated Formatting

- **Prettier**: Consistent code formatting
- **Import Sorting**: Automatic import organization
- **Pre-commit Hooks**: Husky + lint-staged for quality gates
- **CI Checks**: Automated linting and formatting checks

### Quality Metrics

- **Complexity**: Max 15 cyclomatic complexity
- **Function Length**: Max 200 lines per function
- **File Length**: Max 500 lines per file
- **Parameters**: Max 4 parameters per function

## Development Scripts and Commands

### Available Scripts

- **Development**: `npm run dev` (Chrome), `npm run dev:firefox` (Firefox MV2)
- **Build**: `npm run build` (Chrome), `npm run build:firefox` (Firefox MV2)
- **Testing**: `npm run test`, `npm run test:watch`, `npm run test:coverage`
- **E2E Testing**: `npm run test:e2e`, `npm run test:e2e:ui`
- **Code Quality**: `npm run lint`, `npm run format`, `npm run type-check`
- **Full Check**: `npm run check` (lint + format + type-check + test)

### Pre-commit Quality Gates

- **Husky**: Git hooks for automated quality checks
- **lint-staged**: Only lint and format staged files
- **Automatic Fixes**: ESLint and Prettier run automatically on commit

### Node.js Requirements

- **Minimum Version**: Node.js >=20.0.0
- **Package Manager**: npm (lock file committed)
- **Type**: ESM module (`"type": "module"` in package.json)

## Extension-Specific Patterns

### Browser Extension Architecture

- **WXT Framework**: Next-gen extension framework for cross-browser compatibility
- **Manifest V3**: Default for Chrome/Edge with modern APIs
- **Manifest V2**: Firefox compatibility with polyfills
- **webextension-polyfill**: Cross-browser API consistency

### Extension Communication

- **Background Script**: Service worker for API calls and coordination
- **Content Script**: Page injection for storage manipulation
- **Message Passing**: Structured communication between contexts
- **Event System**: Reactive updates across extension components

### View Mode Patterns

- **Popup Mode**: 400x600px fixed dimensions, compact layout
- **Sidebar Mode**: Read-only interface with limited functionality
- **Tab Mode**: Full-screen interface with complete functionality
- **Responsive Components**: Adaptive layouts for different view modes

### Storage Patterns

- **Encrypted Storage**: API keys encrypted in browser.storage.local
- **Cache Management**: 5-minute TTL for configuration data
- **Override Persistence**: Storage overrides persist across sessions
- **Data Validation**: Validate all stored data on retrieval

## Performance Patterns

### Bundle Optimization

- **Code Splitting**: Separate bundles for different entry points
- **Tree Shaking**: Remove unused code automatically
- **Dynamic Imports**: Load components on demand
- **Bundle Analysis**: Monitor bundle size and composition

### Runtime Performance

- **Virtual Scrolling**: Handle large configuration lists efficiently
- **React.memo**: Prevent unnecessary re-renders
- **Debounced Search**: Optimize user input handling
- **Lazy Loading**: Load configuration details on demand

### Memory Management

- **Cleanup Patterns**: Proper cleanup in useEffect hooks
- **Service Lifecycle**: Initialize and cleanup services properly
- **Event Listeners**: Remove event listeners on unmount
- **Cache Invalidation**: Clear stale data appropriately
