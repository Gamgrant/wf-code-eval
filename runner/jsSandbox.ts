// import ivm from 'isolated-vm';
import vm from 'vm';
import fs from 'fs/promises';
import path from 'path';

export interface TestResult {
  passed: boolean;
  error?: string;
  executionTime: number;
  output?: any; 
  expected?: any; 
}

export interface SnippetResult {
  snippetId: string;
  testResults: TestResult[];
  totalPassed: number;
  totalTests: number;
  passRate: number;
  hadRuntimeError: boolean;
  errorMessage?: string;
}

/**
 * Runs a JavaScript snippet in a sandboxed environment with the given test cases
 * 
 * @param snippetPath - Path to the snippet file to test
 * @param testCases - Array of test cases with input and expected output
 * @param functionName - Name of the function to test
 * @param timeout - Timeout in milliseconds (default 1000ms)
 * @returns Result of running all test cases
 */
export async function runSnippet(
  snippetPath: string,
  testCases: any[],
  functionName: string,
  timeout: number = 4000
): Promise<SnippetResult> {
  const snippetId = path.basename(snippetPath, '.js');
  const results: TestResult[] = [];
  let hadRuntimeError = false;
  let errorMessage: string | undefined;

  const buildArgs = (inp: any): any[] => {
    if (Array.isArray(inp)) return inp;
    if (inp !== null && typeof inp === 'object') return Object.values(inp);
    return [inp];
  };

  try {
    const code = await fs.readFile(snippetPath, 'utf-8');
    const script = new vm.Script(code, { filename: snippetPath });

    for (const testCase of testCases) {
      const startTime = Date.now();
      try {
        const sandbox: any = {
          module: { exports: {} },
          exports: {},
          console,
          setTimeout,
          clearTimeout,
        };
        const context = vm.createContext(sandbox);
        script.runInContext(context, { timeout });
        let fn: any =
          (context as any)[functionName] ??
          (typeof sandbox.module?.exports === 'function'
            ? sandbox.module.exports
            : sandbox.module?.exports?.[functionName]);

        if (typeof fn !== 'function') {
          throw new Error(`Function not found: ${functionName}`);
        }

        const args = buildArgs(testCase.input);
        const out = fn(...args);
        const passed = JSON.stringify(out) === JSON.stringify(testCase.expected);

        results.push({
          passed,
          executionTime: Date.now() - startTime,
          output: out,
          expected: testCase.expected
        });
      } catch (err: any) {
        hadRuntimeError = true;
        errorMessage = err?.message ?? String(err);
        results.push({
        passed: false,
        error: errorMessage,
        executionTime: Date.now() - startTime,
        output: undefined,
        expected: testCase.expected
      });
      }
    }
  } catch (err: any) {
    hadRuntimeError = true;
    errorMessage = err?.message ?? String(err);
    for (let i = 0; i < testCases.length; i++) {
      results.push({
        passed: false,
        error: errorMessage,
        executionTime: 0,
        output: undefined,
        expected: testCases[i]?.expected
      });
    }
  }

  const totalPassed = results.filter(r => r.passed).length;
  const totalTests = results.length;
  
  return {
    snippetId,
    testResults: results,
    totalPassed,
    totalTests,
    passRate: totalTests > 0 ? totalPassed / totalTests : 0,
    hadRuntimeError,
    errorMessage
  };
}

function checkResult(result: any, expected: any, functionName: string): boolean {
  // Simple comparison - candidates can improve this if needed
  return JSON.stringify(result) === JSON.stringify(expected);
}