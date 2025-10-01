import { NextRequest, NextResponse } from 'next/server';
import assertionsData from '@/data/assertions.json';

// Type definitions for the API
type Assertion = {
  title: string;
  operator: string;
  path: string;
  expected: any;
  options?: Record<string, any>;
};

type TaskAssertion = {
  prompt: string;
  assertions: Assertion[];
};

type AssertionsData = {
  [taskId: string]: TaskAssertion;
};

const assertions = assertionsData as AssertionsData;

type GetExpectedStateRequest = {
  taskId: string;
};

type GetExpectedStateResponse = {
  taskId: string;
  description: string;
  assertions: Assertion[];
};

type ErrorResponse = {
  error: string;
};

export async function POST(request: NextRequest) {
  try {
    const body: GetExpectedStateRequest = await request.json();
    const { taskId } = body;

    if (!taskId) {
      return NextResponse.json<ErrorResponse>({ error: 'taskId is required' }, { status: 400 });
    }

    // Check if task exists in assertions.json
    if (!(taskId in assertions)) {
      return NextResponse.json<ErrorResponse>({ error: 'Task not found' }, { status: 404 });
    }

    const assertion = assertions[taskId] as TaskAssertion;

    // Transform assertions to match the expected format
    const transformedAssertions = assertion.assertions.map(_assertion => ({
      title: _assertion.title,
      operator: _assertion.operator,
      path: _assertion.path,
      expected: _assertion.expected,
      options: _assertion.options || {},
    }));

    const response: GetExpectedStateResponse = {
      taskId: taskId,
      description: assertion.prompt,
      assertions: transformedAssertions,
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error('Error in get_expected_state:', error);
    return NextResponse.json<ErrorResponse>({ error: 'Internal server error' }, { status: 500 });
  }
}
