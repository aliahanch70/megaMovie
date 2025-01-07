import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/client';
import { rateLimit } from '@/lib/utils/rate-limit';
import { sendSMS } from '@/lib/services/sms';
import { generateOTP, generateOTPMessage, isValidPhoneNumber } from '@/lib/services/otp';

export async function POST(request: Request) {
  try {
    const { phoneNumber } = await request.json();

    if (!isValidPhoneNumber(phoneNumber)) {
      return NextResponse.json(
        { error: 'Invalid phone number format' },
        { status: 400 }
      );
    }

    // Rate limiting
    const { success: rateLimitOk, remaining } = await rateLimit(
      phoneNumber,
      5, // max attempts
      5 * 60 * 1000 // 5 minutes window
    );

    if (!rateLimitOk) {
      return NextResponse.json(
        { error: 'Too many attempts. Please try again later.' },
        { status: 429 }
      );
    }

    const code = generateOTP();
    const message = generateOTPMessage(code);
    const supabase = createClient();

    // Store OTP in database
    const { error: dbError } = await supabase
      .from('phone_auth_codes')
      .insert([{
        phone_number: phoneNumber,
        code,
        expires_at: new Date(Date.now() + 5 * 60 * 1000).toISOString() // 5 minutes expiry
      }]);

    if (dbError) throw dbError;

    // Send SMS
    const { success, error: smsError } = await sendSMS(phoneNumber, message);
    
    if (!success) {
      throw new Error(smsError || 'Failed to send SMS');
    }

    return NextResponse.json({ 
      success: true,
      remaining,
      message: 'Verification code sent successfully'
    });
  } catch (error: any) {
    console.error('Error sending OTP:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to send verification code' },
      { status: 500 }
    );
  }
}