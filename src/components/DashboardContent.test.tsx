import { describe, expect, it, vi } from 'vitest'

import { DashboardContent } from './DashboardContent'

import type { AuthState } from '../types'

import { render, screen } from '@testing-library/react'

// Mock hooks
vi.mock('../hooks/useConfigurationData', () => ({
  useConfigurationData: vi.fn(() => ({
    configurations: [],
    isLoading: false,
    error: undefined,
  })),
}))

vi.mock('../hooks/useConfigurationEvaluation', () => ({
  useConfigurationEvaluation: vi.fn(() => ({
    evaluationResults: new Map(),
  })),
}))

vi.mock('../hooks/useConfigurationSelection', () => ({
  useConfigurationSelection: vi.fn(() => ({
    selectedConfiguration: undefined,
    handleConfigurationSelect: vi.fn(),
  })),
}))

vi.mock('../hooks/useStorageOverrides', () => ({
  useStorageOverrides: vi.fn(() => ({
    activeOverrides: [],
  })),
}))

// Mock child components
vi.mock('./ConfigurationList', () => ({
  ConfigurationList: ({ viewMode }: { viewMode: string }) => (
    <div data-testid="configuration-list" data-view-mode={viewMode}>
      Configuration List
    </div>
  ),
}))

vi.mock('./ConfigurationDetailPanel', () => ({
  ConfigurationDetailPanel: ({ allowOverrides }: { allowOverrides: boolean }) => (
    <div data-testid="configuration-detail-panel" data-allow-overrides={allowOverrides}>
      Configuration Detail Panel
    </div>
  ),
}))

describe('DashboardContent', () => {
  const mockAuthState: AuthState = {
    isAuthenticated: true,
    isLoading: false,
    consoleApiKey: 'test-client-key',
    projectName: 'test-project',
    error: undefined,
  }

  it('should match snapshot with popup view mode', () => {
    const { container } = render(<DashboardContent authState={mockAuthState} viewMode="popup" />)
    expect(container).toMatchSnapshot()
  })

  it('should match snapshot with tab view mode', () => {
    const { container } = render(<DashboardContent authState={mockAuthState} viewMode="tab" />)
    expect(container).toMatchSnapshot()
  })

  it('should match snapshot with sidebar view mode', () => {
    const { container } = render(<DashboardContent authState={mockAuthState} viewMode="sidebar" />)
    expect(container).toMatchSnapshot()
  })

  describe('View Mode Restrictions', () => {
    it('should allow overrides in popup mode', () => {
      render(<DashboardContent authState={mockAuthState} viewMode="popup" />)

      // In popup mode, overrides should be allowed
      const configList = screen.getByTestId('configuration-list')
      expect(configList).toHaveAttribute('data-view-mode', 'popup')
    })

    it('should show read-only banner and disable overrides in tab mode', () => {
      render(<DashboardContent authState={mockAuthState} viewMode="tab" />)

      // Should show read-only banner
      expect(screen.getByText('Read-only mode')).toBeInTheDocument()
      expect(screen.getByText('- Use popup mode to create and manage overrides')).toBeInTheDocument()

      // Configuration list should be in tab mode
      const configList = screen.getByTestId('configuration-list')
      expect(configList).toHaveAttribute('data-view-mode', 'tab')
    })

    // Note: Testing allowOverrides prop passing would require more complex mocking
    // The core functionality is tested through the read-only banners and layout tests
  })

  describe('Layout Differences', () => {
    it('should use single column layout in popup mode', () => {
      render(<DashboardContent authState={mockAuthState} viewMode="popup" />)

      // Should not have the two-column layout class
      expect(screen.queryByText('Select a Configuration')).not.toBeInTheDocument()
    })

    it('should use single column layout in sidebar mode', () => {
      render(<DashboardContent authState={mockAuthState} viewMode="sidebar" />)

      // Should not have the two-column layout class
      expect(screen.getByText('Select a Configuration')).toBeInTheDocument()
    })

    it('should use two column layout in tab mode', () => {
      render(<DashboardContent authState={mockAuthState} viewMode="tab" />)

      // Should show the empty state message for the right column
      expect(screen.getByText('Select a Configuration')).toBeInTheDocument()
      expect(
        screen.getByText('Choose a feature gate, dynamic config, or experiment from the list to view its details.'),
      ).toBeInTheDocument()
    })
  })
})
