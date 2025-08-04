import React from 'react'

import { formatTypeName } from '../utils/configuration-formatters'

import type { StatsigConfigurationItem } from '../types'

interface ConfigurationHeaderProps {
  configuration: StatsigConfigurationItem
  onCreateOverride: () => void
}

/**
 * Header component for configuration details
 */
export const ConfigurationHeader: React.FC<ConfigurationHeaderProps> = ({ configuration, onCreateOverride }) => (
  <div className="mb-6">
    {/* Title and Description */}
    <div className="mb-4">
      <h2 className="mb-2 text-2xl font-bold text-gray-900">{configuration.name}</h2>
      <p className="text-sm text-gray-600">
        Configuration ID:{' '}
        <span className="rounded bg-gray-100 px-2 py-1 font-mono text-gray-800">{configuration.name}</span>
      </p>
    </div>

    {/* Action Button Row */}
    <div className="mb-4">
      <button onClick={onCreateOverride} className="btn-icon btn-primary">
        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
        </svg>
        Create Override
      </button>
    </div>

    {/* Configuration Type and Status */}
    <div className="mb-4 flex items-center gap-3">
      <span
        className={`type-badge ${
          configuration.type === 'feature_gate'
            ? 'type-badge-feature-gate'
            : configuration.type === 'experiment'
              ? 'type-badge-experiment'
              : 'type-badge-dynamic-config'
        }`}
      >
        {formatTypeName(configuration.type)}
      </span>

      {!configuration.enabled && (
        <span className="type-badge bg-gray-100 text-gray-800">
          <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728L5.636 5.636m12.728 12.728L18.364 5.636M5.636 18.364l12.728-12.728"
            />
          </svg>
          Disabled
        </span>
      )}
    </div>
  </div>
)
