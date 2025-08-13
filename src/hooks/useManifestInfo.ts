import { useEffect, useState } from 'react'

interface ManifestInfo {
  name: string
  version: string
  description: string
}

interface UseManifestInfoResult {
  manifestInfo: ManifestInfo | null
  isLoading: boolean
  error: string | null
}

export function useManifestInfo(): UseManifestInfoResult {
  const [manifestInfo, setManifestInfo] = useState<ManifestInfo | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const getManifestInfo = async () => {
      try {
        setIsLoading(true)
        setError(null)

        const response = await browser.runtime.sendMessage({
          type: 'GET_MANIFEST_INFO',
        })

        if (response.success) {
          setManifestInfo(response.data)
        } else {
          setError(response.error ?? 'Failed to get manifest info')
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unknown error occurred')
      } finally {
        setIsLoading(false)
      }
    }

    getManifestInfo()
  }, [])

  return {
    manifestInfo,
    isLoading,
    error,
  }
}
