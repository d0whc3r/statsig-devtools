import { beforeEach, describe, expect, it, vi } from 'vitest'

import { Company } from '@/src/client/sdk.gen'
import { validateConsoleApiKey } from '@/src/utils/api-validation'

// Mock the Company API
vi.mock('@/src/client/sdk.gen', () => ({
  Company: {
    getConsoleV1Company: vi.fn(),
  },
}))

describe('validateConsoleApiKey', () => {
  const mockGetConsoleV1Company = vi.mocked(Company.getConsoleV1Company)
  const apiKey = 'test-api-key'
  beforeEach(() => {
    mockGetConsoleV1Company.mockResolvedValue({
      response: {
        ok: true,
        status: 200,
      },
    } as any)
  })

  describe('successful validation', () => {
    it('should return [null, true] when API key is valid', async () => {
      // Act
      const result = await validateConsoleApiKey(apiKey)

      // Assert
      expect(result).toEqual([null, true])
      expect(mockGetConsoleV1Company).toHaveBeenCalledWith({
        auth: expect.any(Function),
      })
      expect(mockGetConsoleV1Company).toHaveBeenCalledTimes(1)
    })

    it('should call auth function with the provided API key', async () => {
      // Arrange
      // Act
      await validateConsoleApiKey(apiKey)

      // Assert
      const callArgs = mockGetConsoleV1Company.mock.calls[0]
      expect(callArgs).toBeDefined()
      const authFunction = callArgs[0]?.auth as () => string
      expect(authFunction()).toBe(apiKey)
    })
  })

  describe('HTTP error responses', () => {
    it('should return specific error message for 401 status', async () => {
      // Arrange
      mockGetConsoleV1Company.mockResolvedValue({
        response: {
          ok: false,
          status: 401,
        },
      } as any)

      // Act
      const result = await validateConsoleApiKey(apiKey)

      // Assert
      expect(result).toEqual(['Invalid API key. Please check your key and try again.', false])
    })

    it('should return specific error message for 403 status', async () => {
      // Arrange
      mockGetConsoleV1Company.mockResolvedValue({
        response: {
          ok: false,
          status: 403,
        },
      } as any)

      // Act
      const result = await validateConsoleApiKey(apiKey)

      // Assert
      expect(result).toEqual(['API key does not have sufficient permissions.', false])
    })

    it('should return server error message for 500 status', async () => {
      // Arrange
      mockGetConsoleV1Company.mockResolvedValue({
        response: {
          ok: false,
          status: 500,
        },
      } as any)

      // Act
      const result = await validateConsoleApiKey(apiKey)

      // Assert
      expect(result).toEqual(['Server error. Please try again later.', false])
    })

    it('should return server error message for 502 status', async () => {
      // Arrange
      mockGetConsoleV1Company.mockResolvedValue({
        response: {
          ok: false,
          status: 502,
        },
      } as any)

      // Act
      const result = await validateConsoleApiKey(apiKey)

      // Assert
      expect(result).toEqual(['Server error. Please try again later.', false])
    })

    it('should return generic error message for other status codes', async () => {
      // Arrange
      mockGetConsoleV1Company.mockResolvedValue({
        response: {
          ok: false,
          status: 404,
        },
      } as any)

      // Act
      const result = await validateConsoleApiKey(apiKey)

      // Assert
      expect(result).toEqual(['Invalid API key', false])
    })
  })

  describe('network and unexpected errors', () => {
    it('should handle network errors and return error message', async () => {
      // Arrange
      const networkError = new Error('Network error: Failed to fetch')
      mockGetConsoleV1Company.mockRejectedValue(networkError)

      // Act
      const result = await validateConsoleApiKey(apiKey)

      // Assert
      expect(result).toEqual(['Network error: Failed to fetch', false])
      // The Logger is instantiated in the module, so we verify the function works correctly
      // without checking the specific mock call
    })

    it('should handle non-Error exceptions and return generic message', async () => {
      // Arrange
      const nonErrorException = 'Something went wrong'
      mockGetConsoleV1Company.mockRejectedValue(nonErrorException)

      // Act
      const result = await validateConsoleApiKey(apiKey)

      // Assert
      expect(result).toEqual(['An unexpected error occurred. Please try again.', false])
    })

    it('should handle null/undefined errors gracefully', async () => {
      // Arrange
      mockGetConsoleV1Company.mockRejectedValue(null)

      // Act
      const result = await validateConsoleApiKey(apiKey)

      // Assert
      expect(result).toEqual(['An unexpected error occurred. Please try again.', false])
    })
  })

  describe('edge cases', () => {
    it('should handle empty API key', async () => {
      // Arrange
      const emptyApiKey = ''
      mockGetConsoleV1Company.mockResolvedValue({
        response: {
          ok: false,
          status: 401,
        },
      } as any)

      // Act
      const result = await validateConsoleApiKey(emptyApiKey)

      // Assert
      expect(result).toEqual(['Invalid API key. Please check your key and try again.', false])
    })
  })
})
