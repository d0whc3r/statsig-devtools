import type { GetConsoleV1EnvironmentsResponse } from '@/src/client/types.gen'

export const mockEnvironmentsV1Response: GetConsoleV1EnvironmentsResponse = {
  message: 'Success',
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
}

export const mockEmptyEnvironmentsResponse: GetConsoleV1EnvironmentsResponse = {
  message: 'Success',
  data: {
    environments: [],
  },
}
