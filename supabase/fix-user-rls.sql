-- Fix for user creation RLS policy
-- Run this in Supabase SQL Editor to fix the signup issue

-- Drop existing policy if it exists (safe to run multiple times)
DROP POLICY IF EXISTS "Users can insert own profile" ON public.users;

-- Create policy to allow users to insert their own profile during signup
CREATE POLICY "Users can insert own profile"
ON public.users
FOR INSERT
WITH CHECK (auth.uid() = id);

-- Verify all policies are set correctly
SELECT tablename, policyname, cmd
FROM pg_policies
WHERE tablename = 'users'
ORDER BY policyname;