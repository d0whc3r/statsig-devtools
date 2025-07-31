// Utility functions for the Statsig Developer Tools extension
// This file will be expanded in later tasks

export const formatTimestamp = (timestamp: number): string => new Date(timestamp).toLocaleString()

export const isValidStatsigKey = (key: string): boolean => key.startsWith('client-') && key.length > 20

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
