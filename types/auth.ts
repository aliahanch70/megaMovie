export interface PhoneAuthError {
  code: 'invalid_phone' | 'send_otp_failed' | 'verification_failed' | 'rate_limit_exceeded';
  message: string;
}

export interface PhoneAuthState {
  loading: boolean;
  error: PhoneAuthError | null;
  verificationId: string | null;
  phoneNumber: string | null;
}