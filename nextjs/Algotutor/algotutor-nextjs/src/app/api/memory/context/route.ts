import { NextRequest, NextResponse } from 'next/server';
import { getLearningContext, getProblemHistory, storeLearningInsight } from '@/lib/memory';

// GET - Fetch learning context from MemoryStack
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    const problemId = searchParams.get('problemId');
    const category = searchParams.get('category');
    const query = searchParams.get('query');

    if (!userId) {
      return NextResponse.json({ error: 'userId is required' }, { status: 400 });
    }

    // Fetch general learning context
    const context = await getLearningContext(
      userId,
      problemId || '',
      category || ''
    );

    // Fetch problem-specific history if problemId provided
    let problemHistory = null;
    if (problemId) {
      const attempts = await getProblemHistory(userId, problemId);
      if (attempts.length > 0) {
        problemHistory = {
          totalAttempts: attempts.length,
          solved: attempts.some(a => a.solved),
          lastAttempt: attempts[0]?.timestamp,
          averageHintsUsed: attempts.reduce((sum, a) => sum + a.hintsUsed, 0) / attempts.length,
          commonMistakes: Array.from(new Set(attempts.flatMap(a => a.mistakes))),
        };
      }
    }

    console.log(`📚 Learning context for ${userId}:`, context.substring(0, 100));

    return NextResponse.json({
      context,
      problemHistory,
      query,
    });
  } catch (error: any) {
    console.error('Error fetching learning context:', error);
    return NextResponse.json({
      context: 'Unable to fetch learning history.',
      error: error.message,
    });
  }
}

// POST - Store learning insight to MemoryStack
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { userId, insight, category } = body;

    if (!userId || !insight) {
      return NextResponse.json(
        { error: 'userId and insight are required' },
        { status: 400 }
      );
    }

    await storeLearningInsight(userId, insight, category || 'general');

    console.log(`💾 Stored insight for ${userId}: ${insight.substring(0, 50)}...`);

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Error storing learning insight:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
