import ivm from 'isolated-vm';
import fs from 'fs/promises';
import path from 'path';

export interface TestResult {
  passed: boolean;
  error?: string;
  executionTime: number;
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
  timeout: number = 1000
): Promise<SnippetResult> {
  const snippetId = path.basename(snippetPath, '.js');
  const results: TestResult[] = [];
  let hadRuntimeError = false;
  let errorMessage: string | undefined;

  try {
    const code = await fs.readFile(snippetPath, 'utf-8');
    
    // Create a new isolate with memory limit
    const isolate = new ivm.Isolate({ memoryLimit: 128 });
    
    for (const testCase of testCases) {
      const startTime = Date.now();
      
      try {
        // Create a new context for each test
        const context = await isolate.createContext();
        
        // Compile and run the snippet code
        const script = await isolate.compileScript(code);
        await script.run(context);
        
        // Prepare the test execution code
        const testCode = `
          const result = ${functionName}(${JSON.stringify(testCase.input).slice(1, -1)});
          JSON.stringify(result);
        `;
        
        // Run the test with timeout
        const testScript = await isolate.compileScript(testCode);
        const resultJson = await testScript.run(context, { timeout });
        const result = JSON.parse(resultJson);
        
        // Check if result matches expected
        const passed = checkResult(result, testCase.expected, functionName);
        
        results.push({
          passed,
          executionTime: Date.now() - startTime
        });
      } catch (error: any) {
        hadRuntimeError = true;
        errorMessage = error.message;
        results.push({
          passed: false,
          error: error.message,
          executionTime: Date.now() - startTime
        });
      }
    }
    
    // Clean up isolate
    isolate.dispose();
  } catch (error: any) {
    // File read error or compilation error
    hadRuntimeError = true;
    errorMessage = error.message;
    
    // Mark all tests as failed
    for (const _ of testCases) {
      results.push({
        passed: false,
        error: errorMessage,
        executionTime: 0
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