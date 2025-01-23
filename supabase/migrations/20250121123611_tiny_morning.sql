/*
  # Add password reset functionality

  1. New Tables
    - `password_resets`
      - `id` (uuid, primary key)
      - `user_id` (uuid, references users)
      - `token` (text, unique)
      - `expires_at` (timestamptz)
      - `created_at` (timestamptz)
      - `used_at` (timestamptz)

  2. Security
    - Enable RLS on `password_resets` table
    - Add policy for users to read their own reset tokens
    - Add policy for users to update their own reset tokens
*/

CREATE TABLE IF NOT EXISTS password_resets (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES users(id) NOT NULL,
  token text UNIQUE NOT NULL,
  expires_at timestamptz NOT NULL,
  created_at timestamptz DEFAULT now(),
  used_at timestamptz,
  CONSTRAINT token_not_expired CHECK (expires_at > now())
);

ALTER TABLE password_resets ENABLE ROW LEVEL SECURITY;

-- Allow users to read their own reset tokens
CREATE POLICY "Users can read own reset tokens"
  ON password_resets
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

-- Allow users to update their own reset tokens
CREATE POLICY "Users can update own reset tokens"
  ON password_resets
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id);