# Requirements Document

## Introduction

The Statsig Developer Tools extension is a browser-based development tool designed to streamline the testing and debugging of Statsig feature flags, experiments, and dynamic configurations. This extension empowers developers and QA engineers to inspect Statsig configurations in real-time, understand targeting rules, and simulate different user conditions by manipulating browser storage and cookies directly from a convenient popup interface.

The extension addresses the common pain point of manually testing feature flag behavior by providing a unified interface to view all Statsig configurations, understand their evaluation logic, and quickly test different scenarios without requiring backend changes or complex environment setup.

## Requirements

### Requirement 1

**User Story:** As a developer, I want to securely authenticate with my Statsig Console API key, so that I can access my project's feature configurations without compromising security.

#### Acceptance Criteria

1. WHEN a user opens the extension popup THEN the system SHALL display an API key input field if no key is stored
2. WHEN a user enters a valid Statsig Console API key THEN the system SHALL encrypt and store the key securely in browser storage
3. WHEN a user enters an invalid API key THEN the system SHALL display a clear error message and prevent further actions
4. WHEN the extension makes API calls THEN the system SHALL include the API key in the STATSIG-API-KEY header
5. IF the API key becomes invalid THEN the system SHALL prompt the user to re-enter their credentials

### Requirement 2

**User Story:** As a developer, I want to view all feature gates, experiments, and dynamic configs from my Statsig project, so that I can understand what configurations are available for testing.

#### Acceptance Criteria

1. WHEN the user is authenticated THEN the system SHALL fetch and display all feature gates from the Statsig Console API
2. WHEN the user is authenticated THEN the system SHALL fetch and display all experiments from the Statsig Console API
3. WHEN the user is authenticated THEN the system SHALL fetch and display all dynamic configs from the Statsig Console API
4. WHEN displaying configurations THEN the system SHALL show the name, status, and type for each item
5. WHEN the API request fails THEN the system SHALL display an appropriate error message and retry option
6. WHEN configurations are loaded THEN the system SHALL cache the data for 5 minutes to improve performance

### Requirement 3

**User Story:** As a developer, I want to see the detailed targeting rules for each configuration, so that I can understand what conditions control feature behavior.

#### Acceptance Criteria

1. WHEN a user clicks on a configuration item THEN the system SHALL display its detailed targeting rules
2. WHEN displaying rules THEN the system SHALL show conditions, operators, target values, and pass percentages
3. WHEN displaying rules THEN the system SHALL present them in evaluation order (top-down)
4. WHEN rules contain complex conditions THEN the system SHALL format them in a readable, hierarchical structure
5. IF a configuration has no rules THEN the system SHALL indicate this clearly to the user

### Requirement 4

**User Story:** As a developer, I want to set cookies for the current domain, so that I can test feature flag conditions that depend on cookie values.

#### Acceptance Criteria

1. WHEN a user wants to set a cookie THEN the system SHALL provide input fields for name, value, domain, and path
2. WHEN a user submits cookie data THEN the system SHALL use the browser cookies API to set the cookie
3. WHEN setting a cookie THEN the system SHALL validate the input data and show appropriate error messages
4. WHEN a cookie is successfully set THEN the system SHALL provide visual confirmation
5. IF cookie setting fails THEN the system SHALL display the specific error reason

### Requirement 5

**User Story:** As a developer, I want to manipulate localStorage and sessionStorage values, so that I can test feature conditions that depend on browser storage.

#### Acceptance Criteria

1. WHEN a user wants to set storage values THEN the system SHALL provide input fields for key, value, and storage type
2. WHEN a user submits storage data THEN the system SHALL inject a content script to set the values in the page context
3. WHEN setting storage values THEN the system SHALL validate input data and handle errors gracefully
4. WHEN storage values are set THEN the system SHALL provide visual confirmation of the action
5. IF storage manipulation fails THEN the system SHALL display the specific error and suggest solutions

### Requirement 6

**User Story:** As a developer, I want to see real-time evaluation results for configurations, so that I can immediately understand how my test conditions affect feature behavior.

#### Acceptance Criteria

1. WHEN storage or cookie values change THEN the system SHALL re-evaluate all configurations automatically
2. WHEN displaying configurations THEN the system SHALL show current evaluation status (pass/fail, variant, config values)
3. WHEN evaluation results change THEN the system SHALL update the UI immediately without requiring refresh
4. WHEN evaluation fails THEN the system SHALL display debugging information to help identify issues
5. IF network connectivity is lost THEN the system SHALL use cached data and indicate offline status

### Requirement 7

**User Story:** As a developer, I want to search and filter configurations, so that I can quickly find specific items in large projects.

#### Acceptance Criteria

1. WHEN the user types in the search field THEN the system SHALL filter configurations by name in real-time
2. WHEN the user applies filters THEN the system SHALL show only configurations matching the selected criteria
3. WHEN search results are empty THEN the system SHALL display a helpful "no results" message
4. WHEN clearing search/filters THEN the system SHALL restore the full list of configurations
5. IF the search is slow THEN the system SHALL debounce input to avoid excessive filtering

### Requirement 8

**User Story:** As a developer, I want the extension to work reliably across Chrome and Firefox, so that I can use it regardless of my preferred browser.

#### Acceptance Criteria

1. WHEN installed on Chrome THEN the system SHALL function with full feature parity using Manifest V3
2. WHEN installed on Firefox THEN the system SHALL function with full feature parity using appropriate manifest version
3. WHEN using browser APIs THEN the system SHALL use webextension-polyfill for cross-browser compatibility
4. WHEN the extension updates THEN the system SHALL maintain compatibility across both browsers
5. IF browser-specific features are needed THEN the system SHALL gracefully degrade functionality

### Requirement 9

**User Story:** As a security-conscious developer, I want my API key and sensitive data to be handled securely, so that I can use the extension without compromising my project's security.

#### Acceptance Criteria

1. WHEN storing the API key THEN the system SHALL encrypt it using browser storage encryption
2. WHEN making API calls THEN the system SHALL use HTTPS exclusively
3. WHEN handling user input THEN the system SHALL validate and sanitize all data to prevent injection attacks
4. WHEN logging occurs THEN the system SHALL never log sensitive information like API keys
5. IF the extension is uninstalled THEN the system SHALL ensure all stored data is properly cleaned up

### Requirement 10

**User Story:** As a developer working on performance-critical applications, I want the extension to be fast and lightweight, so that it doesn't impact my development workflow.

#### Acceptance Criteria

1. WHEN the extension loads THEN the system SHALL complete initial setup in under 2 seconds
2. WHEN fetching configuration data THEN the system SHALL complete API calls in under 3 seconds for typical projects
3. WHEN the extension bundle is built THEN the system SHALL be under 1MB in total size
4. WHEN displaying large lists THEN the system SHALL use virtual scrolling to maintain performance
5. IF API calls are slow THEN the system SHALL show loading indicators and allow cancellation
