import { beforeEach, describe, expect, it, vi } from 'vitest'

import { Experiments } from '@/src/client/sdk.gen'
import { mockExperimentsV1Response } from '@/src/test/mocks/experiments'

import { ExperimentsDetailApi } from './experiments-detail.api'

// Mock the Experiments client
vi.mock('@/src/client/sdk.gen', () => ({
  Experiments: {
    getConsoleV1ExperimentsById: vi.fn(),
  },
}))

describe('ExperimentsDetailApi', () => {
  let experimentsDetailApi: ExperimentsDetailApi

  beforeEach(() => {
    experimentsDetailApi = new ExperimentsDetailApi()
  })

  it('should return experiment detail successfully', async () => {
    // Arrange
    vi.mocked(Experiments.getConsoleV1ExperimentsById).mockResolvedValue({
      data: {
        message: 'Success',
        data: mockExperimentsV1Response.data[0],
      },
      request: {} as Request,
      response: {} as Response,
    })

    const experimentId = mockExperimentsV1Response.data[0].id

    // Act
    const result = await experimentsDetailApi.getExperimentById(experimentId)

    // Assert
    expect(vi.mocked(Experiments.getConsoleV1ExperimentsById)).toHaveBeenCalledWith({
      path: { id: experimentId },
    })
    expect(result).toEqual({
      data: {
        id: 'experiment-1',
        hypothesis: 'New checkout flow will increase conversion rate by 15%',
        groups: [
          {
            id: 'control',
            name: 'Control Group',
            size: 50,
            parameterValues: {},
          },
          {
            id: 'treatment',
            name: 'Treatment Group',
            size: 50,
            parameterValues: {
              new_checkout_enabled: true,
              checkout_theme: 'modern',
            },
          },
        ],
        controlGroupID: 'control',
        assignmentSourceFilters: [],
      },
    })
  })

  it('should handle API error and return null', async () => {
    // Arrange
    const experimentId = 'experiment-1'
    const apiError = new Error('Network error')
    vi.mocked(Experiments.getConsoleV1ExperimentsById).mockRejectedValue(apiError)

    // Spy on the handleApiError method
    const handleApiErrorSpy = vi.spyOn(experimentsDetailApi as any, 'handleApiError')

    // Act
    const result = await experimentsDetailApi.getExperimentById(experimentId)

    // Assert
    expect(handleApiErrorSpy).toHaveBeenCalledWith(apiError, 'fetch experiment by ID from API', { id: experimentId })
    expect(result).toBeNull()
  })

  it('should handle validation error and return null', async () => {
    // Arrange
    const experimentId = 'experiment-1'
    vi.mocked(Experiments.getConsoleV1ExperimentsById).mockResolvedValue({
      data: {
        message: 'Success',
        data: {
          id: 'experiment-1',
          // Missing required fields to cause validation error
        },
      } as any,
      request: {} as Request,
      response: {} as Response,
    })

    // Spy on the handleParseError method
    const handleParseErrorSpy = vi.spyOn(experimentsDetailApi as any, 'handleParseError')

    // Act
    const result = await experimentsDetailApi.getExperimentById(experimentId)

    // Assert
    expect(vi.mocked(Experiments.getConsoleV1ExperimentsById)).toHaveBeenCalledWith({
      path: { id: experimentId },
    })
    expect(handleParseErrorSpy).toHaveBeenCalledWith(expect.any(Object), 'experiment detail', { id: experimentId })
    expect(result).toBeNull()
  })
})
