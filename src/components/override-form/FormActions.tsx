import type { FormActionsProps } from './types'

export function FormActions({ isValid, isSubmitting, onCancel }: FormActionsProps) {
  return (
    <div className="border-gradient-to-r flex items-center gap-4 border-t-2 from-gray-200 to-gray-300 pt-6">
      <button
        type="submit"
        disabled={!isValid || isSubmitting}
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
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
              Create Override
            </>
          )}
        </div>
      </button>

      <button
        type="button"
        onClick={onCancel}
        className="transform rounded-lg border-2 border-gray-300 px-6 py-3 font-semibold text-gray-700 transition-all duration-200 hover:scale-105 hover:border-gray-400 hover:bg-gray-50"
      >
        Cancel
      </button>
    </div>
  )
}
