import type { ErrorMessageProps } from './types'

export function ErrorMessage({ message }: ErrorMessageProps) {
  return (
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
        <p className="text-sm font-medium text-red-700">{message}</p>
      </div>
    </div>
  )
}
