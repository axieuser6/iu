import React, { useState, useCallback } from 'react';
import { X, User } from 'lucide-react';

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
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = useCallback(async () => {
    if (isSubmitting) return;
    
    const trimmedFirstName = firstName.trim();
    const trimmedLastName = lastName.trim();
    
    if (!trimmedFirstName) {
      setError('Förnamn krävs');
      return;
    }

    if (!trimmedLastName) {
      setError('Efternamn krävs');
      return;
    }

    setIsSubmitting(true);
    setError('');

    try {
      // Send POST request to n8n webhook
      const webhookUrl = 'https://stefan0987.app.n8n.cloud/webhook/803738bb-c134-4bdb-9720-5b1af902475f';
      
      console.log('👤 Sending name via POST to webhook:', trimmedFirstName, trimmedLastName);
      
      const response = await fetch(webhookUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          first_name: trimmedFirstName,
          last_name: trimmedLastName,
          full_name: `${trimmedFirstName} ${trimmedLastName}`,
          timestamp: new Date().toISOString(),
          source: autoTrigger ? 'auto_popup_name_during_call' : 'agent_triggered_get_firstandlastname_tool',
          prompt: prompt
        })
      });

      if (response.ok) {
        console.log('✅ Name sent successfully via POST to webhook');
        onSubmit(trimmedFirstName, trimmedLastName);
        setFirstName('');
        setLastName('');
      } else {
        console.error('❌ Webhook POST request failed:', response.status);
        setError('Misslyckades att skicka namn. Försök igen.');
      }
    } catch (error) {
      console.error('❌ Error sending name via POST to webhook:', error);
      setError('Nätverksfel. Försök igen.');
    } finally {
      setIsSubmitting(false);
    }
  }, [firstName, lastName, isSubmitting, onSubmit, prompt, autoTrigger]);

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
      setError('');
      onClose();
    }
  }, [isSubmitting, onClose]);

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
              {autoTrigger ? 'Pågående Axie Studio samtal - Namn krävs' : 'Axie Studio - Namn krävs'}
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
              ? 'Du är för närvarande i ett aktivt Axie Studio samtal. Vänligen ange ditt namn (Steg 1):' 
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
                    if (error) setError('');
                  }}
                  onKeyDown={handleKeyPress}
                  placeholder="Förnamn"
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
                    if (error) setError('');
                  }}
                  onKeyDown={handleKeyPress}
                  placeholder="Efternamn"
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
                  Avbryt
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
                    {autoTrigger ? 'Bearbetar samtal...' : 'Skickar...'}
                  </>
                ) : (
                  autoTrigger ? 'Fortsätt samtal' : 'Skicka namn'
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