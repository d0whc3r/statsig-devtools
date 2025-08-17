import type {
  GetConsoleV1ExperimentsByIdOverridesResponse,
  GetConsoleV1GatesByIdOverridesResponse,
} from '@/src/client/types.gen'

export const mockGatesOverridesResponse: GetConsoleV1GatesByIdOverridesResponse = {
  message: 'Success',
  data: {
    passingUserIDs: ['user-1', 'user-2'],
    failingUserIDs: ['user-3'],
    passingCustomIDs: ['custom-1'],
    failingCustomIDs: ['custom-2'],
    environmentOverrides: [
      {
        environment: 'production',
        unitID: 'prod-unit-1',
        passingIDs: ['prod-user-1'],
        failingIDs: ['prod-user-2'],
      },
      {
        environment: 'staging',
        unitID: 'staging-unit-1',
        passingIDs: ['staging-user-1'],
        failingIDs: [],
      },
    ],
  },
}

export const mockEmptyGatesOverridesResponse: GetConsoleV1GatesByIdOverridesResponse = {
  message: 'Success',
  data: {
    passingUserIDs: [],
    failingUserIDs: [],
    passingCustomIDs: [],
    failingCustomIDs: [],
    environmentOverrides: [],
  },
}

export const mockExperimentsOverridesResponse: GetConsoleV1ExperimentsByIdOverridesResponse = {
  message: 'Success',
  data: {
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
      {
        groupID: 'control',
        ids: ['custom-user-3'],
        unitType: 'userID',
        environment: null,
      },
    ],
  },
}

export const mockEmptyExperimentsOverridesResponse: GetConsoleV1ExperimentsByIdOverridesResponse = {
  message: 'Success',
  data: {
    overrides: [],
    userIDOverrides: [],
  },
}
