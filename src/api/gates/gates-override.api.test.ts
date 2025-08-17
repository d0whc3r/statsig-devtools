import { beforeEach, describe, expect, it, vi } from 'vitest'

import { Gates } from '@/src/client/sdk.gen'
import { mockEmptyGatesOverridesResponse, mockGatesOverridesResponse } from '@/src/test/mocks/overrides'

import { GatesOverrideApi } from './gates-override.api'

// Mock the Gates client
vi.mock('@/src/client/sdk.gen', () => ({
  Gates: {
    getConsoleV1GatesByIdOverrides: vi.fn(),
    patchConsoleV1GatesByIdOverrides: vi.fn(),
    postConsoleV1GatesByIdOverrides: vi.fn(),
  },
}))

describe('GatesOverrideApi', () => {
  let gatesOverrideApi: GatesOverrideApi

  beforeEach(() => {
    gatesOverrideApi = new GatesOverrideApi()
  })

  describe('getGateOverrides', () => {
    it('should return gate overrides successfully', async () => {
      // Arrange
      const gateId = 'gate-1'
      vi.mocked(Gates.getConsoleV1GatesByIdOverrides).mockResolvedValue({
        data: mockGatesOverridesResponse,
        request: {} as Request,
        response: {} as Response,
      })

      // Act
      const result = await gatesOverrideApi.getGateOverrides(gateId)

      // Assert
      expect(vi.mocked(Gates.getConsoleV1GatesByIdOverrides)).toHaveBeenCalledWith({
        path: { id: gateId },
      })
      expect(result).toEqual({
        data: {
          passingUserIDs: ['user-1', 'user-2'],
          failingUserIDs: ['user-3'],
          passingCustomIDs: ['custom-1'],
          failingCustomIDs: ['custom-2'],
        },
      })
    })

    it('should handle API error and return null', async () => {
      // Arrange
      const gateId = 'gate-1'
      const apiError = new Error('Network error')
      vi.mocked(Gates.getConsoleV1GatesByIdOverrides).mockRejectedValue(apiError)

      // Act
      const result = await gatesOverrideApi.getGateOverrides(gateId)

      // Assert
      expect(result).toBeNull()
    })

    it('should handle validation error and return null', async () => {
      // Arrange
      const gateId = 'gate-1'
      vi.mocked(Gates.getConsoleV1GatesByIdOverrides).mockResolvedValue({
        data: {
          message: 'Success',
          data: {
            passingUserIDs: [],
          } as any,
        },
        request: {} as Request,
        response: {} as Response,
      })

      // Act
      const result = await gatesOverrideApi.getGateOverrides(gateId)

      // Assert
      expect(result).toBeNull()
    })
  })

  describe('createGateOverride', () => {
    it('should create gate override with userId successfully', async () => {
      // Arrange
      const gateId = 'gate-1'
      vi.mocked(Gates.patchConsoleV1GatesByIdOverrides).mockResolvedValue({
        data: mockGatesOverridesResponse,
        request: {} as Request,
        response: {} as Response,
      })

      // Act
      const result = await gatesOverrideApi.createGateOverride(gateId, { userID: 'user-1', value: true })

      // Assert
      expect(vi.mocked(Gates.patchConsoleV1GatesByIdOverrides)).toHaveBeenCalledWith({
        path: { id: gateId },
        body: {
          passingUserIDs: ['user-1'],
          failingUserIDs: [],
        },
      })
      expect(result).toBe(true)
    })

    it('should create gate override with customId successfully', async () => {
      // Arrange
      const gateId = 'gate-1'
      vi.mocked(Gates.patchConsoleV1GatesByIdOverrides).mockResolvedValue({
        data: mockGatesOverridesResponse,
        request: {} as Request,
        response: {} as Response,
      })

      // Act
      const result = await gatesOverrideApi.createGateOverride(gateId, { customID: 'custom-1', value: false })

      // Assert
      expect(vi.mocked(Gates.patchConsoleV1GatesByIdOverrides)).toHaveBeenCalledWith({
        path: { id: gateId },
        body: {
          passingUserIDs: [],
          failingUserIDs: [],
          passingCustomIDs: [],
          failingCustomIDs: ['custom-1'],
        },
      })
      expect(result).toBe(true)
    })

    it('should handle API error and return false', async () => {
      // Arrange
      const gateId = 'gate-1'
      const apiError = new Error('Network error')
      vi.mocked(Gates.patchConsoleV1GatesByIdOverrides).mockRejectedValue(apiError)

      // Act
      const result = await gatesOverrideApi.createGateOverride(gateId, { userID: 'user-1', value: true })

      // Assert
      expect(result).toBe(false)
    })
  })

  describe('removeGateOverride', () => {
    it('should remove gate override successfully', async () => {
      // Arrange
      const gateId = 'gate-1'

      // Mock the get overrides call
      vi.mocked(Gates.getConsoleV1GatesByIdOverrides).mockResolvedValue({
        data: mockGatesOverridesResponse,
        request: {} as Request,
        response: {} as Response,
      })

      // Mock the post overrides call
      vi.mocked(Gates.postConsoleV1GatesByIdOverrides).mockResolvedValue({
        data: mockEmptyGatesOverridesResponse,
        request: {} as Request,
        response: {} as Response,
      })

      // Act
      const result = await gatesOverrideApi.removeGateOverride(gateId, { userID: 'user-1' })

      // Assert
      expect(vi.mocked(Gates.getConsoleV1GatesByIdOverrides)).toHaveBeenCalledWith({
        path: { id: gateId },
      })
      expect(vi.mocked(Gates.postConsoleV1GatesByIdOverrides)).toHaveBeenCalledWith({
        path: { id: gateId },
        body: {
          passingUserIDs: ['user-2'], // user-1 removed from passingUserIDs
          failingUserIDs: ['user-3'], // user-1 removed from failingUserIDs
          passingCustomIDs: ['custom-1'],
          failingCustomIDs: ['custom-2'],
          environmentOverrides: mockGatesOverridesResponse.data.environmentOverrides,
        },
      })
      expect(result).toBe(true)
    })

    it('should handle case when no current overrides exist', async () => {
      // Arrange
      const gateId = 'gate-1'

      // Mock the get overrides call with no data
      vi.mocked(Gates.getConsoleV1GatesByIdOverrides).mockResolvedValue({
        data: mockEmptyGatesOverridesResponse,
        request: {} as Request,
        response: {} as Response,
      })

      // Act
      const result = await gatesOverrideApi.removeGateOverride(gateId, { userID: 'user-1' })

      // Assert
      expect(vi.mocked(Gates.getConsoleV1GatesByIdOverrides)).toHaveBeenCalledWith({
        path: { id: gateId },
      })
      expect(vi.mocked(Gates.postConsoleV1GatesByIdOverrides)).not.toHaveBeenCalled()
      expect(result).toBe(true)
    })

    it('should handle API error and return false', async () => {
      // Arrange
      const gateId = 'gate-1'
      const apiError = new Error('Network error')
      vi.mocked(Gates.getConsoleV1GatesByIdOverrides).mockRejectedValue(apiError)

      // Act
      const result = await gatesOverrideApi.removeGateOverride(gateId, { userID: 'user-1' })

      // Assert
      expect(result).toBe(false)
    })
  })
})
