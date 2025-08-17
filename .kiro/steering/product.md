---
inclusion: always
---

# Product Steering Document

## Product Vision

Statsig DevTools is a browser extension that empowers developers and QA engineers to test, debug, and validate Statsig feature flags, experiments, and dynamic configurations in real-time without backend changes.

## Core Value Proposition

- **Real-time Testing**: Override feature flags and experiment values instantly
- **Dual Override System**: Test scenarios through browser storage manipulation or Statsig API overrides
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
- **Experiment**: A/B test configuration that assigns users to different groups and tracks allocation percentages

### API Key Types

- **Console API Key**: Server-side key (prefix: `console-`) for all operations including configuration metadata and API overrides
- **Single API Strategy**: Simplified architecture using only Console API key

### User Identity System

- **User ID**: Primary user identifier for targeting and overrides
- **Stable ID**: Alternative user identifier (mapped to `customID` in Statsig API)
- **User Context**: User attributes used for targeting and override application
- **Current User**: The active user identifier set for API override operations

### Override System

#### Browser Storage Overrides

- **Storage Override**: Browser storage manipulation to test different scenarios locally
- **Override Types**: localStorage, sessionStorage, cookie
- **Override Persistence**: Overrides maintained across browser sessions
- **Override ID**: Unique identifier for tracking and managing overrides

#### API Overrides (Statsig Console API)

- **API Override**: Server-side override applied through Statsig Console API
- **Gate Override**: Boolean override for feature gates (passing/failing user lists)
- **Experiment Override**: Group assignment override for experiments
- **User ID Override**: Override targeting specific userID
- **Custom ID Override**: Override targeting specific customID (stableId)
- **Override Expiration**: Optional expiration time for API overrides

### View Modes

- **Popup Mode**: Compact 480x550px interface for quick operations
- **Sidebar Mode**: Read-only comprehensive view in Chrome's side panel
- **Tab Mode**: Full-screen interface for complex operations and detailed management

## Business Rules

### API Key Validation

- Console API keys must start with "console-" prefix
- API key validation includes permission and project access checks
- Single key handles both configuration metadata and API override operations
- Validation performed against `/console/v1/company` endpoint

### Configuration Status Types

- **active**: Configuration is live and serving traffic
- **inactive**: Configuration exists but is not serving traffic
- **draft**: Configuration is being developed and not yet live
- **setup**: Configuration is being set up (experiments)
- **running**: Configuration is actively running (experiments)
- **completed**: Configuration has finished running (experiments)
- **paused**: Configuration is temporarily stopped

### Configuration Data Rules

- Feature gates have `isEnabled` boolean property and `checksPerHour` metrics
- Experiments have `allocation` percentage, `startTime`, and `endTime` properties
- Dynamic configs have `isEnabled` boolean and structured default values
- All configurations have `id`, `name`, `description`, `status`, and `type` properties

### Override System Rules

#### Browser Storage Override Rules

- Overrides are applied immediately to the current page
- Each override has a unique ID generated with timestamp and random suffix
- Duplicate overrides (same type/key/domain) replace existing ones
- Overrides persist across browser sessions until manually removed
- Content script injection required for override application

#### API Override Rules

- API overrides require valid Console API key and user identifier
- Gate overrides support boolean values (true/false)
- Experiment overrides support group assignment strings
- Dynamic config overrides not supported via API
- User identifier can be `userID` or `customID` (stableId)
- API overrides are applied server-side and affect all clients
- Override removal requires same user identifier used for creation

### User Identity Rules

- User can have either `userId` or `stableId`, not both simultaneously
- `userId` maps to Statsig API `userID` parameter
- `stableId` maps to Statsig API `customID` parameter
- User identifier is required for API override operations
- User identifier can be edited and persists across sessions

### View Mode Constraints

- Popup mode has fixed dimensions (480x550px)
- Sidebar mode is read-only (no override management)
- Tab mode provides full functionality
- View mode preferences are ephemeral (not persisted)
- Sidebar requires Chrome 114+ with sidePanel API support

### Data Pagination Rules

- API responses include pagination metadata (`itemsPerPage`, `pageNumber`, `totalItems`)
- Default pagination: page 1, limit 100 items
- Pagination parameters are optional in API requests

