import React from 'react'

interface ApiKeyInputProps {
  value: string
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void
  disabled: boolean
  viewMode: 'popup' | 'sidebar' | 'tab'
}

/**
 * ApiKeyInput component renders the API key input field with help text
 */
export function ApiKeyInput({ value, onChange, disabled, viewMode }: ApiKeyInputProps) {
  return (
    <div>
      <label
        htmlFor="apiKey"
        className={`block font-medium text-gray-700 ${viewMode === 'popup' ? 'mb-1 text-xs' : 'mb-2 text-sm'}`}
      >
        Console API Key
      </label>
      <input
        id="apiKey"
        type="text"
        value={value}
        onChange={onChange}
        placeholder="console-xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
        disabled={disabled}
        className={`input-professional w-full font-mono placeholder-gray-400 disabled:bg-gray-50 disabled:text-gray-500 ${
          viewMode === 'popup' ? 'px-3 py-2 text-xs' : 'px-4 py-3 text-sm'
        }`}
        autoComplete="off"
      />
      <div className={`alert-professional alert-info ${viewMode === 'popup' ? 'mt-2 p-3' : 'mt-3 p-4'}`}>
        <div className="flex items-start gap-3">
          <svg
            className="mt-0.5 h-5 w-5 flex-shrink-0 text-blue-600"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
          <div>
            <p className={`font-semibold text-blue-800 ${viewMode === 'popup' ? 'mb-1 text-xs' : 'mb-2 text-sm'}`}>
              Console API Key Required
            </p>
            <div className={`space-y-1 text-blue-700 ${viewMode === 'popup' ? 'text-xs leading-relaxed' : 'text-sm'}`}>
              <p>
                • Must start with <code className="rounded bg-blue-100 px-1.5 py-0.5 font-mono text-xs">console-</code>
              </p>
              {viewMode !== 'popup' && (
                <>
                  <p>• Found in: Statsig Console → Settings → Keys & Environments</p>
                  <p>
                    • <strong>Note:</strong> Server keys (secret-) and Client keys (client-) will not work
                  </p>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
