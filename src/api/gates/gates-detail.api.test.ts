import { beforeEach, describe, expect, it, vi } from 'vitest'

import { Gates } from '@/src/client/sdk.gen'
import { mockGatesV1Response } from '@/src/test/mocks/gates'

import { GatesDetailApi } from './gates-detail.api'

// Mock the Gates client
vi.mock('@/src/client/sdk.gen', () => ({
  Gates: {
    getConsoleV1GatesById: vi.fn(),
  },
}))

describe('GatesDetailApi', () => {
  let gatesDetailApi: GatesDetailApi

  beforeEach(() => {
    gatesDetailApi = new GatesDetailApi()
  })

  it('should return gate detail successfully', async () => {
    // Arrange
    vi.mocked(Gates.getConsoleV1GatesById).mockResolvedValue({
      data: {
        message: 'Success',
        data: mockGatesV1Response.data[0],
      },
      request: {} as Request,
      response: {} as Response,
    })

    const gateId = mockGatesV1Response.data[0].id

    // Act
    const result = await gatesDetailApi.getGatesById(gateId)

    // Assert
    expect(vi.mocked(Gates.getConsoleV1GatesById)).toHaveBeenCalledWith({
      path: { id: gateId },
    })
    expect(result).toEqual({
      data: {
        id: 'gate-1',
        rules: [
          {
            name: 'Default Rule',
            passPercentage: 100,
            conditions: [
              {
                type: 'public',
              },
            ],
          },
        ],
      },
    })
  })

  it('should handle API error and return null', async () => {
    // Arrange
    const gateId = 'gate-1'
    const apiError = new Error('Network error')
    vi.mocked(Gates.getConsoleV1GatesById).mockRejectedValue(apiError)

    // Spy on the handleApiError method
    const handleApiErrorSpy = vi.spyOn(gatesDetailApi as any, 'handleApiError')

    // Act
    const result = await gatesDetailApi.getGatesById(gateId)

    // Assert
    expect(handleApiErrorSpy).toHaveBeenCalledWith(apiError, 'fetch gate by ID from API', { id: gateId })
    expect(result).toBeNull()
  })

  it('should handle validation error and return null', async () => {
    // Arrange
    const gateId = 'gate-1'
    vi.mocked(Gates.getConsoleV1GatesById).mockResolvedValue({
      data: {
        message: 'Success',
        data: {
          id: 'gate-1',
          // Missing required fields to cause validation error
        },
      } as any,
      request: {} as Request,
      response: {} as Response,
    })

    // Spy on the handleParseError method
    const handleParseErrorSpy = vi.spyOn(gatesDetailApi as any, 'handleParseError')

    // Act
    const result = await gatesDetailApi.getGatesById(gateId)

    // Assert
    expect(vi.mocked(Gates.getConsoleV1GatesById)).toHaveBeenCalledWith({
      path: { id: gateId },
    })
    expect(handleParseErrorSpy).toHaveBeenCalledWith(expect.any(Object), 'gate detail', { id: gateId })
    expect(result).toBeNull()
  })
})
