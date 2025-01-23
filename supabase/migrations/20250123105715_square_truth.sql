/*
  # Set admin password and role

  1. Changes
    - Updates admin user role and metadata
    - Note: Password must be reset through the UI since direct password updates 
      are not supported through migrations for security reasons
    
  2. Security
    - Sets admin role and metadata securely
*/

-- Update user role and metadata for admin
UPDATE auth.users
SET raw_app_meta_data = raw_app_meta_data || 
  jsonb_build_object(
    'role', 'admin',
    'is_admin', true
  )
WHERE email = 'appcellon@gmail.com';

-- Ensure admin role is set in users table
UPDATE users
SET role = 'admin'
WHERE email = 'appcellon@gmail.com';