/*
  # Create auth_attempts table for rate limiting

  1. New Tables
    - `auth_attempts`
      - `id` (uuid, primary key)
      - `email` (text)
      - `attempt_type` (text - 'signin' or 'signup')
      - `success` (boolean)
      - `ip_address` (text, nullable)
      - `user_agent` (text, nullable)
      - `created_at` (timestamp)

  2. Security
    - Enable RLS on `auth_attempts` table
    - Add policies for authenticated users to manage their own attempts
*/

-- Create auth_attempts table
CREATE TABLE IF NOT EXISTS auth_attempts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email text NOT NULL,
  attempt_type text NOT NULL CHECK (attempt_type IN ('signin', 'signup')),
  success boolean NOT NULL DEFAULT false,
  ip_address text,
  user_agent text,
  created_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE auth_attempts ENABLE ROW LEVEL SECURITY;

-- Create policies - allow all authenticated users to read/write auth attempts
-- This is needed for rate limiting functionality
CREATE POLICY "Allow authenticated users to read auth attempts"
  ON auth_attempts
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Allow authenticated users to insert auth attempts"
  ON auth_attempts
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- Allow anonymous users to insert auth attempts (needed for signup/signin tracking)
CREATE POLICY "Allow anonymous users to insert auth attempts"
  ON auth_attempts
  FOR INSERT
  TO anon
  WITH CHECK (true);

-- Allow anonymous users to read auth attempts for rate limiting
CREATE POLICY "Allow anonymous users to read auth attempts for rate limiting"
  ON auth_attempts
  FOR SELECT
  TO anon
  USING (true);

-- Create index for better performance on rate limiting queries
CREATE INDEX IF NOT EXISTS auth_attempts_email_created_at_idx ON auth_attempts(email, created_at);
CREATE INDEX IF NOT EXISTS auth_attempts_email_success_created_at_idx ON auth_attempts(email, success, created_at);