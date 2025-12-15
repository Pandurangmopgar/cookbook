'use client';

import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase';

interface CodeProgress {
  last_code: string | null;
  solved: boolean;
  attempts: number;
  solution_revealed: boolean;
}

export function useCodeProgress(problemId: string) {
  const { user } = useAuth();
  const [progress, setProgress] = useState<CodeProgress | null>(null);
  const [loading, setLoading] = useState(true);

  // Load progress when user or problem changes
  useEffect(() => {
    if (!user || !problemId) {
      setProgress(null);
      setLoading(false);
      return;
    }

    loadProgress();
  }, [user, problemId]);

  const loadProgress = async () => {
    if (!user) return;
    
    setLoading(true);
    const { data, error } = await supabase
      .from('user_progress')
      .select('last_code, solved, attempts, solution_revealed')
      .eq('clerk_user_id', user.id)
      .eq('problem_id', problemId)
      .single();

    if (!error && data) {
      setProgress(data);
    } else {
      setProgress(null);
    }
    setLoading(false);
  };

  // Save code progress (debounced - call this on code change)
  const saveCode = useCallback(async (code: string) => {
    if (!user || !problemId) return;

    await supabase
      .from('user_progress')
      .upsert({
        clerk_user_id: user.id,
        problem_id: problemId,
        last_code: code,
        updated_at: new Date().toISOString()
      }, {
        onConflict: 'clerk_user_id,problem_id'
      });
  }, [user, problemId]);

  // Mark problem as solved
  const markSolved = useCallback(async () => {
    if (!user || !problemId) return;

    await supabase
      .from('user_progress')
      .upsert({
        clerk_user_id: user.id,
        problem_id: problemId,
        solved: true,
        updated_at: new Date().toISOString()
      }, {
        onConflict: 'clerk_user_id,problem_id'
      });

    setProgress(prev => prev ? { ...prev, solved: true } : null);
  }, [user, problemId]);

  // Increment attempts
  const incrementAttempts = useCallback(async () => {
    if (!user || !problemId) return;

    const currentAttempts = progress?.attempts || 0;
    
    await supabase
      .from('user_progress')
      .upsert({
        clerk_user_id: user.id,
        problem_id: problemId,
        attempts: currentAttempts + 1,
        updated_at: new Date().toISOString()
      }, {
        onConflict: 'clerk_user_id,problem_id'
      });

    setProgress(prev => prev ? { ...prev, attempts: currentAttempts + 1 } : null);
  }, [user, problemId, progress?.attempts]);

  return {
    progress,
    loading,
    saveCode,
    markSolved,
    incrementAttempts,
    savedCode: progress?.last_code || null
  };
}
