---
inclusion: always
---

# Technical Steering Document

## Tech Stack Decisions

### Core Framework

- **WXT 0.20.8**: Next-gen web extension framework for cross-browser compatibility
- **React 19.1.1**: Latest React with concurrent features and improved hooks
- **TypeScript 5.9.2**: Full type safety with strict configuration
- **Vite**: Fast build system with HMR support (integrated via WXT)

### Styling & UI

- **Tailwind CSS 4.1.12**: Utility-first CSS with latest features and PostCSS integration
- **@tailwindcss/vite 4.1.12**: Vite plugin for Tailwind CSS 4
- **@tailwindcss/postcss 4.1.12**: PostCSS plugin for Tailwind processing
- **Autoprefixer 10.4.21**: Automatic vendor prefixing
- **Responsive Design**: Adaptive layouts for popup/sidepanel/tab modes

### UI Component Libraries

- **Lucide React 0.539.0**: Modern icon library with React components
- **Framer Motion 12.23.12**: Animation library for smooth UI transitions
- **Class Variance Authority 0.7.1**: Type-safe variant API for component styling
- **clsx 2.1.1**: Utility for constructing className strings conditionally
- **tailwind-merge 3.3.1**: Utility for merging Tailwind CSS classes

### Browser Extension Architecture

- **Manifest V3**: Default for Chrome/Edge with modern APIs
- **Manifest V2**: Firefox compatibility with `--mv2` flag
- **webextension-polyfill 0.12.0**: Cross-browser API consistency
- **@wxt-dev/module-react 1.1.3**: React integration for WXT

### API Integration

- **Console API Only**: Single API strategy using Console API key for all operations
- **REST API**: Console API for configuration fetching and management
- **OpenAPI Code Generation**: @hey-api/openapi-ts 0.80.10 with custom patches
- **Zod Validation**: Runtime type validation with Zod 4.0.17
- **Caching**: 5-minute TTL for configuration data

### State Management

- **Zustand 5.0.7**: Lightweight state management with TypeScript support
- **Immer 10.1.1**: Immutable state updates with mutable syntax
- **Persist Middleware**: Automatic state persistence to browser storage
- **Devtools Integration**: Redux DevTools support for debugging
- **React Hooks**: useState, useEffect, useCallback for local component state
- **Custom Hooks**: Reusable logic for auth, configurations, overrides
- **Browser Storage**: Persistent state using browser.storage.local

### Development Tools

- **Vitest 3.2.4**: Fast unit testing with V8 coverage
- **@vitest/ui 3.2.4**: Interactive test UI
- **@vitest/coverage-v8 3.2.4**: V8-based coverage reporting
- **ESLint 9.33.0**: Modern flat config with comprehensive rules
- **Prettier 3.6.2**: Code formatting with Tailwind plugin
- **Husky 9.1.7**: Git hooks for code quality
- **lint-staged 16.1.5**: Staged file processing
- **patch-package 8.0.0**: NPM package patching for custom fixes

### Testing Framework

- **Vitest 3.2.4**: Fast unit testing with native ESM support
- **@testing-library/react 16.3.0**: Component testing with user-centric approach
- **@testing-library/jest-dom 6.7.0**: Additional DOM matchers with Vitest integration
- **@testing-library/user-event 14.6.1**: User interaction simulation
- **happy-dom 18.0.1**: Lightweight DOM implementation for tests
- **Playwright 1.54.2**: Cross-browser E2E testing with extension support

### Code Quality & Automation

- **ESLint 9.33.0**: Modern flat config with comprehensive TypeScript and React rules
- **@typescript-eslint/eslint-plugin 8.39.1**: TypeScript-specific linting rules
- **@typescript-eslint/parser 8.39.1**: TypeScript parser for ESLint
- **eslint-plugin-react 7.37.5**: React best practices enforcement
- **eslint-plugin-react-hooks 5.2.0**: React Hooks rules and best practices
- **eslint-plugin-jsx-a11y 6.10.2**: Accessibility linting for JSX elements
- **eslint-plugin-simple-import-sort 12.1.1**: Automatic import sorting and organization
- **eslint-plugin-unused-imports 4.1.4**: Unused import detection and removal
- **eslint-plugin-import 2.32.0**: Import/export syntax validation
- **eslint-plugin-testing-library 7.6.6**: Testing Library best practices
- **eslint-plugin-prettier 5.5.4**: Prettier integration with ESLint
- **eslint-config-prettier 10.1.8**: Disables conflicting ESLint rules
- **prettier-plugin-tailwindcss 0.6.14**: Tailwind class sorting and formatting

### Release & Deployment

- **semantic-release 24.2.7**: Automated versioning and publishing
- **conventional-changelog-conventionalcommits 9.1.0**: Conventional commit parsing
- **@semantic-release/github 11.0.4**: GitHub release automation with asset uploads
- **@semantic-release/changelog 6.0.3**: Automated changelog generation
- **@semantic-release/git 10.0.1**: Git integration for version commits
- **@semantic-release/npm 12.0.2**: NPM integration (publishing disabled)

### Release Configuration

- **Conventional Commits**: Strict commit message format enforcement
- **Semantic Versioning**: Automatic version bumping based on commit types
- **Release Assets**: Automatic upload of Chrome and Firefox extension packages
- **Changelog Generation**: Automated changelog with categorized changes
- **Branch Strategy**: Releases from master branch only

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
- **Target**: ES2022 for modern JavaScript features
- **Vite Integration**: Tailwind CSS plugin and custom alias configuration

### TypeScript Configuration

