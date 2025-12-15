// Memory integration - gracefully handles missing SDK
let memory: any = null;

try {
  // Try to import MemoryStack SDK if available
  const { MemoryStackClient } = require('@memorystack/sdk');
  memory = new MemoryStackClient({
    apiKey: process.env.MEMORYSTACK_API_KEY || '',
    baseUrl: 'https://memorystack.app',
    agentName: 'coding_tutor',
    agentType: 'educational',
  });
} catch (e) {
  console.log('MemoryStack SDK not available, running without memory features');
}

export interface LearningProfile {
  strengths: string[];
  weaknesses: string[];
  problemsSolved: number;
  totalAttempts: number;
  averageHintsUsed: number;
  preferredHintStyle: 'questions' | 'explanations' | 'examples';
  currentStreak: number;
}

export interface ProblemAttempt {
  problemId: string;
  timestamp: string;
  solved: boolean;
  timeSpent: number;
  hintsUsed: number;
  mistakes: string[];
  finalCode: string;
}

// Store a problem attempt
export async function storeProblemAttempt(
  userId: string,
  attempt: ProblemAttempt
): Promise<void> {
  if (!memory) return;
  
  const content = `Problem attempt: ${attempt.problemId}
Solved: ${attempt.solved}
Time spent: ${attempt.timeSpent} seconds
Hints used: ${attempt.hintsUsed}
${attempt.mistakes.length > 0 ? `Mistakes: ${attempt.mistakes.join(', ')}` : 'No major mistakes'}`;

  try {
    await memory.createMemory({
      messages: [{ role: 'assistant', content }],
      user_id: userId,
      metadata: {
        type: 'problem_attempt',
        problemId: attempt.problemId,
        solved: attempt.solved,
        timeSpent: attempt.timeSpent,
        hintsUsed: attempt.hintsUsed,
        mistakes: attempt.mistakes,
      },
    });
  } catch (e) {
    console.error('Failed to store problem attempt:', e);
  }
}

// Store a learning insight
export async function storeLearningInsight(
  userId: string,
  insight: string,
  category: string
): Promise<void> {
  if (!memory) return;
  
  try {
    await memory.createMemory({
      messages: [{ role: 'assistant', content: `Learning insight for ${category}: ${insight}` }],
      user_id: userId,
      metadata: {
        type: 'learning_insight',
        category,
      },
    });
  } catch (e) {
    console.error('Failed to store learning insight:', e);
  }
}

// Store user's common mistake pattern
export async function storeMistakePattern(
  userId: string,
  problemId: string,
  mistake: string,
  correction: string
): Promise<void> {
  if (!memory) return;
  
  try {
    await memory.createMemory({
      messages: [{ role: 'assistant', content: `Common mistake in ${problemId}: ${mistake}. Correction: ${correction}` }],
      user_id: userId,
      metadata: {
        type: 'mistake_pattern',
        problemId,
        mistake,
        correction,
      },
    });
  } catch (e) {
    console.error('Failed to store mistake pattern:', e);
  }
}

// Get user's learning context for a problem
export async function getLearningContext(
  userId: string,
  problemId: string,
  category: string
): Promise<string> {
  if (!memory) return 'Memory features not available.';
  
  try {
    const results = await memory.searchMemories({
      query: `problem attempt solved learning insight ${category}`,
      user_id: userId,
      limit: 10,
      mode: 'hybrid',
    });

    if (!results.results || results.results.length === 0) {
      return 'This is a new learner with no previous history.';
    }

    const context = results.results
      .map((mem: any) => `• ${mem.content}`)
      .join('\n');

    return context;
  } catch (e) {
    console.error('Failed to get learning context:', e);
    return 'Unable to retrieve learning history.';
  }
}

// Get user's past attempts at a specific problem
export async function getProblemHistory(
  userId: string,
  problemId: string
): Promise<ProblemAttempt[]> {
  if (!memory) return [];
  
  try {
    const results = await memory.searchMemories({
      query: `problem attempt ${problemId}`,
      user_id: userId,
      limit: 5,
      mode: 'hybrid',
    });

    const attempts: ProblemAttempt[] = [];
    for (const mem of results.results || []) {
      if (mem.metadata?.type === 'problem_attempt' && mem.metadata?.problemId === problemId) {
        attempts.push({
          problemId: mem.metadata.problemId,
          timestamp: mem.created_at,
          solved: mem.metadata.solved,
          timeSpent: mem.metadata.timeSpent,
          hintsUsed: mem.metadata.hintsUsed,
          mistakes: mem.metadata.mistakes || [],
          finalCode: '',
        });
      }
    }

    return attempts;
  } catch (e) {
    console.error('Failed to get problem history:', e);
    return [];
  }
}

export { memory };
