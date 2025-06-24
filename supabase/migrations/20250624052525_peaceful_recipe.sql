/*
  # Disable Email Confirmation

  1. Configuration Changes
    - Disable email confirmation requirement
    - Allow users to sign in immediately after registration
    - Update auth settings to bypass email verification

  2. Security
    - Users can sign in without email verification
    - Immediate access to application features
*/

-- Disable email confirmation requirement
UPDATE auth.config 
SET email_confirm = false 
WHERE id = 1;

-- Allow users to sign in without email confirmation
UPDATE auth.users 
SET email_confirmed_at = NOW() 
WHERE email_confirmed_at IS NULL;

-- Update any existing unconfirmed users
UPDATE auth.users 
SET email_confirmed_at = created_at 
WHERE email_confirmed_at IS NULL;