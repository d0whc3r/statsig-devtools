import { beforeEach, describe, expect, it, vi } from 'vitest'

import { StatsigApi } from './statsig.api'

// Mock the individual APIs
vi.mock('./gates/gates.api', () => ({
  GatesApi: vi.fn().mockImplementation(() => ({
    list: {
      getGates: vi.fn().mockResolvedValue({ data: [], pagination: { pageNumber: 1, itemsPerPage: 10, totalItems: 0 } }),
    },
    detail: {
      getGatesById: vi.fn().mockResolvedValue({ data: { id: 'gate-1', name: 'Test Gate' } }),
    },
    override: {
      getGateOverrides: vi.fn().mockResolvedValue({ data: { passingUserIDs: [], failingUserIDs: [] } }),
      createGateOverride: vi.fn().mockResolvedValue(true),
      removeGateOverride: vi.fn().mockResolvedValue(true),
    },
  })),
}))

vi.mock('./experiments/experiments.api', () => ({
  ExperimentsApi: vi.fn().mockImplementation(() => ({
    list: {
      getExperiments: vi
        .fn()
        .mockResolvedValue({ data: [], pagination: { pageNumber: 1, itemsPerPage: 10, totalItems: 0 } }),
    },
    detail: {
      getExperimentById: vi.fn().mockResolvedValue({ data: { id: 'exp-1', name: 'Test Experiment' } }),
    },
    override: {
      getExperimentOverrides: vi.fn().mockResolvedValue({ data: { overrides: [], userIDOverrides: [] } }),
      createExperimentOverride: vi.fn().mockResolvedValue(true),
      removeExperimentOverride: vi.fn().mockResolvedValue(true),
    },
  })),
}))

vi.mock('./dynamic-configs/dynamic-configs.api', () => ({
  DynamicConfigsApi: vi.fn().mockImplementation(() => ({
    list: {
      getDynamicConfigs: vi
        .fn()
        .mockResolvedValue({ data: [], pagination: { pageNumber: 1, itemsPerPage: 10, totalItems: 0 } }),
    },
    detail: {
      getDynamicConfigById: vi.fn().mockResolvedValue({ data: { id: 'config-1', name: 'Test Config' } }),
    },
  })),
}))

vi.mock('./environments/environments.api', () => ({
  EnvironmentsApi: vi.fn().mockImplementation(() => ({
    list: {
      getEnvironments: vi.fn().mockResolvedValue({ data: { environments: [] } }),
    },
  })),
}))

