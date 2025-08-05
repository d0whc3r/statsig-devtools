/**
 * Mock data for E2E tests
 * This file contains realistic mock responses for Statsig APIs
 */

export const mockStatsigResponses = {
  // Console API - Feature Gates
  featureGates: {
    data: [
      {
        id: 'feature_gate_1',
        name: 'new_checkout_flow',
        isEnabled: true,
        description: 'Enable the new checkout flow for better conversion',
        rules: [
          {
            name: 'Rollout Rule',
            passPercentage: 50,
            conditions: [
              {
                type: 'user_id',
                operator: 'str_contains_any',
                targetValue: ['test', 'demo'],
                field: 'userID',
              },
            ],
          },
        ],
        tags: ['checkout', 'conversion'],
        lastModifierName: 'Product Team',
        createdTime: 1640995200000,
      },
      {
        id: 'feature_gate_2',
        name: 'dark_mode_toggle',
        isEnabled: false,
        description: 'Allow users to toggle dark mode',
        rules: [
          {
            name: 'Beta Users',
            passPercentage: 100,
            conditions: [
              {
                type: 'custom',
                operator: 'eq',
                targetValue: true,
                field: 'is_beta_user',
              },
            ],
          },
        ],
        tags: ['ui', 'beta'],
        lastModifierName: 'Design Team',
        createdTime: 1641081600000,
      },
    ],
  },

  // Console API - Experiments
  experiments: {
    data: [
      {
        id: 'experiment_1',
        name: 'button_color_test',
        isEnabled: true,
        description: 'Test different button colors for CTA conversion',
        rules: [
          {
            name: 'Main Traffic',
            passPercentage: 100,
            conditions: [
              {
                type: 'country',
                operator: 'in',
                targetValue: ['US', 'CA', 'GB'],
                field: 'country',
              },
            ],
          },
        ],
        groups: [
          { name: 'control', size: 33, parameterValues: { button_color: 'blue' } },
          { name: 'variant_a', size: 33, parameterValues: { button_color: 'green' } },
          { name: 'variant_b', size: 34, parameterValues: { button_color: 'red' } },
        ],
        tags: ['conversion', 'ui'],
        lastModifierName: 'Growth Team',
        createdTime: 1641168000000,
      },
    ],
  },

  // Console API - Dynamic Configs
  dynamicConfigs: {
    data: [
      {
        id: 'config_1',
        name: 'api_timeouts',
        isEnabled: true,
        description: 'Configure API timeout values',
        rules: [
          {
            name: 'Default Config',
            passPercentage: 100,
            conditions: [],
          },
        ],
        defaultValue: {
          connection_timeout: 5000,
          read_timeout: 10000,
          retry_attempts: 3,
        },
        tags: ['performance', 'api'],
        lastModifierName: 'Backend Team',
        createdTime: 1641254400000,
      },
    ],
  },

  // Client SDK - Initialize response
  initialize: {
    feature_gates: {
      new_checkout_flow: {
        value: true,
        rule_id: 'rule_1',
        secondary_exposures: [],
      },
      dark_mode_toggle: {
        value: false,
        rule_id: 'default',
        secondary_exposures: [],
      },
    },
    dynamic_configs: {
      api_timeouts: {
        value: {
          connection_timeout: 5000,
          read_timeout: 10000,
          retry_attempts: 3,
        },
        rule_id: 'default',
        secondary_exposures: [],
      },
    },
    layer_configs: {},
    sdkParams: {},
    has_updates: true,
    time: Date.now(),
  },

  // Validation responses
  validation: {
    console: {
      isValid: true,
      projectName: 'Test Project',
    },
    client: {
      isValid: true,
    },
  },
}

export const mockApiEndpoints = {
  console: {
    featureGates: 'https://statsigapi.net/console/v1/gates',
    experiments: 'https://statsigapi.net/console/v1/experiments',
    dynamicConfigs: 'https://statsigapi.net/console/v1/dynamic_configs',
  },
  client: {
    initialize: 'https://api.statsig.com/v1/initialize',
  },
}
