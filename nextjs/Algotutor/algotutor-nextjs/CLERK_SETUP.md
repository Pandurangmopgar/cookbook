# Clerk Authentication Setup Guide

This guide explains how to set up Clerk authentication for AlgoTutor.

## Overview

AlgoTutor now uses **Clerk** for authentication instead of Supabase Auth. User profiles are automatically created in the Supabase `user_profiles` table when users sign in.

## Prerequisites

1. A Clerk account (sign up at https://clerk.com)
2. Supabase database for storing user profiles and progress

## Setup Steps

### 1. Create a Clerk Application

1. Go to https://dashboard.clerk.com
2. Click "Add application"
3. Choose your application name (e.g., "AlgoTutor")
4. Select authentication methods:
   - Email/Password
   - Google OAuth (recommended)
   - GitHub OAuth (optional)
5. Click "Create application"

### 2. Get Your Clerk Keys

After creating your application:

1. Go to "API Keys" in the Clerk dashboard
2. Copy your keys:
   - `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`
   - `CLERK_SECRET_KEY`

### 3. Update Environment Variables

Add your Clerk keys to `.env.local`:

```env
# Clerk Authentication
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_your_key_here
CLERK_SECRET_KEY=sk_test_your_secret_key_here
```

### 4. Database Setup

Ensure your Supabase database has the `user_profiles` table:

```sql
CREATE TABLE IF NOT EXISTS user_profiles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id TEXT UNIQUE NOT NULL,
  email TEXT,
  display_name TEXT,
  avatar_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index for faster lookups
CREATE INDEX idx_user_profiles_user_id ON user_profiles(user_id);
```

Also ensure you have the `user_progress` table:

```sql
CREATE TABLE IF NOT EXISTS user_progress (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id TEXT NOT NULL,
  problem_id TEXT NOT NULL,
  last_code TEXT,
  solved BOOLEAN DEFAULT FALSE,
  attempts INTEGER DEFAULT 0,
  solution_revealed BOOLEAN DEFAULT FALSE,
  revealed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, problem_id)
);

-- Index for faster lookups
CREATE INDEX idx_user_progress_user_id ON user_progress(user_id);
CREATE INDEX idx_user_progress_problem_id ON user_progress(problem_id);
```

### 5. Configure Clerk Settings (Optional)

In your Clerk dashboard, you can customize:

1. **Appearance**: Match your app's theme
2. **Email Templates**: Customize verification emails
3. **Social Connections**: Add more OAuth providers
4. **Session Settings**: Configure session duration

## How It Works

### Authentication Flow

1. User clicks "Sign In" button
2. Clerk modal appears with sign-in/sign-up options
3. User authenticates via email/password or OAuth
4. On successful authentication:
   - Clerk creates/updates the user session
   - AuthContext automatically creates a profile in `user_profiles` table
   - User can now save code progress and view solutions

### User Profile Creation

When a user signs in for the first time, the `AuthContext` automatically:

1. Checks if a profile exists in `user_profiles`
2. If not, creates a new profile with:
   - `user_id`: Clerk user ID
   - `email`: User's email
   - `display_name`: User's first name or email prefix
   - `avatar_url`: User's profile image from Clerk

### Code Progress Tracking

- Code is auto-saved every 3 seconds when user is signed in
- Progress is stored in `user_progress` table with Clerk user ID
- Users can switch problems and their code is preserved
- Solution reveals are tracked per user per problem

## Features

### What Users Get

- ✅ Email/password authentication
- ✅ Google OAuth (if enabled)
- ✅ Automatic profile creation
- ✅ Code progress persistence
- ✅ Solution reveal tracking
- ✅ Secure session management

### What You Get

- ✅ No auth code to maintain
- ✅ Built-in security features
- ✅ User management dashboard
- ✅ Analytics and insights
- ✅ Easy OAuth provider setup

## Testing

1. Start your development server:
   ```bash
   npm run dev
   ```

2. Click "Sign In" button
3. Create a test account
4. Verify:
   - Profile created in `user_profiles` table
   - Code saves automatically
   - Progress persists across sessions
   - Solution reveals are tracked

## Troubleshooting

### "Clerk keys not found"
- Ensure `.env.local` has both Clerk keys
- Restart your dev server after adding keys

### "Profile not created"
- Check Supabase connection
- Verify `user_profiles` table exists
- Check browser console for errors

### "Sign in modal not appearing"
- Verify Clerk keys are correct
- Check that ClerkProvider wraps your app in layout.tsx

## Migration from Supabase Auth

If you're migrating from Supabase Auth:

1. Export existing users from Supabase
2. Import users to Clerk (contact Clerk support)
3. Update `user_id` references in database to use Clerk IDs
4. Test authentication flow

## Production Deployment

1. Create a production Clerk application
2. Update environment variables in your hosting platform
3. Configure allowed domains in Clerk dashboard
4. Test authentication in production

## Support

- Clerk Documentation: https://clerk.com/docs
- Clerk Discord: https://clerk.com/discord
- Supabase Documentation: https://supabase.com/docs

## Security Notes

- Never commit `.env.local` to version control
- Use different Clerk apps for development and production
- Regularly rotate your secret keys
- Enable MFA for admin accounts
