import { beforeEach, describe, expect, it, vi } from 'vitest'

import { Experiments } from '@/src/client/sdk.gen'
import { mockEmptyExperimentsOverridesResponse, mockExperimentsOverridesResponse } from '@/src/test/mocks/overrides'

import { ExperimentsOverrideApi } from './experiments-override.api'

// Mock the Experiments client
vi.mock('@/src/client/sdk.gen', () => ({
  Experiments: {
    getConsoleV1ExperimentsByIdOverrides: vi.fn(),
    patchConsoleV1ExperimentsByIdOverrides: vi.fn(),
    postConsoleV1ExperimentsByIdOverrides: vi.fn(),
  },
}))

describe('ExperimentsOverrideApi', () => {
  let experimentsOverrideApi: ExperimentsOverrideApi

  beforeEach(() => {
    experimentsOverrideApi = new ExperimentsOverrideApi()
  })

  describe('getExperimentOverrides', () => {
    it('should return experiment overrides successfully', async () => {
      // Arrange
      const experimentId = 'experiment-1'
      vi.mocked(Experiments.getConsoleV1ExperimentsByIdOverrides).mockResolvedValue({
        data: mockExperimentsOverridesResponse,
        request: {} as Request,
        response: {} as Response,
      })

      // Act
      const result = await experimentsOverrideApi.getExperimentOverrides(experimentId)

      // Assert
      expect(vi.mocked(Experiments.getConsoleV1ExperimentsByIdOverrides)).toHaveBeenCalledWith({
        path: {
          id: experimentId,
        },
      })
      expect(result).toEqual({
        data: mockExperimentsOverridesResponse.data,
      })
    })

    it('should handle API error and return null', async () => {
      // Arrange
      const experimentId = 'experiment-1'
      const apiError = new Error('Network error')
      vi.mocked(Experiments.getConsoleV1ExperimentsByIdOverrides).mockRejectedValue(apiError)

      // Spy on the handleApiError method
      const handleApiErrorSpy = vi.spyOn(experimentsOverrideApi as any, 'handleApiError')

      // Act
      const result = await experimentsOverrideApi.getExperimentOverrides(experimentId)

      // Assert
      expect(handleApiErrorSpy).toHaveBeenCalledWith(apiError, 'fetch experiment overrides from API', {
        id: experimentId,
      })
      expect(result).toBeNull()
    })

    it('should return null when no data is returned', async () => {
      // Arrange
      const experimentId = 'experiment-1'
      vi.mocked(Experiments.getConsoleV1ExperimentsByIdOverrides).mockResolvedValue({
        data: {
          message: 'Success',
          data: mockEmptyExperimentsOverridesResponse.data,
        },
        request: {} as Request,
        response: {} as Response,
      })

      // Act
      const result = await experimentsOverrideApi.getExperimentOverrides(experimentId)

      // Assert
      expect(result).toEqual({
        data: mockEmptyExperimentsOverridesResponse.data,
      })
    })
  })

  describe('createExperimentOverride', () => {
    it('should create experiment override with userId successfully', async () => {
      // Arrange
      const experimentId = 'experiment-1'
      const overrideParams = { userID: 'user-1', groupId: 'treatment', environment: 'production' }

      vi.mocked(Experiments.patchConsoleV1ExperimentsByIdOverrides).mockResolvedValue({
        data: mockExperimentsOverridesResponse,
        request: {} as Request,
        response: {} as Response,
      })

      // Act
      const result = await experimentsOverrideApi.createExperimentOverride(experimentId, overrideParams)

      // Assert
      expect(vi.mocked(Experiments.patchConsoleV1ExperimentsByIdOverrides)).toHaveBeenCalledWith({
        path: {
          id: experimentId,
        },
        body: {
          overrides: [],
          userIDOverrides: [
            {
              groupID: overrideParams.groupId,
              ids: [overrideParams.userID],
              unitType: 'userID',
              environment: 'production',
            },
          ],
        },
      })
      expect(result).toBe(true)
    })

    it('should create experiment override with customId successfully', async () => {
      // Arrange
      const experimentId = 'experiment-1'
      const overrideParams = { customID: 'custom-user-1', groupId: 'control' }

      vi.mocked(Experiments.patchConsoleV1ExperimentsByIdOverrides).mockResolvedValue({
        data: mockExperimentsOverridesResponse,
        request: {} as Request,
        response: {} as Response,
      })

      // Act
      const result = await experimentsOverrideApi.createExperimentOverride(experimentId, overrideParams)

      // Assert
      expect(vi.mocked(Experiments.patchConsoleV1ExperimentsByIdOverrides)).toHaveBeenCalledWith({
        path: {
          id: experimentId,
        },
        body: {
          overrides: [],
          userIDOverrides: [
            {
              groupID: overrideParams.groupId,
              ids: [overrideParams.customID],
              unitType: 'customID',
              environment: null,
            },
          ],
        },
      })
      expect(result).toBe(true)
    })

    it('should handle API error and return false', async () => {
      // Arrange
      const experimentId = 'experiment-1'
      const overrideParams = { userID: 'user-1', groupId: 'treatment' }
      const apiError = new Error('Network error')

      vi.mocked(Experiments.patchConsoleV1ExperimentsByIdOverrides).mockRejectedValue(apiError)

      // Act
      const result = await experimentsOverrideApi.createExperimentOverride(experimentId, overrideParams)

      // Assert
      expect(result).toBe(false)
    })
  })

  describe('removeExperimentOverride', () => {
    it('should remove experiment override successfully', async () => {
      // Arrange
      const experimentId = 'experiment-1'

      // Mock the get overrides call
      vi.mocked(Experiments.getConsoleV1ExperimentsByIdOverrides).mockResolvedValue({
        data: mockExperimentsOverridesResponse,
        request: {} as Request,
        response: {} as Response,
      })

      // Mock the post overrides call
      vi.mocked(Experiments.postConsoleV1ExperimentsByIdOverrides).mockResolvedValue({
        data: mockEmptyExperimentsOverridesResponse,
        request: {} as Request,
        response: {} as Response,
      })

      // Act
      const result = await experimentsOverrideApi.removeExperimentOverride(experimentId, { userID: 'custom-user-3' })

      // Assert
      expect(vi.mocked(Experiments.getConsoleV1ExperimentsByIdOverrides)).toHaveBeenCalledWith({
        path: { id: experimentId },
      })
      expect(vi.mocked(Experiments.postConsoleV1ExperimentsByIdOverrides)).toHaveBeenCalledWith({
        path: { id: experimentId },
        body: {
          overrides: [
            {
              groupID: 'treatment',
              type: 'segment',
              id: 'segment-1',
            },
            {
              groupID: 'control',
              type: 'segment',
              id: 'segment-2',
            },
          ],
          userIDOverrides: [
            {
              groupID: 'treatment',
              ids: ['custom-user-1'],
              unitType: 'customID',
              environment: 'production',
            },
            {
              groupID: 'control',
              ids: ['custom-user-2'],
              unitType: 'customID',
              environment: null,
            },
            // custom-user-3 removed from control group
          ],
        },
      })
      expect(result).toBe(true)
    })

    it('should remove experiment override with specific environment successfully', async () => {
      // Arrange
      const experimentId = 'experiment-1'

      // Mock the get overrides call
      vi.mocked(Experiments.getConsoleV1ExperimentsByIdOverrides).mockResolvedValue({
        data: mockExperimentsOverridesResponse,
        request: {} as Request,
        response: {} as Response,
      })

      // Mock the post overrides call
      vi.mocked(Experiments.postConsoleV1ExperimentsByIdOverrides).mockResolvedValue({
        data: mockEmptyExperimentsOverridesResponse,
        request: {} as Request,
        response: {} as Response,
      })

      // Act
      const result = await experimentsOverrideApi.removeExperimentOverride(experimentId, {
        customID: 'custom-user-1',
        environment: 'production',
      })

      // Assert
      expect(vi.mocked(Experiments.postConsoleV1ExperimentsByIdOverrides)).toHaveBeenCalledWith({
        path: {
          id: experimentId,
        },
        body: {
          overrides: [
            {
              groupID: 'treatment',
              type: 'segment',
              id: 'segment-1',
            },
            {
              groupID: 'control',
              type: 'segment',
              id: 'segment-2',
            },
          ],
          userIDOverrides: [
            // custom-user-1 removed from treatment group (production environment)
            {
              groupID: 'control',
              ids: ['custom-user-2'],
              unitType: 'customID',
              environment: null,
            },
            {
              groupID: 'control',
              ids: ['custom-user-3'],
              unitType: 'userID',
              environment: null,
            },
          ],
        },
      })
      expect(result).toBe(true)
    })

    it('should not remove override when environment does not match', async () => {
      // Arrange
      const experimentId = 'experiment-1'

      // Mock the get overrides call
      vi.mocked(Experiments.getConsoleV1ExperimentsByIdOverrides).mockResolvedValue({
        data: mockExperimentsOverridesResponse,
        request: {} as Request,
        response: {} as Response,
      })

      // Act
      const result = await experimentsOverrideApi.removeExperimentOverride(experimentId, {
        customID: 'custom-user-1',
        environment: 'staging',
      })

      // Assert
      expect(vi.mocked(Experiments.getConsoleV1ExperimentsByIdOverrides)).toHaveBeenCalledWith({
        path: {
          id: experimentId,
        },
      })
      // Should not call post since no matching override was found
      expect(vi.mocked(Experiments.postConsoleV1ExperimentsByIdOverrides)).not.toHaveBeenCalled()
      expect(result).toBe(true)
    })

    it('should handle case when no current overrides exist', async () => {
      // Arrange
      const experimentId = 'experiment-1'

      // Mock the get overrides call with no data
      vi.mocked(Experiments.getConsoleV1ExperimentsByIdOverrides).mockResolvedValue({
        data: mockEmptyExperimentsOverridesResponse,
        request: {} as Request,
        response: {} as Response,
      })

      // Act
      const result = await experimentsOverrideApi.removeExperimentOverride(experimentId, { userID: 'user-1' })

      // Assert
      expect(vi.mocked(Experiments.getConsoleV1ExperimentsByIdOverrides)).toHaveBeenCalledWith({
        path: { id: experimentId },
      })
      // Should not call post since there are no changes to make (removing from empty data)
      expect(vi.mocked(Experiments.postConsoleV1ExperimentsByIdOverrides)).not.toHaveBeenCalled()
      expect(result).toBe(true)
    })

    it('should remove custom ID override successfully', async () => {
      // Arrange
      const experimentId = 'experiment-1'

      // Mock the get overrides call
      vi.mocked(Experiments.getConsoleV1ExperimentsByIdOverrides).mockResolvedValue({
        data: mockExperimentsOverridesResponse,
        request: {} as Request,
        response: {} as Response,
      })

      // Mock the post overrides call
      vi.mocked(Experiments.postConsoleV1ExperimentsByIdOverrides).mockResolvedValue({
        data: mockEmptyExperimentsOverridesResponse,
        request: {} as Request,
        response: {} as Response,
      })

      // Act
      const result = await experimentsOverrideApi.removeExperimentOverride(experimentId, { customID: 'custom-user-1' })

      // Assert
      expect(vi.mocked(Experiments.postConsoleV1ExperimentsByIdOverrides)).toHaveBeenCalledWith({
        path: { id: experimentId },
        body: {
          overrides: [
            {
              groupID: 'treatment',
              type: 'segment',
              id: 'segment-1',
            },
            {
              groupID: 'control',
              type: 'segment',
              id: 'segment-2',
            },
          ],
          userIDOverrides: [
            // custom-user-1 removed from treatment group
            {
              groupID: 'control',
              ids: ['custom-user-2'],
              unitType: 'customID',
              environment: null,
            },
            {
              groupID: 'control',
              ids: ['custom-user-3'],
              unitType: 'userID',
              environment: null,
            },
          ],
        },
      })
      expect(result).toBe(true)
    })

    it('should handle API error and return false', async () => {
      // Arrange
      const experimentId = 'experiment-1'
      const apiError = new Error('Network error')

      // Mock successful get but failed post
      vi.mocked(Experiments.getConsoleV1ExperimentsByIdOverrides).mockResolvedValue({
        data: mockExperimentsOverridesResponse,
        request: {} as Request,
        response: {} as Response,
      })
      vi.mocked(Experiments.postConsoleV1ExperimentsByIdOverrides).mockRejectedValue(apiError)

      // Act
      const result = await experimentsOverrideApi.removeExperimentOverride(experimentId, { userID: 'custom-user-3' })

      // Assert
      expect(result).toBe(false)
    })
  })
})
