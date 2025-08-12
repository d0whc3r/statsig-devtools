import React from 'react'

import type { StorageOverride } from '../services/statsig-integration'
import type { StatsigConfigurationItem } from '../types'

interface RuleDetailOverrideFormProps {
  configuration: StatsigConfigurationItem
  overrideForm: Partial<StorageOverride>
  setOverrideForm: (form: Partial<StorageOverride>) => void
  onSubmit: () => void
  onCancel: () => void
  getSuggestedOverrideValue: () => string
  getSuggestedKey: () => string
}

/**
 * Override form component for RuleDetail
 */
export function RuleDetailOverrideForm({
  configuration: _configuration,
  overrideForm,
  setOverrideForm,
  onSubmit,
  onCancel,
  getSuggestedOverrideValue,
  getSuggestedKey,
}: RuleDetailOverrideFormProps) {
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSubmit()
  }

  return (
    <div className="mt-4 rounded-lg border bg-gray-50 p-4">
      <h4 className="mb-3 text-sm font-medium text-gray-900">Create Override</h4>
      <form onSubmit={handleSubmit} className="space-y-3">
        <div>
          <label htmlFor="override-type" className="mb-1 block text-xs font-medium text-gray-700">
            Storage Type
          </label>
          <select
            id="override-type"
            value={overrideForm.type || 'localStorage'}
            onChange={(e) =>
              setOverrideForm({
                ...overrideForm,
                type: e.target.value as StorageOverride['type'],
              })
            }
            className="w-full rounded border border-gray-300 px-2 py-1 text-xs focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
          >
            <option value="localStorage">Local Storage</option>
            <option value="sessionStorage">Session Storage</option>
            <option value="cookie">Cookie</option>
          </select>
        </div>

        <div>
          <label htmlFor="override-key" className="mb-1 block text-xs font-medium text-gray-700">
            Key
          </label>
          <div className="flex gap-2">
            <input
              id="override-key"
              type="text"
              value={overrideForm.key || ''}
              onChange={(e) => setOverrideForm({ ...overrideForm, key: e.target.value })}
              placeholder="Enter storage key"
              className="flex-1 rounded border border-gray-300 px-2 py-1 text-xs focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
            />
            <button
              type="button"
              onClick={() => setOverrideForm({ ...overrideForm, key: getSuggestedKey() })}
              className="cursor-pointer rounded bg-gray-200 px-2 py-1 text-xs text-gray-700 hover:bg-gray-300"
            >
              Suggest
            </button>
          </div>
        </div>

        <div>
          <label htmlFor="override-value" className="mb-1 block text-xs font-medium text-gray-700">
            Value
          </label>
          <div className="flex gap-2">
            <textarea
              id="override-value"
              value={overrideForm.value || ''}
              onChange={(e) => setOverrideForm({ ...overrideForm, value: e.target.value })}
              placeholder="Enter override value"
              rows={2}
              className="flex-1 rounded border border-gray-300 px-2 py-1 text-xs focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
            />
            <button
              type="button"
              onClick={() => setOverrideForm({ ...overrideForm, value: getSuggestedOverrideValue() })}
              className="cursor-pointer rounded bg-gray-200 px-2 py-1 text-xs text-gray-700 hover:bg-gray-300"
            >
              Suggest
            </button>
          </div>
        </div>

        {overrideForm.type === 'cookie' && (
          <>
            <div>
              <label htmlFor="override-path" className="mb-1 block text-xs font-medium text-gray-700">
                Path (optional)
              </label>
              <input
                id="override-path"
                type="text"
                value={overrideForm.path || ''}
                onChange={(e) => setOverrideForm({ ...overrideForm, path: e.target.value })}
                placeholder="/"
                className="w-full rounded border border-gray-300 px-2 py-1 text-xs focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
              />
            </div>
            <div>
              <label htmlFor="override-domain" className="mb-1 block text-xs font-medium text-gray-700">
                Domain (optional)
              </label>
              <input
                id="override-domain"
                type="text"
                value={overrideForm.domain || ''}
                onChange={(e) => setOverrideForm({ ...overrideForm, domain: e.target.value })}
                placeholder="example.com"
                className="w-full rounded border border-gray-300 px-2 py-1 text-xs focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
              />
            </div>
          </>
        )}

        <div className="flex gap-2 pt-2">
          <button
            type="submit"
            disabled={!overrideForm.key || !overrideForm.value}
            className="rounded bg-blue-600 px-3 py-1 text-xs text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-gray-300"
          >
            Create Override
          </button>
          <button
            type="button"
            onClick={onCancel}
            className="cursor-pointer rounded bg-gray-200 px-3 py-1 text-xs text-gray-700 hover:bg-gray-300"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  )
}
