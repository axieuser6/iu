import React, { useState, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { X, User } from 'lucide-react';
import { useFormSubmission } from '../hooks/useFormSubmission';

interface NamePopupProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (firstName: string, lastName: string) => void;
  prompt?: string;
  autoTrigger?: boolean;
}

const NamePopup: React.FC<NamePopupProps> = ({ 
  isOpen, 
  onClose, 
  onSubmit, 
  prompt = "Enter your name to continue:",
  autoTrigger = false
}) => {
  const { t } = useTranslation();
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');

  const validateName = useCallback((data: { firstName: string; lastName: string }) => {
    const trimmedFirstName = firstName.trim();
    const trimmedLastName = lastName.trim();
    
    if (!trimmedFirstName) {
      return t('error.firstName.required');
    }

    if (!trimmedLastName) {
      return t('error.lastName.required');
    }

    return null;
  }, [firstName, lastName, t]);

  const { isSubmitting, error, submitForm, clearError } = useFormSubmission<{
    first_name: string;
    last_name: string;
    full_name: string;
    prompt: string;
  }>({
    onSuccess: (data) => {
      console.log('✅ Name submitted successfully:', data.first_name, data.last_name);
      onSubmit(data.first_name, data.last_name);
      setFirstName('');
      setLastName('');
    },
    webhookSource: autoTrigger ? 'auto_popup_name_during_call' : 'agent_triggered_get_firstandlastname_tool',
    validateData: validateName
  });

  const handleSubmit = useCallback(async () => {
    const trimmedFirstName = firstName.trim();
    const trimmedLastName = lastName.trim();
    
    await submitForm({
      first_name: trimmedFirstName,
      last_name: trimmedLastName,
      full_name: `${trimmedFirstName} ${trimmedLastName}`,
      prompt: prompt
    });
  }, [firstName, lastName, prompt, submitForm]);

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
      setFirstName('');
      setLastName('');
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
              <User size={16} className="text-white" />
            </div>
            <h2 className="text-lg font-semibold text-black">
              {autoTrigger ? t('title.activeCall') + ' - ' + t('title.nameRequired') : 'Axie Studio - ' + t('title.nameRequired')}
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
              ? t('description.activeCallName')
              : prompt
            }
          </p>
          
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <input
                  type="text"
                  value={firstName}
                  onChange={(e) => {
                    setFirstName(e.target.value);
                    if (error) clearError();
                  }}
                  onKeyDown={handleKeyPress}
                  placeholder={t('form.firstName.placeholder')}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:border-black focus:ring-1 focus:ring-black outline-none transition-all text-black placeholder-gray-400 disabled:opacity-50 disabled:bg-gray-50"
                  autoFocus
                  autoComplete="given-name"
                  disabled={isSubmitting}
                />
              </div>
              <div>
                <input
                  type="text"
                  value={lastName}
                  onChange={(e) => {
                    setLastName(e.target.value);
                    if (error) clearError();
                  }}
                  onKeyDown={handleKeyPress}
                  placeholder={t('form.lastName.placeholder')}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:border-black focus:ring-1 focus:ring-black outline-none transition-all text-black placeholder-gray-400 disabled:opacity-50 disabled:bg-gray-50"
                  autoComplete="family-name"
                  disabled={isSubmitting}
                />
              </div>
            </div>
            
            {error && (
              <p className="text-red-600 text-xs">
                {error}
              </p>
            )}
            
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
                disabled={!firstName.trim() || !lastName.trim() || isSubmitting}
                className={`${autoTrigger ? 'w-full' : 'flex-1'} px-4 py-3 bg-black hover:bg-gray-800 disabled:bg-gray-300 disabled:cursor-not-allowed text-white rounded-lg text-sm font-medium transition-colors flex items-center justify-center`}
              >
                {isSubmitting ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                    {autoTrigger ? t('status.processing') : t('status.submitting')}
                  </>
                ) : (
                  autoTrigger ? t('button.continue') : t('button.submit') + ' namn'
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NamePopup;