-- Reset password for a user
-- Run this in Supabase SQL Editor

-- First, check if the user exists
SELECT id, email, created_at, last_sign_in_at
FROM auth.users
WHERE email = 'raymond.zhang@utexas.edu';

-- If the user exists, you can:
-- 1. Delete and recreate the user (easiest for testing)
-- 2. Or use Supabase Dashboard to send password reset email

-- Option 1: Delete the user (uncomment to use)
-- DELETE FROM auth.users WHERE email = 'raymond.zhang@utexas.edu';
-- Then sign up again with a new password

-- Option 2: Check profile in public.users table
SELECT * FROM public.users WHERE email = 'raymond.zhang@utexas.edu';

-- Option 3: Create a new test user directly (uncomment and modify)
-- INSERT INTO auth.users (
--   instance_id,
--   id,
--   aud,
--   role,
--   email,
--   encrypted_password,
--   email_confirmed_at,
--   created_at,
--   updated_at,
--   raw_app_meta_data,
--   raw_user_meta_data
-- ) VALUES (
--   '00000000-0000-0000-0000-000000000000',
--   gen_random_uuid(),
--   'authenticated',
--   'authenticated',
--   'test@example.com',
--   crypt('password123', gen_salt('bf')),
--   now(),
--   now(),
--   now(),
--   '{"provider":"email","providers":["email"]}',
--   '{}'
-- );