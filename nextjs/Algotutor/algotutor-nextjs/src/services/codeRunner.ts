import { Problem } from "@/types";

export interface TestCaseResult {
  passed: boolean;
  input: any;
  expected: any;
  actual: any;
}

export interface CodeRunResult {
  passed: boolean;
  results: string;
  testCaseResults?: TestCaseResult[];
}

function getOrCreateUserId(): string {
  if (typeof window === 'undefined') return 'user_temp';
  const stored = localStorage.getItem('ai_tutor_user_id');
  if (stored) return stored;
  const newId = `user_${Math.random().toString(36).slice(2, 9)}`;
  localStorage.setItem('ai_tutor_user_id', newId);
  return newId;
}

// Async version that uses E2B via Next.js API (also stores memories!)
export const runUserCodeAsync = async (code: string, problem: Problem): Promise<CodeRunResult> => {
  // Check if it's Python code
  if (code.includes('class Solution:') || code.includes('def ')) {
    try {
      const userId = getOrCreateUserId();
      
      // Call the Next.js API route which uses E2B AND stores memories
      const response = await fetch('/api/execute', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          problemId: problem.id,
          code,
          userId,
          timeSpent: 0, // Could track this in the UI
          hintsUsed: 0, // Could track this in the UI
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || `Server error: ${response.status}`);
      }

      const result = await response.json();
      
      // Parse test results into structured format
      const testResults = result.testResults || [];
      const testCaseResults: TestCaseResult[] = testResults.map((t: any) => ({
        passed: t.passed,
        input: t.input,
        expected: t.expected,
        actual: t.actual
      }));
      
      return {
        passed: result.success,
        results: result.output || 'Execution complete',
        testCaseResults
      };
    } catch (error: any) {
      return {
        passed: false,
        results: `Execution Error: ${error.message}`
      };
    }
  }

  // For JavaScript, use local execution
  return runUserCode(code, problem);
};

// Sync version for local JS execution (original)
export const runUserCode = (code: string, problem: Problem): CodeRunResult => {
  try {
    // Basic safety check
    if (code.includes('process') || code.includes('fetch') || code.includes('window') || code.includes('document')) {
      return { passed: false, results: "Security Error: Code contains restricted keywords." };
    }

    // Check for Python syntax - suggest using async version
    if (code.includes('class Solution:') || code.includes('def ')) {
      return {
        passed: true,
        results: "Python code detected. Click 'Run Code' to execute with E2B, or ask Algo to check your code!"
      };
    }

    // Wrap code to extract the function
    // eslint-disable-next-line no-new-func
    const userFn = new Function(`
      ${code}
      if (typeof ${problem.functionName} === 'function') return ${problem.functionName};
      return null;
    `)();

    if (typeof userFn !== 'function') {
      return { passed: false, results: `Error: Could not find the '${problem.functionName}' function.` };
    }

    const results = [];
    let allPassed = true;

    const testCaseResults: TestCaseResult[] = [];
    
    for (const testCase of problem.testCases) {
      try {
        const inputArgs = JSON.parse(JSON.stringify(testCase.input));
        const expected = testCase.expected;
        
        const actual = userFn(...inputArgs);
        
        const passed = JSON.stringify(actual) === JSON.stringify(expected);
        if (!passed) allPassed = false;
        
        testCaseResults.push({
          passed,
          input: testCase.input,
          expected,
          actual
        });
        
        results.push(
          `Input: ${JSON.stringify(testCase.input)} | Expected: ${JSON.stringify(expected)} | Got: ${JSON.stringify(actual)} | ${passed ? '✅' : '❌'}`
        );
      } catch (err: any) {
        allPassed = false;
        testCaseResults.push({
          passed: false,
          input: testCase.input,
          expected: testCase.expected,
          actual: `Error: ${err.message}`
        });
        results.push(`Input: ${JSON.stringify(testCase.input)} | Error: ${err.message} ❌`);
      }
    }

    return {
      passed: allPassed,
      results: results.join('\n'),
      testCaseResults
    };

  } catch (e: any) {
    return { passed: false, results: `Syntax/Runtime Error: ${e.message}` };
  }
};
