import { BaseIcon } from './BaseIcon'

import type { IconProps } from './types'

const tabPaths = [
  {
    d: 'M9 17v-2m3 2v-4m3 4v-6m2 10H4a2 2 0 01-2-2V5a2 2 0 012-2h16a2 2 0 012 2v14a2 2 0 01-2 2z',
  },
]

export function TabIcon(props: IconProps) {
  return <BaseIcon paths={tabPaths} {...props} />
}
