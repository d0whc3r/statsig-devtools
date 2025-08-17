import { zDynamicConfigDto } from '@/src/client/zod.gen'

import type { z } from 'zod'

export const statsigDynamicConfigDetailResponseSchema = zDynamicConfigDto.pick({
  id: true,
  rules: true,
  defaultValue: true,
})

export type StatsigDynamicConfigDetailResponse = z.infer<typeof statsigDynamicConfigDetailResponseSchema>
