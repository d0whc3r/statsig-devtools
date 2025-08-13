---
inclusion: always
---

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

## Domain Terminology

### Configuration Types

- **Feature Gate**: Boolean flag that controls feature availability (on/off)
- **Dynamic Config**: Key-value configuration that returns structured data
- **Experiment**: A/B test configuration that assigns users to different groups
- **Autotune**: Automated optimization configuration
- **Layer**: Hierarchical configuration grouping

### API Key Types

- **Console API Key**: Server-side key (prefix: `console-`) for all operations including configuration metadata and evaluation
- **Single API Strategy**: Simplified architecture using only Console API key

### Evaluation Concepts

- **Evaluation Result**: Outcome of checking a configuration against user context
- **Rule ID**: Unique identifier for the rule that determined the evaluation outcome
- **Group Name**: Experiment group assignment (e.g., "control", "treatment")
- **Pass Percentage**: Percentage of users who should pass a rule
- **Secondary Exposures**: Additional gates checked during evaluation
- **User Context**: User attributes used for targeting (userID, email, custom fields)

### Storage Override System

- **Storage Override**: Browser storage manipulation to test different scenarios
- **Override Types**: localStorage, sessionStorage, cookie
- **Override Persistence**: Overrides maintained across browser sessions
- **Override ID**: Unique identifier for tracking and managing overrides
- **Feature Override**: Override specifically targeting a Statsig configuration

### View Modes

- **Popup Mode**: Compact 480x550px interface for quick operations
- **Sidebar Mode**: Read-only comprehensive view in Chrome's side panel
- **Tab Mode**: Full-screen interface for complex operations and detailed management

## Business Rules

### API Key Validation

- Console API keys must start with "console-" prefix
- API key validation includes permission and project access checks
- Single key handles both configuration metadata and evaluation operations

### Configuration Evaluation

- Feature gates return boolean values (true/false)
- Experiments return group assignments (string values)
- Dynamic configs return structured data (objects)
- Evaluation requires valid user context
- Failed evaluations return default values with error reasons

### Storage Override Rules

- Overrides are applied immediately to the current page
- Each override has a unique ID based on type, key, and domain
- Duplicate overrides (same type/key/domain) replace existing ones
- Overrides persist across browser sessions until manually removed
- Content script injection required for override application

### View Mode Constraints

- Popup mode has fixed dimensions (480x550px)
- Sidebar mode is read-only (no override management)
- Tab mode provides full functionality
- View mode preferences are persisted per user
- Sidebar requires Chrome 114+ with sidePanel API support

### Error Handling Classifications

- **Authentication Errors**: Invalid API keys, permission issues (401, 403)
- **API Errors**: Network failures, rate limits, server errors (429, 500)
- **Storage Errors**: Browser storage quota, encryption failures
- **Injection Errors**: Content script unavailable, blocked pages
- **Validation Errors**: Invalid input data, malformed configurations
- **Network Errors**: Connection timeouts, offline scenarios

## Validation Patterns

### URL Injection Validation

- Only HTTP/HTTPS protocols allowed
- Browser internal pages blocked (chrome:, about:, file:)
- Extension pages blocked (chrome-extension:, moz-extension:)
- Store domains blocked (chromewebstore.google.com, addons.mozilla.org)

### Configuration Data Validation

- Configuration names must be non-empty strings
- Rule conditions require type, operator, and target value
- Pass percentages must be between 0 and 1
- User context fields validated against expected types

### Storage Override Validation

- Override keys must be non-empty strings
- Cookie overrides require domain specification
- Storage values serialized as strings
- Override IDs must be unique within type/key/domain scope

### API Response Validation

- All API responses checked for success status
- Error responses include user-friendly messages
- Rate limit responses trigger retry logic
- Malformed responses handled gracefully

## Key Features

### Authentication & Security

- Single API key system (Console API only)
- AES-GCM encryption for stored API keys
- API key validation with project detection
- Secure storage with browser.storage.local

### Configuration Management

- View all feature gates, experiments, and dynamic configs
- Real-time evaluation with user context
- Rule inspection and targeting logic display
- Configuration search and filtering by type/status
- Cached configuration data with 5-minute TTL

### Testing & Override System

- localStorage/sessionStorage/cookie manipulation
- Storage override persistence across sessions
- Bulk override operations and management
- Content script injection for page-level changes
- Override tracking with unique identifiers

### User Interface

- **Popup**: Quick access for basic operations (480x550px)
- **Side Panel**: Comprehensive dashboard with read-only access
- **Tab Interface**: Full-screen management for complex operations
- Responsive design adapting to different view modes
- Error boundaries with user-friendly messages

### Developer Experience

- Comprehensive error categorization and recovery actions
- Loading states and progress indicators
- Notification system for user feedback
- Debug tools for troubleshooting
- Accessibility support and keyboard navigation

## Product Constraints

### Technical Limitations

- Browser extension security model restrictions
- Statsig API rate limits (100 requests/minute)
- Cross-origin restrictions for content injection
- Storage size limitations for cached data
- Bundle size constraints (<500KB total)

### Browser Compatibility

- Chrome MV3 (primary target)
- Firefox MV2 (secondary support)
- Safari MV2 (future roadmap)
- Sidebar requires Chrome 114+

### Functional Constraints

- Content script injection blocked on internal browser pages
- Override application requires page refresh in some cases
- Single API key handles all operations (simplified architecture)

## Success Metrics

### Performance Targets

- Configuration loading performance (<2s)
- Override application success rate (>95%)
- User error rate (<5% of operations)
- Cross-browser compatibility (Chrome/Firefox)

### User Experience Metrics

- Time to first configuration load
- Override creation success rate
- Error recovery completion rate
- View mode switching success rate

## Future Roadmap

### Near-term Enhancements

- Safari support (MV2)
- Advanced filtering and search capabilities
- Configuration export/import functionality
- Enhanced error recovery workflows

### Long-term Vision

- Team collaboration features
- Integration with CI/CD pipelines
- Advanced analytics and reporting
- Multi-project management support
