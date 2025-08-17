import React from 'react'

import { formatValue } from '../utils/configuration-formatters'

import type { EvaluationResult } from '../services/unified-statsig-api'
import type { StatsigConfigurationItem } from '../types'

interface ExperimentVisualizationProps {
  configuration: StatsigConfigurationItem
  evaluationResult?: EvaluationResult
  compact?: boolean
}

/**
 * Component for visualizing experiment groups with distribution charts
 */
export function ExperimentVisualization({
  configuration,
  evaluationResult,
  compact = false,
}: ExperimentVisualizationProps) {
  if (configuration.type !== 'experiment' || !configuration.groups || configuration.groups.length === 0) {
    return null
  }

  const totalPercentage = Math.round(configuration.groups.reduce((sum, group) => sum + group.size, 0) * 100) / 100

  return (
    <div className={`${compact ? 'p-2' : 'p-4'} rounded-lg border border-slate-200 bg-white`}>
      <div className="mb-4">
        <h3 className="mb-2 text-lg font-semibold text-gray-900">Experiment Distribution</h3>
        <p className="text-sm text-gray-600">
          {configuration.groups.length} variants • {totalPercentage}% total allocation
        </p>
      </div>

      {/* Distribution Bar Chart */}
      <div className="mb-6">
        <div className="flex h-8 overflow-hidden rounded-lg border border-slate-200">
          {configuration.groups.map((group, index) => {
            const isCurrentGroup = evaluationResult?.groupName === group.name
            const colors = [
              'bg-blue-500',
              'bg-green-500',
              'bg-purple-500',
              'bg-orange-500',
              'bg-red-500',
              'bg-indigo-500',
              'bg-pink-500',
              'bg-yellow-500',
            ]
            const color = colors[index % colors.length]

            return (
              <div
                key={group.name}
                className={`${color} ${isCurrentGroup ? 'ring-2 ring-purple-600 ring-offset-2' : ''} relative`}
                style={{ width: `${(group.size / totalPercentage) * 100}%` }}
                title={`${group.name}: ${group.size}%`}
              >
                {group.size >= 10 && (
                  <div className="absolute inset-0 flex items-center justify-center text-xs font-medium text-white">
                    {group.size}%
                  </div>
                )}
              </div>
            )
          })}
        </div>
      </div>

      {/* Groups Details */}
      <div className="space-y-3">
        {configuration.groups.map((group, index) => {
          const isCurrentGroup = evaluationResult?.groupName === group.name
          const colors = [
            { bg: 'bg-blue-50', border: 'border-blue-200', text: 'text-blue-900', dot: 'bg-blue-500' },
            { bg: 'bg-green-50', border: 'border-green-200', text: 'text-green-900', dot: 'bg-green-500' },
            { bg: 'bg-purple-50', border: 'border-purple-200', text: 'text-purple-900', dot: 'bg-purple-500' },
            { bg: 'bg-orange-50', border: 'border-orange-200', text: 'text-orange-900', dot: 'bg-orange-500' },
            { bg: 'bg-red-50', border: 'border-red-200', text: 'text-red-900', dot: 'bg-red-500' },
            { bg: 'bg-indigo-50', border: 'border-indigo-200', text: 'text-indigo-900', dot: 'bg-indigo-500' },
            { bg: 'bg-pink-50', border: 'border-pink-200', text: 'text-pink-900', dot: 'bg-pink-500' },
            { bg: 'bg-yellow-50', border: 'border-yellow-200', text: 'text-yellow-900', dot: 'bg-yellow-500' },
          ]
          const colorScheme = colors[index % colors.length]

          return (
            <div
              key={group.name}
              className={`rounded-lg border p-3 ${
                isCurrentGroup
                  ? 'border-purple-300 bg-purple-50 ring-2 ring-purple-200'
                  : `${colorScheme.border} ${colorScheme.bg}`
              }`}
            >
              <div className="mb-2 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className={`h-3 w-3 rounded-full ${colorScheme.dot}`} />
                  <span className={`font-semibold ${isCurrentGroup ? 'text-purple-900' : colorScheme.text}`}>
                    {group.name}
                  </span>
                  {isCurrentGroup && (
                    <span className="inline-flex items-center rounded-full bg-purple-100 px-2 py-1 text-xs font-medium text-purple-800">
                      <svg className="mr-1 h-3 w-3" fill="currentColor" viewBox="0 0 20 20">
                        <path
                          fillRule="evenodd"
                          d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                          clipRule="evenodd"
                        />
                      </svg>
                      Active
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <span className={`text-sm font-medium ${isCurrentGroup ? 'text-purple-700' : 'text-slate-600'}`}>
                    {group.size}%
                  </span>
                  <div className="text-xs text-slate-500">
                    ({Math.round((group.size / totalPercentage) * 100 * 100) / 100}% of traffic)
                  </div>
                </div>
              </div>

              {group.parameterValues && Object.keys(group.parameterValues).length > 0 && (
                <div className="mt-2">
                  <div className="mb-1 text-xs font-medium text-slate-600">Parameters:</div>
                  <div className="rounded border border-slate-200 bg-white p-2">
                    <div className="space-y-1">
                      {Object.entries(group.parameterValues).map(([key, value]) => (
                        <div key={key} className="flex items-center justify-between text-xs">
                          <span className="font-medium text-slate-700">{key}:</span>
                          <span className="font-mono text-slate-900">{formatValue(value)}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
          )
        })}
      </div>

      {/* Summary Stats */}
      <div className="mt-4 border-t border-slate-200 pt-4">
        <div className="grid grid-cols-3 gap-4 text-center">
          <div>
            <div className="text-lg font-semibold text-slate-900">{configuration.groups.length}</div>
            <div className="text-xs text-slate-600">Variants</div>
          </div>
          <div>
            <div className="text-lg font-semibold text-slate-900">{totalPercentage}%</div>
            <div className="text-xs text-slate-600">Total Traffic</div>
          </div>
          <div>
            <div className="text-lg font-semibold text-slate-900">{evaluationResult?.groupName ? '1' : '0'}</div>
            <div className="text-xs text-slate-600">Active Group</div>
          </div>
        </div>
      </div>
    </div>
  )
}
