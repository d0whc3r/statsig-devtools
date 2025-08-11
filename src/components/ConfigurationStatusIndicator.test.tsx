import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import * as configurationFormatters from '../utils/configuration-formatters'
import { ConfigurationStatusIndicator } from './ConfigurationStatusIndicator'

import type { EvaluationResult } from '../services/statsig-integration'

import { cleanup, render, screen } from '@testing-library/react'

// Mock the configuration formatters
vi.mock('../utils/configuration-formatters')

const mockConfigurationFormatters = vi.mocked(configurationFormatters)

describe('ConfigurationStatusIndicator', () => {
  const mockPassedResult: EvaluationResult = {
    configurationName: 'test_feature',
    type: 'feature_gate',
    passed: true,
    reason: 'rule_match',
    value: true,
  }

  const mockFailedResult: EvaluationResult = {
    configurationName: 'test_feature',
    type: 'feature_gate',
    passed: false,
    reason: 'no_match',
    value: false,
  }

  afterEach(() => {
    cleanup()
  })

  beforeEach(() => {
    vi.clearAllMocks()

    // Default mock implementations
    mockConfigurationFormatters.getStatusIndicatorClass.mockImplementation((passed) => {
      if (passed === true) return 'text-green-600 bg-green-50'
      if (passed === false) return 'text-red-600 bg-red-50'
      return 'text-gray-600 bg-gray-50'
    })

    mockConfigurationFormatters.getStatusText.mockImplementation((passed) => {
      if (passed === true) return 'Passed'
      if (passed === false) return 'Failed'
      return 'Unknown'
    })

    mockConfigurationFormatters.getStatusIconPath.mockImplementation((passed) => {
      if (passed === true) return 'M5 13l4 4L19 7'
      if (passed === false) return 'M6 18L18 6M6 6l12 12'
      return 'M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z'
    })
  })

  describe('basic rendering', () => {
    it('should render with default props', () => {
      const { container } = render(<ConfigurationStatusIndicator />)

      const indicator = container.firstChild as HTMLElement
      expect(indicator).toBeInTheDocument()

      // Should have SVG icon
      const svg = indicator.querySelector('svg')
      expect(svg).toBeInTheDocument()
      expect(svg).toHaveClass('h-4', 'w-4') // default medium size
    })

    it('should call formatter functions with correct parameters', () => {
      render(<ConfigurationStatusIndicator result={mockPassedResult} />)

      expect(mockConfigurationFormatters.getStatusIndicatorClass).toHaveBeenCalledWith(true)
      expect(mockConfigurationFormatters.getStatusText).toHaveBeenCalledWith(true)
      expect(mockConfigurationFormatters.getStatusIconPath).toHaveBeenCalledWith(true)
    })

    it('should handle undefined result', () => {
      render(<ConfigurationStatusIndicator result={undefined} />)

      expect(mockConfigurationFormatters.getStatusIndicatorClass).toHaveBeenCalledWith(undefined)
      expect(mockConfigurationFormatters.getStatusText).toHaveBeenCalledWith(undefined)
      expect(mockConfigurationFormatters.getStatusIconPath).toHaveBeenCalledWith(undefined)
    })
  })

  describe('evaluation result states', () => {
    it('should render passed state correctly', () => {
      const { container } = render(<ConfigurationStatusIndicator result={mockPassedResult} />)

      const indicator = container.firstChild as HTMLElement
      expect(indicator).toHaveClass('text-green-600', 'bg-green-50')
      expect(screen.getByText('Passed')).toBeInTheDocument()

      const path = indicator.querySelector('path')
      expect(path).toHaveAttribute('d', 'M5 13l4 4L19 7')
    })

    it('should render failed state correctly', () => {
      const { container } = render(<ConfigurationStatusIndicator result={mockFailedResult} />)

      const indicator = container.firstChild as HTMLElement
      expect(indicator).toHaveClass('text-red-600', 'bg-red-50')
      expect(screen.getByText('Failed')).toBeInTheDocument()

      const path = indicator.querySelector('path')
      expect(path).toHaveAttribute('d', 'M6 18L18 6M6 6l12 12')
    })

    it('should render unknown state when result is undefined', () => {
      const { container } = render(<ConfigurationStatusIndicator />)

      const indicator = container.firstChild as HTMLElement
      expect(indicator).toHaveClass('text-gray-600', 'bg-gray-50')
      expect(screen.getByText('Unknown')).toBeInTheDocument()
    })

    it('should handle result with undefined passed property', () => {
      const resultWithUndefinedPassed: EvaluationResult = {
        configurationName: 'test_feature',
        type: 'feature_gate',
        passed: undefined as any,
        reason: 'unknown',
        value: null,
      }

      render(<ConfigurationStatusIndicator result={resultWithUndefinedPassed} />)

      expect(mockConfigurationFormatters.getStatusIndicatorClass).toHaveBeenCalledWith(undefined)
      expect(mockConfigurationFormatters.getStatusText).toHaveBeenCalledWith(undefined)
      expect(mockConfigurationFormatters.getStatusIconPath).toHaveBeenCalledWith(undefined)
    })
  })

  describe('size variants', () => {
    it('should render small size correctly', () => {
      const { container } = render(<ConfigurationStatusIndicator size="sm" />)

      const svg = (container.firstChild as HTMLElement).querySelector('svg')
      expect(svg).toHaveClass('h-3', 'w-3')
    })

    it('should render medium size correctly (default)', () => {
      const { container } = render(<ConfigurationStatusIndicator size="md" />)

      const svg = (container.firstChild as HTMLElement).querySelector('svg')
      expect(svg).toHaveClass('h-4', 'w-4')
    })

    it('should render large size correctly', () => {
      const { container } = render(<ConfigurationStatusIndicator size="lg" />)

      const svg = (container.firstChild as HTMLElement).querySelector('svg')
      expect(svg).toHaveClass('h-5', 'w-5')
    })

    it('should default to medium size when size prop is not provided', () => {
      const { container } = render(<ConfigurationStatusIndicator />)

      const svg = (container.firstChild as HTMLElement).querySelector('svg')
      expect(svg).toHaveClass('h-4', 'w-4')
    })
  })

  describe('text display options', () => {
    it('should show text by default', () => {
      render(<ConfigurationStatusIndicator />)

      expect(screen.getByText('Unknown')).toBeInTheDocument()
    })

    it('should hide text when showText is false', () => {
      const { container } = render(<ConfigurationStatusIndicator showText={false} />)

      expect(screen.queryByText('Unknown')).not.toBeInTheDocument()
      // Should still have the icon
      const svg = (container.firstChild as HTMLElement).querySelector('svg')
      expect(svg).toBeInTheDocument()
    })

    it('should show text when showText is true', () => {
      render(<ConfigurationStatusIndicator showText />)

      expect(screen.getByText('Unknown')).toBeInTheDocument()
    })

    it('should not render text element when showText is false', () => {
      const { container } = render(<ConfigurationStatusIndicator result={mockPassedResult} showText={false} />)

      const indicator = container.firstChild as HTMLElement
      // Should only contain SVG, no text nodes
      expect(indicator.childNodes).toHaveLength(1)
      expect(indicator.querySelector('svg')).toBeInTheDocument()
    })
  })

  describe('SVG icon properties', () => {
    it('should render SVG with correct attributes', () => {
      const { container } = render(<ConfigurationStatusIndicator />)

      const svg = (container.firstChild as HTMLElement).querySelector('svg')
      expect(svg).toHaveAttribute('fill', 'none')
      expect(svg).toHaveAttribute('viewBox', '0 0 24 24')
      expect(svg).toHaveAttribute('stroke', 'currentColor')
    })

    it('should render path with correct stroke properties', () => {
      const { container } = render(<ConfigurationStatusIndicator />)

      const path = (container.firstChild as HTMLElement).querySelector('path')
      expect(path).toHaveAttribute('stroke-linecap', 'round')
      expect(path).toHaveAttribute('stroke-linejoin', 'round')
      expect(path).toHaveAttribute('stroke-width', '2')
    })

    it('should use icon path from formatter function', () => {
      const customIconPath =
        'M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z'
      mockConfigurationFormatters.getStatusIconPath.mockReturnValue(customIconPath)

      const { container } = render(<ConfigurationStatusIndicator result={mockPassedResult} />)

      const path = (container.firstChild as HTMLElement).querySelector('path')
      expect(path).toHaveAttribute('d', customIconPath)
    })
  })

  describe('combined props', () => {
    it('should render correctly with all props provided', () => {
      const { container } = render(
        <ConfigurationStatusIndicator result={mockPassedResult} size="lg" showText={false} />,
      )

      const indicator = container.firstChild as HTMLElement
      expect(indicator).toHaveClass('text-green-600', 'bg-green-50')

      const svg = indicator.querySelector('svg')
      expect(svg).toHaveClass('h-5', 'w-5')

      expect(screen.queryByText('Passed')).not.toBeInTheDocument()
    })

    it('should render small failed indicator with text', () => {
      const { container } = render(<ConfigurationStatusIndicator result={mockFailedResult} size="sm" showText />)

      const indicator = container.firstChild as HTMLElement
      expect(indicator).toHaveClass('text-red-600', 'bg-red-50')

      const svg = indicator.querySelector('svg')
      expect(svg).toHaveClass('h-3', 'w-3')

      expect(screen.getByText('Failed')).toBeInTheDocument()
    })
  })

  describe('edge cases', () => {
    it('should handle empty result object', () => {
      const emptyResult = {} as EvaluationResult

      render(<ConfigurationStatusIndicator result={emptyResult} />)

      expect(mockConfigurationFormatters.getStatusIndicatorClass).toHaveBeenCalledWith(undefined)
      expect(mockConfigurationFormatters.getStatusText).toHaveBeenCalledWith(undefined)
      expect(mockConfigurationFormatters.getStatusIconPath).toHaveBeenCalledWith(undefined)
    })

    it('should handle null result', () => {
      render(<ConfigurationStatusIndicator result={null as any} />)

      expect(mockConfigurationFormatters.getStatusIndicatorClass).toHaveBeenCalledWith(undefined)
      expect(mockConfigurationFormatters.getStatusText).toHaveBeenCalledWith(undefined)
      expect(mockConfigurationFormatters.getStatusIconPath).toHaveBeenCalledWith(undefined)
    })

    it('should handle invalid size gracefully', () => {
      const { container } = render(<ConfigurationStatusIndicator size={'invalid' as any} />)

      // Should fallback to some default behavior or handle gracefully
      const indicator = container.firstChild as HTMLElement
      expect(indicator).toBeInTheDocument()
    })

    it('should handle formatter functions returning empty strings', () => {
      mockConfigurationFormatters.getStatusIndicatorClass.mockReturnValue('')
      mockConfigurationFormatters.getStatusText.mockReturnValue('')
      mockConfigurationFormatters.getStatusIconPath.mockReturnValue('')

      const { container } = render(<ConfigurationStatusIndicator result={mockPassedResult} />)

      const indicator = container.firstChild as HTMLElement
      expect(indicator).toBeInTheDocument()

      const path = indicator.querySelector('path')
      expect(path).toHaveAttribute('d', '')
    })
  })

  describe('accessibility', () => {
    it('should be accessible to screen readers', () => {
      const { container } = render(<ConfigurationStatusIndicator result={mockPassedResult} />)

      const indicator = container.firstChild as HTMLElement
      expect(indicator).toBeInTheDocument()

      // Text should be readable by screen readers
      expect(screen.getByText('Passed')).toBeInTheDocument()
    })

    it('should work without text for screen readers when showText is false', () => {
      const { container } = render(<ConfigurationStatusIndicator result={mockPassedResult} showText={false} />)

      const indicator = container.firstChild as HTMLElement
      expect(indicator).toBeInTheDocument()

      // Should still have visual indicator (SVG) even without text
      const svg = indicator.querySelector('svg')
      expect(svg).toBeInTheDocument()
    })
  })
})
