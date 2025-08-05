# Product Steering Document

## Product Vision
Statsig DevTools is a browser extension that empowers developers and QA engineers to test, debug, and validate Statsig feature flags, experiments, and dynamic configurations in real-time without backend changes.

## Core Value Proposition
- **Real-time Testing**: Override feature flags and experiment values instantly
- **Zero Backend Changes**: Test scenarios through browser storage manipulation
- **Developer Productivity**: Streamlined workflow for feature flag debugging
- **Cross-browser Support**: Works on Chrome (MV3) and Firefox (MV2)

## Target Users
- **Primary**: Frontend developers working with feature flags
- **Secondary**: QA engineers testing feature variations
- **Tertiary**: Product managers validating experiment configurations

## Key Features

### Authentication & Security
- Dual API key system (Console API + Client SDK)
- Secure storage with encryption
- API key validation and project detection

### Configuration Management
- View all feature gates, experiments, and dynamic configs
- Real-time evaluation with user context
- Rule inspection and targeting logic display
- Configuration search and filtering

### Testing & Override System
- localStorage/sessionStorage manipulation
- Cookie management for testing scenarios
- Storage override persistence across sessions
- Bulk override operations

### User Interface
- **Popup**: Quick access for basic operations (400x600px)
- **Side Panel**: Comprehensive dashboard with detailed views
- **Tab Interface**: Full-screen management for complex operations
- Responsive design adapting to different view modes

### Developer Experience
- Error boundaries with user-friendly messages
- Loading states and progress indicators
- Notification system for user feedback
- Keyboard shortcuts and accessibility support

## Product Constraints
- Browser extension security model limitations
- Statsig API rate limits and permissions
- Cross-origin restrictions for content injection
- Storage size limitations for cached data

## Success Metrics
- Configuration loading performance (<2s)
- Override application success rate (>95%)
- User error rate (<5% of operations)
- Cross-browser compatibility (Chrome/Firefox)

## Future Roadmap
- Safari support (MV2)
- Advanced filtering and search
- Configuration export/import
- Team collaboration features
- Integration with CI/CD pipelines
