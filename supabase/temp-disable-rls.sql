-- Temporary solution: Disable RLS for testing
-- WARNING: Only use this for development/testing!

-- Disable RLS on users table
ALTER TABLE public.users DISABLE ROW LEVEL SECURITY;

-- Verify RLS is disabled
SELECT tablename, rowsecurity
FROM pg_tables
WHERE schemaname = 'public' AND tablename = 'users';

-- You should see rowsecurity = false

-- IMPORTANT: To re-enable RLS after testing, run:
-- ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;