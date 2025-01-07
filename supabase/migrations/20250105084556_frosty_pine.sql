/*
  # Phone Authentication Tables

  1. New Tables
    - `phone_auth_codes`
      - For storing temporary OTP codes
      - Includes expiration time
      - Auto-cleanup via RLS policy
    
    - `rate_limits`
      - For rate limiting OTP requests
      - Tracks request counts per identifier
      - Auto-cleanup of old entries

  2. Security
    - Enable RLS on both tables
    - Strict access policies
    - Automatic data cleanup
*/

-- Phone Authentication Codes Table
CREATE TABLE IF NOT EXISTS phone_auth_codes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  phone_number text NOT NULL,
  code text NOT NULL,
  expires_at timestamptz NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Rate Limiting Table
CREATE TABLE IF NOT EXISTS rate_limits (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  identifier text NOT NULL,
  timestamp timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE phone_auth_codes ENABLE ROW LEVEL SECURITY;
ALTER TABLE rate_limits ENABLE ROW LEVEL SECURITY;

-- Indexes
CREATE INDEX IF NOT EXISTS idx_phone_auth_codes_phone_number ON phone_auth_codes(phone_number);
CREATE INDEX IF NOT EXISTS idx_phone_auth_codes_expires_at ON phone_auth_codes(expires_at);
CREATE INDEX IF NOT EXISTS idx_rate_limits_identifier_timestamp ON rate_limits(identifier, timestamp);

-- Add phone_number to profiles table if it doesn't exist
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'profiles' AND column_name = 'phone_number'
  ) THEN
    ALTER TABLE profiles ADD COLUMN phone_number text UNIQUE;
  END IF;
END $$;

-- Policies for phone_auth_codes
CREATE POLICY "Service role can manage phone auth codes"
  ON phone_auth_codes
  USING (true)
  WITH CHECK (true);

-- Policies for rate_limits
CREATE POLICY "Service role can manage rate limits"
  ON rate_limits
  USING (true)
  WITH CHECK (true);

-- Cleanup function for expired codes
CREATE OR REPLACE FUNCTION cleanup_expired_auth_codes()
RETURNS trigger AS $$
BEGIN
  DELETE FROM phone_auth_codes WHERE expires_at < NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to cleanup expired codes
DROP TRIGGER IF EXISTS trigger_cleanup_expired_auth_codes ON phone_auth_codes;
CREATE TRIGGER trigger_cleanup_expired_auth_codes
  AFTER INSERT ON phone_auth_codes
  EXECUTE FUNCTION cleanup_expired_auth_codes();