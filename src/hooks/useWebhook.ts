import { useCallback } from 'react';

const WEBHOOK_URL = import.meta.env.VITE_N8N_WEBHOOK_URL;

export const useWebhook = () => {
  const sendToWebhook = useCallback(async (data: any, source: string): Promise<boolean> => {
    if (!WEBHOOK_URL) {
      console.error('❌ Webhook URL not configured in environment variables');
      return false;
    }

    try {
      console.log(`📤 Sending data to webhook (${source}):`, data);
      
      const response = await fetch(WEBHOOK_URL, {
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
        console.log('✅ Data sent successfully to webhook');
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

  return { sendToWebhook };
};