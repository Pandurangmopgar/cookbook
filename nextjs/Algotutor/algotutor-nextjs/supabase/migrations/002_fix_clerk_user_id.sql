-- Drop existing tables and recreate with TEXT user_id for Clerk
DROP TABLE IF EXISTS user_progress CASCADE;
DROP TABLE IF EXISTS user_profiles CASCADE;

-- Create user_profiles table for Clerk users (user_id is TEXT, not UUID)
CREATE TABLE user_profiles (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  clerk_user_id TEXT NOT NULL UNIQUE,
  email TEXT,
  display_name TEXT,
  avatar_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_user_profiles_clerk_user_id ON user_profiles(clerk_user_id);

-- Create user_progress table for tracking problem progress
CREATE TABLE user_progress (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  clerk_user_id TEXT NOT NULL,
  problem_id TEXT NOT NULL,
  solved BOOLEAN DEFAULT FALSE,
  solution_revealed BOOLEAN DEFAULT FALSE,
  revealed_at TIMESTAMPTZ,
  attempts INTEGER DEFAULT 0,
  last_code TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(clerk_user_id, problem_id)
);

CREATE INDEX idx_user_progress_clerk_user_id ON user_progress(clerk_user_id);
CREATE INDEX idx_user_progress_problem_id ON user_progress(problem_id);

-- Disable RLS for now (Clerk handles auth, not Supabase)
ALTER TABLE user_profiles DISABLE ROW LEVEL SECURITY;
ALTER TABLE user_progress DISABLE ROW LEVEL SECURITY;
