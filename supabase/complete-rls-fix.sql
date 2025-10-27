-- Complete fix for user signup RLS issue
-- Run this entire script in Supabase SQL Editor

-- Step 1: Drop ALL existing policies for users table to start fresh
DROP POLICY IF EXISTS "Users can view all profiles" ON public.users;
DROP POLICY IF EXISTS "Users can insert own profile" ON public.users;
DROP POLICY IF EXISTS "Users can update own profile" ON public.users;

-- Step 2: Temporarily disable RLS to clear any issues
ALTER TABLE public.users DISABLE ROW LEVEL SECURITY;

-- Step 3: Re-enable RLS
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

-- Step 4: Create all policies fresh with correct permissions
-- Allow anyone to read profiles (for discovery)
CREATE POLICY "Enable read access for all users"
ON public.users
FOR SELECT
USING (true);

-- CRITICAL: Allow authenticated users to insert their own profile
CREATE POLICY "Enable insert for authenticated users only"
ON public.users
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = id);

-- Allow users to update their own profile
CREATE POLICY "Enable update for users based on id"
ON public.users
FOR UPDATE
TO authenticated
USING (auth.uid() = id)
WITH CHECK (auth.uid() = id);

-- Allow users to delete their own profile
CREATE POLICY "Enable delete for users based on id"
ON public.users
FOR DELETE
TO authenticated
USING (auth.uid() = id);

-- Step 5: Verify the policies are created
SELECT
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd,
    qual,
    with_check
FROM pg_policies
WHERE tablename = 'users'
ORDER BY policyname;

-- Step 6: Test by checking current user
SELECT auth.uid() as current_user_id;