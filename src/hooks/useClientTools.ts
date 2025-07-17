import { useCallback } from 'react';
import { useWebhook } from './useWebhook';

interface UserInfo {
  firstName: string;
  lastName: string;
  email: string;
}

interface ClientToolResponse {
  success: boolean;
  message: string;
}

interface NameToolResponse extends ClientToolResponse {
  first_name: string;
  last_name: string;
}

interface EmailToolResponse extends ClientToolResponse {
  email: string;
}

interface InfoToolResponse extends ClientToolResponse {
  first_name: string;
  last_name: string;
  email: string;
}

export const useClientTools = () => {
  const { sendToWebhook } = useWebhook();

  const getStoredUserInfo = useCallback((): UserInfo | null => {
    const storedUserInfo = localStorage.getItem('axie_studio_user_info');
    if (storedUserInfo) {
      try {
        return JSON.parse(storedUserInfo);
      } catch (error) {
        console.error('❌ Failed to parse stored user info:', error);
        localStorage.removeItem('axie_studio_user_info');
      }
    }
    return null;
  }, []);

  const get_firstandlastname = useCallback(async (params?: { first_name?: string; last_name?: string }): Promise<NameToolResponse> => {
    console.log('🔧 Agent requested user name via get_firstandlastname tool');
    console.log('📥 Agent params (ignored):', params);
    
    const currentUserInfo = getStoredUserInfo();
    
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
    
    const response: NameToolResponse = {
      first_name: currentUserInfo.firstName,
      last_name: currentUserInfo.lastName,
      success: true,
      message: 'User name retrieved from local storage'
    };

    console.log('📤 Returning to agent:', response);
    return response;
  }, [getStoredUserInfo, sendToWebhook]);

  const get_email = useCallback(async (params?: { email?: string }): Promise<EmailToolResponse> => {
    console.log('🔧 Agent requested user email via get_email tool');
    console.log('📥 Agent params (ignored):', params);
    
    const currentUserInfo = getStoredUserInfo();
    
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
    
    const response: EmailToolResponse = {
      email: currentUserInfo.email,
      success: true,
      message: 'User email retrieved from local storage'
    };

    console.log('📤 Returning to agent:', response);
    return response;
  }, [getStoredUserInfo, sendToWebhook]);

  const get_info = useCallback(async (params?: { email?: string; first_name?: string; last_name?: string }): Promise<InfoToolResponse> => {
    console.log('🔧 Agent requested complete user info via get_info tool');
    console.log('📥 Agent params (ignored):', params);
    
    const currentUserInfo = getStoredUserInfo();
    
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
    
    const response: InfoToolResponse = {
      email: currentUserInfo.email,
      first_name: currentUserInfo.firstName,
      last_name: currentUserInfo.lastName,
      success: true,
      message: 'Complete user info retrieved from local storage'
    };

    console.log('📤 Returning to agent:', response);
    return response;
  }, [getStoredUserInfo, sendToWebhook]);

  return {
    get_firstandlastname,
    get_email,
    get_info
  };
};