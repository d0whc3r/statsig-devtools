import type { StorageOverride } from '../../services/statsig-integration'
import type { ReactNode } from 'react'

export interface OverrideFormProps {
  onSubmit: (override: StorageOverride) => Promise<void>
  onCancel: () => void
  initialValues?: Partial<StorageOverride>
}

export interface FormFieldProps {
  id: string
  label: string
  icon: ReactNode
  error?: string
  helpText?: string
  colorScheme?: 'blue' | 'green' | 'purple' | 'orange'
  children: ReactNode
}

export interface FormHeaderProps {
  onCancel: () => void
}

export interface FormActionsProps {
  isValid: boolean
  isSubmitting: boolean
  onCancel: () => void
}

export interface CookieFieldsProps {
  formData: Partial<StorageOverride>
  errors: Record<string, string>
  updateField: (field: keyof StorageOverride, value: string) => void
}

export interface ErrorMessageProps {
  message: string
}
