---
inclusion: always
---

# Technical Steering Document

## Tech Stack Decisions

### Core Framework

- **WXT 0.20.7**: Next-gen web extension framework for cross-browser compatibility
- **React 19.1.1**: Latest React with concurrent features and improved hooks
- **TypeScript 5.9.2**: Full type safety with strict configuration
- **Vite**: Fast build system with HMR support (integrated via WXT)

### Styling & UI

- **Tailwind CSS 4.1.11**: Utility-first CSS with latest features and PostCSS integration
- **@tailwindcss/vite**: Vite plugin for Tailwind CSS 4
- **@tailwindcss/postcss**: PostCSS plugin for Tailwind processing
- **Autoprefixer 10.4.21**: Automatic vendor prefixing
- **Responsive Design**: Adaptive layouts for popup/sidepanel/tab modes

### Browser Extension Architecture

- **Manifest V3**: Default for Chrome/Edge with modern APIs
- **Manifest V2**: Firefox compatibility with `--mv2` flag
- **webextension-polyfill 0.12.0**: Cross-browser API consistency
- **@wxt-dev/module-react 1.1.3**: React integration for WXT

### API Integration

- **Dual API Strategy**: Console API (metadata) + Client SDK (evaluation)
- **@statsig/js-client 3.21.1**: Official Statsig SDK for real-time evaluation
- **REST API**: Console API for configuration fetching
- **Caching**: 5-minute TTL for configuration data

### State Management

- **React Hooks**: useState, useEffect, useCallback for local state
- **Custom Hooks**: Reusable logic for auth, configurations, overrides
- **No Global State**: Prop drilling with context for shared data
- **Browser Storage**: Persistent state using browser.storage.local

### Development Tools

- **Vitest 3.2.4**: Fast unit testing with V8 coverage
- **@vitest/ui 3.2.4**: Interactive test UI
- **@vitest/coverage-v8 3.2.4**: V8-based coverage reporting
- **ESLint 9.33.0**: Modern flat config with comprehensive rules
- **Prettier 3.6.2**: Code formatting with Tailwind plugin
- **Husky 9.1.7**: Git hooks for code quality
- **lint-staged 16.1.5**: Staged file processing

### Testing Framework

- **Vitest 3.2.4**: Fast unit testing with native ESM support
- **@testing-library/react 16.3.0**: Component testing with user-centric approach
- **@testing-library/jest-dom 6.6.4**: Additional DOM matchers with Vitest integration
- **@testing-library/user-event 14.6.1**: User interaction simulation
- **happy-dom 18.0.1**: Lightweight DOM implementation for tests
- **Playwright 1.54.2**: Cross-browser E2E testing with extension support

### Code Quality & Automation

- **ESLint 9.33.0**: Modern flat config with comprehensive TypeScript and React rules
- **@typescript-eslint/eslint-plugin 8.39.0**: TypeScript-specific linting rules
- **eslint-plugin-react 7.37.5**: React best practices enforcement
- **eslint-plugin-jsx-a11y 6.10.2**: Accessibility linting
- **eslint-plugin-simple-import-sort 12.1.1**: Automatic import sorting
- **eslint-plugin-unused-imports 4.1.4**: Unused import detection and removal
- **prettier-plugin-tailwindcss 0.6.14**: Tailwind class sorting

### Release & Deployment

- **semantic-release 24.2.7**: Automated versioning and publishing
- **conventional-changelog-conventionalcommits 9.1.0**: Conventional commit parsing
- **@semantic-release/github 11.0.4**: GitHub release automation
- **@semantic-release/changelog 6.0.3**: Automated changelog generation

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

## Build Configuration

### WXT Configuration

- **Entry Points**: Automatic detection of popup, sidepanel, tab, background, and content scripts
- **Manifest Generation**: Automatic manifest.json generation with permissions and CSP
- **Cross-browser Support**: Chrome MV3 (default) and Firefox MV2 (`--mv2` flag)
- **Development Server**: Hot reload for extension development
- **Build Optimization**: Automatic code splitting and tree shaking

### TypeScript Configuration

- **Strict Mode**: All strict TypeScript checks enabled
- **Unused Variables**: `noUnusedLocals` and `noUnusedParameters` enforced
- **Switch Statements**: `noFallthroughCasesInSwitch` prevents fallthrough bugs
- **Import Extensions**: `allowImportingTsExtensions` for better module resolution
- **Type Definitions**: Chrome and Node types included for extension development

### ESLint Configuration (Flat Config)

- **Modern Setup**: ESLint 9.x flat configuration format
- **TypeScript Integration**: Full TypeScript parsing and rule enforcement
- **React Rules**: Comprehensive React and React Hooks rules
- **Import Management**: Automatic import sorting and unused import removal
- **Accessibility**: JSX accessibility rules for inclusive design
- **Code Quality**: Complexity limits, best practices, and performance rules

### Testing Configuration

- **Vitest Setup**: Fast testing with V8 coverage provider
- **Happy DOM**: Lightweight DOM implementation for better performance
- **Coverage Thresholds**: 90% coverage requirement for all metrics
- **Browser API Mocking**: Comprehensive mocking of extension APIs
- **Playwright E2E**: Extension-specific E2E testing with automated loading

## Development Environment

### Node.js Requirements

- **Minimum Version**: Node.js >=20.0.0
- **Package Manager**: npm (lock file committed)
- **Module Type**: ESM (`"type": "module"` in package.json)

### Development Scripts

- **Development**: `npm run dev` (Chrome), `npm run dev:firefox` (Firefox MV2)
- **Build**: `npm run build` (Chrome), `npm run build:firefox` (Firefox MV2)
- **Testing**: `npm run test`, `npm run test:watch`, `npm run test:coverage`
- **E2E Testing**: `npm run test:e2e`, `npm run test:e2e:ui`
- **Code Quality**: `npm run lint`, `npm run format`, `npm run type-check`
- **Full Check**: `npm run check` (lint + format + type-check + test)

### Git Hooks (Husky)

- **Pre-commit**: Lint-staged files, type check, run tests
- **Commit-msg**: Validate conventional commit format
- **Pre-push**: Full project lint/format, type check, tests, and builds

### Continuous Integration

- **Quality Gates**: Automated linting, formatting, type checking, and testing
- **Coverage Reporting**: HTML, JSON, and JUnit XML reports
- **Cross-browser Builds**: Automated Chrome and Firefox extension builds
- **Release Automation**: Semantic versioning with GitHub releases

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