describe('StatsigApi', () => {
  let statsigApi: StatsigApi

  beforeEach(() => {
    statsigApi = new StatsigApi()
  })

  describe('delegated methods', () => {
    it('should delegate getGates to gates.list.getGates', async () => {
      // Act
      const result = await statsigApi.getGates({ page: 2, limit: 20 })

      // Assert
      expect(statsigApi.gates.list.getGates).toHaveBeenCalledWith({ page: 2, limit: 20 })
      expect(result).toEqual({ data: [], pagination: { pageNumber: 1, itemsPerPage: 10, totalItems: 0 } })
    })

    it('should delegate getExperiments to experiments.list.getExperiments', async () => {
      // Act
      const result = await statsigApi.getExperiments({ page: 1, limit: 15 })

      // Assert
      expect(statsigApi.experiments.list.getExperiments).toHaveBeenCalledWith({ page: 1, limit: 15 })
      expect(result).toEqual({ data: [], pagination: { pageNumber: 1, itemsPerPage: 10, totalItems: 0 } })
    })

    it('should delegate getDynamicConfigs to dynamicConfigs.list.getDynamicConfigs', async () => {
      // Act
      const result = await statsigApi.getDynamicConfigs({ page: 3, limit: 25 })

      // Assert
      expect(statsigApi.dynamicConfigs.list.getDynamicConfigs).toHaveBeenCalledWith({ page: 3, limit: 25 })
      expect(result).toEqual({ data: [], pagination: { pageNumber: 1, itemsPerPage: 10, totalItems: 0 } })
    })

    it('should delegate getEnvironments to environments.list.getEnvironments', async () => {
      // Act
      const result = await statsigApi.getEnvironments()

      // Assert
      expect(statsigApi.environments.list.getEnvironments).toHaveBeenCalledWith()
      expect(result).toEqual({ data: { environments: [] } })
    })

    it('should work with default parameters', async () => {
      // Act
      await statsigApi.getGates()
      await statsigApi.getExperiments()
      await statsigApi.getDynamicConfigs()

      // Assert
      expect(statsigApi.gates.list.getGates).toHaveBeenCalledWith(undefined)
      expect(statsigApi.experiments.list.getExperiments).toHaveBeenCalledWith(undefined)
      expect(statsigApi.dynamicConfigs.list.getDynamicConfigs).toHaveBeenCalledWith(undefined)
    })
  })

  describe('gate-specific convenience methods', () => {
    it('should delegate getGateDetails to gates.detail.getGatesById', async () => {
      // Act
      const result = await statsigApi.getGateDetails('gate-1')

      // Assert
      expect(statsigApi.gates.detail.getGatesById).toHaveBeenCalledWith('gate-1')
      expect(result).toEqual({ data: { id: 'gate-1', name: 'Test Gate' } })
    })

    it('should delegate getGateOverrides to gates.override.getGateOverrides', async () => {
      // Act
      const result = await statsigApi.getGateOverrides('gate-1')

      // Assert
      expect(statsigApi.gates.override.getGateOverrides).toHaveBeenCalledWith('gate-1')
      expect(result).toEqual({ data: { passingUserIDs: [], failingUserIDs: [] } })
    })

    it('should delegate createGateOverride to gates.override.createGateOverride', async () => {
      // Act
      const params = { userID: 'user-1', value: true }
      const result = await statsigApi.createGateOverride('gate-1', params)

      // Assert
      expect(statsigApi.gates.override.createGateOverride).toHaveBeenCalledWith('gate-1', params)
      expect(result).toBe(true)
    })

    it('should delegate removeGateOverride to gates.override.removeGateOverride', async () => {
      // Act
      const params = { userID: 'user-1' }
      const result = await statsigApi.removeGateOverride('gate-1', params)

      // Assert
      expect(statsigApi.gates.override.removeGateOverride).toHaveBeenCalledWith('gate-1', params)
      expect(result).toBe(true)
    })
  })

  describe('experiment-specific convenience methods', () => {
    it('should delegate getExperimentDetails to experiments.detail.getExperimentById', async () => {
      // Act
      const result = await statsigApi.getExperimentDetails('exp-1')

      // Assert
      expect(statsigApi.experiments.detail.getExperimentById).toHaveBeenCalledWith('exp-1')
      expect(result).toEqual({ data: { id: 'exp-1', name: 'Test Experiment' } })
    })

    it('should delegate getExperimentOverrides to experiments.override.getExperimentOverrides', async () => {
      // Act
      const result = await statsigApi.getExperimentOverrides('exp-1')

      // Assert
      expect(statsigApi.experiments.override.getExperimentOverrides).toHaveBeenCalledWith('exp-1')
      expect(result).toEqual({ data: { overrides: [], userIDOverrides: [] } })
    })

    it('should delegate createExperimentOverride to experiments.override.createExperimentOverride', async () => {
      // Act
      const params = { userID: 'user-1', groupId: 'treatment' }
      const result = await statsigApi.createExperimentOverride('exp-1', params)

      // Assert
      expect(statsigApi.experiments.override.createExperimentOverride).toHaveBeenCalledWith('exp-1', params)
      expect(result).toBe(true)
    })

    it('should delegate removeExperimentOverride to experiments.override.removeExperimentOverride', async () => {
      // Act
      const params = { userID: 'user-1' }
      const result = await statsigApi.removeExperimentOverride('exp-1', params)

      // Assert
      expect(statsigApi.experiments.override.removeExperimentOverride).toHaveBeenCalledWith('exp-1', params)
      expect(result).toBe(true)
    })
  })

  describe('dynamic config-specific convenience methods', () => {
    it('should delegate getDynamicConfigDetails to dynamicConfigs.detail.getDynamicConfigById', async () => {
      // Act
      const result = await statsigApi.getDynamicConfigDetails('config-1')

      // Assert
      expect(statsigApi.dynamicConfigs.detail.getDynamicConfigById).toHaveBeenCalledWith('config-1')
      expect(result).toEqual({ data: { id: 'config-1', name: 'Test Config' } })
    })
  })

  describe('singleton pattern', () => {
    it('should return the same instance when calling getInstance multiple times', () => {
      // Act
      const instance1 = StatsigApi.getInstance()
      const instance2 = StatsigApi.getInstance()

      // Assert
      expect(instance1).toBe(instance2)
    })
  })
})
