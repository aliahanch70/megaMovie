import { NextResponse } from 'next/server';
import { Resend } from 'resend';

if (!process.env.RESEND_API_KEY) {
  throw new Error('RESEND_API_KEY is not set in environment variables');
}

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(request: Request) {
  try {
    const { email, code } = await request.json();

    if (!email || !code) {
      return NextResponse.json(
        { error: 'Email and code are required' },
        { status: 400 }
      );
    }

    // Try sending the email and log any errors
    try {
      const { data, error } = await resend.emails.send({
        from: 'onboarding@resend.dev', // Replace with your verified domain
        replyTo: 'no-reply@yourdomain.com',
        to: email,
        subject: 'Your Verification Code',
        html: `
          <div style="font-family: Arial, sans-serif; padding: 20px;">
            <h2>Verification Code</h2>
            <p>Your verification code is:</p>
            <h1 style="font-size: 32px; letter-spacing: 5px; color: #333;">${code}</h1>
            <p>This code will expire soon.</p>
          </div>
        `,
      });

      if (error) {
        console.error('Resend API error:', error);
        throw error;
      }

      console.log('Email sent successfully:', data);
      return NextResponse.json({ success: true });
    } catch (emailError) {
      console.error('Email sending error:', emailError);
      throw emailError;
    }
  } catch (error) {
    console.error('Server error:', error);
    return NextResponse.json(
      { error: 'Failed to send verification code' },
      { status: 500 }
    );
  }
}
