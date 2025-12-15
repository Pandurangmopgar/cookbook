import { NextRequest, NextResponse } from 'next/server';
import { getProblemById } from '@/lib/problems';
import { analyzeCode, generateHint } from '@/lib/tutor';
import { getLearningContext, storeMistakePattern } from '@/lib/memory';

export async function POST(request: NextRequest) {
  try {
    const { problemId, code, userId, previousHints = [] } = await request.json();

    if (!problemId || !code || !userId) {
      return NextResponse.json(
        { error: 'problemId, code, and userId are required' },
        { status: 400 }
      );
    }

    const problem = getProblemById(problemId);
    if (!problem) {
      return NextResponse.json({ error: 'Problem not found' }, { status: 404 });
    }

    // Analyze the code
    const analysis = await analyzeCode(problem, code);

    // Get learning context from memory
    const learningContext = await getLearningContext(userId, problemId, problem.category);

    // Generate hint if stuck or requested
    let hint = null;
    if (analysis.isStuck || analysis.progress === 'partial') {
      hint = await generateHint(problem, code, analysis, learningContext, previousHints);
    }

    // Store mistake patterns for learning
    for (const issue of analysis.issues) {
      await storeMistakePattern(userId, problemId, issue, '');
    }

    return NextResponse.json({
      analysis,
      hint,
      problemHints: problem.hints,
    });
  } catch (error) {
    console.error('Analysis error:', error);
    return NextResponse.json({ error: 'Analysis failed' }, { status: 500 });
  }
}
