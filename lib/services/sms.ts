import twilio from 'twilio';

const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const messagingServiceSid = process.env.TWILIO_MESSAGING_SERVICE_SID;

if (!accountSid || !authToken) {
  throw new Error('Twilio credentials are not configured');
}

const client = twilio(accountSid, authToken);

export async function sendSMS(to: string, message: string): Promise<{ success: boolean; error?: string }> {
  try {
    const messageOptions: any = {
      to,
      body: message,
      messagingServiceSid
    };

    const result = await client.messages.create(messageOptions);
    return { success: true };
  } catch (error: any) {
    console.error('SMS sending error:', error);
    return { 
      success: false, 
      error: error.message || 'Failed to send SMS'
    };
  }
}