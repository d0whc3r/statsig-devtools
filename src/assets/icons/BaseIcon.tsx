import type { IconPathProps, IconProps } from './types'

interface BaseIconProps extends IconProps {
  paths: IconPathProps[]
}

export function BaseIcon({ className = '', paths, ...svgProps }: BaseIconProps) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" {...svgProps}>
      {paths.map((path, index) => (
        <path
          key={index}
          strokeLinecap={path.strokeLinecap ?? 'round'}
          strokeLinejoin={path.strokeLinejoin ?? 'round'}
          strokeWidth={path.strokeWidth ?? 2}
          d={path.d}
        />
      ))}
    </svg>
  )
}
