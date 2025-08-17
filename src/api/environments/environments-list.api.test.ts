import { beforeEach, describe, expect, it, vi } from 'vitest'

import { Environments } from '@/src/client/sdk.gen'
import { mockEmptyEnvironmentsResponse, mockEnvironmentsV1Response } from '@/src/test/mocks/environments'

import { EnvironmentsListApi } from './environments-list.api'

// Mock the Environments client
vi.mock('@/src/client/sdk.gen', () => ({
  Environments: {
    getConsoleV1Environments: vi.fn(),
  },
}))

describe('EnvironmentListApi', () => {
  let environmentListApi: EnvironmentsListApi

  beforeEach(() => {
    environmentListApi = new EnvironmentsListApi()
  })

  it('should return environments list successfully', async () => {
    // Arrange
    vi.mocked(Environments.getConsoleV1Environments).mockResolvedValue({
      data: mockEnvironmentsV1Response,
      request: {} as Request,
      response: {} as Response,
    })

    // Act
    const result = await environmentListApi.getEnvironments()

    // Assert
    expect(vi.mocked(Environments.getConsoleV1Environments)).toHaveBeenCalledWith()
    expect(result).toEqual({
      data: {
        environments: [
          {
            name: 'Production',
            id: 'prod',
            isProduction: true,
            requiresReview: true,
            requiredReviewGroupID: 'review-group-1',
            requiresReleasePipeline: true,
          },
          {
            name: 'Staging',
            id: 'staging',
            isProduction: false,
            requiresReview: false,
            requiredReviewGroupID: undefined,
            requiresReleasePipeline: false,
          },
          {
            name: 'Development',
            id: 'development',
            isProduction: false,
            requiresReview: false,
            requiredReviewGroupID: undefined,
            requiresReleasePipeline: false,
          },
        ],
      },
    })
  })

  it('should return empty list when no environments exist', async () => {
    // Arrange
    vi.mocked(Environments.getConsoleV1Environments).mockResolvedValue({
      data: mockEmptyEnvironmentsResponse,
      request: {} as Request,
      response: {} as Response,
    })

    // Act
    const result = await environmentListApi.getEnvironments()

    // Assert
    expect(vi.mocked(Environments.getConsoleV1Environments)).toHaveBeenCalledWith()
    expect(result).toEqual({
      data: {
        environments: [],
      },
    })
  })

  it('should handle API error and return empty response', async () => {
    // Arrange
    const apiError = new Error('Network error')
    vi.mocked(Environments.getConsoleV1Environments).mockRejectedValue(apiError)

    // Spy on the handleApiError method
    const handleApiErrorSpy = vi.spyOn(environmentListApi as any, 'handleApiError')

    // Act
    const result = await environmentListApi.getEnvironments()

    // Assert
    expect(handleApiErrorSpy).toHaveBeenCalledWith(apiError, 'fetch environments from API')
    expect(result).toEqual({
      data: {
        environments: [],
      },
    })
  })

  it('should handle validation error and return empty response', async () => {
    // Arrange
    const invalidResponse = {
      ...mockEnvironmentsV1Response,
      data: {
        environments: [
          {
            ...mockEnvironmentsV1Response.data.environments[0],
            // Remove required field to cause validation error
            name: undefined as any,
          },
        ],
      },
    }
    vi.mocked(Environments.getConsoleV1Environments).mockResolvedValue({
      data: invalidResponse,
      request: {} as Request,
      response: {} as Response,
    })

    // Spy on the handleParseError method
    const handleParseErrorSpy = vi.spyOn(environmentListApi as any, 'handleParseError')

    // Act
    const result = await environmentListApi.getEnvironments()

    // Assert
    expect(vi.mocked(Environments.getConsoleV1Environments)).toHaveBeenCalledWith()
    expect(handleParseErrorSpy).toHaveBeenCalledWith(expect.any(Object), 'environments')
    expect(result).toEqual({
      data: {
        environments: [],
      },
    })
  })
})
