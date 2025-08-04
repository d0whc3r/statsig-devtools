import { describe, expect, it } from 'vitest'

/**
 * Integration tests for configuration processing
 * These tests verify the complete flow of processing Statsig configurations
 */

describe('Configuration Processing Integration', () => {
  // Mock data that represents what we'd get from Statsig API
  const mockApiResponse = {
    feature_gates: [
      {
        id: 'gate-1',
        name: 'test_feature_gate',
        isEnabled: true,
        description: 'Test feature gate for integration testing',
        rules: [
          {
            name: 'Test Rule',
            passPercentage: 50,
            conditions: [
              {
                type: 'user_id',
                operator: 'eq',
                targetValue: 'test-user',
                field: 'userID',
              },
            ],
          },
        ],
        tags: ['test', 'integration'],
        lastModifierName: 'Test User',
        createdTime: 1640995200000, // Fixed timestamp for consistent snapshots
      },
    ],
    dynamic_configs: [
      {
        id: 'config-1',
        name: 'test_dynamic_config',
        isEnabled: true,
        description: 'Test dynamic config',
        rules: [],
        defaultValue: {
          theme: 'dark',
          maxItems: 10,
          features: ['feature1', 'feature2'],
        },
        tags: ['config'],
        lastModifierName: 'Config Manager',
        createdTime: 1640995200000,
      },
    ],
    experiments: [
      {
        id: 'exp-1',
        name: 'test_experiment',
        isEnabled: false,
        description: 'Test experiment for A/B testing',
        rules: [
          {
            name: 'Experiment Rule',
            passPercentage: 100,
            conditions: [
              {
                type: 'country',
                operator: 'in',
                targetValue: ['US', 'CA'],
                field: 'country',
              },
            ],
          },
        ],
        groups: [
          { name: 'control', size: 50, parameterValues: { variant: 'A' } },
          { name: 'treatment', size: 50, parameterValues: { variant: 'B' } },
        ],
        tags: ['experiment', 'ab-test'],
        lastModifierName: 'Experiment Manager',
        createdTime: 1640995200000,
      },
    ],
  }

  // Helper function to process configurations (simulates real processing logic)
  const processConfigurations = (apiResponse: typeof mockApiResponse) => {
    const processed = {
      totalConfigurations: 0,
      enabledConfigurations: 0,
      configurationsByType: {
        feature_gates: 0,
        dynamic_configs: 0,
        experiments: 0,
      },
      configurations: [] as any[],
    }

    // Process feature gates
    if (apiResponse.feature_gates) {
      processed.configurationsByType.feature_gates = apiResponse.feature_gates.length
      processed.totalConfigurations += apiResponse.feature_gates.length

      apiResponse.feature_gates.forEach((gate) => {
        if (gate.isEnabled) processed.enabledConfigurations++
        processed.configurations.push({
          ...gate,
          type: 'feature_gate',
          formattedName: gate.name.replace(/_/g, ' ').replace(/\b\w/g, (l) => l.toUpperCase()),
        })
      })
    }

    // Process dynamic configs
    if (apiResponse.dynamic_configs) {
      processed.configurationsByType.dynamic_configs = apiResponse.dynamic_configs.length
      processed.totalConfigurations += apiResponse.dynamic_configs.length

      apiResponse.dynamic_configs.forEach((config) => {
        if (config.isEnabled) processed.enabledConfigurations++
        processed.configurations.push({
          ...config,
          type: 'dynamic_config',
          formattedName: config.name.replace(/_/g, ' ').replace(/\b\w/g, (l) => l.toUpperCase()),
        })
      })
    }

    // Process experiments
    if (apiResponse.experiments) {
      processed.configurationsByType.experiments = apiResponse.experiments.length
      processed.totalConfigurations += apiResponse.experiments.length

      apiResponse.experiments.forEach((experiment) => {
        if (experiment.isEnabled) processed.enabledConfigurations++
        processed.configurations.push({
          ...experiment,
          type: 'experiment',
          formattedName: experiment.name.replace(/_/g, ' ').replace(/\b\w/g, (l) => l.toUpperCase()),
        })
      })
    }

    return processed
  }

  // Helper function to generate override suggestions
  const generateOverrideSuggestions = (configuration: any) => {
    const suggestions = {
      key: `statsig_override_${configuration.name}`,
      localStorage: '',
      sessionStorage: '',
      cookie: '',
    }

    switch (configuration.type) {
      case 'feature_gate':
        suggestions.localStorage = 'true'
        suggestions.sessionStorage = 'true'
        suggestions.cookie = 'enabled'
        break
      case 'dynamic_config':
        suggestions.localStorage = JSON.stringify(configuration.defaultValue || {})
        suggestions.sessionStorage = JSON.stringify({ overridden: true })
        suggestions.cookie = 'custom_config'
        break
      case 'experiment':
        suggestions.localStorage = JSON.stringify({ group: 'treatment' })
        suggestions.sessionStorage = JSON.stringify({ variant: 'B' })
        suggestions.cookie = 'treatment_group'
        break
    }

    return suggestions
  }

  describe('Configuration Processing', () => {
    it('should process API response correctly', () => {
      const processed = processConfigurations(mockApiResponse)

      expect(processed.totalConfigurations).toBe(3)
      expect(processed.enabledConfigurations).toBe(2) // gate and config are enabled
      expect(processed.configurationsByType).toEqual({
        feature_gates: 1,
        dynamic_configs: 1,
        experiments: 1,
      })
      expect(processed.configurations).toHaveLength(3)
    })

    it('should format configuration names correctly', () => {
      const processed = processConfigurations(mockApiResponse)

      const gateConfig = processed.configurations.find((c) => c.type === 'feature_gate')
      const dynamicConfig = processed.configurations.find((c) => c.type === 'dynamic_config')
      const experimentConfig = processed.configurations.find((c) => c.type === 'experiment')

      expect(gateConfig.formattedName).toBe('Test Feature Gate')
      expect(dynamicConfig.formattedName).toBe('Test Dynamic Config')
      expect(experimentConfig.formattedName).toBe('Test Experiment')
    })

    it('should handle empty API response', () => {
      const emptyResponse = {
        feature_gates: [],
        dynamic_configs: [],
        experiments: [],
      }

      const processed = processConfigurations(emptyResponse)

      expect(processed.totalConfigurations).toBe(0)
      expect(processed.enabledConfigurations).toBe(0)
      expect(processed.configurations).toHaveLength(0)
    })
  })

  describe('Override Suggestions', () => {
    it('should generate correct suggestions for feature gate', () => {
      const processed = processConfigurations(mockApiResponse)
      const gateConfig = processed.configurations.find((c) => c.type === 'feature_gate')
      const suggestions = generateOverrideSuggestions(gateConfig)

      expect(suggestions.key).toBe('statsig_override_test_feature_gate')
      expect(suggestions.localStorage).toBe('true')
      expect(suggestions.sessionStorage).toBe('true')
      expect(suggestions.cookie).toBe('enabled')
    })

    it('should generate correct suggestions for dynamic config', () => {
      const processed = processConfigurations(mockApiResponse)
      const dynamicConfig = processed.configurations.find((c) => c.type === 'dynamic_config')
      const suggestions = generateOverrideSuggestions(dynamicConfig)

      expect(suggestions.key).toBe('statsig_override_test_dynamic_config')
      expect(suggestions.localStorage).toBe(
        JSON.stringify({
          theme: 'dark',
          maxItems: 10,
          features: ['feature1', 'feature2'],
        }),
      )
      expect(suggestions.sessionStorage).toBe(JSON.stringify({ overridden: true }))
      expect(suggestions.cookie).toBe('custom_config')
    })

    it('should generate correct suggestions for experiment', () => {
      const processed = processConfigurations(mockApiResponse)
      const experimentConfig = processed.configurations.find((c) => c.type === 'experiment')
      const suggestions = generateOverrideSuggestions(experimentConfig)

      expect(suggestions.key).toBe('statsig_override_test_experiment')
      expect(suggestions.localStorage).toBe(JSON.stringify({ group: 'treatment' }))
      expect(suggestions.sessionStorage).toBe(JSON.stringify({ variant: 'B' }))
      expect(suggestions.cookie).toBe('treatment_group')
    })
  })

  describe('Integration Snapshots', () => {
    it('should match processed configuration snapshot', () => {
      const processed = processConfigurations(mockApiResponse)
      expect(processed).toMatchSnapshot('processed-configurations')
    })

    it('should match override suggestions snapshot', () => {
      const processed = processConfigurations(mockApiResponse)
      const allSuggestions = processed.configurations.map((config) => ({
        configName: config.name,
        configType: config.type,
        suggestions: generateOverrideSuggestions(config),
      }))

      expect(allSuggestions).toMatchSnapshot('override-suggestions')
    })

    it('should match complete integration flow snapshot', () => {
      const processed = processConfigurations(mockApiResponse)
      const integrationResult = {
        summary: {
          totalConfigurations: processed.totalConfigurations,
          enabledConfigurations: processed.enabledConfigurations,
          configurationsByType: processed.configurationsByType,
        },
        configurations: processed.configurations.map((config) => ({
          id: config.id,
          name: config.name,
          type: config.type,
          isEnabled: config.isEnabled,
          formattedName: config.formattedName,
          overrideSuggestions: generateOverrideSuggestions(config),
        })),
      }

      expect(integrationResult).toMatchSnapshot('complete-integration-flow')
    })
  })
})
