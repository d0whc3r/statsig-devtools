import React from 'react'

import type { EvaluationResult } from '../services/unified-statsig-api'
import type { StatsigConfigurationItem } from '../types'

interface ExperimentSummaryCardProps {
  configuration: StatsigConfigurationItem
  evaluationResult?: EvaluationResult
}

/**
 * Compact summary card for experiment information
 */
export function ExperimentSummaryCard({ configuration, evaluationResult }: ExperimentSummaryCardProps) {
  if (configuration.type !== 'experiment' || !configuration.groups || configuration.groups.length === 0) {
    return null
  }

  const currentGroup = configuration.groups.find((group) => group.name === evaluationResult?.groupName)
  const totalTraffic = configuration.groups.reduce((sum, group) => sum + group.size, 0)

  return (
    <div className="rounded-lg border border-purple-200 bg-gradient-to-r from-purple-50 to-indigo-50 p-4">
      <div className="mb-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="h-2 w-2 rounded-full bg-purple-500" />
          <span className="font-semibold text-purple-900">Experiment Active</span>
        </div>
        <span className="rounded-full bg-purple-100 px-2 py-1 text-xs font-medium text-purple-700">
          {configuration.groups.length} variants
        </span>
      </div>

      {currentGroup && (
        <div className="mb-3">
          <div className="mb-1 text-sm text-purple-800">
            <span className="font-medium">Current Group:</span> {currentGroup.name}
          </div>
          <div className="text-xs text-purple-600">
            {currentGroup.size}% of traffic • {Math.round((currentGroup.size / totalTraffic) * 100)}% allocation
          </div>
        </div>
      )}

      <div className="flex items-center justify-between text-xs text-purple-700">
        <span>Total Traffic: {totalTraffic}%</span>
        <span className="flex items-center gap-1">
          <svg className="h-3 w-3" fill="currentColor" viewBox="0 0 20 20">
            <path
              fillRule="evenodd"
              d="M3 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z"
              clipRule="evenodd"
            />
          </svg>
          View Details
        </span>
      </div>
    </div>
  )
}
