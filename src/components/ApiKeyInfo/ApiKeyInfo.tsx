export function ApiKeyInfo() {
  return (
    <div className="rounded-md border border-blue-200 bg-blue-50 p-3">
      <p className="text-xs leading-relaxed text-blue-700">
        <strong>Need a Console API key?</strong> Generate one in your{' '}
        <a
          href="https://console.statsig.com/api_keys"
          target="_blank"
          rel="noopener noreferrer"
          className="cursor-pointer text-blue-800 underline hover:text-blue-900"
        >
          Statsig Console
        </a>{' '}
        under Settings → API Keys
      </p>
    </div>
  )
}
