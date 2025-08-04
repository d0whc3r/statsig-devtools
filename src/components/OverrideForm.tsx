import React from 'react'

import { useOverrideForm } from '../hooks/useOverrideForm'

import type { StorageOverride } from '../services/statsig-integration'

interface OverrideFormProps {
  onSubmit: (override: StorageOverride) => Promise<void>
  onCancel: () => void
  initialValues?: Partial<StorageOverride>
}

/**
 * Form component for creating storage overrides
 */
export const OverrideForm: React.FC<OverrideFormProps> = ({ onSubmit, onCancel, initialValues }) => {
  const { formData, errors, isSubmitting, updateField, submitForm, resetForm, isValid } = useOverrideForm({
    onSubmit,
    initialValues,
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const success = await submitForm()
    if (success) {
      onCancel() // Close form on success
    }
  }

  const handleCancel = () => {
    resetForm()
    onCancel()
  }

  return (
    <div className="animate-in slide-in-from-top-4 relative rounded-xl border-2 border-blue-200 bg-gradient-to-br from-blue-50 via-white to-purple-50 p-6 shadow-xl backdrop-blur-sm duration-300">
      {/* Decorative background elements */}
      <div className="pointer-events-none absolute top-0 left-0 h-full w-full rounded-xl bg-gradient-to-br from-blue-500/5 to-purple-500/5" />
      <div className="pointer-events-none absolute top-4 right-4 h-20 w-20 rounded-full bg-gradient-to-br from-blue-400/10 to-purple-400/10 blur-xl" />
      <div className="pointer-events-none absolute bottom-4 left-4 h-16 w-16 rounded-full bg-gradient-to-br from-purple-400/10 to-pink-400/10 blur-xl" />

      <div className="relative z-10">
        <div className="mb-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-blue-500 to-purple-600 shadow-lg">
              <svg className="h-5 w-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 100 4m0-4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 100 4m0-4v2m0-6V4"
                />
              </svg>
            </div>
            <div>
              <h3 className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-xl font-bold text-transparent">
                Create Override
              </h3>
              <p className="mt-1 text-sm text-gray-600">Configure storage values for testing</p>
            </div>
          </div>
          <button
            onClick={handleCancel}
            className="flex h-8 w-8 items-center justify-center rounded-lg text-gray-400 transition-all duration-200 hover:scale-110 hover:bg-gray-100 hover:text-gray-600"
          >
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Storage Type */}
          <div className="group">
            <label htmlFor="type" className="mb-2 block flex items-center gap-2 text-sm font-semibold text-gray-800">
              <svg className="h-4 w-4 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 7v10c0 2.21 1.79 4 4 4h8c2.21 0 4-1.79 4-4V7c0-2.21-1.79-4-4-4H8c-2.21 0-4 1.79-4 4z"
                />
              </svg>
              Storage Type
            </label>
            <select
              id="type"
              value={formData.type || 'localStorage'}
              onChange={(e) => updateField('type', e.target.value)}
              className="w-full rounded-lg border-2 border-gray-200 bg-white/80 px-4 py-3 backdrop-blur-sm transition-all duration-200 group-hover:shadow-md hover:border-blue-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-500 focus:outline-none"
            >
              <option value="localStorage">🗄️ Local Storage</option>
              <option value="sessionStorage">⏱️ Session Storage</option>
              <option value="cookie">🍪 Cookie</option>
            </select>
            {errors.type && (
              <div className="animate-in slide-in-from-left-2 mt-2 flex items-center gap-2 text-red-600 duration-200">
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
                <p className="text-sm font-medium">{errors.type}</p>
              </div>
            )}
          </div>

          {/* Key */}
          <div className="group">
            <label htmlFor="key" className="mb-2 block flex items-center gap-2 text-sm font-semibold text-gray-800">
              <svg className="h-4 w-4 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-3a1 1 0 011-1h2.586l6.414-6.414a6 6 0 015.743-7.743z"
                />
              </svg>
              Key
            </label>
            <input
              type="text"
              id="key"
              value={formData.key || ''}
              onChange={(e) => updateField('key', e.target.value)}
              placeholder="e.g., user_id, feature_flag_key"
              className="w-full rounded-lg border-2 border-gray-200 bg-white/80 px-4 py-3 placeholder-gray-400 backdrop-blur-sm transition-all duration-200 group-hover:shadow-md hover:border-green-300 focus:border-green-500 focus:ring-2 focus:ring-green-500 focus:outline-none"
            />
            {errors.key && (
              <div className="animate-in slide-in-from-left-2 mt-2 flex items-center gap-2 text-red-600 duration-200">
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
                <p className="text-sm font-medium">{errors.key}</p>
              </div>
            )}
          </div>

          {/* Value */}
          <div className="group">
            <label htmlFor="value" className="mb-2 block flex items-center gap-2 text-sm font-semibold text-gray-800">
              <svg className="h-4 w-4 text-purple-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                />
              </svg>
              Value
            </label>
            <textarea
              id="value"
              value={formData.value || ''}
              onChange={(e) => updateField('value', e.target.value)}
              placeholder="e.g., true, false, 123, or JSON object"
              rows={3}
              className="w-full resize-none rounded-lg border-2 border-gray-200 bg-white/80 px-4 py-3 placeholder-gray-400 backdrop-blur-sm transition-all duration-200 group-hover:shadow-md hover:border-purple-300 focus:border-purple-500 focus:ring-2 focus:ring-purple-500 focus:outline-none"
            />
            {errors.value && (
              <div className="animate-in slide-in-from-left-2 mt-2 flex items-center gap-2 text-red-600 duration-200">
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
                <p className="text-sm font-medium">{errors.value}</p>
              </div>
            )}
            <div className="mt-2 flex items-center gap-2 text-gray-500">
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              <p className="text-xs">Supports strings, numbers, booleans, and JSON objects</p>
            </div>
          </div>

          {/* Cookie-specific fields */}
          {formData.type === 'cookie' && (
            <div className="animate-in slide-in-from-top-2 space-y-6 rounded-lg border-2 border-orange-200 bg-gradient-to-r from-orange-50 to-yellow-50 p-4 duration-300">
              <div className="flex items-center gap-2 font-semibold text-orange-700">
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
                Cookie Configuration
              </div>

              {/* Domain */}
              <div className="group">
                <label
                  htmlFor="domain"
                  className="mb-2 block flex items-center gap-2 text-sm font-semibold text-gray-800"
                >
                  <svg className="h-4 w-4 text-orange-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9v-9m0-9v9"
                    />
                  </svg>
                  Domain
                </label>
                <input
                  type="text"
                  id="domain"
                  value={formData.domain || ''}
                  onChange={(e) => updateField('domain', e.target.value)}
                  placeholder="e.g., example.com (auto-filled from current tab)"
                  className="w-full rounded-lg border-2 border-orange-200 bg-white/80 px-4 py-3 placeholder-gray-400 backdrop-blur-sm transition-all duration-200 group-hover:shadow-md hover:border-orange-300 focus:border-orange-500 focus:ring-2 focus:ring-orange-500 focus:outline-none"
                />
                {errors.domain && (
                  <div className="animate-in slide-in-from-left-2 mt-2 flex items-center gap-2 text-red-600 duration-200">
                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                    <p className="text-sm font-medium">{errors.domain}</p>
                  </div>
                )}
                <div className="mt-2 flex items-center gap-2 text-gray-500">
                  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                  <p className="text-xs">Leave empty to use current domain</p>
                </div>
              </div>

              {/* Path */}
              <div className="group">
                <label
                  htmlFor="path"
                  className="mb-2 block flex items-center gap-2 text-sm font-semibold text-gray-800"
                >
                  <svg className="h-4 w-4 text-orange-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2H5a2 2 0 00-2-2z"
                    />
                  </svg>
                  Path
                </label>
                <input
                  type="text"
                  id="path"
                  value={formData.path || '/'}
                  onChange={(e) => updateField('path', e.target.value)}
                  placeholder="/"
                  className="w-full rounded-lg border-2 border-orange-200 bg-white/80 px-4 py-3 placeholder-gray-400 backdrop-blur-sm transition-all duration-200 group-hover:shadow-md hover:border-orange-300 focus:border-orange-500 focus:ring-2 focus:ring-orange-500 focus:outline-none"
                />
                {errors.path && (
                  <div className="animate-in slide-in-from-left-2 mt-2 flex items-center gap-2 text-red-600 duration-200">
                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                    <p className="text-sm font-medium">{errors.path}</p>
                  </div>
                )}
                <div className="mt-2 flex items-center gap-2 text-gray-500">
                  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                  <p className="text-xs">Cookie path (defaults to /)</p>
                </div>
              </div>
            </div>
          )}

          {/* Submit Error */}
          {errors.submit && (
            <div className="animate-in slide-in-from-top-2 rounded-lg border-2 border-red-200 bg-gradient-to-r from-red-50 to-pink-50 p-4 duration-300">
              <div className="flex items-center gap-3">
                <div className="flex-shrink-0">
                  <svg className="h-5 w-5 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                </div>
                <p className="text-sm font-medium text-red-700">{errors.submit}</p>
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="border-gradient-to-r flex items-center gap-4 border-t-2 from-gray-200 to-gray-300 pt-6">
            <button
              type="submit"
              disabled={!isValid() || isSubmitting}
              className="group relative flex-1 transform overflow-hidden rounded-lg bg-gradient-to-r from-blue-500 to-purple-600 px-6 py-3 font-semibold text-white shadow-lg transition-all duration-200 hover:scale-105 hover:from-blue-600 hover:to-purple-700 hover:shadow-xl disabled:transform-none disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:shadow-lg"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent opacity-0 transition-opacity duration-200 group-hover:opacity-100" />
              <div className="relative flex items-center justify-center gap-2">
                {isSubmitting ? (
                  <>
                    <svg className="h-5 w-5 animate-spin" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      />
                    </svg>
                    Creating Override...
                  </>
                ) : (
                  <>
                    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                      />
                    </svg>
                    Create Override
                  </>
                )}
              </div>
            </button>
            <button
              type="button"
              onClick={handleCancel}
              className="transform rounded-lg border-2 border-gray-300 px-6 py-3 font-semibold text-gray-700 transition-all duration-200 hover:scale-105 hover:border-gray-400 hover:bg-gray-50"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
