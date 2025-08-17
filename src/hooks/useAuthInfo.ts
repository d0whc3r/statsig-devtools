import { useAuthStore } from '@/src/stores/auth.store'

export function useAuthInfo() {
  const { isAuthenticated } = useAuthStore()

  return {
    isAuthenticated,
  }
}
