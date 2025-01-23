/*
  # Set up admin user and fix auth flows

  1. Changes
    - Set appcellon@gmail.com as admin user
    - Update user role to admin
  
  2. Security
    - Maintains existing RLS policies
*/

-- Set user as admin
UPDATE users 
SET role = 'admin'
WHERE email = 'appcellon@gmail.com';