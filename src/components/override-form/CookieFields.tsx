import { FormField } from './FormField'

import type { CookieFieldsProps } from './types'

export function CookieFields({ formData, errors, updateField }: CookieFieldsProps) {
  if (formData.type !== 'cookie') {
    return null
  }

  return (
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

      <FormField
        id="domain"
        label="Domain"
        colorScheme="orange"
        error={errors.domain}
        helpText="Leave empty to use current domain"
        icon={
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9v-9m0-9v9"
            />
          </svg>
        }
      >
        <input
          type="text"
          id="domain"
          value={formData.domain || ''}
          onChange={(e) => updateField('domain', e.target.value)}
          placeholder="e.g., example.com (auto-filled from current tab)"
          className="w-full rounded-lg border-2 border-orange-200 bg-white/80 px-4 py-3 placeholder-gray-400 backdrop-blur-sm transition-all duration-200 group-hover:shadow-md hover:border-orange-300 focus:border-orange-500 focus:ring-2 focus:ring-orange-500 focus:outline-none"
        />
      </FormField>

      <FormField
        id="path"
        label="Path"
        colorScheme="orange"
        error={errors.path}
        helpText="Cookie path (defaults to /)"
        icon={
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2H5a2 2 0 00-2-2z"
            />
          </svg>
        }
      >
        <input
          type="text"
          id="path"
          value={formData.path || '/'}
          onChange={(e) => updateField('path', e.target.value)}
          placeholder="/"
          className="w-full rounded-lg border-2 border-orange-200 bg-white/80 px-4 py-3 placeholder-gray-400 backdrop-blur-sm transition-all duration-200 group-hover:shadow-md hover:border-orange-300 focus:border-orange-500 focus:ring-2 focus:ring-orange-500 focus:outline-none"
        />
      </FormField>
    </div>
  )
}
