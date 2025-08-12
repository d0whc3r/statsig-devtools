import React from 'react'

import { formatValue } from '../utils/configuration-formatters'

import type { EvaluationResult } from '../services/statsig-integration'

interface EvaluationResultCardProps {
  result: EvaluationResult
}

/**
 * Card component for displaying evaluation results
 */
export function EvaluationResultCard({ result }: EvaluationResultCardProps) {
  return (
    <div className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
      <div className="mb-3 flex flex-wrap items-center gap-2">
        <span className={`status-badge ${result.passed ? 'status-badge-success' : 'status-badge-error'}`}>
          <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d={result.passed ? 'M5 13l4 4L19 7' : 'M6 18L18 6M6 6l12 12'}
            />
          </svg>
          {result.passed ? 'Pass' : 'Fail'}
        </span>
        <span className="text-sm font-medium text-gray-600">Evaluation Result</span>
      </div>

      {/* Result Details */}
      <div className="space-y-3">
        {/* Value */}
        <div className="flex flex-wrap items-center justify-between gap-2">
          <span className="text-sm font-medium text-gray-700">Value:</span>
          <span className="rounded bg-gray-50 px-2 py-1 font-mono text-sm break-all text-gray-900">
            {formatValue(result.value)}
          </span>
        </div>

        {/* Group Name (for experiments) */}
        {result.groupName && (
          <div className="flex flex-wrap items-center justify-between gap-2">
            <span className="text-sm font-medium text-gray-700">Group:</span>
            <span className="rounded bg-purple-50 px-2 py-1 text-sm font-medium text-purple-700">
              {result.groupName}
            </span>
          </div>
        )}

        {/* Rule ID */}
        {result.ruleId && (
          <div className="flex flex-wrap items-center justify-between gap-2">
            <span className="text-sm font-medium text-gray-700">Rule ID:</span>
            <span className="font-mono text-sm break-all text-gray-600">{result.ruleId}</span>
          </div>
        )}

        {/* Secondary Exposures */}
        {result.secondaryExposures && result.secondaryExposures.length > 0 && (
          <div>
            <span className="mb-2 block text-sm font-medium text-gray-700">Secondary Exposures:</span>
            <div className="space-y-1">
              {result.secondaryExposures.map((exposure, index) => (
                <div key={index} className="rounded bg-gray-50 px-2 py-1 text-xs text-gray-600">
                  {exposure.gate}: {formatValue(exposure.gateValue)} ({exposure.ruleID})
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Evaluation Details */}
        {result.evaluationDetails && (
          <div className="border-t border-gray-100 pt-2">
            <span className="mb-2 block text-sm font-medium text-gray-700">Evaluation Details:</span>
            <pre className="overflow-x-auto rounded bg-gray-50 p-2 font-mono text-xs break-words whitespace-pre-wrap text-gray-600">
              <code>{JSON.stringify(result.evaluationDetails, null, 2)}</code>
            </pre>
          </div>
        )}
      </div>
    </div>
  )
}
