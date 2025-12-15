import { NextRequest, NextResponse } from 'next/server';
import { CATEGORIES } from '@/constants';
import { analyzeCode, generateHint } from '@/lib/tutor';
import { getLearningContext } from '@/lib/memory';
import { Problem } from '@/types';

// Get problem from CATEGORIES (same source as frontend)
function getProblemById(id: string): { problem: Problem; categoryName: string } | undefined {
  for (const category of CATEGORIES) {
    const problem = category.problems.find(p => p.id === id);
    if (problem) return { problem, categoryName: category.name };
  }
  return undefined;
}

export async function POST(request: NextRequest) {
  try {
    const { problemId, code, userId, hintIndex = 0, previousHints = [] } = await request.json();

    if (!problemId || !userId) {
      return NextResponse.json(
        { error: 'problemId and userId are required' },
        { status: 400 }
      );
    }

    const result = getProblemById(problemId);
    if (!result) {
      return NextResponse.json({ error: 'Problem not found' }, { status: 404 });
    }
    const { problem, categoryName } = result;

    // Generate AI hint based on code (no static hints in this Problem type)
    const analysis = await analyzeCode(problem, code || problem.starterCode);
    const learningContext = await getLearningContext(userId, problemId, categoryName);
    const hint = await generateHint(problem, code || '', analysis, learningContext, previousHints, categoryName);

    return NextResponse.json({
      hint,
      analysis,
    });
  } catch (error) {
    console.error('Hint error:', error);
    return NextResponse.json({ error: 'Failed to generate hint' }, { status: 500 });
  }
}
