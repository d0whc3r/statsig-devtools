import { BaseIcon } from './BaseIcon'

import type { IconProps } from './types'

const moonPaths = [
  {
    d: 'M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z',
  },
]

export function MoonIcon(props: IconProps) {
  return <BaseIcon paths={moonPaths} {...props} />
}
