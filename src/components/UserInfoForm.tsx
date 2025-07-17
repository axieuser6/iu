import React, { useState, useCallback } from 'react';
import { User, Mail, Phone } from 'lucide-react';
import { Link } from 'react-router-dom';

interface UserInfoFormProps {
  onSubmit: (userInfo: { firstName: string; lastName: string; email: string }) => void;
  isSubmitting?: boolean;
}

const UserInfoForm: React.FC<UserInfoFormProps> = ({ onSubmit, isSubmitting = false }) => {
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [agreedToTerms, setAgreedToTerms] = useState(false);

  const validateForm = useCallback(() => {
    const newErrors: { [key: string]: string } = {};

    if (!firstName.trim()) {
      newErrors.firstName = 'Förnamn krävs';
    }

    if (!lastName.trim()) {
      newErrors.lastName = 'Efternamn krävs';
    }

    if (!email.trim()) {
      newErrors.email = 'E-post krävs';
    } else {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email.trim())) {
        newErrors.email = 'Vänligen ange en giltig e-postadress';
      }
    }

    if (!agreedToTerms) {
      newErrors.terms = 'Du måste godkänna villkoren för att fortsätta';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [firstName, lastName, email, agreedToTerms]);

  const handleSubmit = useCallback((e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    const userInfo = {
      firstName: firstName.trim(),
      lastName: lastName.trim(),
      email: email.trim()
    };

    onSubmit(userInfo);
  }, [firstName, lastName, email, validateForm, onSubmit]);

  const handleInputChange = useCallback((field: string, value: string) => {
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
    
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  }, [errors]);

  return (
    <div className="w-full max-w-md mx-auto">
      <div className="bg-white rounded-lg shadow-lg border border-gray-200 p-6">
        {/* Header */}
        <div className="text-center mb-6">
          <div className="w-12 h-12 bg-black rounded-full flex items-center justify-center mx-auto mb-3">
            <User size={24} className="text-white" />
          </div>
          <h2 className="text-xl font-semibold text-black mb-2">
            Välkommen till Axie Studio
          </h2>
          <p className="text-gray-600 text-sm">
            Fyll i dina uppgifter för att starta samtalet med vår AI-assistent
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
                placeholder="Förnamn"
                className={`w-full px-4 py-3 border rounded-lg focus:ring-1 focus:ring-black outline-none transition-all text-black placeholder-gray-400 disabled:opacity-50 disabled:bg-gray-50 ${
                  errors.firstName ? 'border-red-300 focus:border-red-500' : 'border-gray-300 focus:border-black'
                }`}
                autoComplete="given-name"
                disabled={isSubmitting}
              />
              {errors.firstName && (
                <p className="text-red-600 text-xs mt-1">{errors.firstName}</p>
              )}
            </div>
            <div>
              <input
                type="text"
                value={lastName}
                onChange={(e) => handleInputChange('lastName', e.target.value)}
                placeholder="Efternamn"
                className={`w-full px-4 py-3 border rounded-lg focus:ring-1 focus:ring-black outline-none transition-all text-black placeholder-gray-400 disabled:opacity-50 disabled:bg-gray-50 ${
                  errors.lastName ? 'border-red-300 focus:border-red-500' : 'border-gray-300 focus:border-black'
                }`}
                autoComplete="family-name"
                disabled={isSubmitting}
              />
              {errors.lastName && (
                <p className="text-red-600 text-xs mt-1">{errors.lastName}</p>
              )}
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
                placeholder="din@email.com"
                className={`w-full pl-10 pr-4 py-3 border rounded-lg focus:ring-1 focus:ring-black outline-none transition-all text-black placeholder-gray-400 disabled:opacity-50 disabled:bg-gray-50 ${
                  errors.email ? 'border-red-300 focus:border-red-500' : 'border-gray-300 focus:border-black'
                }`}
                autoComplete="email"
                disabled={isSubmitting}
              />
            </div>
            {errors.email && (
              <p className="text-red-600 text-xs mt-1">{errors.email}</p>
            )}
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
                  if (errors.terms) {
                    setErrors(prev => ({ ...prev, terms: '' }));
                  }
                }}
                className="mt-1 w-4 h-4 text-black border-gray-300 rounded focus:ring-black focus:ring-1"
                disabled={isSubmitting}
              />
              <label htmlFor="terms" className="text-sm text-gray-700 leading-relaxed">
                Genom att fortsätta godkänner du våra{' '}
                <Link 
                  to="/terms" 
                  className="text-black hover:text-gray-700 font-medium underline transition-colors"
                  target="_blank"
                >
                  villkor
                </Link>
              </label>
            </div>
            {errors.terms && (
              <p className="text-red-600 text-xs">{errors.terms}</p>
            )}
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full px-4 py-3 bg-black hover:bg-gray-800 disabled:bg-gray-300 disabled:cursor-not-allowed text-white rounded-lg text-sm font-medium transition-colors flex items-center justify-center space-x-2"
          >
            {isSubmitting ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                <span>Startar samtal...</span>
              </>
            ) : (
              <>
                <Phone size={16} />
                <span>Starta AI-samtal</span>
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
};

export default UserInfoForm;