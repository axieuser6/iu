import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useConversation } from '@elevenlabs/react';
import { Shield } from 'lucide-react';
import VoiceOrb from '../components/VoiceOrb';
import StatusIndicators from '../components/StatusIndicators';
import PermissionWarning from '../components/PermissionWarning';
import UserInfoForm from '../components/UserInfoForm';

// Client tool result interface

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

  // Store user info in localStorage when it's set
  useEffect(() => {
    if (userInfo) {
      localStorage.setItem('axie_studio_user_info', JSON.stringify(userInfo));
      console.log('💾 User info stored locally:', userInfo);
    }
  }, [userInfo]);

  // Load user info from localStorage on mount
  useEffect(() => {
    const storedUserInfo = localStorage.getItem('axie_studio_user_info');
    if (storedUserInfo) {
      try {
        const parsed = JSON.parse(storedUserInfo);
        setUserInfo(parsed);
        console.log('📂 User info loaded from localStorage:', parsed);
      } catch (error) {
        console.error('❌ Failed to parse stored user info:', error);
        localStorage.removeItem('axie_studio_user_info');
      }
    }
  }, []);

  // Helper function to send data to webhook
  const sendToWebhook = useCallback(async (data: any, source: string) => {
    try {
      const webhookUrl = 'https://stefan0987.app.n8n.cloud/webhook/803738bb-c134-4bdb-9720-5b1af902475f';
      
      const response = await fetch(webhookUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          ...data,
          timestamp: new Date().toISOString(),
          source: source
        })
      });

      if (response.ok) {
        console.log('✅ Data sent successfully to webhook:', data);
        return true;
      } else {
        console.error('❌ Webhook POST request failed:', response.status);
        return false;
      }
    } catch (error) {
      console.error('❌ Error sending data to webhook:', error);
      return false;
    }
  }, []);
  // Client tool: get_firstandlastname - Agent provides first and last name, we store and return it
  const get_firstandlastname = useCallback(async (params?: { first_name?: string; last_name?: string }) => {
    console.log('🔧 Agent requested user name via get_firstandlastname tool');
    console.log('📥 Agent params (ignored):', params);
    
    // Get stored user info
    const storedUserInfo = localStorage.getItem('axie_studio_user_info');
    const currentUserInfo = storedUserInfo ? JSON.parse(storedUserInfo) : null;
    
    if (!currentUserInfo || !currentUserInfo.firstName || !currentUserInfo.lastName) {
      console.log('❌ No stored user name found');
      return {
        first_name: '',
        last_name: '',
        success: false,
        message: 'No user name stored locally'
      };
    }
    
    console.log('📂 Using stored user info:', currentUserInfo);
    
    // Send to webhook
    await sendToWebhook({
      first_name: currentUserInfo.firstName,
      last_name: currentUserInfo.lastName,
      full_name: `${currentUserInfo.firstName} ${currentUserInfo.lastName}`
    }, 'agent_triggered_get_firstandlastname_tool');
    
    const response = {
      first_name: currentUserInfo.firstName,
      last_name: currentUserInfo.lastName,
      success: true,
      message: 'User name retrieved from local storage'
    };

    console.log('📤 Returning to agent:', response);
    return response;
  }, [sendToWebhook]);

  // Client tool: get_email - Agent provides email, we store and return it
  const get_email = useCallback(async (params?: { email?: string }) => {
    console.log('🔧 Agent requested user email via get_email tool');
    console.log('📥 Agent params (ignored):', params);
    
    // Get stored user info
    const storedUserInfo = localStorage.getItem('axie_studio_user_info');
    const currentUserInfo = storedUserInfo ? JSON.parse(storedUserInfo) : null;
    
    if (!currentUserInfo || !currentUserInfo.email) {
      console.log('❌ No stored user email found');
      return {
        email: '',
        success: false,
        message: 'No user email stored locally'
      };
    }
    
    console.log('📂 Using stored user info:', currentUserInfo);
    
    // Send to webhook
    await sendToWebhook({
      email: currentUserInfo.email
    }, 'agent_triggered_get_email_tool');
    
    const response = {
      email: currentUserInfo.email,
      success: true,
      message: 'User email retrieved from local storage'
    };

    console.log('📤 Returning to agent:', response);
    return response;
  }, [sendToWebhook]);

  // Client tool: get_info - Agent provides complete info, we store and return it
  const get_info = useCallback(async (params?: { email?: string; first_name?: string; last_name?: string }) => {
    console.log('🔧 Agent requested complete user info via get_info tool');
    console.log('📥 Agent params (ignored):', params);
    
    // Get stored user info
    const storedUserInfo = localStorage.getItem('axie_studio_user_info');
    const currentUserInfo = storedUserInfo ? JSON.parse(storedUserInfo) : null;
    
    if (!currentUserInfo || !currentUserInfo.firstName || !currentUserInfo.lastName || !currentUserInfo.email) {
      console.log('❌ Incomplete user info stored locally');
      return {
        email: currentUserInfo?.email || '',
        first_name: currentUserInfo?.firstName || '',
        last_name: currentUserInfo?.lastName || '',
        success: false,
        message: 'Incomplete user info stored locally'
      };
    }
    
    console.log('📂 Using stored user info:', currentUserInfo);
    
    // Send to webhook
    await sendToWebhook({
      email: currentUserInfo.email,
      first_name: currentUserInfo.firstName,
      last_name: currentUserInfo.lastName,
      full_name: `${currentUserInfo.firstName} ${currentUserInfo.lastName}`
    }, 'agent_triggered_get_info_tool');
    
    const response = {
      email: currentUserInfo.email,
      first_name: currentUserInfo.firstName,
      last_name: currentUserInfo.lastName,
      success: true,
      message: 'Complete user info retrieved from local storage'
    };

    console.log('📤 Returning to agent:', response);
    return response;
  }, [sendToWebhook]);


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
      
    }, []),
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
    
    // Send to webhook using helper function
    await sendToWebhook({
      first_name: info.firstName,
      last_name: info.lastName,
      email: info.email,
      full_name: `${info.firstName} ${info.lastName}`,
      prompt: 'User submitted information before starting AI call'
    }, 'pre_call_form_submission');
    
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
  }, [hasPermission, requestMicrophonePermission, sendToWebhook]);

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
      console.log('🔧 Agent can now call get_firstandlastname, get_email, and get_info tools to receive and store user information');
      
    } catch (error) {
      console.error('❌ Failed to start Axie Studio session:', error);
      setIsStartingCall(false);
      
      // Auto-retry on failure
      if (connectionAttempts < RETRY_ATTEMPTS) {
        setConnectionAttempts(prev => prev + 1);
        setTimeout(() => startSession(), 1000);
      }
    }
  }, [agentId, conversation, connectionAttempts]);

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
      // Don't clear userInfo - keep it stored locally
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

  // Show form if user hasn't submitted info yet and not connected
  if (!userInfo && !isConnected && !isStartingCall) {
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