import React from 'react'

import { useOverrideForm } from '../../hooks/useOverrideForm'
import { CookieFields } from './CookieFields'
import { ErrorMessage } from './ErrorMessage'
import { FormActions } from './FormActions'
import { FormField } from './FormField'
import { FormHeader } from './FormHeader'
import { useFormSubmission } from './hooks/useFormSubmission'

import type { OverrideFormProps } from './types'

/**
 * Form component for creating storage overrides
 */
export function OverrideForm({ onSubmit, onCancel, initialValues }: OverrideFormProps) {
  const { formData, errors, isSubmitting, updateField, submitForm, resetForm, isValid } = useOverrideForm({
    onSubmit,
    initialValues,
  })

  const { handleSubmit, handleCancel } = useFormSubmission({
    onCancel,
    submitForm,
    resetForm,
  })

  return (
    <div className="animate-in slide-in-from-top-4 relative rounded-xl border-2 border-blue-200 bg-gradient-to-br from-blue-50 via-white to-purple-50 p-6 shadow-xl backdrop-blur-sm duration-300">
      {/* Decorative background elements */}
      <div className="pointer-events-none absolute top-0 left-0 h-full w-full rounded-xl bg-gradient-to-br from-blue-500/5 to-purple-500/5" />
      <div className="pointer-events-none absolute top-4 right-4 h-20 w-20 rounded-full bg-gradient-to-br from-blue-400/10 to-purple-400/10 blur-xl" />
      <div className="pointer-events-none absolute bottom-4 left-4 h-16 w-16 rounded-full bg-gradient-to-br from-purple-400/10 to-pink-400/10 blur-xl" />

      <div className="relative z-10">
        <FormHeader onCancel={handleCancel} />

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Storage Type */}
          <FormField
            id="type"
            label="Storage Type"
            colorScheme="blue"
            error={errors.type}
            icon={
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 7v10c0 2.21 1.79 4 4 4h8c2.21 0 4-1.79 4-4V7c0-2.21-1.79-4-4-4H8c-2.21 0-4 1.79-4 4z"
                />
              </svg>
            }
          >
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
          </FormField>

          {/* Key */}
          <FormField
            id="key"
            label="Key"
            colorScheme="green"
            error={errors.key}
            icon={
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-3a1 1 0 011-1h2.586l6.414-6.414a6 6 0 015.743-7.743z"
                />
              </svg>
            }
          >
            <input
              type="text"
              id="key"
              value={formData.key || ''}
              onChange={(e) => updateField('key', e.target.value)}
              placeholder="e.g., user_id, feature_flag_key"
              className="w-full rounded-lg border-2 border-gray-200 bg-white/80 px-4 py-3 placeholder-gray-400 backdrop-blur-sm transition-all duration-200 group-hover:shadow-md hover:border-green-300 focus:border-green-500 focus:ring-2 focus:ring-green-500 focus:outline-none"
            />
          </FormField>

          {/* Value */}
          <FormField
            id="value"
            label="Value"
            colorScheme="purple"
            error={errors.value}
            helpText="Supports strings, numbers, booleans, and JSON objects"
            icon={
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                />
              </svg>
            }
          >
            <textarea
              id="value"
              value={typeof formData.value === 'string' ? formData.value : String(formData.value ?? '')}
              onChange={(e) => updateField('value', e.target.value)}
              placeholder="e.g., true, false, 123, or JSON object"
              rows={3}
              className="w-full resize-none rounded-lg border-2 border-gray-200 bg-white/80 px-4 py-3 placeholder-gray-400 backdrop-blur-sm transition-all duration-200 group-hover:shadow-md hover:border-purple-300 focus:border-purple-500 focus:ring-2 focus:ring-purple-500 focus:outline-none"
            />
          </FormField>

          {/* Cookie-specific fields */}
          <CookieFields formData={formData} errors={errors} updateField={updateField} />

          {/* Submit Error */}
          {errors.submit && <ErrorMessage message={errors.submit} />}

          {/* Actions */}
          <FormActions isValid={isValid()} isSubmitting={isSubmitting} onCancel={handleCancel} />
        </form>
      </div>
    </div>
  )
}
