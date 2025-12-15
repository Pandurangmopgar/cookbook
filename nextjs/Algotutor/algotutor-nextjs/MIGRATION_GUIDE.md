# Migration Guide: Supabase Auth → Clerk Auth

This guide explains the changes made to migrate from Supabase Auth to Clerk Auth.

## What Changed?

### Authentication Provider
- **Before**: Supabase Auth
- **After**: Clerk Auth

### Database
- **Before**: Supabase for both auth and database
- **After**: Clerk for auth, Supabase for database only

## Why Clerk?

1. **Better Developer Experience**: Pre-built UI components, easier setup
2. **More Auth Options**: Easy OAuth integration (Google, GitHub, etc.)
3. **Better Security**: Built-in security features and compliance
4. **User Management**: Dashboard for managing users
5. **No Auth Code**: Less code to maintain

## Files Changed

### 1. `src/contexts/AuthContext.tsx`
- Replaced Supabase auth hooks with Clerk hooks
- Simplified auth state management
- Removed manual sign-in/sign-up functions (Clerk handles this)

### 2. `src/components/AuthModal.tsx`
- Replaced custom form with Clerk's `<SignIn>` and `<SignUp>` components
- Removed manual form validation
- Clerk handles all auth UI and logic

### 3. `src/app/layout.tsx`
- Added `ClerkProvider` wrapper
- Kept `AuthProvider` for app-specific auth logic

### 4. `src/middleware.ts` (New)
- Added Clerk middleware for route protection
- Configures public vs protected routes

### 5. `.env.local`
- Added Clerk keys
- Kept Supabase keys for database access

### 6. `src/hooks/useCodeProgress.ts`
- No changes needed! Still uses `useAuth()` hook
- User ID now comes from Clerk instead of Supabase

### 7. `src/components/SolutionReveal.tsx`
- No changes needed! Still uses `useAuth()` hook

## Database Schema

No changes needed! The `user_profiles` and `user_progress` tables remain the same:

```sql
-- user_profiles table
CREATE TABLE user_profiles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id TEXT UNIQUE NOT NULL,  -- Now stores Clerk user ID
  email TEXT,
  display_name TEXT,
  avatar_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- user_progress table (unchanged)
CREATE TABLE user_progress (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id TEXT NOT NULL,  -- Now stores Clerk user ID
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
```

## User Experience Changes

### Before (Supabase Auth)
1. User clicks "Sign In"
2. Custom modal with email/password form
3. Manual form validation
4. Email verification required
5. Manual error handling

### After (Clerk Auth)
1. User clicks "Sign In"
2. Clerk modal with multiple options:
   - Email/password
   - Google OAuth
   - Magic link
   - More options available
3. Automatic validation
4. Flexible verification options
5. Better error messages

## Migration Steps for Existing Users

If you have existing users in Supabase Auth:

### Option 1: Fresh Start (Recommended for Development)
1. Clear existing auth data
2. Users create new accounts with Clerk
3. Old progress data remains (linked by email if needed)

### Option 2: User Migration (Production)
1. Export users from Supabase Auth
2. Contact Clerk support for bulk user import
3. Map Supabase user IDs to Clerk user IDs
4. Update `user_id` in database tables

### Option 3: Dual Auth (Temporary)
1. Keep both auth systems running
2. Gradually migrate users
3. Deprecate Supabase Auth after migration

## Testing Checklist

- [ ] Sign up with email/password works
- [ ] Sign in with email/password works
- [ ] Google OAuth works (if enabled)
- [ ] User profile created in database
- [ ] Code saves correctly
- [ ] Code persists across sessions
- [ ] Solution reveals are tracked
- [ ] Sign out works
- [ ] Protected routes work
- [ ] Public routes accessible

## Rollback Plan

If you need to rollback to Supabase Auth:

1. Restore these files from git:
   - `src/contexts/AuthContext.tsx`
   - `src/components/AuthModal.tsx`
   - `src/app/layout.tsx`
2. Delete `src/middleware.ts`
3. Remove Clerk keys from `.env.local`
4. Run `npm install` to ensure dependencies
5. Restart dev server

## Benefits of Migration

### For Developers
- ✅ Less auth code to maintain
- ✅ Pre-built UI components
- ✅ Better documentation
- ✅ Easier OAuth setup
- ✅ Built-in user management

### For Users
- ✅ More sign-in options
- ✅ Better security
- ✅ Faster authentication
- ✅ Better error messages
- ✅ Modern UI

## Common Issues

### Issue: "Clerk keys not found"
**Solution**: Add Clerk keys to `.env.local` and restart server

### Issue: "Profile not created"
**Solution**: Check Supabase connection and table schema

### Issue: "Sign in modal not appearing"
**Solution**: Verify ClerkProvider wraps app in layout.tsx

### Issue: "OAuth not working"
**Solution**: Configure OAuth providers in Clerk dashboard

## Support

- Clerk Documentation: https://clerk.com/docs
- Clerk Discord: https://clerk.com/discord
- Migration Support: support@clerk.com

## Next Steps

1. Test authentication flow
2. Configure OAuth providers
3. Customize Clerk appearance
4. Set up production environment
5. Monitor user sign-ups

## Conclusion

The migration to Clerk simplifies authentication while maintaining all existing functionality. User data and progress remain intact, and the overall user experience is improved.
