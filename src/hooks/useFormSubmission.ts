import { useState, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { useWebhook } from './useWebhook';

interface FormState {
  isSubmitting: boolean;
  error: string;
}

interface UseFormSubmissionOptions {
  onSuccess?: (data: any) => void;
  webhookSource: string;
  validateData?: (data: any) => string | null;
}

export const useFormSubmission = <T>({ onSuccess, webhookSource, validateData }: UseFormSubmissionOptions) => {
  const { t } = useTranslation();
  const { sendToWebhook } = useWebhook();
  const [formState, setFormState] = useState<FormState>({
    isSubmitting: false,
    error: ''
  });

  const submitForm = useCallback(async (data: T) => {
    if (formState.isSubmitting) return;

    // Validate data if validator provided
    if (validateData) {
      const validationError = validateData(data);
      if (validationError) {
        setFormState(prev => ({ ...prev, error: validationError }));
        return;
      }
    }

    setFormState({ isSubmitting: true, error: '' });

    try {
      const success = await sendToWebhook(data, webhookSource);
      
      if (success) {
        console.log('✅ Form submitted successfully');
        onSuccess?.(data);
      } else {
        setFormState(prev => ({ 
          ...prev, 
          error: t('error.submission.failed')
        }));
      }
    } catch (error) {
      console.error('❌ Error submitting form:', error);
      setFormState(prev => ({ 
        ...prev, 
        error: t('error.network')
      }));
    } finally {
      setFormState(prev => ({ ...prev, isSubmitting: false }));
    }
  }, [formState.isSubmitting, validateData, sendToWebhook, webhookSource, onSuccess, t]);

  const clearError = useCallback(() => {
    setFormState(prev => ({ ...prev, error: '' }));
  }, []);

  return {
    ...formState,
    submitForm,
    clearError
  };
};