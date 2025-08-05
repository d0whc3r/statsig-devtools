# Technical Steering Document

## Tech Stack Decisions

### Core Framework

- **WXT**: Next-gen web extension framework for cross-browser compatibility
- **React 19**: Latest React with concurrent features and improved hooks
- **TypeScript**: Full type safety with strict configuration
- **Vite**: Fast build system with HMR support

### Styling & UI

- **Tailwind CSS 4**: Utility-first CSS with latest features
- **Responsive Design**: Adaptive layouts for popup/sidepanel/tab modes
- **Component Library**: Custom components with consistent design system

### Browser Extension Architecture

- **Manifest V3**: Default for Chrome/Edge with modern APIs
- **Manifest V2**: Firefox compatibility with polyfills
- **webextension-polyfill**: Cross-browser API consistency

### API Integration

- **Dual API Strategy**: Console API (metadata) + Client SDK (evaluation)
- **@statsig/js-client**: Official Statsig SDK for real-time evaluation
- **REST API**: Console API for configuration fetching
- **Caching**: 5-minute TTL for configuration data

### State Management

- **React Hooks**: useState, useEffect, useCallback for local state
- **Custom Hooks**: Reusable logic for auth, configurations, overrides
- **No Global State**: Prop drilling with context for shared data
- **Local Storage**: Persistent state for auth and overrides

### Development Tools

- **Vitest**: Fast unit testing with React Testing Library
- **ESLint**: TypeScript + React rules with Prettier integration
- **Husky**: Pre-commit hooks for code quality
- **lint-staged**: Staged file linting and formatting

## Architecture Patterns

### Component Architecture

- **Functional Components**: React hooks pattern throughout
- **Composition**: Higher-order components for shared behavior
- **Error Boundaries**: Graceful error handling at component level
- **Loading States**: Consistent loading UI patterns

### Service Layer

- **Unified API Service**: Single interface for Statsig operations
- **Storage Manager**: Encrypted browser storage operations
- **Error Handler**: Centralized error management with categorization
- **Cache Manager**: Intelligent caching with TTL and invalidation

### Extension Communication

- **Background Script**: Service worker for API calls and coordination
- **Content Script**: Page injection for storage manipulation
- **Message Passing**: Structured communication between contexts
- **Event System**: Reactive updates across extension components

## Technical Constraints

- **Bundle Size**: <500KB total extension size
- **Memory Usage**: <50MB runtime memory footprint
- **API Limits**: Respect Statsig rate limits (100 req/min)
- **Security**: CSP compliance and secure storage practices

## Performance Optimizations

- **Virtual Scrolling**: Large configuration lists
- **React.memo**: Expensive component re-renders
- **Debounced Search**: User input optimization
- **Lazy Loading**: Configuration details on demand
- **Bundle Splitting**: Code splitting for different entry points
