import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Types for our database
export interface UserProfile {
  id: string;
  clerk_user_id: string;
  email: string | null;
  display_name: string | null;
  avatar_url: string | null;
  created_at: string;
  updated_at: string;
}

export interface UserProgress {
  id: string;
  clerk_user_id: string;
  problem_id: string;
  solved: boolean;
  solution_revealed: boolean;
  revealed_at: string | null;
  attempts: number;
  last_code: string | null;
  created_at: string;
  updated_at: string;
}
