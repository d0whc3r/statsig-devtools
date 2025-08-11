import React from 'react'

interface AuthHeaderProps {
  viewMode: 'popup' | 'sidebar' | 'tab'
}

/**
 * AuthHeader component displays the title and description for the authentication form
 */
export function AuthHeader({ viewMode }: AuthHeaderProps) {
  return (
    <div className={`mb-4 text-center ${viewMode === 'tab' ? 'mb-8' : ''}`}>
      <h1
        className={`text-primary mb-2 font-bold ${
          viewMode === 'tab' ? 'text-3xl' : viewMode === 'popup' ? 'text-lg' : 'text-xl'
        }`}
      >
        Statsig Developer Tools
      </h1>
      <p className={`text-secondary ${viewMode === 'popup' ? 'text-xs' : 'text-sm'}`}>
        Enter your Console API key to get started
      </p>
    </div>
  )
}
