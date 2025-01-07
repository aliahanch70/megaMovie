import { createClient } from './client';
import { PhoneAuthError } from '@/types/auth';

export async function sendOTP(phoneNumber: string): Promise<{ success: boolean; error?: PhoneAuthError }> {
  try {
    const response = await fetch('/api/auth/send-otp', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ phoneNumber }),
    });

    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.message);
    }

    return { success: true };
  } catch (error) {
    return {
      success: false,
      error: {
        code: 'send_otp_failed',
        message: error instanceof Error ? error.message : 'Failed to send OTP'
      }
    };
  }
}

export async function verifyOTP(phoneNumber: string, code: string): Promise<{ 
  success: boolean; 
  error?: PhoneAuthError;
  session?: any;
}> {
  try {
    const supabase = createClient();
    const response = await fetch('/api/auth/verify-otp', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ phoneNumber, code }),
    });

    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.message);
    }

    // Sign in with custom token from backend
    const { data: authData, error: signInError } = await supabase.auth.signInWithPassword({
      phone: phoneNumber,
      password: data.token // Use the token as password
    });

    if (signInError) throw signInError;

    return { 
      success: true,
      session: authData.session
    };
  } catch (error) {
    return {
      success: false,
      error: {
        code: 'verification_failed',
        message: error instanceof Error ? error.message : 'Failed to verify OTP'
      }
    };
  }
}