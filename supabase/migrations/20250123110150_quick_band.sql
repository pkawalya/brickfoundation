/*
  # Fix Admin Authentication

  1. Changes
    - Ensure admin user exists in users table with correct role
    - Set admin role in auth metadata
    - Enable admin user account

  2. Security
    - Only affects single admin account
    - Maintains existing RLS policies
*/

-- First ensure the admin user exists in users table with correct role
INSERT INTO users (id, email, full_name, phone_number, is_active, role)
SELECT 
  id,
  email,
  COALESCE(raw_user_meta_data->>'full_name', 'Admin User'),
  COALESCE(raw_user_meta_data->>'phone_number', '+256000000000'),
  true,
  'admin'
FROM auth.users 
WHERE email = 'appcellon@gmail.com'
ON CONFLICT (email) DO UPDATE
SET 
  role = 'admin',
  is_active = true;

-- Update auth metadata for admin user
UPDATE auth.users
SET raw_app_meta_data = jsonb_build_object(
  'role', 'admin',
  'is_admin', true
)
WHERE email = 'appcellon@gmail.com';