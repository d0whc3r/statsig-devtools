import type { GetConsoleV1GatesResponse } from '@/src/client/types.gen'

export const mockGatesV1Response: GetConsoleV1GatesResponse = {
  message: 'Success',
  data: [
    {
      id: 'gate-1',
      name: 'feature_gate_1',
      description: 'Test feature gate for authentication',
      lastModifierId: 'user-1',
      lastModifiedTime: 1640995200000,
      lastModifierEmail: 'user1@example.com',
      lastModifierName: 'User One',
      createdTime: 1640995200000,
      creatorName: 'User One',
      checksPerHour: 1000,
      status: 'Launched',
      type: 'PERMANENT',
      typeReason: 'NONE',
      isEnabled: true,
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
    {
      id: 'gate-2',
      name: 'feature_gate_2',
      description: 'Test feature gate for notifications',
      lastModifierId: 'user-2',
      lastModifiedTime: 1640995200000,
      lastModifierEmail: 'user2@example.com',
      lastModifierName: 'User Two',
      createdTime: 1640995200000,
      creatorName: 'User Two',
      checksPerHour: 500,
      status: 'Disabled',
      type: 'PERMANENT',
      typeReason: 'NONE',
      isEnabled: false,
      rules: [
        {
          name: 'Default Rule',
          passPercentage: 0,
          conditions: [
            {
              type: 'public',
            },
          ],
        },
      ],
    },
    {
      id: 'gate-3',
      name: 'feature_gate_3',
      description: 'Test feature gate for analytics',
      lastModifierId: 'user-3',
      lastModifiedTime: 1640995200000,
      lastModifierEmail: 'user3@example.com',
      lastModifierName: 'User Three',
      createdTime: 1640995200000,
      creatorName: 'User Three',
      checksPerHour: 2000,
      status: 'Launched',
      type: 'PERMANENT',
      typeReason: 'NONE',
      isEnabled: true,
      rules: [
        {
          name: 'Default Rule',
          passPercentage: 50,
          conditions: [
            {
              type: 'public',
            },
          ],
        },
      ],
    },
  ],
  pagination: {
    itemsPerPage: 10,
    pageNumber: 1,
    totalItems: 3,
    nextPage: null,
    previousPage: null,
    all: '/url/gates',
  },
}

export const mockEmptyGatesResponse: GetConsoleV1GatesResponse = {
  message: 'Success',
  data: [],
  pagination: {
    itemsPerPage: 10,
    pageNumber: 1,
    totalItems: 0,
    nextPage: null,
    previousPage: null,
    all: '/url/gates',
  },
}
