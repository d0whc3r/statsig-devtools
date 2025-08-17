import { beforeEach, describe, expect, it, vi } from 'vitest'

import { Gates } from '@/src/client/sdk.gen'
import { mockGatesV1Response } from '@/src/test/mocks/gates'

import { GatesListApi } from './gates-list.api'

vi.mock('@/src/client/sdk.gen', () => ({
  Gates: {
    getConsoleV1Gates: vi.fn(),
  },
}))

describe('GatesListApi', () => {
  let gatesListApi: GatesListApi

  beforeEach(() => {
    gatesListApi = new GatesListApi()
    vi.clearAllMocks()
  })

  it('should return gates successfully with default pagination', async () => {
    // Arrange
    vi.mocked(Gates.getConsoleV1Gates).mockResolvedValue({
      data: mockGatesV1Response,
      request: {} as Request,
      response: {} as Response,
    })

    // Act
    const result = await gatesListApi.getGates()

    // Assert
    expect(vi.mocked(Gates.getConsoleV1Gates)).toHaveBeenCalledWith({
      query: {
        page: 1,
        limit: 10,
      },
    })
    expect(result).toEqual({
      data: [
        {
          id: 'gate-1',
          name: 'feature_gate_1',
          description: 'Test feature gate for authentication',
          isEnabled: true,
          status: 'Launched',
          type: 'PERMANENT',
          checksPerHour: 1000,
        },
        {
          id: 'gate-2',
          name: 'feature_gate_2',
          description: 'Test feature gate for notifications',
          isEnabled: false,
          status: 'Disabled',
          type: 'PERMANENT',
          checksPerHour: 500,
        },
        {
          id: 'gate-3',
          name: 'feature_gate_3',
          description: 'Test feature gate for analytics',
          isEnabled: true,
          status: 'Launched',
          type: 'PERMANENT',
          checksPerHour: 2000,
        },
      ],
      pagination: {
        itemsPerPage: 10,
        pageNumber: 1,
        totalItems: 3,
      },
    })
  })

  it('should return gates successfully with custom pagination parameters', async () => {
    // Arrange
    vi.mocked(Gates.getConsoleV1Gates).mockResolvedValue({
      data: mockGatesV1Response,
      request: {} as Request,
      response: {} as Response,
    })

    // Act
    await gatesListApi.getGates({ page: 2, limit: 5 })

    // Assert
    expect(vi.mocked(Gates.getConsoleV1Gates)).toHaveBeenCalledWith({
      query: {
        page: 2,
        limit: 5,
      },
    })
  })

  it('should handle API error and return empty response', async () => {
    // Arrange
    const apiError = new Error('Network error')
    vi.mocked(Gates.getConsoleV1Gates).mockRejectedValue(apiError)

    // Spy on the handleApiError method
    const handleApiErrorSpy = vi.spyOn(gatesListApi as any, 'handleApiError')

    // Act
    const result = await gatesListApi.getGates()

    // Assert
    expect(handleApiErrorSpy).toHaveBeenCalledWith(apiError, 'fetch gates from API')
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
      ...mockGatesV1Response,
      data: [
        {
          ...mockGatesV1Response.data[0],
          // Remove required field to cause validation error
          description: undefined as any,
        },
      ],
    }
    vi.mocked(Gates.getConsoleV1Gates).mockResolvedValue({
      data: invalidResponse,
      request: {} as Request,
      response: {} as Response,
    })

    // Spy on the handleParseError method
    const handleParseErrorSpy = vi.spyOn(gatesListApi as any, 'handleParseError')

    // Act
    const result = await gatesListApi.getGates()

    // Assert
    expect(handleParseErrorSpy).toHaveBeenCalledWith(expect.any(Object), 'gates')
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
