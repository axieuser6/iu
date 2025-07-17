import React, { useState, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { X, Mail } from 'lucide-react';
import { useFormSubmission } from '../hooks/useFormSubmission';

interface EmailPopupProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (email: string) => void;
  prompt?: string;
  autoTrigger?: boolean;
}

const EmailPopup: React.FC<EmailPopupProps> = ({ 
  isOpen, 
  onClose, 
  onSubmit, 
  prompt = "Enter your email to complete booking:",
  autoTrigger = false
}) => {
  const { t } = useTranslation();
  const [email, setEmail] = useState('');

  const validateEmail = useCallback((data: { email: string }) => {
    const trimmedEmail = email.trim();
    
    if (!trimmedEmail) {
      return t('error.email.required');
    }

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(trimmedEmail)) {
      return t('error.email.invalid');
    }

    return null;
  }, [email, t]);

  const { isSubmitting, error, submitForm, clearError } = useFormSubmission<{ email: string; prompt: string }>({
    onSuccess: (data) => {
      console.log('✅ Email submitted successfully:', data.email);
      onSubmit(data.email);
      setEmail('');
    },
    webhookSource: autoTrigger ? 'auto_popup_during_call' : 'agent_triggered_get_email_tool',
    validateData: validateEmail
  });

  const handleSubmit = useCallback(async () => {
    const trimmedEmail = email.trim();
    await submitForm({
      email: trimmedEmail,
      prompt: prompt
    });
  }, [email, prompt, submitForm]);

  const handleKeyPress = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleSubmit();
    } else if (e.key === 'Escape') {
      e.preventDefault();
      onClose();
    }
  }, [handleSubmit, onClose]);

  const handleClose = useCallback(() => {
    if (!isSubmitting) {
      setEmail('');
      clearError();
      onClose();
    }
  }, [isSubmitting, onClose, clearError]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-2xl w-full max-w-md mx-auto border border-gray-200">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-100">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-black rounded-full flex items-center justify-center">
              <Mail size={16} className="text-white" />
            </div>
            <h2 className="text-lg font-semibold text-black">
              {autoTrigger ? t('title.activeCall') + ' - ' + t('title.emailRequired') : 'Axie Studio - ' + t('title.emailRequired')}
            </h2>
          </div>
          {!autoTrigger && (
            <button
              onClick={handleClose}
              disabled={isSubmitting}
              className="text-gray-400 hover:text-gray-600 transition-colors disabled:opacity-50"
              aria-label="Close"
            >
              <X size={20} />
            </button>
          )}
        </div>

        {/* Content */}
        <div className="p-6">
          <p className="text-gray-700 text-sm mb-4 leading-relaxed">
            {autoTrigger 
              ? t('description.activeCallEmail')
              : prompt
            }
          </p>
          
          <div className="space-y-4">
            <div>
              <input
                type="email"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  if (error) clearError();
                }}
                onKeyDown={handleKeyPress}
                placeholder={t('form.email.placeholder')}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:border-black focus:ring-1 focus:ring-black outline-none transition-all text-black placeholder-gray-400 disabled:opacity-50 disabled:bg-gray-50"
                autoFocus
                autoComplete="email"
                disabled={isSubmitting}
              />
              {error && (
                <p className="text-red-600 text-xs mt-2">
                  {error}
                </p>
              )}
            </div>
            
            <div className="flex space-x-3">
              {!autoTrigger && (
                <button
                  onClick={handleClose}
                  disabled={isSubmitting}
                  className="flex-1 px-4 py-3 text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-lg text-sm font-medium transition-colors disabled:opacity-50"
                >
                  {t('button.cancel')}
                </button>
              )}
              <button
                onClick={handleSubmit}
                disabled={!email.trim() || isSubmitting}
                className={`${autoTrigger ? 'w-full' : 'flex-1'} px-4 py-3 bg-black hover:bg-gray-800 disabled:bg-gray-300 disabled:cursor-not-allowed text-white rounded-lg text-sm font-medium transition-colors flex items-center justify-center`}
              >
                {isSubmitting ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                    {autoTrigger ? t('status.processing') : t('status.submitting')}
                  </>
                ) : (
                  autoTrigger ? t('button.continue') : t('button.submit') + ' e-post'
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EmailPopup;