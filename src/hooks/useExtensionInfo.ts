import { useEffect, useState } from 'react'

import { BrowserRuntime } from '../utils/browser-api'

interface ExtensionInfo {
  name: string
  version: string
  description: string
  manifestVersion: number
}

/**
 * Hook to get extension information from the manifest
 */
export function useExtensionInfo() {
  const [extensionInfo, setExtensionInfo] = useState<ExtensionInfo | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const getExtensionInfo = async () => {
      try {
        const manifest = BrowserRuntime.getManifest()

        setExtensionInfo({
          name: manifest.name || 'Statsig DevTools',
          version: manifest.version || '1.0.0',
          description: manifest.description || '',
          manifestVersion: manifest.manifest_version || 3,
        })
      } catch (error) {
        console.error('Failed to get extension info:', error)
        // Fallback to default values
        setExtensionInfo({
          name: 'Statsig DevTools',
          version: '1.0.0',
          description: 'Browser extension for testing and debugging Statsig feature flags',
          manifestVersion: 3,
        })
      } finally {
        setIsLoading(false)
      }
    }

    getExtensionInfo()
  }, [])

  return {
    extensionInfo,
    isLoading,
  }
}
