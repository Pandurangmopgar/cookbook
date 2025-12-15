'use client';

import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase';

export function useSolvedProblems() {
  const { user } = useAuth();
  const [solvedProblems, setSolvedProblems] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);

  // Load all solved problems when user changes
  useEffect(() => {
    if (!user) {
      setSolvedProblems(new Set());
      setLoading(false);
      return;
    }

    loadSolvedProblems();
  }, [user]);

  const loadSolvedProblems = async () => {
    if (!user) return;
    
    setLoading(true);
    const { data, error } = await supabase
      .from('user_progress')
      .select('problem_id')
      .eq('clerk_user_id', user.id)
      .eq('solved', true);

    if (!error && data) {
      setSolvedProblems(new Set(data.map(d => d.problem_id)));
    }
    setLoading(false);
  };

  // Add a problem to solved set (called when user solves a problem)
  const addSolved = useCallback((problemId: string) => {
    setSolvedProblems(prev => new Set([...prev, problemId]));
  }, []);

  // Check if a problem is solved
  const isSolved = useCallback((problemId: string) => {
    return solvedProblems.has(problemId);
  }, [solvedProblems]);

  return {
    solvedProblems,
    loading,
    isSolved,
    addSolved,
    refresh: loadSolvedProblems,
    count: solvedProblems.size
  };
}
