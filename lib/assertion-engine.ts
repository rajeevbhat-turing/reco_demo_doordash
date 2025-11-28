interface Assertion {
  operator: string;
  path?: string;
  paths?: Record<string, string>;
  expectation?: any;
  options?: Record<string, any>;
}

interface AssertionResult {
  actual: any;
  result: 'match' | 'mismatch' | 'error';
  error?: string;
  score?: number;
  details?: {
    criteria: Record<string, number>;
    overall: number;
    hard_rules_triggered: string[];
    rationale: string;
  };
}

export class AssertionEngine {
  async execute(assertion: Assertion, localStorage: Record<string, any>): Promise<AssertionResult> {
    try {
      switch (assertion.operator) {
        case 'JSON_MATCH':
          return this.executeJsonMatch(assertion, localStorage);
        case 'EXISTS':
          return this.executeExists(assertion, localStorage);
        case 'NOT_EXISTS':
          return this.executeNotExists(assertion, localStorage);
        case 'STRING_MATCH':
          return this.executeStringMatch(assertion, localStorage);
        case 'STRING_CONTAINS':
          return this.executeStringContains(assertion, localStorage);
        case 'COMPARE':
          return this.executeCompare(assertion, localStorage);
        case 'ARRAY_CONTAINS':
          return this.executeArrayContains(assertion, localStorage);
        case 'ARRAY_LENGTH':
          return this.executeArrayLength(assertion, localStorage);
        case 'DATETIME_IN_RANGE':
          return this.executeDatetimeInRange(assertion, localStorage);
        case 'DATETIME_DIFFERENCE':
          return this.executeDatetimeDifference(assertion, localStorage);
        case 'LLM_RUBRIC_JUDGE':
          return this.executeLLMRubricJudge(assertion, localStorage);
        default:
          return {
            actual: null,
            result: 'error',
            error: `Unknown operator: ${assertion.operator}`,
          };
      }
    } catch (error) {
      return {
        actual: null,
        result: 'error',
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  private getValue(path: string, data: any): any {
    if (!path) return null;

    const keys = path.split('.');
    let current = data;

    for (const key of keys) {
      if (current === null || current === undefined) return null;

      // Handle array indices like "items[0]"
      if (key.includes('[') && key.includes(']')) {
        const arrayKey = key.substring(0, key.indexOf('['));
        const index = parseInt(key.substring(key.indexOf('[') + 1, key.indexOf(']')));

        if (current[arrayKey] && Array.isArray(current[arrayKey])) {
          // Validate array index bounds to prevent crashes
          if (isNaN(index) || index < 0 || index >= current[arrayKey].length) {
            return null;
          }
          current = current[arrayKey][index];
        } else {
          return null;
        }
      } else {
        current = current[key];

        // If the current value is a string that looks like JSON, try to parse it
        if (typeof current === 'string' && this.isJsonString(current)) {
          try {
            current = JSON.parse(current);
          } catch (e) {
            // If parsing fails, keep the string value
          }
        }
      }
    }

    return current;
  }

  private isJsonString(str: string): boolean {
    try {
      JSON.parse(str);
      return true;
    } catch (e) {
      return false;
    }
  }

  private executeJsonMatch(
    assertion: Assertion,
    localStorage: Record<string, any>
  ): AssertionResult {
    const actual = this.getValue(assertion.path!, localStorage);
    const expected = assertion.expectation;

    // Deep equality check
    const isMatch = JSON.stringify(actual) === JSON.stringify(expected);

    return {
      actual,
      result: isMatch ? 'match' : 'mismatch',
    };
  }

  private executeExists(assertion: Assertion, localStorage: Record<string, any>): AssertionResult {
    const actual = this.getValue(assertion.path!, localStorage);
    const exists = actual !== null && actual !== undefined;

    return {
      actual,
      result: exists ? 'match' : 'mismatch',
    };
  }

  private executeNotExists(
    assertion: Assertion,
    localStorage: Record<string, any>
  ): AssertionResult {
    const actual = this.getValue(assertion.path!, localStorage);
    const notExists = actual === null || actual === undefined;

    return {
      actual,
      result: notExists ? 'match' : 'mismatch',
    };
  }

  private executeStringMatch(
    assertion: Assertion,
    localStorage: Record<string, any>
  ): AssertionResult {
    const actual = this.getValue(assertion.path!, localStorage);
    const expected = assertion.expectation;

    if (typeof actual !== 'string') {
      return {
        actual,
        result: 'error',
        error: 'Expected string value',
      };
    }

    let actualStr = actual;
    let expectedStr = expected;

    const options = assertion.options || {};

    if (options.trim) {
      actualStr = actualStr.trim();
      expectedStr = expectedStr.trim();
    }

    if (options.caseInsensitive) {
      actualStr = actualStr.toLowerCase();
      expectedStr = expectedStr.toLowerCase();
    }

    if (options.normalizeWhitespace) {
      actualStr = actualStr.replace(/\s+/g, ' ');
      expectedStr = expectedStr.replace(/\s+/g, ' ');
    }

    const isMatch = actualStr === expectedStr;

    return {
      actual,
      result: isMatch ? 'match' : 'mismatch',
    };
  }

  private executeStringContains(
    assertion: Assertion,
    localStorage: Record<string, any>
  ): AssertionResult {
    const actual = this.getValue(assertion.path!, localStorage);
    const expected = assertion.expectation;

    if (typeof actual !== 'string') {
      return {
        actual,
        result: 'error',
        error: 'Expected string value',
      };
    }

    let actualStr = actual;
    let expectedStr = expected;

    const options = assertion.options || {};

    if (options.caseInsensitive) {
      actualStr = actualStr.toLowerCase();
      expectedStr = expectedStr.toLowerCase();
    }

    const contains = actualStr.includes(expectedStr);

    return {
      actual,
      result: contains ? 'match' : 'mismatch',
    };
  }

  private executeCompare(assertion: Assertion, localStorage: Record<string, any>): AssertionResult {
    const actual = this.getValue(assertion.path!, localStorage);
    const expected = assertion.expectation;
    const options = assertion.options || {};

    if (!options.op || !options.type) {
      return {
        actual,
        result: 'error',
        error: 'Missing required options: op and type',
      };
    }

    let actualValue: any;
    let expectedValue: any;

    switch (options.type) {
      case 'number':
        actualValue = Number(actual);
        expectedValue = Number(expected);
        if (isNaN(actualValue) || isNaN(expectedValue)) {
          return {
            actual,
            result: 'error',
            error: 'Invalid number values',
          };
        }
        break;

      case 'string':
        actualValue = String(actual);
        expectedValue = String(expected);
        break;

      case 'boolean':
        actualValue = Boolean(actual);
        expectedValue = Boolean(expected);
        break;

      case 'datetime':
        // For now, simple string comparison - you can enhance this
        actualValue = actual;
        expectedValue = expected;
        break;

      default:
        return {
          actual,
          result: 'error',
          error: `Unsupported type: ${options.type}`,
        };
    }

    let isMatch = false;

    switch (options.op) {
      case '==':
        isMatch = actualValue === expectedValue;
        break;
      case '!=':
        isMatch = actualValue !== expectedValue;
        break;
      case '>':
        isMatch = actualValue > expectedValue;
        break;
      case '>=':
        isMatch = actualValue >= expectedValue;
        break;
      case '<':
        isMatch = actualValue < expectedValue;
        break;
      case '<=':
        isMatch = actualValue <= expectedValue;
        break;
      default:
        return {
          actual,
          result: 'error',
          error: `Unsupported operator: ${options.op}`,
        };
    }

    return {
      actual,
      result: isMatch ? 'match' : 'mismatch',
    };
  }

  private executeArrayContains(
    assertion: Assertion,
    localStorage: Record<string, any>
  ): AssertionResult {
    const actual = this.getValue(assertion.path!, localStorage);
    const expected = assertion.expectation;
    const options = assertion.options || {};

    if (!Array.isArray(actual)) {
      return {
        actual,
        result: 'error',
        error: 'Expected array value',
      };
    }

    const mode = options.mode || 'some';
    const matchBy = options.matchBy || 'deep';
    const key = options.key;

    let isMatch = false;

    if (mode === 'some') {
      // At least one expected item is present
      if (Array.isArray(expected)) {
        isMatch = expected.some(expectedItem =>
          actual.some(actualItem => this.compareItems(actualItem, expectedItem, matchBy, key))
        );
      } else {
        isMatch = actual.some(actualItem => this.compareItems(actualItem, expected, matchBy, key));
      }
    } else if (mode === 'all') {
      // All expected items are present
      if (Array.isArray(expected)) {
        isMatch = expected.every(expectedItem =>
          actual.some(actualItem => this.compareItems(actualItem, expectedItem, matchBy, key))
        );
      } else {
        isMatch = actual.some(actualItem => this.compareItems(actualItem, expected, matchBy, key));
      }
    } else if (mode === 'exact') {
      // Array equals expected items
      if (Array.isArray(expected)) {
        if (options.orderSensitive) {
          isMatch = JSON.stringify(actual) === JSON.stringify(expected);
        } else {
          isMatch =
            actual.length === expected.length &&
            expected.every(expectedItem =>
              actual.some(actualItem => this.compareItems(actualItem, expectedItem, matchBy, key))
            );
        }
      } else {
        isMatch = actual.length === 1 && this.compareItems(actual[0], expected, matchBy, key);
      }
    }

    return {
      actual,
      result: isMatch ? 'match' : 'mismatch',
    };
  }

  private executeArrayLength(
    assertion: Assertion,
    localStorage: Record<string, any>
  ): AssertionResult {
    const actual = this.getValue(assertion.path!, localStorage);
    const expected = assertion.expectation;
    const options = assertion.options || {};

    if (!Array.isArray(actual)) {
      return {
        actual,
        result: 'error',
        error: 'Expected array value',
      };
    }

    const op = options.op || '==';
    const actualLength = actual.length;

    let isMatch = false;

    switch (op) {
      case '==':
        isMatch = actualLength === expected;
        break;
      case '>':
        isMatch = actualLength > expected;
        break;
      case '>=':
        isMatch = actualLength >= expected;
        break;
      case '<':
        isMatch = actualLength < expected;
        break;
      case '<=':
        isMatch = actualLength <= expected;
        break;
      default:
        return {
          actual,
          result: 'error',
          error: `Unsupported operator: ${op}`,
        };
    }

    return {
      actual,
      result: isMatch ? 'match' : 'mismatch',
    };
  }

  private executeDatetimeInRange(
    assertion: Assertion,
    localStorage: Record<string, any>
  ): AssertionResult {
    // Simplified implementation - you can enhance this with proper datetime parsing
    const actual = this.getValue(assertion.path!, localStorage);
    const expected = assertion.expectation;

    return {
      actual,
      result: 'error',
      error: 'DATETIME_IN_RANGE not yet implemented',
    };
  }

  private executeDatetimeDifference(
    assertion: Assertion,
    localStorage: Record<string, any>
  ): AssertionResult {
    // Simplified implementation - you can enhance this with proper datetime parsing
    const actual = this.getValue(assertion.path!, localStorage);
    const expected = assertion.expectation;

    return {
      actual,
      result: 'error',
      error: 'DATETIME_DIFFERENCE not yet implemented',
    };
  }

  private async executeLLMRubricJudge(
    assertion: Assertion,
    localStorage: Record<string, any>
  ): Promise<AssertionResult> {
    try {
      const actual = this.getValue(assertion.path!, localStorage);
      const expected = assertion.expectation;
      const options = assertion.options || {};

      if (!options.judge || !options.judge.prompt_template) {
        return {
          actual,
          result: 'error',
          error: 'Missing required options: judge.prompt_template',
        };
      }

      // Import the assertion operators to use the LLM_RUBRIC_JUDGE
      const { assertionOperators } = await import('./utils/assertion-operators');

      // Call the LLM_RUBRIC_JUDGE operator
      const result = await assertionOperators.LLM_RUBRIC_JUDGE(
        actual,
        expected,
        options as { judge: { prompt_template: string } }
      );

      return {
        actual: result.actual,
        result: result.result === 'pass' ? 'match' : 'mismatch',
        score: result.score,
        details: result.details,
        error: result.error,
      };
    } catch (error) {
      return {
        actual: null,
        result: 'error',
        error: error instanceof Error ? error.message : 'Unknown error in LLM_RUBRIC_JUDGE',
      };
    }
  }

  private compareItems(actual: any, expected: any, matchBy: string, key?: string): boolean {
    if (matchBy === 'deep') {
      return JSON.stringify(actual) === JSON.stringify(expected);
    } else if (matchBy === 'key' && key) {
      return actual[key] === expected[key];
    }
    return false;
  }
}
