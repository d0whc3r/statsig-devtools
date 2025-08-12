import { describe, expect, it, vi } from 'vitest'

import * as useActiveTabModule from '../hooks/useActiveTab'
import { ActiveTabInfo } from './ActiveTabInfo'

import { render, screen } from '@testing-library/react'

// Mock the useActiveTab hook
vi.mock('../hooks/useActiveTab')

const mockUseActiveTab = vi.mocked(useActiveTabModule.useActiveTab)

describe('ActiveTabInfo', () => {
  it('renders loading state', () => {
    mockUseActiveTab.mockReturnValue({
      tabInfo: {
        url: null,
        domain: null,
        canInject: false,
      },
      isLoading: true,
      refreshTabInfo: vi.fn(),
    })

    render(<ActiveTabInfo />)

    expect(screen.getByText('Loading tab information...')).toBeInTheDocument()
  })

  it('renders no active tab state', () => {
    mockUseActiveTab.mockReturnValue({
      tabInfo: {
        url: null,
        domain: null,
        canInject: false,
        reason: 'No active tab',
      },
      isLoading: false,
      refreshTabInfo: vi.fn(),
    })

    render(<ActiveTabInfo />)

    expect(screen.getByText('No active tab')).toBeInTheDocument()
  })

  it('renders tab info when injection available', () => {
    mockUseActiveTab.mockReturnValue({
      tabInfo: {
        url: 'https://example.com/path',
        domain: 'example.com',
        canInject: true,
      },
      isLoading: false,
      refreshTabInfo: vi.fn(),
    })

    const { container } = render(<ActiveTabInfo />)

    expect(container).toBeInTheDocument()
  })

  it('renders injection not available state', () => {
    mockUseActiveTab.mockReturnValue({
      tabInfo: {
        url: 'https://example.com/path',
        domain: 'example.com',
        canInject: false,
        reason: 'Chrome internal page',
      },
      isLoading: false,
      refreshTabInfo: vi.fn(),
    })

    render(<ActiveTabInfo />)

    expect(screen.getByText('Chrome internal page')).toBeInTheDocument()
  })

  it('renders in compact mode', () => {
    mockUseActiveTab.mockReturnValue({
      tabInfo: {
        url: 'https://example.com/path',
        domain: 'example.com',
        canInject: true,
      },
      isLoading: false,
      refreshTabInfo: vi.fn(),
    })

    const { container } = render(<ActiveTabInfo compact />)

    expect(container).toBeInTheDocument()
  })
})
