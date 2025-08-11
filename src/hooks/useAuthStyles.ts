interface UseAuthStylesProps {
  viewMode: 'popup' | 'sidebar' | 'tab'
}

interface UseAuthStylesReturn {
  containerStyles: string
}

/**
 * Custom hook to manage responsive styles for authentication components
 */
export function useAuthStyles({ viewMode }: UseAuthStylesProps): UseAuthStylesReturn {
  /**
   * Get responsive container styles
   */
  const getContainerStyles = () => {
    const baseStyles = 'w-full mx-auto'

    switch (viewMode) {
      case 'tab':
        return `${baseStyles} max-w-2xl p-8 min-h-screen flex flex-col justify-center`
      case 'sidebar':
        return `${baseStyles} max-w-md p-4 h-full flex flex-col justify-center`
      case 'popup':
      default:
        return `${baseStyles} p-3 flex flex-col justify-center`
    }
  }

  return {
    containerStyles: getContainerStyles(),
  }
}
