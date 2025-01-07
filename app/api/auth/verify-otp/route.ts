import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/client';
import { sign } from 'jsonwebtoken';

export async function POST(req: Request) {
  try {
    const { phoneNumber, code } = await req.json();
    const supabase = createClient();

    // Verify OTP
    const { data: otpData, error: otpError } = await supabase
      .from('phone_auth_codes')
      .select('*')
      .eq('phone_number', phoneNumber)
      .eq('code', code)
      .gt('expires_at', new Date().toISOString())
      .single();

    if (otpError || !otpData) {
      return NextResponse.json(
        { message: 'Invalid or expired verification code' },
        { status: 400 }
      );
    }

    // Delete used OTP
    await supabase
      .from('phone_auth_codes')
      .delete()
      .eq('phone_number', phoneNumber);

    // Check if user exists
    const { data: userData } = await supabase
      .from('profiles')
      .select('id')
      .eq('phone_number', phoneNumber)
      .single();

    if (!userData) {
      // Create new user
      const { data: newUser, error: createError } = await supabase.auth.signUp({
        phone: phoneNumber,
        password: process.env.SUPABASE_USER_PASSWORD as string // Use a secure password
      });

      if (createError) throw createError;
    }

    // Generate JWT token
    const token = sign(
      { phone_number: phoneNumber },
      process.env.JWT_SECRET as string,
      { expiresIn: '1h' }
    );

    return NextResponse.json({ success: true, token });
  } catch (error) {
    console.error('Error verifying OTP:', error);
    return NextResponse.json(
      { message: 'Failed to verify code' },
      { status: 500 }
    );
  }
}