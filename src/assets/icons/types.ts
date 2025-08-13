import type { SVGProps } from 'react'

// Base interface for all SVG icon components
export interface IconProps extends SVGProps<SVGSVGElement> {
  className?: string
}

// Type for SVG path elements
export interface IconPathProps {
  strokeLinecap?: 'round' | 'butt' | 'square'
  strokeLinejoin?: 'round' | 'miter' | 'bevel'
  strokeWidth?: number
  d: string
}
