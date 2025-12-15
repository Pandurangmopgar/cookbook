import { NextRequest, NextResponse } from 'next/server';
import { CATEGORIES } from '@/constants';
import { executeCode } from '@/lib/executor';
import { storeProblemAttempt, storeLearningInsight } from '@/lib/memory';
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
    const { problemId, code, userId, timeSpent = 0, hintsUsed = 0 } = await request.json();

    if (!problemId || !code || !userId) {
      return NextResponse.json(
        { error: 'problemId, code, and userId are required' },
        { status: 400 }
      );
    }

    const result = getProblemById(problemId);
    if (!result) {
      return NextResponse.json({ error: 'Problem not found' }, { status: 404 });
    }
    const { problem, categoryName } = result;

    // Use functionName from problem if available, otherwise extract from code
    const functionName = problem.functionName || extractFunctionName(problem.starterCode);

    // Execute code with test cases
    const execResult = await executeCode(code, functionName, problem.testCases);

    // Store attempt in memory
    const mistakes = execResult.testResults
      ?.filter((t: any) => !t.passed)
      .map((t: any) => `Failed: input ${t.input}`) || [];

    try {
      console.log('Storing problem attempt to MemoryStack...');
      await storeProblemAttempt(userId, {
        problemId,
        timestamp: new Date().toISOString(),
        solved: execResult.success,
        timeSpent,
        hintsUsed,
        mistakes,
        finalCode: code,
      });
      console.log('✅ Problem attempt stored successfully');

      // Store learning insight if solved
      if (execResult.success) {
        console.log('Storing learning insight...');
        await storeLearningInsight(
          userId,
          `Successfully solved ${problem.title} in ${timeSpent}s with ${hintsUsed} hints`,
          categoryName
        );
        console.log('✅ Learning insight stored successfully');
      }
    } catch (memoryError) {
      console.error('❌ Failed to store memory:', memoryError);
      // Continue - don't fail the request just because memory storage failed
    }

    return NextResponse.json(execResult);
  } catch (error) {
    console.error('Execution error:', error);
    return NextResponse.json({ error: 'Execution failed' }, { status: 500 });
  }
}

function extractFunctionName(starterCode: string): string {
  const match = starterCode.match(/def\s+(\w+)\s*\(/);
  return match ? match[1] : 'solution';
}
