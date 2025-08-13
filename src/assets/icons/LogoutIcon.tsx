import { BaseIcon } from './BaseIcon'

import type { IconProps } from './types'

const logoutPaths = [
  {
    d: 'M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1',
  },
]

export function LogoutIcon(props: IconProps) {
  return <BaseIcon paths={logoutPaths} {...props} />
}
