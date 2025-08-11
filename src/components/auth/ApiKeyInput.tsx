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
        className={`w-full rounded-md border border-gray-300 font-mono placeholder-gray-400 shadow-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-500 focus:outline-none disabled:bg-gray-50 disabled:text-gray-500 ${
          viewMode === 'popup' ? 'px-2 py-1 text-xs' : 'px-3 py-2 text-sm'
        }`}
        autoComplete="off"
      />
      <div className={`rounded-md border border-blue-200 bg-blue-50 ${viewMode === 'popup' ? 'mt-1 p-2' : 'mt-2 p-3'}`}>
        <p className={`font-medium text-blue-800 ${viewMode === 'popup' ? 'mb-0.5 text-xs' : 'mb-1 text-sm'}`}>
          Required: Console API Key
        </p>
        <p className={`text-blue-700 ${viewMode === 'popup' ? 'text-xs leading-tight' : 'text-xs'}`}>
          • Must start with <code className="rounded bg-blue-100 px-1">console-</code>
          {viewMode !== 'popup' && (
            <>
              <br />
              • Found in: Statsig Console → Settings → Keys & Environments
              <br />• <strong>Note:</strong> Server keys (secret-) and Client keys (client-) will not work
            </>
          )}
        </p>
      </div>
    </div>
  )
}
