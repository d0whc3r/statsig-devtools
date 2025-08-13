import { BaseIcon } from './BaseIcon'

import type { IconProps } from './types'

const exclamationCirclePaths = [
  {
    d: 'M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z',
  },
]

export function ExclamationCircleIcon(props: IconProps) {
  return <BaseIcon paths={exclamationCirclePaths} {...props} />
}
