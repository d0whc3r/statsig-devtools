import { defineConfig } from 'wxt'

// See https://wxt.dev/api/config.html
export default defineConfig({
  modules: ['@wxt-dev/module-react'],
  manifest: {
    name: 'Statsig DevTools',
    description:
      'Browser extension for testing and debugging Statsig feature flags, experiments, and dynamic configurations',
    version: '1.0.0',

    // Required permissions for Statsig functionality
    permissions: [
      'storage', // For storing API keys and cached data
      'cookies', // For reading and setting cookies for testing
      'activeTab', // For accessing current tab information
      'scripting', // For injecting content scripts (Manifest V3)
      'sidePanel', // For sidebar functionality
    ],

    // Host permissions for Statsig API domains and content injection
    host_permissions: [
      'https://api.statsig.com/*',
      'https://statsigapi.net/*',
      'https://featuregates.org/*',
      'https://events.statsigapi.net/*',
      'https://api.statsigcdn.com/*',
      'https://featureassets.org/*',
      'https://assetsconfigcdn.org/*',
      'https://prodregistryv2.org/*',
      'http://localhost/*', // For local development
      'https://localhost/*', // For local development with HTTPS
      '<all_urls>', // For content script injection on all sites
    ],

    // Content Security Policy for extension pages
    content_security_policy: {
      extension_pages: [
        "script-src 'self' 'wasm-unsafe-eval';",
        "object-src 'self';",
        "connect-src 'self'",
        'https://api.statsig.com',
        'https://statsigapi.net',
        'https://featuregates.org',
        'https://events.statsigapi.net',
        'https://api.statsigcdn.com',
        'https://featureassets.org',
        'https://assetsconfigcdn.org',
        'https://prodregistryv2.org',
        'http://localhost:*',
        'https://localhost:*;',
      ].join(' '),
    },

    // Action configuration (replaces browser_action in Manifest V3)
    action: {
      default_popup: 'popup/index.html',
      default_title: 'Statsig DevTools',
      default_icon: {
        16: 'icon/16.png',
        32: 'icon/32.png',
        48: 'icon/48.png',
        128: 'icon/128.png',
      },
    },

    // Side panel configuration
    side_panel: {
      default_path: 'sidepanel/index.html',
    },

    // Icons for the extension
    icons: {
      16: 'icon/16.png',
      32: 'icon/32.png',
      48: 'icon/48.png',
      96: 'icon/96.png',
      128: 'icon/128.png',
    },

    // Background script and content scripts are automatically configured by WXT based on entrypoints
    // However, we explicitly declare content scripts to ensure they're included in development builds
    content_scripts: [
      {
        matches: ['<all_urls>'],
        js: ['content-scripts/content.js'],
        run_at: 'document_start',
      },
    ],

    // Web accessible resources for content script communication
    web_accessible_resources: [
      {
        resources: ['injected-script.js'],
        matches: ['<all_urls>'],
      },
    ],

    // Minimum Chrome version for Manifest V3 features
    minimum_chrome_version: '88',
  },

  // Browser-specific manifest overrides
  manifestVersion: 3, // Default to Manifest V3

  vite: () => ({
    define: {
      __DEV__: JSON.stringify(process.env.NODE_ENV === 'development'),
    },
  }),
})
