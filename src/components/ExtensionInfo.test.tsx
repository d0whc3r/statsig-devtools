import { describe, expect, it, vi } from 'vitest'

import { useExtensionInfo } from '../hooks/useExtensionInfo'
import { ExtensionInfo } from './ExtensionInfo'

import { render, screen } from '@testing-library/react'

// Mock the hook
vi.mock('../hooks/useExtensionInfo')

const mockUseExtensionInfo = vi.mocked(useExtensionInfo)

describe('ExtensionInfo', () => {
  it('should render nothing when loading', () => {
    mockUseExtensionInfo.mockReturnValue({
      extensionInfo: null,
      isLoading: true,
    })

    const { container } = render(<ExtensionInfo />)
    expect(container.firstChild).toBeNull()
  })

  it('should render nothing when no extension info', () => {
    mockUseExtensionInfo.mockReturnValue({
      extensionInfo: null,
      isLoading: false,
    })

    const { container } = render(<ExtensionInfo />)
    expect(container.firstChild).toBeNull()
  })

  it('should render compact version', () => {
    mockUseExtensionInfo.mockReturnValue({
      extensionInfo: {
        name: 'Test Extension',
        version: '2.0.0',
        description: 'Test description',
        manifestVersion: 3,
      },
      isLoading: false,
    })

    render(<ExtensionInfo compact />)

    expect(screen.getByText('v2.0.0')).toBeInTheDocument()
    expect(screen.queryByText('Test Extension')).not.toBeInTheDocument()
  })

  it('should render full version without description', () => {
    mockUseExtensionInfo.mockReturnValue({
      extensionInfo: {
        name: 'Test Extension',
        version: '2.0.0',
        description: 'Test description',
        manifestVersion: 3,
      },
      isLoading: false,
    })

    render(<ExtensionInfo />)

    expect(screen.getByText('Test Extension')).toBeInTheDocument()
    expect(screen.getByText('v2.0.0')).toBeInTheDocument()
    expect(screen.getByText('MV3')).toBeInTheDocument()
    expect(screen.queryByText('Test description')).not.toBeInTheDocument()
  })

  it('should render full version with description', () => {
    mockUseExtensionInfo.mockReturnValue({
      extensionInfo: {
        name: 'Test Extension',
        version: '2.0.0',
        description: 'Test description',
        manifestVersion: 2,
      },
      isLoading: false,
    })

    render(<ExtensionInfo showDescription />)

    expect(screen.getByText('Test Extension')).toBeInTheDocument()
    expect(screen.getByText('v2.0.0')).toBeInTheDocument()
    expect(screen.getByText('MV2')).toBeInTheDocument()
    expect(screen.getByText('Test description')).toBeInTheDocument()
  })

  it('should apply custom className', () => {
    mockUseExtensionInfo.mockReturnValue({
      extensionInfo: {
        name: 'Test Extension',
        version: '2.0.0',
        description: 'Test description',
        manifestVersion: 3,
      },
      isLoading: false,
    })

    const { container } = render(<ExtensionInfo className="custom-class" />)

    expect(container.firstChild).toHaveClass('custom-class')
  })

  it('should handle empty description gracefully', () => {
    mockUseExtensionInfo.mockReturnValue({
      extensionInfo: {
        name: 'Test Extension',
        version: '2.0.0',
        description: '',
        manifestVersion: 3,
      },
      isLoading: false,
    })

    render(<ExtensionInfo showDescription />)

    expect(screen.getByText('Test Extension')).toBeInTheDocument()
    expect(screen.getByText('v2.0.0')).toBeInTheDocument()
    expect(screen.getByText('MV3')).toBeInTheDocument()
    // Description should not be rendered when empty
    expect(screen.queryByRole('paragraph')).not.toBeInTheDocument()
  })
})
