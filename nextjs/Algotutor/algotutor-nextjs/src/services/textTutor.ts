import { Problem } from "@/types";

export interface AIFeedback {
  feedback: string;
  type: 'progress' | 'warning' | 'suggestion' | 'encouragement' | 'question';
  approach: string | null;
  progress_percent: number;
  next_hint?: string;
}

function getOrCreateUserId(): string {
  if (typeof window === 'undefined') return 'user_temp';
  const stored = localStorage.getItem('ai_tutor_user_id');
  if (stored) return stored;
  const newId = `user_${Math.random().toString(36).slice(2, 9)}`;
  localStorage.setItem('ai_tutor_user_id', newId);
  return newId;
}

export async function analyzeCodeRealtime(
  code: string,
  previousCode: string,
  problem: Problem
): Promise<AIFeedback> {
  // Skip if code is just starter code
  if (code.trim() === problem.starterCode.trim()) {
    return {
      feedback: "Start typing your solution! I'm watching and will help as you code.",
      type: 'encouragement',
      approach: null,
      progress_percent: 0,
    };
  }

  try {
    const userId = getOrCreateUserId();
    const response = await fetch('/api/realtime', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        problemId: problem.id,
        code,
        previousCode,
        userId,
      }),
    });

    const data = await response.json();
    return {
      feedback: data.feedback || '',
      type: data.type || 'encouragement',
      approach: data.approach || null,
      progress_percent: data.progress_percent || 0,
      next_hint: data.next_hint || null,
    };
  } catch (error) {
    console.error('Realtime analysis error:', error);
    return {
      feedback: '',
      type: 'encouragement',
      approach: null,
      progress_percent: 0,
    };
  }
}

export async function getTextHint(
  code: string,
  problem: Problem,
  hintIndex: number,
  previousHints: string[]
): Promise<{ hint: string; type: string }> {
  try {
    const userId = getOrCreateUserId();
    const response = await fetch('/api/hint', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        problemId: problem.id,
        code,
        userId,
        hintIndex,
        previousHints,
      }),
    });

    const data = await response.json();
    return {
      hint: data.hint?.content || data.hint?.hint || 'Think about the problem step by step.',
      type: data.hint?.type || 'encouragement',
    };
  } catch (error) {
    console.error('Hint generation error:', error);
    return { hint: 'Keep going! Think about the problem step by step.', type: 'encouragement' };
  }
}


export async function executeCode(
  code: string,
  problem: Problem,
  timeSpent: number = 0,
  hintsUsed: number = 0
): Promise<{ success: boolean; testResults?: any[]; error?: string }> {
  try {
    const userId = getOrCreateUserId();
    const response = await fetch('/api/execute', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        problemId: problem.id,
        code,
        userId,
        timeSpent,
        hintsUsed,
      }),
    });

    const data = await response.json();
    return {
      success: data.success || false,
      testResults: data.testResults,
      error: data.error,
    };
  } catch (error) {
    console.error('Code execution error:', error);
    return { success: false, error: 'Failed to execute code' };
  }
}
