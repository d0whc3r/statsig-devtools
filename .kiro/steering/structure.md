# Project Structure Steering Document

## Directory Organization

### Root Level
```
statsig-devtools/
├── entrypoints/          # WXT entry points (extension contexts)
├── src/                  # Application source code
├── public/               # Static assets (icons, manifest resources)
├── .kiro/               # Project documentation and specifications
├── .output/             # Build output (generated)
└── config files         # TypeScript, ESLint, Prettier, etc.
```

### Entry Points (`entrypoints/`)
```
entrypoints/
├── background.ts         # Service worker (API calls, coordination)
├── content.ts           # Content script (page injection)
├── popup/               # Extension popup interface
│   ├── App.tsx          # Popup root component
│   ├── main.tsx         # Popup entry point
│   └── index.html       # Popup HTML template
├── sidepanel/           # Side panel interface
├── tab/                 # Full tab interface
├── modules/             # Shared extension modules
│   ├── storage-operations.ts
│   ├── statsig-injection.ts
│   └── script-execution.ts
└── types/               # Extension-specific types
```

### Source Code (`src/`)
```
src/
├── components/          # React UI components
│   ├── AppLayout.tsx    # Main layout wrapper
│   ├── Dashboard.tsx    # Primary dashboard
│   ├── AuthComponent.tsx # Authentication UI
│   ├── Configuration*.tsx # Config management components
│   ├── Override*.tsx    # Override management components
│   └── shared/          # Reusable UI components
├── hooks/               # Custom React hooks
│   ├── useAuth.ts       # Authentication state
│   ├── useConfiguration*.ts # Config data hooks
│   └── useStorageOverrides.ts # Override management
├── services/            # Business logic layer
│   ├── unified-statsig-api.ts # Main API service
│   ├── statsig-api.ts   # Console API client
│   ├── storage-manager.ts # Browser storage
│   ├── error-handler.ts # Error management
│   └── cache-manager.ts # Caching layer
├── utils/               # Utility functions
│   ├── browser-api.ts   # Browser API abstractions
│   ├── logger.ts        # Logging utilities
│   └── configuration-formatters.ts # Data formatting
├── types/               # TypeScript type definitions
└── styles/              # Global CSS styles
```

## File Naming Conventions
- **Components**: PascalCase (e.g., `ConfigurationList.tsx`)
- **Hooks**: camelCase with `use` prefix (e.g., `useAuth.ts`)
- **Services**: kebab-case (e.g., `storage-manager.ts`)
- **Types**: camelCase (e.g., `index.ts`)
- **Tests**: Same as source with `.test.ts` suffix

## Import/Export Patterns
- **Default Exports**: Components and main service classes
- **Named Exports**: Utilities, types, and helper functions
- **Barrel Exports**: Index files for clean imports
- **Absolute Imports**: Use `@/` alias for src directory

## Component Organization
- **One Component Per File**: Single responsibility principle
- **Co-located Tests**: Test files next to source files
- **Shared Components**: Reusable components in dedicated folder
- **Feature Grouping**: Related components grouped by functionality

## Service Layer Structure
- **Single Responsibility**: Each service handles one domain
- **Dependency Injection**: Services accept dependencies as parameters
- **Error Handling**: Consistent error handling across services
- **Async/Await**: Promise-based APIs throughout

## Type Organization
- **Domain Types**: Grouped by business domain
- **API Types**: Separate from business logic types
- **Component Props**: Defined inline or in component file
- **Shared Types**: Exported from types/index.ts

## Asset Management
- **Icons**: Multiple sizes (16, 32, 48, 96, 128px) in public/icon/
- **Static Files**: Public directory for manifest resources
- **Generated Assets**: Build output in .output/ directory
- **Development Assets**: Hot reload and dev server assets
