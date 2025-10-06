import { NextRequest, NextResponse } from 'next/server';
import { deepParseJson, resolvePath } from '@/lib/utils/path-resolver';
import { assertionOperators, operatorsWithNoExpected } from '@/lib/utils/assertion-operators';
import assertions from '@/data/assertions.json';

// Type for assertions data
type AssertionsData = {
  [key: string]: {
    prompt: string;
    assertions: Array<{
      title?: string;
      operator: string;
      path?: string;
      paths?: Record<string, string>;
      expected: any;
      options?: any;
    }>;
  };
};

// Type for assertion result
type AssertionResult = {
  operator: string;
  passed?: boolean;
  error: string | null;
  actual: any;
  expected: any;
  executionTime?: number;
  result?: string;
  score?: number;
  details?: {
    criteria: Record<string, number>;
    overall: number;
    hard_rules_triggered: string[];
    rationale: string;
  };
};

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const taskId = formData.get('taskId') as string;
    const assertion = formData.get('assertion') as string;
    const localStorageDumpFile = formData.get('localStorageDump') as File;
    const modelResponse = formData.get('modelResponse') as string;

    if (!taskId) {
      return NextResponse.json({ error: 'taskId is required' }, { status: 400 });
    }

    if (!localStorageDumpFile) {
      return NextResponse.json({ error: 'localStorageDump is required' }, { status: 400 });
    }

    // Check if task exists in assertions.json
    const assertionsData = assertions as AssertionsData;
    if (!assertionsData[taskId]) {
      return NextResponse.json({ error: 'Task not found' }, { status: 404 });
    }

    // Read the localStorage dump file
    const localStorageDumpReq = await localStorageDumpFile.text();

    try {
      // Parse localStorage dump
      let localStorageDump;
      try {
        localStorageDump = deepParseJson(localStorageDumpReq);
      } catch (error) {
        return NextResponse.json(
          { error: 'Invalid localStorageDump JSON format' },
          { status: 400 }
        );
      }

      // Get actual state for a single assertion only - used for sub-checks in the /verify_raw route
      if (assertion) {
        const { operator, path, paths, expected, options = {} } = JSON.parse(assertion);

        let result: AssertionResult = {
          operator,
          passed: false,
          error: null,
          actual: null,
          expected: expected,
          executionTime: 0,
        };

        try {
          if (!operator || !(operator in assertionOperators)) {
            throw new Error(`Unknown operator: ${operator}`);
          }

          let actualValue;
          const startTime = Date.now();

          if (operator === 'LLM_RUBRIC_JUDGE') {
            // For LLM_RUBRIC_JUDGE, use the modelResponse as the actual value
            if (!modelResponse) {
              throw new Error('Model response is required for LLM_RUBRIC_JUDGE operator');
            }
            actualValue = modelResponse;
          } else {
            if (path) {
              actualValue = resolvePath(localStorageDump, path);
            } else if (paths && typeof paths === 'object') {
              actualValue = {} as Record<string, any>;
              for (const [key, pathValue] of Object.entries(paths)) {
                actualValue[key] = resolvePath(localStorageDump, pathValue as string);
              }
            } else {
              throw new Error("Either 'path' or 'paths' must be specified");
            }
          }

          result.actual = actualValue;
          if (!actualValue && !operatorsWithNoExpected.includes(operator)) {
            result.error =
              'No actual value found, which means the proper sub-check is not completed.';
          }

          if (operator === 'LLM_RUBRIC_JUDGE') {
            // For LLM_RUBRIC_JUDGE, the operator returns the full response object
            const llmResponse = await (assertionOperators as any)[operator](
              actualValue,
              expected,
              options
            );
            result.actual = llmResponse.actual || actualValue;
            result.expected = llmResponse.expected || expected;
            result.passed = llmResponse.result === 'pass';
            result.result = llmResponse.result;
            result.score = llmResponse.score;
            result.details = llmResponse.details;
            result.error = llmResponse.error;
          } else {
            result.passed = (assertionOperators as any)[operator](actualValue, expected, options);
          }

          result.executionTime = Date.now() - startTime;
        } catch (error) {
          result.error = (error as Error).message;
          result.passed = false;
        }

        result.result = result.passed ? 'pass' : 'fail';
        delete result.passed;

        return NextResponse.json(result);
      }

      const task = assertionsData[taskId];
      const processedAssertions: AssertionResult[] = [];

      // Process each assertion
      for (const _assertion of task.assertions) {
        const { operator, path, paths, expected, options = {} } = _assertion;

        let result: AssertionResult = {
          operator,
          passed: false,
          error: null,
          actual: null,
          expected: expected,
        };

        try {
          if (!operator || !(operator in assertionOperators)) {
            throw new Error(`Unknown operator: ${operator}`);
          }

          let actualValue;

          if (path) {
            actualValue = resolvePath(localStorageDump, path);
          } else if (paths && typeof paths === 'object') {
            actualValue = {} as Record<string, any>;
            for (const [key, pathValue] of Object.entries(paths)) {
              actualValue[key] = resolvePath(localStorageDump, pathValue as string);
            }
          } else {
            throw new Error("Either 'path' or 'paths' must be specified");
          }

          result.actual = actualValue;
          if (!actualValue && !operatorsWithNoExpected.includes(operator)) {
            result.error =
              'No actual value found, which means the proper sub-check is not completed.';
          }
          result.passed = (assertionOperators as any)[operator](actualValue, expected, options);
        } catch (error) {
          result.error = (error as Error).message;
          result.passed = false;
        }

        result.result = result.passed ? 'pass' : 'fail';
        delete result.passed;

        processedAssertions.push(result);
      }

      return NextResponse.json({
        taskId: taskId,
        prompt: task.prompt,
        assertions: processedAssertions,
      });
    } catch (error) {
      console.error('Get actual state error:', error);
      return NextResponse.json(
        {
          error: 'Failed to process actual state',
          taskId: taskId,
        },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error('API error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
