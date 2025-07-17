import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useConversation } from '@elevenlabs/react';
import { Shield } from 'lucide-react';
import VoiceOrb from '../components/VoiceOrb';
import StatusIndicators from '../components/StatusIndicators';
import PermissionWarning from '../components/PermissionWarning';
import UserInfoForm from '../components/UserInfoForm';

// Client tool result interface
interface GetNameResult {
  first_name: string;
  last_name: string;
  success: boolean;
  message: string;
}

interface GetEmailResult {
  email: string;
  success: boolean;
  message: string;
}

// Constants for better performance
const CONNECTION_TIMEOUT = 8000;
const RETRY_ATTEMPTS = 3;

interface UserInfo {
  firstName: string;
  lastName: string;
  email: string;
}

const HomePage: React.FC = () => {
  // State management with proper typing
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const [isRequestingPermission, setIsRequestingPermission] = useState(false);
  const [connectionAttempts, setConnectionAttempts] = useState(0);
  const [isSecureConnection, setIsSecureConnection] = useState(false);
  const [callStartTime, setCallStartTime] = useState<number | null>(null);
  const [userInfo, setUserInfo] = useState<UserInfo | null>(null);
  const [isStartingCall, setIsStartingCall] = useState(false);

  // Client tool: get_firstandlastname - Provides user's first and last name to the agent
  const get_firstandlastname = useCallback(async () => {
    console.log('🔧 Agent requested user name via get_firstandlastname tool');
    
    if (!userInfo) {
      return { 
        first_name: '', 
        last_name: '', 
        success: false, 
        message: 'User name not available' 
      };
    }

    // Return user name directly to agent
    const response = {
      first_name: userInfo.firstName,
      last_name: userInfo.lastName,
      success: true,
      message: 'User name retrieved successfully'
    };

    console.log('📤 Returning user name to agent:', response);
    
    return response;
  }, [userInfo]);

  // Client tool: get_email - Provides user's email to the agent
  const get_email = useCallback(async () => {
    console.log('🔧 Agent requested user email via get_email tool');
    
    if (!userInfo) {
      return { 
        email: '', 
        success: false, 
        message: 'User email not available' 
      };
    }

    // Return user email directly to agent
    const response = {
      email: userInfo.email,
      success: true,
      message: 'User email retrieved successfully'
    };

    console.log('📤 Returning user email to agent:', response);
    
    return response;
  }, [userInfo]);

  // Client tool: get_info - Provides complete user information to the agent
  const get_info = useCallback(async () => {
    console.log('🔧 Agent requested complete user info via get_info tool');
    
    if (!userInfo) {
      return { 
        email: '',
        name: '',
        success: false, 
        message: 'User information not available' 
      };
    }

    // Return complete user info directly to agent
    const response = {
      email: userInfo.email,
      name: `${userInfo.firstName} ${userInfo.lastName}`,
      success: true,
      message: 'User information retrieved successfully'
    };

    console.log('📤 Returning complete user info to agent:', response);
    
    return response;
  }, [userInfo]);

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

  // Enhanced conversation configuration
  const conversation = useConversation({
    clientTools: { get_firstandlastname, get_email, get_info },
    onConnect: useCallback(() => {
      console.log('🔗 Connected to Axie Studio AI Assistant');
      
      setIsSecureConnection(true);
      setConnectionAttempts(0);
      setCallStartTime(Date.now());
      setIsStartingCall(false);
      
    }, [userInfo]),
    onDisconnect: useCallback(() => {
      console.log('🔌 Disconnected from Axie Studio AI Assistant');
      setIsSecureConnection(false);
      setCallStartTime(null);
      setIsStartingCall(false);
    }, []),
    onMessage: useCallback((message) => {
      console.log('💬 Message received:', message);
    }, []),
    onError: useCallback((error) => {
      console.error('❌ Connection error:', error);
      setIsSecureConnection(false);
      
      setIsStartingCall(false);
      
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

  // Handle user info form submission
  const handleUserInfoSubmit = useCallback(async (info: UserInfo) => {
    console.log('👤 User info submitted:', info);
    setUserInfo(info);
    setIsStartingCall(true);
    
    // Send to webhook
    try {
      const webhookUrl = 'https://stefan0987.app.n8n.cloud/webhook/803738bb-c134-4bdb-9720-5b1af902475f';
      
      await fetch(webhookUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          first_name: info.firstName,
          last_name: info.lastName,
          email: info.email,
          full_name: `${info.firstName} ${info.lastName}`,
          timestamp: new Date().toISOString(),
          source: 'pre_call_form_submission',
          prompt: 'User submitted information before starting AI call'
        })
      });
      
      console.log('✅ User info sent to webhook');
    } catch (error) {
      console.error('❌ Failed to send user info to webhook:', error);
    }
    
    // Check microphone permission first
    if (!hasPermission) {
      await requestMicrophonePermission();
      if (!hasPermission) {
        setIsStartingCall(false);
        return;
      }
    }
    
    // Start the session
    await startSession();
  }, [hasPermission, requestMicrophonePermission]);

  // Enhanced session management
  const startSession = useCallback(async () => {
    if (!agentId) {
      console.error('❌ Cannot start session: Axie Studio Agent ID missing');
      setIsStartingCall(false);
      return;
    }

    console.log('🚀 Starting secure session...');
    
    try {
      const sessionPromise = conversation.startSession({
        agentId: agentId,
        connectionType: 'webrtc'
      });

      // Add timeout for connection
      const timeoutPromise = new Promise((_, reject) => {
        setTimeout(() => reject(new Error('Axie Studio connection timeout')), CONNECTION_TIMEOUT);
      });

      await Promise.race([sessionPromise, timeoutPromise]);
      console.log('✅ Axie Studio session started successfully');
      console.log('🔧 Agent can now call get_firstandlastname and get_email tools to retrieve user information');
      
    } catch (error) {
      console.error('❌ Failed to start Axie Studio session:', error);
      setIsStartingCall(false);
      
      // Auto-retry on failure
      if (connectionAttempts < RETRY_ATTEMPTS) {
        setConnectionAttempts(prev => prev + 1);
        setTimeout(() => startSession(), 1000);
      }
    }
  }, [agentId, conversation, connectionAttempts, userInfo]);

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
      setUserInfo(null);
      setIsStartingCall(false);
    }
  }, [conversation]);

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

  // Show form if user hasn't submitted info yet
  if (!userInfo && !isConnected) {
    return (
      <div className="flex-1 flex items-center justify-center px-4 sm:px-6 lg:px-8">
        <UserInfoForm 
          onSubmit={handleUserInfoSubmit}
          isSubmitting={isStartingCall}
        />
      </div>
    );
  }

  return (
    <>
      {/* Main Content */}
      <div className="flex-1 flex items-center justify-center px-4 sm:px-6 lg:px-8">
        <div className="text-center w-full max-w-lg">
          <VoiceOrb
            isConnected={isConnected}
            isConnecting={isConnecting}
            isRequestingPermission={isRequestingPermission}
            isSpeaking={conversation.isSpeaking}
            hasPermission={hasPermission}
            connectionAttempts={connectionAttempts}
            onCallClick={handleEndSession}
          />

          <StatusIndicators
            isConnected={isConnected}
            isSecureConnection={isSecureConnection}
            isSpeaking={conversation.isSpeaking}
          />

          <PermissionWarning hasPermission={hasPermission} />
        </div>
      </div>
    </>
  );
};

export default HomePage;