## Validation Patterns

### API Key Validation

- Console API keys must start with "console-" prefix
- Validation performed via `/console/v1/company` endpoint
- HTTP status codes: 401 (invalid key), 403 (insufficient permissions), 500+ (server error)
- Validation results cached to avoid repeated API calls

### User Identifier Validation

- User identifiers must be non-empty strings after trimming
- Either `userId` or `stableId` required, not both
- User identifier required for all API override operations
- Custom user ID input supports override of current user context

### Override Value Validation

- Override values support JSON parsing for complex data types
- String values used as fallback if JSON parsing fails
- Empty or whitespace-only values rejected
- Boolean values for gate overrides, string values for experiment overrides

### API Response Validation

- All API responses validated using Zod schemas
- Configuration list responses include data array and pagination metadata
- Override responses include user ID lists and group assignments
- Parse errors logged with context information
- Malformed responses handled gracefully with fallback empty data

### Storage Override Validation

- Override keys must be non-empty strings
- Cookie overrides require domain specification
- Storage values serialized as strings
- Override IDs generated with unique timestamp and random suffix pattern

## Key Features

### Authentication & Security

- Single API key system (Console API only)
- API key validation with company endpoint verification
- Secure storage with browser.storage.local
- User identifier management (userId/stableId)

### Configuration Management

- View all feature gates, experiments, and dynamic configs
- Configuration data with pagination support (default: 100 items per page)
- Status-based filtering (active, inactive, draft, setup, running, completed, paused)
- Configuration metrics display (checksPerHour for gates, allocation for experiments)
- Real-time data loading with individual loading states per configuration type

### Dual Override System

#### Browser Storage Overrides

- localStorage/sessionStorage/cookie manipulation
- Storage override persistence across sessions
- Unique override ID generation and tracking
- Content script injection for page-level changes

#### API Overrides (Statsig Console API)

- Server-side overrides through Statsig Console API
- Gate overrides with boolean values (passing/failing user lists)
- Experiment overrides with group assignment
- User-specific targeting (userID/customID)
- Override removal and management
- Real-time override status display

### User Interface

- **Popup**: Quick access for basic operations (480x550px)
- **Side Panel**: Comprehensive dashboard with read-only access
- **Tab Interface**: Full-screen management for complex operations
- Responsive design adapting to different view modes
- Configuration tabs with expandable details
- Override panels with dual source selection (browser/API)

### User Management

- User identifier configuration (userId vs stableId)
- Current user display and editing
- API override count tracking
- User context persistence across sessions

### Developer Experience

- Centralized error handling with user-friendly messages
- Loading states and progress indicators for all async operations
- Real-time override application feedback
- Debug logging with scoped loggers
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
- API overrides require valid Console API key and user identifier
- Dynamic config API overrides not supported (Console API limitation)
- Override application may require page refresh in some cases
- Single API key handles all operations (simplified architecture)
- View mode preferences are ephemeral (not persisted across sessions)

### API Override Limitations

- Gate overrides limited to boolean values only
- Experiment overrides limited to group assignment strings
- Dynamic config overrides only available through browser storage
- User identifier required for all API override operations
- Override removal requires same user identifier used for creation

## Success Metrics

### Performance Targets

- Configuration loading performance (<2s for 100 items)
- API override application success rate (>95%)
- Browser storage override success rate (>98%)
- User error rate (<5% of operations)
- Cross-browser compatibility (Chrome/Firefox)

### User Experience Metrics

- Time to first configuration load
- Override creation success rate (browser vs API)
- API key validation success rate
- User identifier configuration completion rate
- View mode switching success rate
- Override removal success rate

## Future Roadmap

### Near-term Enhancements

- Safari support (MV2)
- Dynamic config API override support (pending Statsig Console API)
- Advanced filtering and search capabilities
- Bulk override operations
- Override expiration management
- Enhanced error recovery workflows

### Long-term Vision

- Team collaboration features
- Integration with CI/CD pipelines
- Advanced analytics and reporting
- Multi-project management support
- Override scheduling and automation
- Configuration change history tracking
