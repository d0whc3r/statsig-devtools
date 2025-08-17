import { useDashboardStore } from '@/src/stores/dashboard-store'

export function useDashboardNavigation() {
  const {
    selectedGate,
    selectedExperiment,
    selectedDynamicConfig,
    currentView,
    selectGate,
    selectExperiment,
    selectDynamicConfig,
    setCurrentView,
  } = useDashboardStore()

  const handleItemSelect = (item: any) => {
    if (item.type === 'gate' || item.gateId) {
      selectGate(item)
    } else if (item.type === 'experiment' || item.experimentId) {
      selectExperiment(item)
    } else if (item.type === 'dynamicConfig' || item.configId) {
      selectDynamicConfig(item)
    }
  }

  const handleBack = () => {
    selectGate(null)
    selectExperiment(null)
    selectDynamicConfig(null)
  }

  const handleViewChange = (view: 'overview' | 'gates' | 'experiments' | 'dynamicConfigs') => {
    setCurrentView(view)
  }

  return {
    selectedGate,
    selectedExperiment,
    selectedDynamicConfig,
    currentView,
    handleItemSelect,
    handleBack,
    handleViewChange,
  }
}
