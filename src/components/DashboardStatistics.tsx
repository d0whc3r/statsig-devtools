import React from 'react'

import type { DashboardStatistics as StatisticsType } from '../utils/dashboard-statistics'

interface DashboardStatisticsProps {
  statistics: StatisticsType
}

/**
 * Component for displaying dashboard statistics
 */
export const DashboardStatistics: React.FC<DashboardStatisticsProps> = ({ statistics }) => (
  <div className="mt-4 flex items-center gap-6">
    {/* Configuration Counts */}
    <div className="flex items-center gap-4">
      <div className="rounded-lg border border-gray-200 bg-white px-3 py-2 shadow-sm">
        <span className="text-sm font-semibold text-gray-900">{statistics.totalConfigurations}</span>
        <span className="ml-1 text-xs text-gray-600">configurations</span>
      </div>
      <div className="rounded-lg border border-gray-200 bg-white px-3 py-2 shadow-sm">
        <span className="text-sm font-semibold text-gray-900">{statistics.evaluatedConfigurations}</span>
        <span className="ml-1 text-xs text-gray-600">evaluated</span>
      </div>
      <div className="rounded-lg border border-gray-200 bg-white px-3 py-2 shadow-sm">
        <span className="text-sm font-semibold text-gray-900">{statistics.activeOverridesCount}</span>
        <span className="ml-1 text-xs text-gray-600">overrides</span>
      </div>
    </div>

    {/* Pass/Fail Indicators */}
    {statistics.evaluatedConfigurations > 0 && (
      <div className="flex items-center gap-3">
        <div className="status-badge status-badge-success">
          <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
          {statistics.passedConfigurations} Passed
        </div>
        <div className="status-badge status-badge-error">
          <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
          {statistics.failedConfigurations} Failed
        </div>
      </div>
    )}

    {/* Success Rate */}
    {statistics.evaluatedConfigurations > 0 && (
      <div className="rounded-lg border border-gray-200 bg-white px-3 py-2 shadow-sm">
        <span className="text-sm font-semibold text-gray-900">
          {Math.round(statistics.evaluationSuccessRate * 100)}%
        </span>
        <span className="ml-1 text-xs text-gray-600">success rate</span>
      </div>
    )}
  </div>
)
