// Utility functions for the Statsig Developer Tools extension
// This file will be expanded in later tasks

export const formatTimestamp = (timestamp: number): string => new Date(timestamp).toLocaleString()

export const isValidConsoleApiKey = (key: string): boolean => key.startsWith('console-') && key.length > 20

export const isValidStatsigKey = (key: string): boolean => {
  // Validate Statsig client keys (format: client-xxxxxxxxxxxxxxxxxxxx)
  if (key.startsWith('client-')) {
    return key.length >= 30 // client- (7) + at least 23 characters
  }
  // Validate Statsig server keys (format: secret-xxxxxxxxxxxxxxxxxxxx)
  if (key.startsWith('secret-')) {
    return key.length >= 30 // secret- (7) + at least 23 characters
  }
  return false
}

export const parseStatsigUrl = (url: string): { endpoint: string; params: URLSearchParams } | null => {
  try {
    const urlObj = new URL(url)
    if (urlObj.hostname.includes('statsig') || urlObj.hostname.includes('featuregates')) {
      return {
        endpoint: urlObj.pathname,
        params: urlObj.searchParams,
      }
    }
    return null
  } catch {
    return null
  }
}
