import { NextRequest, NextResponse } from 'next/server';
import { getLearningProfile, getProblemHistory } from '@/lib/memory';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const userId = searchParams.get('userId');
  const problemId = searchParams.get('problemId');

  if (!userId) {
    return NextResponse.json({ error: 'userId is required' }, { status: 400 });
  }

  try {
    // Get problem-specific history
    if (problemId) {
      const history = await getProblemHistory(userId, problemId);
      return NextResponse.json({ history });
    }

    // Get overall learning profile
    const profile = await getLearningProfile(userId);
    return NextResponse.json({ profile });
  } catch (error) {
    console.error('Progress error:', error);
    return NextResponse.json({ error: 'Failed to get progress' }, { status: 500 });
  }
}
