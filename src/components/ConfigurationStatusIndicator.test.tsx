import { beforeEach, describe, expect, it, vi } from 'vitest'

import * as configurationFormatters from '../utils/configuration-formatters'
import { ConfigurationStatusIndicator } from './ConfigurationStatusIndicator'

import type { EvaluationResult } from '../services/statsig-integration'

import { render, screen } from '@testing-library/react'

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

  beforeEach(() => {
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

  it('should match snapshot with default props', () => {
    const { container } = render(<ConfigurationStatusIndicator />)
    expect(container).toMatchSnapshot()
  })

  describe('basic rendering', () => {
    it('should render with default props', () => {
      render(<ConfigurationStatusIndicator />)

      const indicators = screen.getAllByRole('generic')
      const indicator = indicators[1] // The span element (second generic element)
      expect(indicator).toBeInTheDocument()
      expect(indicator).toHaveClass('text-gray-600', 'bg-gray-50')
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
      render(<ConfigurationStatusIndicator result={mockPassedResult} />)

      const indicators = screen.getAllByRole('generic')
      const indicator = indicators[1] // The span element
      expect(indicator).toHaveClass('text-green-600', 'bg-green-50')
      expect(screen.getByText('Passed')).toBeInTheDocument()
    })

    it('should render failed state correctly', () => {
      render(<ConfigurationStatusIndicator result={mockFailedResult} />)

      const indicators = screen.getAllByRole('generic')
      const indicator = indicators[1] // The span element
      expect(indicator).toHaveClass('text-red-600', 'bg-red-50')
      expect(screen.getByText('Failed')).toBeInTheDocument()
    })

    it('should render unknown state when result is undefined', () => {
      render(<ConfigurationStatusIndicator />)

      const indicators = screen.getAllByRole('generic')
      const indicator = indicators[1] // The span element
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

  describe('text display options', () => {
    it('should show text by default', () => {
      render(<ConfigurationStatusIndicator />)

      expect(screen.getByText('Unknown')).toBeInTheDocument()
    })

    it('should hide text when showText is false', () => {
      render(<ConfigurationStatusIndicator showText={false} />)

      expect(screen.queryByText('Unknown')).not.toBeInTheDocument()
    })

    it('should show text when showText is true', () => {
      render(<ConfigurationStatusIndicator showText />)

      expect(screen.getByText('Unknown')).toBeInTheDocument()
    })

    it('should not render text element when showText is false', () => {
      render(<ConfigurationStatusIndicator result={mockPassedResult} showText={false} />)

      const indicators = screen.getAllByRole('generic')
      const indicator = indicators[1] // The span element
      // Should only contain SVG, no text nodes
      expect(indicator.childNodes).toHaveLength(1)
    })
  })

  describe('combined props', () => {
    it('should render correctly with all props provided', () => {
      render(<ConfigurationStatusIndicator result={mockPassedResult} size="lg" showText={false} />)

      const indicators = screen.getAllByRole('generic')
      const indicator = indicators[1] // The span element
      expect(indicator).toHaveClass('text-green-600', 'bg-green-50')

      expect(screen.queryByText('Passed')).not.toBeInTheDocument()
    })

    it('should render small failed indicator with text', () => {
      render(<ConfigurationStatusIndicator result={mockFailedResult} size="sm" showText />)

      const indicators = screen.getAllByRole('generic')
      const indicator = indicators[1] // The span element
      expect(indicator).toHaveClass('text-red-600', 'bg-red-50')

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
      render(<ConfigurationStatusIndicator size={'invalid' as any} />)

      // Should fallback to some default behavior or handle gracefully
      const indicators = screen.getAllByRole('generic')
      const indicator = indicators[1] // The span element
      expect(indicator).toBeInTheDocument()
    })

    it('should handle formatter functions returning empty strings', () => {
      mockConfigurationFormatters.getStatusIndicatorClass.mockReturnValue('')
      mockConfigurationFormatters.getStatusText.mockReturnValue('')
      mockConfigurationFormatters.getStatusIconPath.mockReturnValue('')

      render(<ConfigurationStatusIndicator result={mockPassedResult} />)

      const indicators = screen.getAllByRole('generic')
      const indicator = indicators[1] // The span element
      expect(indicator).toBeInTheDocument()
    })
  })

  describe('accessibility', () => {
    it('should be accessible to screen readers', () => {
      render(<ConfigurationStatusIndicator result={mockPassedResult} />)

      const indicators = screen.getAllByRole('generic')
      const indicator = indicators[1] // The span element
      expect(indicator).toBeInTheDocument()

      // Text should be readable by screen readers
      expect(screen.getByText('Passed')).toBeInTheDocument()
    })

    it('should work without text for screen readers when showText is false', () => {
      render(<ConfigurationStatusIndicator result={mockPassedResult} showText={false} />)

      const indicators = screen.getAllByRole('generic')
      const indicator = indicators[1] // The span element
      expect(indicator).toBeInTheDocument()

      // Should still have visual indicator even without text
      expect(indicator.childNodes).toHaveLength(1)
    })
  })
})
