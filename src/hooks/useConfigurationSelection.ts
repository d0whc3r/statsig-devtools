import { useCallback, useState } from 'react'

import type { StatsigConfigurationItem } from '../types'

export interface UseConfigurationSelectionReturn {
  selectedConfiguration: StatsigConfigurationItem | undefined
  handleConfigurationSelect: (config: StatsigConfigurationItem | undefined) => void
}

/**
 * Hook for managing configuration selection
 */
export function useConfigurationSelection(): UseConfigurationSelectionReturn {
  const [selectedConfiguration, setSelectedConfiguration] = useState<StatsigConfigurationItem | undefined>(undefined)

  const handleConfigurationSelect = useCallback((config: StatsigConfigurationItem | undefined) => {
    setSelectedConfiguration(config)
  }, [])

  return {
    selectedConfiguration,
    handleConfigurationSelect,
  }
}
