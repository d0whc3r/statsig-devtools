export function TabFeatures() {
  return (
    <div className="border-border mt-8 border-t pt-6">
      <div className="text-center">
        <h3 className="text-muted-foreground mb-2 text-sm font-semibold">What you can do with Statsig DevTools:</h3>
        <div className="text-muted-foreground grid grid-cols-1 gap-3 text-xs">
          <div className="flex items-center justify-center space-x-2">
            <span className="bg-primary h-1.5 w-1.5 rounded-full" />
            <span>Test and debug feature flags in real-time</span>
          </div>
          <div className="flex items-center justify-center space-x-2">
            <span className="bg-primary h-1.5 w-1.5 rounded-full" />
            <span>Override configurations for testing scenarios</span>
          </div>
          <div className="flex items-center justify-center space-x-2">
            <span className="bg-primary h-1.5 w-1.5 rounded-full" />
            <span>Monitor experiments and dynamic configs</span>
          </div>
        </div>
      </div>
    </div>
  )
}

export function ApiKeyInfo() {
  return (
    <div className="rounded-md border border-blue-200 bg-blue-50 p-3">
      <p className="text-xs leading-relaxed text-blue-700">
        <strong>Need a Console API key?</strong> Generate one in your{' '}
        <a
          href="https://console.statsig.com/api_keys"
          target="_blank"
          rel="noopener noreferrer"
          className="text-blue-800 underline hover:text-blue-900"
          style={{ cursor: 'pointer' }}
        >
          Statsig Console
        </a>{' '}
        under Settings → API Keys
      </p>
    </div>
  )
}

export const getLoginFormStyles = (viewMode: 'popup' | 'sidebar' | 'tab') => ({
  container: (() => {
    switch (viewMode) {
      case 'popup':
        return 'h-full w-full flex flex-col'
      case 'sidebar':
        return 'h-full w-full flex flex-col'
      case 'tab':
        return 'min-h-screen w-full max-w-lg mx-auto flex flex-col'
    }
  })(),
  form: (() => {
    switch (viewMode) {
      case 'popup':
        return 'flex-1 flex flex-col space-y-4 p-4'
      case 'sidebar':
        return 'flex-1 flex flex-col space-y-5 p-6'
      case 'tab':
        return 'flex-1 flex flex-col space-y-6 p-8'
    }
  })(),
  header: (() => {
    switch (viewMode) {
      case 'popup':
        return 'text-center mb-6'
      case 'sidebar':
        return 'text-center mb-6'
      case 'tab':
        return 'text-center mb-10'
    }
  })(),
  title: (() => {
    switch (viewMode) {
      case 'popup':
        return 'text-lg font-bold text-foreground mb-1'
      case 'sidebar':
        return 'text-xl font-bold text-foreground mb-2'
      case 'tab':
        return 'text-3xl font-bold text-foreground mb-3'
    }
  })(),
  version: (() => {
    switch (viewMode) {
      case 'popup':
        return 'text-xs text-muted-foreground mb-2'
      case 'sidebar':
        return 'text-xs text-muted-foreground mb-2'
      case 'tab':
        return 'text-sm text-muted-foreground mb-4'
    }
  })(),
})
