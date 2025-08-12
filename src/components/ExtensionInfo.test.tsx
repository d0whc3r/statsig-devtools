import { describe, expect, it, vi } from 'vitest'

import { useExtensionInfo } from '../hooks/useExtensionInfo'
import { ExtensionInfo } from './ExtensionInfo'

import { render, screen } from '@testing-library/react'

// Mock the hook
vi.mock('../hooks/useExtensionInfo')

const mockUseExtensionInfo = vi.mocked(useExtensionInfo)

describe('ExtensionInfo', () => {
  it('renders nothing when loading', () => {
    mockUseExtensionInfo.mockReturnValue({
      extensionInfo: null,
      isLoading: true,
    })

    render(<ExtensionInfo />)

    // Should not render any extension info content
    expect(screen.queryByText(/v\d+\.\d+\.\d+/)).not.toBeInTheDocument()
    expect(screen.queryByText(/MV[23]/)).not.toBeInTheDocument()
  })

  it('renders nothing when no extension info', () => {
    mockUseExtensionInfo.mockReturnValue({
      extensionInfo: null,
      isLoading: false,
    })

    render(<ExtensionInfo />)

    // Should not render any extension info content
    expect(screen.queryByText(/v\d+\.\d+\.\d+/)).not.toBeInTheDocument()
    expect(screen.queryByText(/MV[23]/)).not.toBeInTheDocument()
  })

  it('renders compact version', () => {
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

  it('renders full version without description', () => {
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

  it('renders full version with description', () => {
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

  it('renders with custom props', () => {
    mockUseExtensionInfo.mockReturnValue({
      extensionInfo: {
        name: 'Test Extension',
        version: '2.0.0',
        description: 'Test description',
        manifestVersion: 3,
      },
      isLoading: false,
    })

    render(<ExtensionInfo className="custom-class" />)

    // Verify the component renders correctly with custom props
    expect(screen.getByText('Test Extension')).toBeInTheDocument()
    expect(screen.getByText('v2.0.0')).toBeInTheDocument()
    expect(screen.getByText('MV3')).toBeInTheDocument()
  })

  it('handles empty description gracefully', () => {
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
