import { useCallback, useEffect, useState } from 'react'

import { storageInjectionService } from '../services/storage-injection'

import type { StorageOverride } from '../types'

interface UseOverrideFormProps {
  onSubmit: (override: StorageOverride) => Promise<void>
  initialValues?: Partial<StorageOverride>
}

/**
 * Custom hook for managing override form state and validation
 */
export const useOverrideForm = ({ onSubmit, initialValues }: UseOverrideFormProps) => {
  const [formData, setFormData] = useState<Partial<StorageOverride>>({
    type: 'localStorage',
    key: '',
    value: '',
    ...initialValues,
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})

  /**
   * Validate form data
   */
  const validateForm = useCallback((data: Partial<StorageOverride>): Record<string, string> => {
    const validationErrors: Record<string, string> = {}

    if (!data.key?.trim()) {
      validationErrors.key = 'Key is required'
    }

    const valueStr = typeof data.value === 'string' ? data.value : String(data.value ?? '')
    if (!valueStr.trim()) {
      validationErrors.value = 'Value is required'
    }

    if (!data.type) {
      validationErrors.type = 'Storage type is required'
    }

    // Validate JSON format for complex values
    if (valueStr && valueStr.trim().startsWith('{')) {
      try {
        JSON.parse(valueStr)
      } catch {
        validationErrors.value = 'Invalid JSON format'
      }
    }

    return validationErrors
  }, [])

  /**
   * Update form field
   */
  const updateField = useCallback(
    async (field: keyof StorageOverride, value: string) => {
      setFormData((prev) => ({ ...prev, [field]: value }))

      // Auto-fill domain when cookie type is selected
      if (field === 'type' && value === 'cookie') {
        try {
          const domain = await storageInjectionService.getCurrentTabDomain()
          if (domain) {
            setFormData((prev) => ({ ...prev, domain }))
          }
        } catch {
          // Silently fail - user can manually enter domain
        }
      }

      // Clear field error when user starts typing
      if (errors[field]) {
        setErrors((prev) => {
          const newErrors = { ...prev }
          delete newErrors[field]
          return newErrors
        })
      }
    },
    [errors],
  )

  /**
   * Reset form to initial state
   */
  const resetForm = useCallback(() => {
    setFormData({
      type: 'localStorage',
      key: '',
      value: '',
      ...initialValues,
    })
    setErrors({})
    setIsSubmitting(false)
  }, [initialValues])

  /**
   * Auto-fill domain when component mounts and type is cookie
   */
  useEffect(() => {
    const autoFillDomain = async () => {
      if (formData.type === 'cookie' && !formData.domain) {
        try {
          const domain = await storageInjectionService.getCurrentTabDomain()
          if (domain) {
            setFormData((prev) => ({ ...prev, domain }))
          }
        } catch {
          // Silently fail - user can manually enter domain
        }
      }
    }

    autoFillDomain()
  }, [formData.type, formData.domain])

  /**
   * Submit form with validation
   */
  const submitForm = useCallback(async () => {
    const validationErrors = validateForm(formData)

    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors)
      return false
    }

    setIsSubmitting(true)
    setErrors({})

    try {
      await onSubmit(formData as StorageOverride)
      resetForm()
      return true
    } catch (err) {
      setErrors({
        submit: err instanceof Error ? err.message : 'Failed to create override',
      })
      return false
    } finally {
      setIsSubmitting(false)
    }
  }, [formData, validateForm, onSubmit, resetForm])

  /**
   * Check if form is valid
   */
  const isValid = useCallback(() => {
    const validationErrors = validateForm(formData)
    return Object.keys(validationErrors).length === 0
  }, [formData, validateForm])

  return {
    formData,
    errors,
    isSubmitting,
    updateField,
    submitForm,
    resetForm,
    isValid,
  }
}
