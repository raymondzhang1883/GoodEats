# Supabase Setup Guide for GoodEats!

## Quick Setup

1. Create a new Supabase project at [supabase.com](https://supabase.com)
2. Run the SQL schema from `/supabase/schema.sql`
3. Copy `.env.local.example` to `.env.local` and add your credentials:
   ```
   NEXT_PUBLIC_SUPABASE_URL=your_project_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
   ```

## Database Schema

The main schema file is located at `/supabase/schema.sql`. It includes:

- **Tables**: users, events, rsvps, friendships, meal_plans, posts, comments
- **Row Level Security**: Policies for all tables
- **Triggers**: Automatic attendee counting for events
- **Indexes**: Performance optimizations

## Authentication

- Email/password authentication is enabled by default
- Users table extends Supabase auth.users
- Profile creation happens via trigger when auth user is created

## Row Level Security

All tables have RLS enabled with appropriate policies:
- Users can view all profiles but only edit their own
- Anyone can view events, but only hosts can edit/delete
- Users can manage their own RSVPs
- Friend relationships are private to involved users

## Troubleshooting

### RLS Issues
If you get "new row violates row-level security policy" errors:
1. Ensure the INSERT policy for users table exists
2. The trigger function `handle_new_user()` should be created
3. Check that RLS is enabled on all tables

### Password Reset
To reset a user's password:
1. Go to Authentication → Users in Supabase Dashboard
2. Click the three dots → "Send password reset"
3. Or delete the user and sign up again with new credentials