- **Project References**: Composite project structure with separate configs for app, test, e2e, and config files
- **Strict Mode**: All strict TypeScript checks enabled
- **Unused Variables**: `noUnusedLocals` and `noUnusedParameters` enforced
- **Switch Statements**: `noFallthroughCasesInSwitch` prevents fallthrough bugs
- **Import Extensions**: `allowImportingTsExtensions` for better module resolution
- **Type Definitions**: Chrome, Node, and webextension-polyfill types included
- **Target**: ES2022 for compilation output

### ESLint Configuration (Flat Config)

- **Modern Setup**: ESLint 9.x flat configuration format with comprehensive plugin integration
- **TypeScript Integration**: Full TypeScript parsing and rule enforcement
- **React Rules**: Comprehensive React and React Hooks rules with JSX best practices
- **Import Management**: Automatic import sorting and unused import removal
- **Accessibility**: JSX accessibility rules for inclusive design
- **Code Quality**: Complexity limits (max 15), function length limits (max 200 lines), and performance rules
- **File-specific Configs**: Separate configurations for test files, E2E tests, and config files
- **Prettier Integration**: Automatic code formatting with Tailwind class sorting

### Testing Configuration

- **Vitest Setup**: Fast testing with V8 coverage provider and happy-dom environment
- **Coverage Thresholds**: 90% coverage requirement for all metrics (branches, functions, lines, statements)
- **Browser API Mocking**: Comprehensive mocking of extension APIs in setup.ts
- **Playwright E2E**: Extension-specific E2E testing with automated loading
- **Test Organization**: Separate TypeScript configs for unit tests and E2E tests

## Development Environment

### Node.js Requirements

- **Minimum Version**: Node.js >=20.0.0
- **Package Manager**: npm (lock file committed)
- **Module Type**: ESM (`"type": "module"` in package.json)

### Development Scripts

- **Development**: `npm run dev` (Chrome), `npm run dev:firefox` (Firefox MV2)
- **Build**: `npm run build` (Chrome), `npm run build:firefox` (Firefox MV2)
- **Packaging**: `npm run zip` (Chrome), `npm run zip:firefox` (Firefox MV2)
- **Testing**: `npm run test`, `npm run test:watch`
- **E2E Testing**: `npm run test:e2e`, `npm run test:e2e:ui`
- **Type Checking**: `npm run type-check`, `npm run type-check:all` (all projects)
- **Code Quality**: `npm run lint`, `npm run lint:fix`
- **Full Check**: `npm run check` (lint:fix + type-check:all + test)
- **CI Check**: `npm run check:ci` (lint + type-check:all + test)
- **OpenAPI Generation**: `npm run openapi-ts`

### Git Hooks (Husky)

- **Pre-commit**: Lint-staged files, type check, run tests
- **Commit-msg**: Validate conventional commit format with detailed error messages
- **Pre-push**: Full project lint/format fixes, type check, tests, and cross-browser builds
- **Patch Package**: Automatic patch application on install

### Continuous Integration

- **Quality Gates**: Automated linting, formatting, type checking, and testing
- **Coverage Reporting**: HTML, JSON, and text reports with 90% thresholds
- **Cross-browser Builds**: Automated Chrome and Firefox extension builds
- **Release Automation**: Semantic versioning with GitHub releases and asset uploads
- **Dependency Updates**: Renovate bot for automated dependency management

## API Code Generation

### OpenAPI Integration

- **@hey-api/openapi-ts 0.80.10**: Modern OpenAPI TypeScript generator
- **Source**: Statsig OpenAPI spec (https://api.statsig.com/openapi/20240601.json)
- **Output**: Generated client in `src/client/` with TypeScript types and Zod validators
- **Plugins**: TypeScript generation, Fetch client, SDK with class-based approach
- **Custom Patches**: Applied via patch-package for TypeScript compatibility fixes
- **Runtime Config**: Custom HTTP client configuration for authentication

### Generated Code Structure

- **Client Generation**: Automatic API client generation with type safety
- **Zod Validation**: Runtime type validation for API responses
- **SDK Classes**: Class-based SDK approach for better organization
- **Fetch Integration**: Modern fetch-based HTTP client
- **Type Safety**: Full TypeScript coverage for API operations

## Technical Constraints

- **Bundle Size**: <500KB total extension size
- **Memory Usage**: <50MB runtime memory footprint
- **API Limits**: Respect Statsig rate limits (100 req/min)
- **Security**: CSP compliance and secure storage practices
- **Browser Support**: Chrome 88+ (Manifest V3), Firefox (Manifest V2)

## Dependency Management

### Package Management

- **NPM**: Primary package manager with committed lock file
- **Renovate**: Automated dependency updates with recommended configuration
- **Patch Package**: Custom patches for third-party packages when needed
- **Version Pinning**: Exact versions for critical dependencies

### Update Strategy

- **Automated Updates**: Renovate bot handles routine dependency updates
- **Security Updates**: Automatic security patches via Renovate
- **Major Version Updates**: Manual review and testing required
- **Custom Patches**: Applied automatically via postinstall hook

## Performance Optimizations

- **Build Target**: ES2022 for modern JavaScript features and better performance
- **Bundle Splitting**: Code splitting for different entry points
- **Tree Shaking**: Automatic unused code elimination
- **Minification**: ESBuild minification for production builds
- **Source Maps**: Development-only source maps for debugging
- **Virtual Scrolling**: Large configuration lists
- **React.memo**: Expensive component re-renders
- **Debounced Search**: User input optimization
- **Lazy Loading**: Configuration details on demand
