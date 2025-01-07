export function generateOTP(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

export function generateOTPMessage(code: string): string {
  return `Your verification code is: ${code}. Valid for 5 minutes.`;
}

export function isValidPhoneNumber(phone: string): boolean {
  // Basic phone number validation - can be enhanced based on requirements
  const phoneRegex = /^\+[1-9]\d{1,14}$/;
  return phoneRegex.test(phone);
}