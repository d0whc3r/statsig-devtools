import type { FormFieldProps } from './types'

const colorSchemes = {
  blue: {
    icon: 'text-blue-500',
    border: 'border-gray-200 hover:border-blue-300 focus:border-blue-500 focus:ring-blue-500',
  },
  green: {
    icon: 'text-green-500',
    border: 'border-gray-200 hover:border-green-300 focus:border-green-500 focus:ring-green-500',
  },
  purple: {
    icon: 'text-purple-500',
    border: 'border-gray-200 hover:border-purple-300 focus:border-purple-500 focus:ring-purple-500',
  },
  orange: {
    icon: 'text-orange-500',
    border: 'border-orange-200 hover:border-orange-300 focus:border-orange-500 focus:ring-orange-500',
  },
}

export function FormField({ id, label, icon, error, helpText, colorScheme = 'blue', children }: FormFieldProps) {
  const colors = colorSchemes[colorScheme]

  return (
    <div className="group">
      <label htmlFor={id} className="mb-2 block flex items-center gap-2 text-sm font-semibold text-gray-800">
        <span className={colors.icon}>{icon}</span>
        {label}
      </label>

      {children}

      {error && (
        <div className="animate-in slide-in-from-left-2 mt-2 flex items-center gap-2 text-red-600 duration-200">
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
          <p className="text-sm font-medium">{error}</p>
        </div>
      )}

      {helpText && !error && (
        <div className="mt-2 flex items-center gap-2 text-gray-500">
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
          <p className="text-xs">{helpText}</p>
        </div>
      )}
    </div>
  )
}
