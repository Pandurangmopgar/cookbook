import { Sandbox } from '@e2b/code-interpreter';

export interface TestCase {
  input: any[];
  expected: any;
  description?: string;
}

export interface ExecutionResult {
  success: boolean;
  output?: string;
  error?: string;
  testResults?: TestResult[];
}

export interface TestResult {
  passed: boolean;
  input: string;
  expected: string;
  actual: string;
  description?: string;
}

export async function executeCode(
  code: string,
  functionName: string,
  testCases: TestCase[]
): Promise<ExecutionResult> {
  const apiKey = process.env.E2B_API_KEY;
  if (!apiKey) {
    return { success: false, error: 'E2B_API_KEY not configured' };
  }

  let sandbox: Sandbox | null = null;

  try {
    sandbox = await Sandbox.create({ apiKey });

    // Build test runner code
    const testCode = buildTestRunner(code, functionName, testCases);
    const execution = await sandbox.runCode(testCode);

    // Parse results
    const output = execution.logs.stdout.join('\n');
    const errors = execution.logs.stderr.join('\n');

    if (execution.error) {
      return {
        success: false,
        error: execution.error.value || execution.error.name || 'Execution error',
        output: errors,
      };
    }

    // Parse test results from output
    const testResults = parseTestResults(output, testCases);
    const allPassed = testResults.every(t => t.passed);

    return {
      success: allPassed,
      output,
      testResults,
    };
  } catch (e: any) {
    return { success: false, error: e.message || 'Execution failed' };
  } finally {
    if (sandbox) {
      try { await sandbox.kill(); } catch {}
    }
  }
}


function buildTestRunner(code: string, functionName: string, testCases: TestCase[]): string {
  const testCasesJson = JSON.stringify(testCases);
  
  return `
${code}

import json

test_cases = json.loads('''${testCasesJson}''')
results = []

# Check if Solution class exists and instantiate it
solution = None
if 'Solution' in dir():
    solution = Solution()

for i, tc in enumerate(test_cases):
    try:
        args = tc['input']
        expected = tc['expected']
        
        # Try calling as class method first, then as standalone function
        if solution and hasattr(solution, '${functionName}'):
            actual = getattr(solution, '${functionName}')(*args)
        else:
            actual = ${functionName}(*args)
        
        passed = actual == expected
        results.append({
            'index': i,
            'passed': passed,
            'expected': str(expected),
            'actual': str(actual)
        })
        status = '✓' if passed else '✗'
        print(f"Test {i+1}: {status}")
        if not passed:
            print(f"  Input: {args}")
            print(f"  Expected: {expected}")
            print(f"  Got: {actual}")
    except Exception as e:
        results.append({
            'index': i,
            'passed': False,
            'expected': str(tc['expected']),
            'actual': f'Error: {str(e)}'
        })
        print(f"Test {i+1}: ✗ Error: {e}")

passed = sum(1 for r in results if r['passed'])
total = len(results)
print(f"\\nResults: {passed}/{total} tests passed")
print("__RESULTS__" + json.dumps(results))
`;
}

function parseTestResults(output: string, testCases: TestCase[]): TestResult[] {
  // Try to parse JSON results
  const resultsMatch = output.match(/__RESULTS__(.+)/);
  if (resultsMatch) {
    try {
      const parsed = JSON.parse(resultsMatch[1]);
      return parsed.map((r: any, i: number) => ({
        passed: r.passed,
        input: JSON.stringify(testCases[i]?.input || []),
        expected: r.expected,
        actual: r.actual,
        description: testCases[i]?.description,
      }));
    } catch {}
  }

  // Fallback: parse from output text
  return testCases.map((tc, i) => ({
    passed: output.includes(`Test ${i + 1}: ✓`),
    input: JSON.stringify(tc.input),
    expected: JSON.stringify(tc.expected),
    actual: 'See output',
    description: tc.description,
  }));
}
