import { beforeEach, describe, expect, it, vi } from 'vitest'

import { Experiments } from '@/src/client/sdk.gen'
import { mockEmptyExperimentsResponse, mockExperimentsV1Response } from '@/src/test/mocks/experiments'

import { ExperimentsListApi } from './experiments-list.api'

// Mock the Experiments client
vi.mock('@/src/client/sdk.gen', () => ({
  Experiments: {
    getConsoleV1Experiments: vi.fn(),
  },
}))

describe('ExperimentsListApi', () => {
  let experimentsListApi: ExperimentsListApi

  beforeEach(() => {
    experimentsListApi = new ExperimentsListApi()
  })

  it('should return experiments list successfully', async () => {
    // Arrange
    vi.mocked(Experiments.getConsoleV1Experiments).mockResolvedValue({
      data: mockExperimentsV1Response,
      request: {} as Request,
      response: {} as Response,
    })

    // Act
    const result = await experimentsListApi.getExperiments({ page: 1, limit: 10 })

    // Assert
    expect(vi.mocked(Experiments.getConsoleV1Experiments)).toHaveBeenCalledWith({
      query: {
        page: 1,
        limit: 10,
      },
    })
    expect(result).toEqual({
      data: [
        {
          id: 'experiment-1',
          name: 'checkout_flow_experiment',
          description: 'Test experiment for checkout flow optimization',
          allocation: 50,
          status: 'active',
          startTime: 1640995200000,
          endTime: 1672531200000,
        },
        {
          id: 'experiment-2',
          name: 'pricing_display_experiment',
          description: 'Test experiment for pricing display variations',
          allocation: 25,
          status: 'setup',
          startTime: 1640995200000,
          endTime: 1672531200000,
        },
        {
          id: 'experiment-3',
          name: 'onboarding_flow_experiment',
          description: 'Test experiment for user onboarding optimization',
          allocation: 75,
          status: 'active',
          startTime: 1640995200000,
          endTime: 1672531200000,
        },
      ],
      pagination: {
        itemsPerPage: 10,
        pageNumber: 1,
        totalItems: 3,
      },
    })
  })

  it('should return empty list when no experiments exist', async () => {
    // Arrange
    vi.mocked(Experiments.getConsoleV1Experiments).mockResolvedValue({
      data: mockEmptyExperimentsResponse,
      request: {} as Request,
      response: {} as Response,
    })

    // Act
    const result = await experimentsListApi.getExperiments({ page: 1, limit: 10 })

    // Assert
    expect(vi.mocked(Experiments.getConsoleV1Experiments)).toHaveBeenCalledWith({
      query: {
        page: 1,
        limit: 10,
      },
    })
    expect(result).toEqual({
      data: [],
      pagination: {
        itemsPerPage: 10,
        pageNumber: 1,
        totalItems: 0,
      },
    })
  })

  it('should handle API error and return empty response', async () => {
    // Arrange
    const apiError = new Error('Network error')
    vi.mocked(Experiments.getConsoleV1Experiments).mockRejectedValue(apiError)

    // Spy on the handleApiError method
    const handleApiErrorSpy = vi.spyOn(experimentsListApi as any, 'handleApiError')

    // Act
    const result = await experimentsListApi.getExperiments({ page: 1, limit: 10 })

    // Assert
    expect(handleApiErrorSpy).toHaveBeenCalledWith(apiError, 'fetch experiments from API')
    expect(result).toEqual({
      data: [],
      pagination: {
        itemsPerPage: 10,
        pageNumber: 1,
        totalItems: 0,
      },
    })
  })

  it('should handle validation error and return empty response', async () => {
    // Arrange
    const invalidResponse = {
      ...mockExperimentsV1Response,
      data: [
        {
          ...mockExperimentsV1Response.data[0],
          // Remove required field to cause validation error
          description: undefined as any,
        },
      ],
    }
    vi.mocked(Experiments.getConsoleV1Experiments).mockResolvedValue({
      data: invalidResponse,
      request: {} as Request,
      response: {} as Response,
    })

    // Spy on the handleParseError method
    const handleParseErrorSpy = vi.spyOn(experimentsListApi as any, 'handleParseError')

    // Act
    const result = await experimentsListApi.getExperiments({ page: 1, limit: 10 })

    // Assert
    expect(vi.mocked(Experiments.getConsoleV1Experiments)).toHaveBeenCalledWith({
      query: {
        page: 1,
        limit: 10,
      },
    })
    expect(handleParseErrorSpy).toHaveBeenCalledWith(expect.any(Object), 'experiments')
    expect(result).toEqual({
      data: [],
      pagination: {
        itemsPerPage: 10,
        pageNumber: 1,
        totalItems: 0,
      },
    })
  })

  it('should use default pagination when no parameters provided', async () => {
    // Arrange
    vi.mocked(Experiments.getConsoleV1Experiments).mockResolvedValue({
      data: mockEmptyExperimentsResponse,
      request: {} as Request,
      response: {} as Response,
    })

    // Act
    const result = await experimentsListApi.getExperiments()

    // Assert
    expect(vi.mocked(Experiments.getConsoleV1Experiments)).toHaveBeenCalledWith({
      query: {
        page: 1,
        limit: 10,
      },
    })
    expect(result).toEqual({
      data: [],
      pagination: {
        itemsPerPage: 10,
        pageNumber: 1,
        totalItems: 0,
      },
    })
  })
})
