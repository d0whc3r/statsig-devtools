# Statsig DevTools

A powerful browser extension for testing and debugging Statsig feature flags, experiments, and dynamic configurations. Built with WXT, React, and TypeScript for cross-browser compatibility.

## 🚀 Features

### Core Functionality

- **Feature Flag Testing**: View and override feature flags in real-time
- **Experiment Management**: Test different experiment variations
- **Dynamic Configuration**: Inspect and modify dynamic configs
- **Storage Override**: Manipulate localStorage and sessionStorage values
- **Cookie Management**: Read and modify cookies for testing scenarios

### User Interface

- **Popup Interface**: Quick access to essential controls
- **Side Panel**: Comprehensive dashboard with detailed views
- **Tab Interface**: Full-screen management interface
- **Real-time Updates**: Live synchronization with Statsig API
- **Error Handling**: Robust error boundaries and user feedback

### Developer Experience

- **TypeScript**: Full type safety and IntelliSense support
- **Testing**: Comprehensive test suite with Vitest
- **Linting**: ESLint with TypeScript and React rules
- **Formatting**: Prettier with Tailwind CSS plugin
- **Git Hooks**: Pre-commit hooks with Husky and lint-staged

## 🛠️ Tech Stack

- **Framework**: [WXT](https://wxt.dev/) - Next-gen Web Extension Framework
- **Frontend**: React 19 with TypeScript
- **Styling**: Tailwind CSS 4
- **Testing**: Vitest with Testing Library
- **Build**: Vite with TypeScript
- **Linting**: ESLint + Prettier
- **Package Manager**: npm

## 📦 Installation

1. **Clone the repository**

   ```bash
   git clone <repository-url>
   cd statsig-chrome
   ```

2. **Install dependencies**

   ```bash
   npm install
   ```

3. **Prepare the extension**
   ```bash
   npm run postinstall
   ```

## 🔧 Development

### Chrome Development

```bash
# Start development server for Chrome (Manifest V3)
npm run dev

# Build for production
npm run build

# Create distribution package
npm run zip
```

### Firefox Development

```bash
# Start development server for Firefox (Manifest V2)
npm run dev:firefox

# Build for production
npm run build:firefox

# Create distribution package
npm run zip:firefox
```

### Code Quality

```bash
# Run all checks (lint, format, type-check, test)
npm run check

# Run individual checks
npm run lint          # ESLint
npm run format        # Prettier
npm run type-check    # TypeScript
npm run test          # Vitest

# Fix issues automatically
npm run lint:fix
npm run format
```

### Testing

```bash
# Run tests once
npm run test

# Watch mode
npm run test:watch

# UI mode
npm run test:ui

# Coverage report
npm run test:coverage

# Coverage with UI
npm run test:coverage:ui

# E2E tests
npm run test:e2e

# E2E tests with UI
npm run test:e2e:ui

# E2E tests in headed mode
npm run test:e2e:headed
```

## 📁 Project Structure

```
statsig-chrome/
├── entrypoints/                 # WXT entry points
│   ├── background.ts           # Background service worker
│   ├── content.ts              # Content script
│   ├── popup/                  # Extension popup
│   ├── sidepanel/              # Side panel interface
│   ├── tab/                    # Tab interface
│   ├── modules/                # Shared modules
│   └── types/                  # Type definitions
├── src/
│   ├── components/             # React components
│   │   ├── Dashboard.tsx       # Main dashboard
│   │   ├── AuthComponent.tsx   # Authentication
│   │   ├── ConfigurationList.tsx
│   │   ├── OverrideManager.tsx
│   │   └── ...
│   ├── services/               # Business logic
│   │   ├── statsig-api.ts      # Statsig API integration
│   │   ├── storage-manager.ts  # Storage operations
│   │   ├── cache-manager.ts    # Caching layer
│   │   └── ...
│   ├── hooks/                  # Custom React hooks
│   ├── utils/                  # Utility functions
│   ├── types/                  # TypeScript types
│   └── styles/                 # Global styles
├── public/                     # Static assets
├── tests/                      # Test files
└── config files               # Configuration files
```

## 🔑 Key Components

### Background Script

- Handles extension lifecycle events
- Manages communication between components
- Coordinates content script injection
- Provides debugging and monitoring capabilities

### Content Script

- Injects into web pages to interact with Statsig
- Handles storage overrides (localStorage, sessionStorage)
- Manages cookie operations
- Communicates with background script and UI components

### User Interfaces

- **Popup**: Quick access interface for basic operations
- **Side Panel**: Comprehensive dashboard with detailed views
- **Tab Interface**: Full-screen management for complex operations

### Services

- **Statsig API**: Integration with Statsig's REST API
- **Storage Manager**: Handles browser storage operations
- **Cache Manager**: Optimizes API calls and data retrieval
- **Error Handler**: Centralized error management and reporting

## 🌐 Browser Support

| Browser | Manifest Version | Status       |
| ------- | ---------------- | ------------ |
| Chrome  | V3               | ✅ Supported |
| Firefox | V2               | ✅ Supported |
| Edge    | V3               | ✅ Supported |
| Safari  | V2               | 🔄 Planned   |

## 🔧 Configuration

### Environment Variables

The extension supports various environment variables for configuration:

```bash
# Development
NODE_ENV=development

# Browser detection (automatically set)
BROWSER=chrome|firefox|edge
MANIFEST_VERSION=2|3
```

### Manifest Configuration

The extension manifest is automatically generated based on the target browser:

- **Chrome/Edge**: Manifest V3 with modern APIs
- **Firefox**: Manifest V2 for compatibility

## 🧪 Testing Strategy

### Unit Tests

- Component testing with React Testing Library
- Service layer testing with mocked dependencies
- Utility function testing

### Integration Tests

- End-to-end workflow testing
- API integration testing
- Storage operation testing

### E2E Tests

- Complete user workflow testing with Playwright
- Browser extension functionality testing
- Cross-browser compatibility testing
- Mocked Statsig API responses (no real API keys needed)

### Coverage Requirements

- Minimum 90% coverage for all metrics:
  - Branches: 90%
  - Functions: 90%
  - Lines: 90%
  - Statements: 90%

## 🚀 Deployment

### Building for Production

1. **Chrome/Edge (Manifest V3)**

   ```bash
   npm run build
   npm run zip
   ```

2. **Firefox (Manifest V2)**
   ```bash
   npm run build:firefox
   npm run zip:firefox
   ```

### Extension Store Submission

The built extension packages are ready for submission to:

- Chrome Web Store (chrome-mv3.zip)
- Firefox Add-ons (firefox-mv2.zip)
- Edge Add-ons (chrome-mv3.zip)

## 🤝 Contributing

### Development Workflow

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Make your changes
4. Run quality checks: `npm run check`
5. Commit your changes: `git commit -m 'Add amazing feature'`
6. Push to the branch: `git push origin feature/amazing-feature`
7. Open a Pull Request

### Code Standards

- Follow TypeScript best practices
- Use React functional components with hooks
- Write comprehensive tests for new features
- Maintain consistent code formatting with Prettier
- Follow ESLint rules and fix all warnings

### Git Hooks

Pre-commit hooks automatically run:

- ESLint with auto-fix
- Prettier formatting
- TypeScript type checking
- Test suite

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- [WXT](https://wxt.dev/) - Amazing web extension framework
- [Statsig](https://statsig.com/) - Feature flag and experimentation platform
- [React](https://react.dev/) - UI library
- [Tailwind CSS](https://tailwindcss.com/) - Utility-first CSS framework
- [Vitest](https://vitest.dev/) - Fast unit testing framework

## 📞 Support

For questions, issues, or contributions:

- Open an issue on GitHub
- Check the [WXT documentation](https://wxt.dev/)
- Review [Statsig documentation](https://docs.statsig.com/)

---

Built with ❤️ using WXT and React
