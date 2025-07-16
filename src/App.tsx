import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useConversation } from '@elevenlabs/react';
import { Mic, MicOff, Phone, PhoneOff, Mail, X, Shield, User, ArrowRight } from 'lucide-react';
import TermsPopup from './components/TermsPopup';

// Types for better type safety
interface UserData {
  firstName: string;
  lastName: string;
  email: string;
}

// Constants for better performance
const CONNECTION_TIMEOUT = 8000;
const RETRY_ATTEMPTS = 3;

function App() {
  // State management with proper typing
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const [isRequestingPermission, setIsRequestingPermission] = useState(false);
  const [connectionAttempts, setConnectionAttempts] = useState(0);
  const [isSecureConnection, setIsSecureConnection] = useState(false);
  const [showTermsModal, setShowTermsModal] = useState(false);
  const [hasAcceptedTerms, setHasAcceptedTerms] = useState(false);
  const [callStartTime, setCallStartTime] = useState<number | null>(null);
  
  // New state for pre-call data collection
  const [showDataForm, setShowDataForm] = useState(false);
  const [userData, setUserData] = useState<UserData>({
    firstName: '',
    lastName: '',
    email: ''
  });
  const [formErrors, setFormErrors] = useState<Partial<UserData>>({});
  const [isSubmittingForm, setIsSubmittingForm] = useState(false);

  // Check terms acceptance on mount
  useEffect(() => {
    const checkTermsAcceptance = () => {
      try {
        const storedConsent = localStorage.getItem('axie_studio_terms_consent');
        if (storedConsent) {
          const consentData = JSON.parse(storedConsent);
          const isValid = consentData.accepted && consentData.timestamp;
          
          // Check if consent is less than 1 year old
          const consentDate = new Date(consentData.timestamp);
          const oneYearAgo = new Date();
          oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1);
          
          if (isValid && consentDate > oneYearAgo) {
            setHasAcceptedTerms(true);
            console.log('✅ Valid terms consent found');
          } else {
            console.log('⚠️ Terms consent expired or invalid');
            localStorage.removeItem('axie_studio_terms_consent');
            setHasAcceptedTerms(false);
          }
        } else {
          console.log('ℹ️ No terms consent found');
          setHasAcceptedTerms(false);
        }
      } catch (error) {
        console.error('❌ Error checking terms consent:', error);
        setHasAcceptedTerms(false);
      }
    };

    checkTermsAcceptance();
  }, []);

  // Memoized agent ID with validation
  const agentId = useMemo(() => {
    const id = import.meta.env.VITE_AXIE_STUDIO_AGENT_ID || import.meta.env.VITE_ELEVENLABS_AGENT_ID;
    if (!id) {
      console.error('❌ Axie Studio Agent ID missing in environment variables');
      return null;
    }
    console.log('✅ Axie Studio Agent ID loaded securely');
    return id;
  }, []);

  // Enhanced conversation configuration - NO CLIENT TOOLS since we're sending data TO agent
  const conversation = useConversation({
    onConnect: useCallback(() => {
      console.log('🔗 Connected to Axie Studio AI Assistant');
      console.log('📤 User data sent to agent:', userData);
      setIsSecureConnection(true);
      setConnectionAttempts(0);
      setCallStartTime(Date.now());
    }, [userData]),
    onDisconnect: useCallback(() => {
      console.log('🔌 Disconnected from Axie Studio AI Assistant');
      setIsSecureConnection(false);
      setCallStartTime(null);
    }, []),
    onMessage: useCallback((message) => {
      console.log('💬 Message received:', message);
    }, []),
    onError: useCallback((error) => {
      console.error('❌ Connection error:', error);
      setIsSecureConnection(false);
      
      // Auto-retry logic for better reliability
      if (connectionAttempts < RETRY_ATTEMPTS) {
        setTimeout(() => {
          setConnectionAttempts(prev => prev + 1);
          console.log(`🔄 Retrying connection (${connectionAttempts + 1}/${RETRY_ATTEMPTS})`);
        }, 2000);
      }
    }, [connectionAttempts])
  });

  // Optimized microphone permission request with better UX
  const requestMicrophonePermission = useCallback(async () => {
    if (isRequestingPermission) return;
    
    setIsRequestingPermission(true);
    console.log('🎤 Requesting microphone permission...');
    
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
          sampleRate: 48000
        }
      });
      
      // Immediately stop the stream to free resources
      stream.getTracks().forEach(track => track.stop());
      
      setHasPermission(true);
      console.log('✅ Microphone permission granted');
    } catch (error) {
      console.error('❌ Microphone permission denied:', error);
      setHasPermission(false);
    } finally {
      setIsRequestingPermission(false);
    }
  }, [isRequestingPermission]);

  // Validate form data
  const validateForm = useCallback(() => {
    const errors: Partial<UserData> = {};
    
    if (!userData.firstName.trim()) {
      errors.firstName = 'Förnamn krävs';
    }
    
    if (!userData.lastName.trim()) {
      errors.lastName = 'Efternamn krävs';
    }
    
    if (!userData.email.trim()) {
      errors.email = 'E-post krävs';
    } else {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(userData.email.trim())) {
        errors.email = 'Vänligen ange en giltig e-postadress';
      }
    }
    
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  }, [userData]);

  // Handle form submission
  const handleFormSubmit = useCallback(async () => {
    if (!validateForm() || isSubmittingForm) return;
    
    setIsSubmittingForm(true);
    
    try {
      // Send data to webhook
      const webhookUrl = 'https://stefan0987.app.n8n.cloud/webhook/803738bb-c134-4bdb-9720-5b1af902475f';
      
      console.log('📤 Sending user data to webhook before call:', userData);
      
      const response = await fetch(webhookUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          first_name: userData.firstName.trim(),
          last_name: userData.lastName.trim(),
          email: userData.email.trim(),
          full_name: `${userData.firstName.trim()} ${userData.lastName.trim()}`,
          timestamp: new Date().toISOString(),
          source: 'webapp_pre_call_form'
        })
      });

      if (response.ok) {
        console.log('✅ User data sent successfully to webhook');
        setShowDataForm(false);
        // Now start the session with the user data
        await handleStartSession();
      } else {
        console.error('❌ Webhook POST request failed:', response.status);
        alert('Misslyckades att skicka data. Försök igen.');
      }
    } catch (error) {
      console.error('❌ Error sending data to webhook:', error);
      alert('Nätverksfel. Försök igen.');
    } finally {
      setIsSubmittingForm(false);
    }
  }, [userData, validateForm, isSubmittingForm]);

  // Enhanced session management with user data
  const handleStartSession = useCallback(async () => {
    if (!agentId) {
      console.error('❌ Cannot start session: Axie Studio Agent ID missing');
      return;
    }

    if (!hasPermission) {
      await requestMicrophonePermission();
      return;
    }

    console.log('🚀 Starting secure session with user data...');
    
    try {
      // Create context message with user data for the agent
      const contextMessage = `User Information - Name: ${userData.firstName} ${userData.lastName}, Email: ${userData.email}. Please use this information during our conversation.`;
      
      const sessionPromise = conversation.startSession({
        agentId: agentId,
        connectionType: 'webrtc',
        // Send initial context to agent
        initialMessage: contextMessage
      });

      // Add timeout for connection
      const timeoutPromise = new Promise((_, reject) => {
        setTimeout(() => reject(new Error('Axie Studio connection timeout')), CONNECTION_TIMEOUT);
      });

      await Promise.race([sessionPromise, timeoutPromise]);
      console.log('✅ Axie Studio session started successfully with user data');
      
    } catch (error) {
      console.error('❌ Failed to start Axie Studio session:', error);
      
      // Auto-retry on failure
      if (connectionAttempts < RETRY_ATTEMPTS) {
        setConnectionAttempts(prev => prev + 1);
        setTimeout(() => handleStartSession(), 1000);
      }
    }
  }, [agentId, hasPermission, requestMicrophonePermission, conversation, connectionAttempts, userData]);

  // Handle initial call button click
  const handleInitialCallClick = useCallback(async () => {
    // Check terms acceptance first
    if (!hasAcceptedTerms) {
      console.log('📋 Terms not accepted, showing terms modal');
      setShowTermsModal(true);
      return;
    }

    // Show data collection form
    setShowDataForm(true);
  }, [hasAcceptedTerms]);

  // Handle terms acceptance
  const handleTermsAccept = useCallback(() => {
    console.log('✅ Terms and conditions accepted');
    setHasAcceptedTerms(true);
    setShowTermsModal(false);
    
    // Show data form after terms acceptance
    setTimeout(() => {
      setShowDataForm(true);
    }, 100);
  }, []);

  // Handle terms decline
  const handleTermsDecline = useCallback(() => {
    console.log('❌ Terms and conditions declined');
    setShowTermsModal(false);
    setHasAcceptedTerms(false);
    
    // Show user-friendly message
    alert('Du måste acceptera våra villkor för att använda Axie Studio AI Röstassistent.');
  }, []);

  // Optimized session end with cleanup
  const handleEndSession = useCallback(async () => {
    console.log('🛑 Ending Axie Studio session...');
    
    try {
      await conversation.endSession();
      console.log('✅ Axie Studio session ended successfully');
    } catch (error) {
      console.error('❌ Error ending Axie Studio session:', error);
    } finally {
      setIsSecureConnection(false);
      setConnectionAttempts(0);
    }
  }, [conversation]);

  // Handle form input changes
  const handleInputChange = useCallback((field: keyof UserData, value: string) => {
    setUserData(prev => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (formErrors[field]) {
      setFormErrors(prev => ({ ...prev, [field]: undefined }));
    }
  }, [formErrors]);

  // Check initial permissions on mount
  useEffect(() => {
    const checkPermissions = async () => {
      if (navigator.permissions) {
        try {
          const result = await navigator.permissions.query({ name: 'microphone' as PermissionName });
          setHasPermission(result.state === 'granted');
          
          result.addEventListener('change', () => {
            setHasPermission(result.state === 'granted');
          });
        } catch (error) {
          console.warn('⚠️ Could not check microphone permissions:', error);
        }
      }
    };

    checkPermissions();
  }, []);

  // Security check for HTTPS
  useEffect(() => {
    if (location.protocol !== 'https:' && location.hostname !== 'localhost') {
      console.warn('⚠️ Insecure connection detected. HTTPS recommended for production.');
    }
  }, []);

  // Memoized connection status
  const connectionStatus = useMemo(() => {
    const isConnected = conversation.status === 'connected';
    const isConnecting = conversation.status !== 'connected' && conversation.status !== 'disconnected';
    
    return { isConnected, isConnecting };
  }, [conversation.status]);

  const { isConnected, isConnecting } = connectionStatus;

  // Memoized responsive button size
  const buttonSize = useMemo(() => {
    return window.innerWidth < 640 ? 20 : window.innerWidth < 1024 ? 24 : 28;
  }, []);

  return (
    <div className="min-h-screen bg-white flex flex-col">
      {/* Terms and Conditions Popup */}
      <TermsPopup
        isOpen={showTermsModal}
        onAccept={handleTermsAccept}
        onDecline={handleTermsDecline}
      />

      {/* Data Collection Form Modal */}
      {showDataForm && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-2xl w-full max-w-md mx-auto border border-gray-200">
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-100">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-black rounded-full flex items-center justify-center">
                  <User size={16} className="text-white" />
                </div>
                <h2 className="text-lg font-semibold text-black">
                  Dina uppgifter för AI-samtalet
                </h2>
              </div>
            </div>

            {/* Content */}
            <div className="p-6">
              <p className="text-gray-700 text-sm mb-4 leading-relaxed">
                Ange dina uppgifter så att AI-agenten kan använda dem under samtalet:
              </p>
              
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <input
                      type="text"
                      value={userData.firstName}
                      onChange={(e) => handleInputChange('firstName', e.target.value)}
                      placeholder="Förnamn"
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:border-black focus:ring-1 focus:ring-black outline-none transition-all text-black placeholder-gray-400 disabled:opacity-50 disabled:bg-gray-50"
                      autoFocus
                      autoComplete="given-name"
                      disabled={isSubmittingForm}
                    />
                    {formErrors.firstName && (
                      <p className="text-red-600 text-xs mt-1">{formErrors.firstName}</p>
                    )}
                  </div>
                  <div>
                    <input
                      type="text"
                      value={userData.lastName}
                      onChange={(e) => handleInputChange('lastName', e.target.value)}
                      placeholder="Efternamn"
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:border-black focus:ring-1 focus:ring-black outline-none transition-all text-black placeholder-gray-400 disabled:opacity-50 disabled:bg-gray-50"
                      autoComplete="family-name"
                      disabled={isSubmittingForm}
                    />
                    {formErrors.lastName && (
                      <p className="text-red-600 text-xs mt-1">{formErrors.lastName}</p>
                    )}
                  </div>
                </div>
                
                <div>
                  <input
                    type="email"
                    value={userData.email}
                    onChange={(e) => handleInputChange('email', e.target.value)}
                    placeholder="din@email.com"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:border-black focus:ring-1 focus:ring-black outline-none transition-all text-black placeholder-gray-400 disabled:opacity-50 disabled:bg-gray-50"
                    autoComplete="email"
                    disabled={isSubmittingForm}
                  />
                  {formErrors.email && (
                    <p className="text-red-600 text-xs mt-1">{formErrors.email}</p>
                  )}
                </div>
                
                <div className="flex space-x-3">
                  <button
                    onClick={() => setShowDataForm(false)}
                    disabled={isSubmittingForm}
                    className="flex-1 px-4 py-3 text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-lg text-sm font-medium transition-colors disabled:opacity-50"
                  >
                    Avbryt
                  </button>
                  <button
                    onClick={handleFormSubmit}
                    disabled={isSubmittingForm}
                    className="flex-1 px-4 py-3 bg-black hover:bg-gray-800 disabled:bg-gray-300 disabled:cursor-not-allowed text-white rounded-lg text-sm font-medium transition-colors flex items-center justify-center"
                  >
                    {isSubmittingForm ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                        Startar samtal...
                      </>
                    ) : (
                      <>
                        Starta AI-samtal
                        <ArrowRight size={16} className="ml-2" />
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Enhanced Header with Security Indicator */}
      <div className="p-4 sm:p-6 lg:p-8">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <a 
              href="https://www.axiestudio.se" 
              target="_blank" 
              rel="noopener noreferrer"
              className="flex items-center space-x-3 hover:opacity-80 transition-opacity"
            >
              <img 
                src="https://www.axiestudio.se/logo.jpg" 
                alt="Axie Studio" 
                className="w-6 h-6 sm:w-8 sm:h-8 rounded-lg object-cover"
                loading="eager"
              />
              <h1 className="text-lg sm:text-xl lg:text-2xl font-semibold text-gray-900">
                Axie Studio
              </h1>
            </a>
          </div>
          
          {/* Security Status Indicator */}
          {isConnected && (
            <div className="flex items-center space-x-2 text-emerald-600">
              <Shield size={16} />
              <span className="text-xs font-medium hidden sm:inline">Secure</span>
            </div>
          )}
        </div>
      </div>

      {/* Optimized Main Content */}
      <div className="flex-1 flex items-center justify-center px-4 sm:px-6 lg:px-8">
        <div className="text-center w-full max-w-lg">
          <div className="relative mb-6 sm:mb-8 lg:mb-12">
            {/* Enhanced gradient orb with better performance */}
            <div className={`w-64 h-64 sm:w-80 sm:h-80 lg:w-96 lg:h-96 xl:w-[400px] xl:h-[400px] mx-auto rounded-full transition-all duration-500 will-change-transform ${
              isConnected 
                ? 'bg-gradient-to-br from-emerald-400 via-blue-500 to-purple-600 animate-pulse' 
                : conversation.isSpeaking
                ? 'bg-gradient-to-br from-blue-400 via-cyan-500 to-teal-600 animate-spin'
                : 'bg-gradient-to-br from-blue-400 via-cyan-500 to-teal-600'
            } shadow-2xl relative overflow-hidden`}>
              <div className="absolute inset-3 sm:inset-4 lg:inset-6 rounded-full bg-gradient-to-br from-white/20 to-transparent"></div>
              
              {/* Enhanced central button */}
              <div className="absolute inset-0 flex items-center justify-center">
                <button
                  onClick={isConnected ? handleEndSession : handleInitialCallClick}
                  disabled={isConnecting || isRequestingPermission}
                  className="w-16 h-16 sm:w-20 sm:h-20 lg:w-24 lg:h-24 bg-black/80 backdrop-blur-sm rounded-full flex items-center justify-center text-white hover:bg-black/90 active:scale-95 transition-all duration-200 shadow-xl disabled:opacity-50 disabled:cursor-not-allowed group touch-manipulation will-change-transform"
                  aria-label={isConnected ? 'End call' : 'Start call'}
                >
                  {isConnecting || isRequestingPermission ? (
                    <div className="w-5 h-5 sm:w-6 sm:h-6 lg:w-7 lg:h-7 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  ) : isConnected ? (
                    <PhoneOff size={buttonSize} className="group-hover:scale-110 transition-transform" />
                  ) : hasPermission === false ? (
                    <MicOff size={buttonSize} className="group-hover:scale-110 transition-transform" />
                  ) : (
                    <Phone size={buttonSize} className="group-hover:scale-110 transition-transform" />
                  )}
                </button>
              </div>

              {/* Optimized speaking indicator */}
              {conversation.isSpeaking && (
                <>
                  <div className="absolute inset-0 rounded-full border-2 sm:border-4 border-white/30 animate-ping will-change-transform"></div>
                  <div className="absolute inset-6 sm:inset-8 lg:inset-12 rounded-full border border-white/20 sm:border-2 animate-ping animation-delay-200 will-change-transform"></div>
                </>
              )}
            </div>

            {/* Enhanced status label */}
            <div className="absolute -bottom-12 sm:-bottom-16 lg:-bottom-20 left-1/2 transform -translate-x-1/2 w-full px-4">
              <div className="bg-black/80 backdrop-blur-sm text-white px-3 py-2 sm:px-4 sm:py-2 lg:px-6 lg:py-3 rounded-full text-xs sm:text-sm lg:text-base font-medium shadow-lg mx-auto max-w-fit">
                {isConnecting || isRequestingPermission ? (
                  connectionAttempts > 0 ? `Återansluter... (${connectionAttempts}/${RETRY_ATTEMPTS})` : 'Ansluter...'
                ) : isConnected ? (
                  'Avsluta samtal'
                ) : hasPermission === false ? (
                  'Aktivera mikrofon'
                ) : (
                  'Ring AI-agent'
                )}
              </div>
            </div>
          </div>

          {/* Show user data when connected */}
          {isConnected && userData.firstName && (
            <div className="mb-4 sm:mb-6">
              <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-3 sm:p-4 max-w-xs sm:max-w-md mx-auto">
                <div className="text-emerald-800 text-xs sm:text-sm">
                  <p className="font-medium">AI-agenten känner till:</p>
                  <p>👤 {userData.firstName} {userData.lastName}</p>
                  <p>📧 {userData.email}</p>
                </div>
              </div>
            </div>
          )}

          {/* Enhanced status indicators */}
          {isConnected && (
            <div className="flex items-center justify-center space-x-3 sm:space-x-4 lg:space-x-6 mb-4 sm:mb-6">
              <div className="flex items-center space-x-2 text-emerald-600">
                <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></div>
                <span className="text-xs sm:text-sm lg:text-base font-medium">
                  {isSecureConnection ? 'Säker anslutning' : 'Ansluten'}
                </span>
              </div>
              {conversation.isSpeaking && (
                <div className="flex items-center space-x-2 text-blue-600">
                  <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
                  <span className="text-xs sm:text-sm lg:text-base font-medium">AI talar</span>
                </div>
              )}
            </div>
          )}

          {/* Enhanced permission warning */}
          {hasPermission === false && (
            <div className="max-w-xs sm:max-w-md lg:max-w-lg mx-auto mb-4 sm:mb-6 px-4">
              <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 sm:p-4">
                <div className="flex items-start sm:items-center space-x-2 text-amber-800">
                  <MicOff size={16} className="flex-shrink-0 mt-0.5 sm:mt-0" />
                  <span className="text-xs sm:text-sm font-medium leading-relaxed">
                    Mikrofonbehörighet krävs för att använda röstassistenten
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Enhanced Footer */}
      <div className="p-4 sm:p-6 lg:p-8 text-center">
        <div className="flex flex-col items-center space-y-3">
          <button
            onClick={() => window.open('https://www.axiestudio.se/villkor', '_blank')}
            className="text-gray-600 hover:text-black text-sm font-medium underline transition-colors"
          >
            Villkör
          </button>
          <div className="flex items-center justify-center space-x-2 text-gray-500">
            <span className="text-xs sm:text-sm">Powered by</span>
            <img 
              src="https://www.axiestudio.se/logo.jpg" 
              alt="Axie Studio" 
              className="w-3 h-3 sm:w-4 sm:h-4 rounded object-cover"
              loading="lazy"
            />
            <span className="text-xs sm:text-sm font-medium">Axie Studio AI</span>
          </div>
        </div>
      </div>
    </div>
  );
}
          <span className="text-xs sm:text-sm">Powered by</span>
          <img 
            src="https://www.axiestudio.se/logo.jpg" 
            alt="Axie Studio" 
            className="w-3 h-3 sm:w-4 sm:h-4 rounded object-cover"
            loading="lazy"
          />
          <span className="text-xs sm:text-sm font-medium">Axie Studio AI</span>
        </div>
      </div>
    </div>
  );
}

export default App;