import React, { useState, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { User, Mail, Phone } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useFormSubmission } from '../hooks/useFormSubmission';

interface UserInfoFormProps {
  onSubmit: (userInfo: { firstName: string; lastName: string; email: string }) => void;
  isSubmitting?: boolean;
}

const UserInfoForm: React.FC<UserInfoFormProps> = ({ onSubmit, isSubmitting = false }) => {
  const { t } = useTranslation();
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  const [termsError, setTermsError] = useState('');

  const validateUserInfo = useCallback((data: { firstName: string; lastName: string; email: string }) => {
    const { firstName, lastName, email } = data;

    if (!firstName.trim()) {
      return t('error.firstName.required');
    }

    if (!lastName.trim()) {
      return t('error.lastName.required');
    }

    if (!email.trim()) {
      return t('error.email.required');
    } else {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email.trim())) {
        return t('error.email.invalid');
      }
    }

    if (!agreedToTerms) {
      setTermsError(t('error.terms.required'));
      return t('error.terms.required');
    }

    setTermsError('');
    return null;
  }, [firstName, lastName, email, agreedToTerms, t]);

  const { error, submitForm } = useFormSubmission<{
    first_name: string;
    last_name: string;
    email: string;
    full_name: string;
    prompt: string;
  }>({
    onSuccess: (data) => {
      const userInfo = {
        firstName: data.first_name,
        lastName: data.last_name,
        email: data.email
      };
      onSubmit(userInfo);
    },
    webhookSource: 'pre_call_form_submission',
    validateData: validateUserInfo
  });

  const handleSubmit = useCallback((e: React.FormEvent) => {
    e.preventDefault();
    
    submitForm({
      first_name: firstName.trim(),
      last_name: lastName.trim(),
      email: email.trim(),
      full_name: `${firstName.trim()} ${lastName.trim()}`,
      prompt: 'User submitted information before starting AI call'
    });
  }, [firstName, lastName, email, submitForm]);

  const handleInputChange = useCallback((field: string, value: string, clearErrorFn?: () => void) => {
    switch (field) {
      case 'firstName':
        setFirstName(value);
        break;
      case 'lastName':
        setLastName(value);
        break;
      case 'email':
        setEmail(value);
        break;
    }
    
    // Clear specific errors when user starts typing
    if (clearErrorFn) {
      clearErrorFn();
    }
  }, []);

  return (
    <div className="w-full max-w-md mx-auto">
      <div className="bg-white rounded-lg shadow-lg border border-gray-200 p-6">
        {/* Header */}
        <div className="text-center mb-6">
          <div className="w-12 h-12 bg-black rounded-full flex items-center justify-center mx-auto mb-3">
            <User size={24} className="text-white" />
          </div>
          <h2 className="text-xl font-semibold text-black mb-2">
            {t('title.welcome')}
          </h2>
          <p className="text-gray-600 text-sm">
            {t('description.fillInfo')}
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Name Fields */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <input
                type="text"
                value={firstName}
                onChange={(e) => handleInputChange('firstName', e.target.value)}
                placeholder={t('form.firstName.placeholder')}
                className="w-full px-4 py-3 border border-gray-300 focus:border-black rounded-lg focus:ring-1 focus:ring-black outline-none transition-all text-black placeholder-gray-400 disabled:opacity-50 disabled:bg-gray-50"
                autoComplete="given-name"
                disabled={isSubmitting}
              />
            </div>
            <div>
              <input
                type="text"
                value={lastName}
                onChange={(e) => handleInputChange('lastName', e.target.value)}
                placeholder={t('form.lastName.placeholder')}
                className="w-full px-4 py-3 border border-gray-300 focus:border-black rounded-lg focus:ring-1 focus:ring-black outline-none transition-all text-black placeholder-gray-400 disabled:opacity-50 disabled:bg-gray-50"
                autoComplete="family-name"
                disabled={isSubmitting}
              />
            </div>
          </div>

          {/* Email Field */}
          <div>
            <div className="relative">
              <Mail size={18} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="email"
                value={email}
                onChange={(e) => handleInputChange('email', e.target.value)}
                placeholder={t('form.email.placeholder')}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 focus:border-black rounded-lg focus:ring-1 focus:ring-black outline-none transition-all text-black placeholder-gray-400 disabled:opacity-50 disabled:bg-gray-50"
                autoComplete="email"
                disabled={isSubmitting}
              />
            </div>
          </div>

          {/* Terms Agreement */}
          <div className="space-y-3">
            <div className="flex items-start space-x-3">
              <input
                type="checkbox"
                id="terms"
                checked={agreedToTerms}
                onChange={(e) => {
                  setAgreedToTerms(e.target.checked);
                  if (termsError) {
                    setTermsError('');
                  }
                }}
                className="mt-1 w-4 h-4 text-black border-gray-300 rounded focus:ring-black focus:ring-1"
                disabled={isSubmitting}
              />
              <label htmlFor="terms" className="text-sm text-gray-700 leading-relaxed">
                {t('terms.agreement')}{' '}
                <Link 
                  to="/terms" 
                  className="text-black hover:text-gray-700 font-medium underline transition-colors"
                  target="_blank"
                >
                  {t('terms.link')}
                </Link>
              </label>
            </div>
            {termsError && (
              <p className="text-red-600 text-xs">{termsError}</p>
            )}
          </div>

          {/* General form error */}
          {error && (
            <div className="text-red-600 text-xs">
              {error}
            </div>
          )}

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full px-4 py-3 bg-black hover:bg-gray-800 disabled:bg-gray-300 disabled:cursor-not-allowed text-white rounded-lg text-sm font-medium transition-colors flex items-center justify-center space-x-2"
          >
            {isSubmitting ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                <span>{t('status.starting')}</span>
              </>
            ) : (
              <>
                <Phone size={16} />
                <span>{t('button.startCall')}</span>
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
};

export default UserInfoForm;