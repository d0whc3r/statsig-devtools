import { BaseIcon } from './BaseIcon'

import type { IconProps } from './types'

const sidebarPaths = [
  {
    d: 'M4 6h16M4 10h16M4 14h16M4 18h16',
  },
]

export function SidebarIcon(props: IconProps) {
  return <BaseIcon paths={sidebarPaths} {...props} />
}
