import { useCallback } from 'react'

import type { FormEvent } from 'react'

interface UseFormSubmissionProps {
  onCancel: () => void
  submitForm: () => Promise<boolean>
  resetForm: () => void
}

export function useFormSubmission({ onCancel, submitForm, resetForm }: UseFormSubmissionProps) {
  const handleSubmit = useCallback(
    async (e: FormEvent) => {
      e.preventDefault()
      const success = await submitForm()
      if (success) {
        onCancel() // Close form on success
      }
    },
    [submitForm, onCancel],
  )

  const handleCancel = useCallback(() => {
    resetForm()
    onCancel()
  }, [resetForm, onCancel])

  return {
    handleSubmit,
    handleCancel,
  }
}
