import judges from '@/data/judges.json';

export type JsonMatchOptions = {
  unorderedArrays?: boolean;
  allowExtraKeys?: boolean;
};

export type ArrayContainsOptions = {
  mode?: 'some' | 'all' | 'exact';
  orderSensitive?: boolean;
  matchBy?: 'deep' | 'key';
  key?: string;
};

export type StringMatchOptions = {
  caseInsensitive?: boolean;
  trim?: boolean;
  normalizeWhitespace?: boolean;
};

export type StringContainsOptions = {
  caseInsensitive?: boolean;
};

export type CompareOptions = {
  op: '==' | '!=' | '>' | '>=' | '<' | '<=';
  type: 'number' | 'string' | 'datetime' | 'boolean';
  tolerance?: number;
  tz?: string;
  granularity?: 'datetime' | 'date' | 'time';
  input?: 'iso' | 'epochMs' | 'epochSec';
};

export type BetweenOptions = {
  type?: 'number' | 'string' | 'datetime';
  inclusive?: boolean;
  tolerance?: number;
  tz?: string;
  granularity?: 'datetime' | 'date' | 'time';
  input?: 'iso' | 'epochMs' | 'epochSec';
};

export type BetweenExpected = {
  min: number | string;
  max: number | string;
};

export type ArrayLengthOptions = {
  op?: '==' | '>' | '>=' | '<' | '<=';
};

export type DateTimeInRangeOptions = {
  tz?: string;
  granularity?: 'datetime' | 'date' | 'time';
  input?: 'iso' | 'epochMs' | 'epochSec';
};

export type DateTimeInRangeExpected = {
  start: string | '$NOW' | '$TODAY';
  end: string | '$NOW' | '$TODAY';
  inclusive?: boolean;
};

export type DateTimeDifferenceOptions = {
  tz?: string;
  input?: 'iso' | 'epochMs' | 'epochSec';
  toleranceMs?: number;
};

export type DateTimeDifferenceActual = {
  start: string;
  end: string;
};

// Operator function types
type AssertionOperator = (actual: any, expected?: any, options?: any) => boolean;

type JsonMatchOperator = (actual: any, expected: any, options?: JsonMatchOptions) => boolean;
type ExistsOperator = (actual: any) => boolean;
type NotExistsOperator = (actual: any) => boolean;
type ArrayContainsOperator = (
  actual: any,
  expected: any[],
  options?: ArrayContainsOptions
) => boolean;
type StringMatchOperator = (actual: any, expected: string, options?: StringMatchOptions) => boolean;
type StringContainsOperator = (
  actual: any,
  expected: string,
  options?: StringContainsOptions
) => boolean;
type CompareOperator = (actual: any, expected: any, options: CompareOptions) => boolean;
type BetweenOperator = (
  actual: any,
  expected: BetweenExpected,
  options?: BetweenOptions
) => boolean;
type ArrayLengthOperator = (actual: any, expected: number, options?: ArrayLengthOptions) => boolean;
type DateTimeInRangeOperator = (
  actual: any,
  expected: DateTimeInRangeExpected,
  options?: DateTimeInRangeOptions
) => boolean;
type DateTimeDifferenceOperator = (
  actual: DateTimeDifferenceActual,
  expected: string | number,
  options?: DateTimeDifferenceOptions
) => boolean;

// LLM Rubric Judge operator type
export type LLMRubricJudgeOperator = (
  actual: any,
  expected: any,
  options: {
    judge: {
      prompt_template: string;
    };
  }
) => Promise<{
  operator: string;
  expected: any;
  actual: any;
  result: 'pass' | 'fail';
  score: number;
  details: {
    criteria: Record<string, number>;
    overall: number;
    hard_rules_triggered: string[];
    rationale: string;
  };
  error?: string;
}>;

// Main assertion operators object type
export type AssertionOperators = {
  JSON_MATCH: JsonMatchOperator;
  EXISTS: ExistsOperator;
  NOT_EXISTS: NotExistsOperator;
  ARRAY_CONTAINS: ArrayContainsOperator;
  STRING_MATCH: StringMatchOperator;
  STRING_CONTAINS: StringContainsOperator;
  COMPARE: CompareOperator;
  BETWEEN: BetweenOperator;
  ARRAY_LENGTH: ArrayLengthOperator;
  DATETIME_IN_RANGE: DateTimeInRangeOperator;
  DATETIME_DIFFERENCE: DateTimeDifferenceOperator;
  LLM_RUBRIC_JUDGE: LLMRubricJudgeOperator;
};

const handleLLMAssertion = async (assertion: any, modelResponse: any) => {
  const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY;
  const OPENROUTER_URL = process.env.OPENROUTER_URL;
  const OPENROUTER_MODEL = process.env.OPENROUTER_MODEL;

  if (!OPENROUTER_URL || !OPENROUTER_API_KEY || !OPENROUTER_MODEL) {
    throw new Error(
      'Missing required environment variables: OPENROUTER_URL, OPENROUTER_API_KEY, or OPENROUTER_MODEL'
    );
  }

  const response = await fetch(OPENROUTER_URL, {
    method: 'POST',
    body: JSON.stringify({
      model: OPENROUTER_MODEL,
      messages: [
        {
          role: 'user',
          content: [
            {
              type: 'text',
              text: `Model Response: \n\n${modelResponse}\n-------------------`,
            },
            {
              type: 'text',
              text: `Verifier Definition: \n\n${JSON.stringify(assertion)}\n-------------------`,
            },
            {
              type: 'text',
              text: `${assertion.options.judge.prompt_template} \n\n ${
                (judges as any)[assertion.options.judge.prompt_template]
              }`,
            },
          ],
        },
      ],
    }),
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${OPENROUTER_API_KEY}` },
  });

  if (!response.ok) {
    throw new Error(`LLM API call failed: ${response.status} ${response.statusText}`);
  }

  const data = await response.json();

  // Extract the content from the LLM response
  const content = data.choices?.[0]?.message?.content;
  if (!content) {
    throw new Error('No content returned from LLM');
  }

  try {
    // Parse the JSON response from the LLM
    const parsedResponse = JSON.parse(content);

    // Validate the response structure
    if (!parsedResponse.operator || !parsedResponse.result || parsedResponse.score === undefined) {
      throw new Error('Invalid LLM response structure');
    }

    return parsedResponse;
  } catch (parseError) {
    // If parsing fails, return a structured error response
    return {
      operator: 'LLM_RUBRIC_JUDGE',
      expected: assertion.expected,
      actual: modelResponse,
      result: 'fail',
      score: 0,
      details: {
        criteria: {},
        overall: 0,
        hard_rules_triggered: [],
        rationale: `Failed to parse LLM response: ${
          parseError instanceof Error ? parseError.message : 'Unknown error'
        }`,
      },
      error: `LLM response parsing failed: ${
        parseError instanceof Error ? parseError.message : 'Unknown error'
      }`,
    };
  }
};

export const assertionOperators: AssertionOperators = {
  JSON_MATCH: (actual: any, expected: any, options: JsonMatchOptions = {}) => {
    const { unorderedArrays = false, allowExtraKeys = false } = options;

    if (unorderedArrays && Array.isArray(actual) && Array.isArray(expected)) {
      const actualSorted = [...actual].sort();
      const expectedSorted = [...expected].sort();
      return JSON.stringify(actualSorted) === JSON.stringify(expectedSorted);
    }

    if (allowExtraKeys && typeof actual === 'object' && typeof expected === 'object') {
      for (const key in expected) {
        if (JSON.stringify(actual[key]) !== JSON.stringify(expected[key])) {
          return false;
        }
      }
      return true;
    }

    return JSON.stringify(actual) === JSON.stringify(expected);
  },

  EXISTS: (actual: any) => {
    return actual !== undefined && actual !== null;
  },

  NOT_EXISTS: (actual: any) => {
    return actual === undefined || actual === null;
  },

  ARRAY_CONTAINS: (actual: any, expected: any[], options: ArrayContainsOptions = {}) => {
    if (!Array.isArray(actual)) {
      return false;
    }

    const { mode = 'some', orderSensitive = false, matchBy = 'deep', key } = options;

    if (matchBy === 'key' && !key) {
      throw new Error("key is required when matchBy is 'key'");
    }

    if (!['some', 'all', 'exact'].includes(mode)) {
      throw new Error("mode must be 'some', 'all', or 'exact'");
    }

    if (!['deep', 'key'].includes(matchBy)) {
      throw new Error("matchBy must be 'deep' or 'key'");
    }

    // Helper function to compare items based on matchBy
    const compareItems = (actualItem: any, expectedItem: any) => {
      if (matchBy === 'key' && key) {
        if (typeof actualItem === 'object' && actualItem !== null) {
          return actualItem[key] === expectedItem[key];
        }
        return false;
      } else {
        return JSON.stringify(actualItem) === JSON.stringify(expectedItem);
      }
    };

    if (mode === 'some') {
      return expected.some(expectedItem =>
        actual.some(actualItem => compareItems(actualItem, expectedItem))
      );
    }

    if (mode === 'all') {
      return expected.every(expectedItem =>
        actual.some(actualItem => compareItems(actualItem, expectedItem))
      );
    }

    if (mode === 'exact') {
      if (actual.length !== expected.length) {
        return false;
      }

      if (orderSensitive) {
        return actual.every((actualItem, index) => compareItems(actualItem, expected[index]));
      } else {
        return expected.every(expectedItem =>
          actual.some(actualItem => compareItems(actualItem, expectedItem))
        );
      }
    }

    return false;
  },

  STRING_MATCH: (actual: any, expected: string, options: StringMatchOptions = {}) => {
    if (typeof actual !== 'string' || typeof expected !== 'string') {
      return false;
    }

    const { caseInsensitive = false, trim = false, normalizeWhitespace = false } = options;

    let actualStr = actual;
    let expectedStr = expected;

    if (trim) {
      actualStr = actualStr.trim();
      expectedStr = expectedStr.trim();
    }

    if (normalizeWhitespace) {
      actualStr = actualStr.replace(/\s+/g, ' ');
      expectedStr = expectedStr.replace(/\s+/g, ' ');
    }

    if (caseInsensitive) {
      actualStr = actualStr.toLowerCase();
      expectedStr = expectedStr.toLowerCase();
    }

    return actualStr === expectedStr;
  },

  STRING_CONTAINS: (actual: any, expected: string, options: StringContainsOptions = {}) => {
    if (typeof actual !== 'string' || typeof expected !== 'string') {
      return false;
    }

    const { caseInsensitive = false } = options;

    let actualStr = actual;
    let expectedStr = expected;

    if (caseInsensitive) {
      actualStr = actualStr.toLowerCase();
      expectedStr = expectedStr.toLowerCase();
    }

    return actualStr.includes(expectedStr);
  },

  COMPARE: (actual: any, expected: any, options: CompareOptions) => {
    const { op, type } = options;

    if (!op || !type) {
      throw new Error('op and type are required for COMPARE operator');
    }

    if (!['==', '!=', '>', '>=', '<', '<='].includes(op)) {
      throw new Error('op must be one of: ==, !=, >, >=, <, <=');
    }

    if (!['number', 'string', 'datetime', 'boolean'].includes(type)) {
      throw new Error('type must be one of: number, string, datetime, boolean');
    }

    if (type === 'number') {
      const actualNum = Number(actual);
      const expectedNum = Number(expected);
      const { tolerance = 0 } = options;

      if (isNaN(actualNum) || isNaN(expectedNum)) {
        return false;
      }

      const diff = Math.abs(actualNum - expectedNum);
      if (tolerance > 0) {
        return diff <= tolerance;
      }

      switch (op) {
        case '==':
          return actualNum === expectedNum;
        case '!=':
          return actualNum !== expectedNum;
        case '>':
          return actualNum > expectedNum;
        case '>=':
          return actualNum >= expectedNum;
        case '<':
          return actualNum < expectedNum;
        case '<=':
          return actualNum <= expectedNum;
        default:
          return false;
      }
    }

    if (type === 'string') {
      const actualStr = String(actual);
      const expectedStr = String(expected);

      switch (op) {
        case '==':
          return actualStr === expectedStr;
        case '!=':
          return actualStr !== expectedStr;
        case '>':
          return actualStr > expectedStr;
        case '>=':
          return actualStr >= expectedStr;
        case '<':
          return actualStr < expectedStr;
        case '<=':
          return actualStr <= expectedStr;
        default:
          return false;
      }
    }

    if (type === 'datetime') {
      const { tz = 'UTC', granularity = 'datetime', input = 'iso' } = options;

      let actualDate: Date | undefined, expectedDate: Date | undefined;

      // Parse actual date
      if (input === 'iso') {
        actualDate = new Date(actual);
      } else if (input === 'epochMs') {
        actualDate = new Date(Number(actual));
      } else if (input === 'epochSec') {
        actualDate = new Date(Number(actual) * 1000);
      }

      // Parse expected date (handle special values)
      if (expected === '$NOW') {
        expectedDate = new Date();
      } else if (expected === '$TODAY') {
        const now = new Date();
        expectedDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      } else {
        if (input === 'iso') {
          expectedDate = new Date(expected);
        } else if (input === 'epochMs') {
          expectedDate = new Date(Number(expected));
        } else if (input === 'epochSec') {
          expectedDate = new Date(Number(expected) * 1000);
        }
      }

      if (
        !actualDate ||
        !expectedDate ||
        isNaN(actualDate.getTime()) ||
        isNaN(expectedDate.getTime())
      ) {
        return false;
      }

      // Apply granularity
      if (granularity === 'date') {
        actualDate = new Date(
          actualDate.getFullYear(),
          actualDate.getMonth(),
          actualDate.getDate()
        );
        expectedDate = new Date(
          expectedDate.getFullYear(),
          expectedDate.getMonth(),
          expectedDate.getDate()
        );
      } else if (granularity === 'time') {
        actualDate = new Date(
          0,
          0,
          0,
          actualDate.getHours(),
          actualDate.getMinutes(),
          actualDate.getSeconds(),
          actualDate.getMilliseconds()
        );
        expectedDate = new Date(
          0,
          0,
          0,
          expectedDate.getHours(),
          expectedDate.getMinutes(),
          expectedDate.getSeconds(),
          expectedDate.getMilliseconds()
        );
      }

      switch (op) {
        case '==':
          return actualDate.getTime() === expectedDate.getTime();
        case '!=':
          return actualDate.getTime() !== expectedDate.getTime();
        case '>':
          return actualDate.getTime() > expectedDate.getTime();
        case '>=':
          return actualDate.getTime() >= expectedDate.getTime();
        case '<':
          return actualDate.getTime() < expectedDate.getTime();
        case '<=':
          return actualDate.getTime() <= expectedDate.getTime();
        default:
          return false;
      }
    }

    if (type === 'boolean') {
      const actualBool = Boolean(actual);
      const expectedBool = Boolean(expected);

      switch (op) {
        case '==':
          return actualBool === expectedBool;
        case '!=':
          return actualBool !== expectedBool;
        default:
          return false;
      }
    }

    return false;
  },

  BETWEEN: (actual: any, expected: BetweenExpected, options: BetweenOptions = {}) => {
    const { type = 'number', inclusive = true, tolerance = 0 } = options;

    if (!type) {
      throw new Error('type is required for BETWEEN operator');
    }

    if (!['number', 'string', 'datetime'].includes(type)) {
      throw new Error('type must be one of: number, string, datetime');
    }

    if (
      !expected ||
      typeof expected !== 'object' ||
      expected.min === undefined ||
      expected.max === undefined
    ) {
      throw new Error('expected must be an object with min and max properties');
    }

    if (type === 'number') {
      let actualNum = Number(actual);
      const minNum = Number(expected.min);
      const maxNum = Number(expected.max);

      // Handle price strings like "$59.00" by removing currency symbols
      if (isNaN(actualNum) && typeof actual === 'string') {
        const cleanedActual = actual.replace(/[$,]/g, '');
        actualNum = Number(cleanedActual);
      }

      if (isNaN(actualNum) || isNaN(minNum) || isNaN(maxNum)) {
        return false;
      }

      if (inclusive) {
        return actualNum >= minNum && actualNum <= maxNum;
      } else {
        return actualNum > minNum && actualNum < maxNum;
      }
    }

    if (type === 'string') {
      const actualStr = String(actual);
      const minStr = String(expected.min);
      const maxStr = String(expected.max);

      if (inclusive) {
        return actualStr >= minStr && actualStr <= maxStr;
      } else {
        return actualStr > minStr && actualStr < maxStr;
      }
    }

    if (type === 'datetime') {
      const { tz = 'UTC', granularity = 'datetime', input = 'iso' } = options;

      let actualDate: Date | undefined, minDate: Date | undefined, maxDate: Date | undefined;

      // Parse dates based on input format
      try {
        if (input === 'iso') {
          actualDate = new Date(actual);
          minDate = new Date(expected.min);
          maxDate = new Date(expected.max);
        } else if (input === 'epochMs') {
          actualDate = new Date(Number(actual));
          minDate = new Date(Number(expected.min));
          maxDate = new Date(Number(expected.max));
        } else if (input === 'epochSec') {
          actualDate = new Date(Number(actual) * 1000);
          minDate = new Date(Number(expected.min) * 1000);
          maxDate = new Date(Number(expected.max) * 1000);
        }
      } catch (e) {
        return false;
      }

      if (
        !actualDate ||
        !minDate ||
        !maxDate ||
        isNaN(actualDate.getTime()) ||
        isNaN(minDate.getTime()) ||
        isNaN(maxDate.getTime())
      ) {
        return false;
      }

      // Apply granularity
      if (granularity === 'date') {
        actualDate.setHours(0, 0, 0, 0);
        minDate.setHours(0, 0, 0, 0);
        maxDate.setHours(0, 0, 0, 0);
      } else if (granularity === 'time') {
        const actualTime =
          actualDate.getHours() * 3600 + actualDate.getMinutes() * 60 + actualDate.getSeconds();
        const minTime =
          minDate.getHours() * 3600 + minDate.getMinutes() * 60 + minDate.getSeconds();
        const maxTime =
          maxDate.getHours() * 3600 + maxDate.getMinutes() * 60 + maxDate.getSeconds();

        if (inclusive) {
          return actualTime >= minTime && actualTime <= maxTime;
        } else {
          return actualTime > minTime && actualTime < maxTime;
        }
      }

      const actualTime = actualDate.getTime();
      const minTime = minDate.getTime();
      const maxTime = maxDate.getTime();

      if (inclusive) {
        return actualTime >= minTime && actualTime <= maxTime;
      } else {
        return actualTime > minTime && actualTime < maxTime;
      }
    }

    return false;
  },

  ARRAY_LENGTH: (actual: any, expected: number, options: ArrayLengthOptions = {}) => {
    if (!Array.isArray(actual)) {
      return false;
    }

    const { op = '==' } = options;
    const actualLength = actual.length;
    const expectedLength = Number(expected);

    if (isNaN(expectedLength)) {
      return false;
    }

    switch (op) {
      case '==':
        return actualLength === expectedLength;
      case '>':
        return actualLength > expectedLength;
      case '>=':
        return actualLength >= expectedLength;
      case '<':
        return actualLength < expectedLength;
      case '<=':
        return actualLength <= expectedLength;
      default:
        return false;
    }
  },

  DATETIME_IN_RANGE: (
    actual: any,
    expected: DateTimeInRangeExpected,
    options: DateTimeInRangeOptions = {}
  ) => {
    const { tz = 'UTC', granularity = 'datetime', input = 'iso' } = options;
    const { start, end, inclusive = true } = expected;

    if (!start || !end) {
      throw new Error('start and end are required for DATETIME_IN_RANGE');
    }

    let actualDate: Date | undefined, startDate: Date | undefined, endDate: Date | undefined;

    // Parse actual date
    if (input === 'iso') {
      actualDate = new Date(actual);
    } else if (input === 'epochMs') {
      actualDate = new Date(Number(actual));
    } else if (input === 'epochSec') {
      actualDate = new Date(Number(actual) * 1000);
    }

    // Parse start date
    if (start === '$NOW') {
      startDate = new Date();
    } else if (start === '$TODAY') {
      const now = new Date();
      startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    } else {
      if (input === 'iso') {
        startDate = new Date(start);
      } else if (input === 'epochMs') {
        startDate = new Date(Number(start));
      } else if (input === 'epochSec') {
        startDate = new Date(Number(start) * 1000);
      }
    }

    // Parse end date
    if (end === '$NOW') {
      endDate = new Date();
    } else if (end === '$TODAY') {
      const now = new Date();
      endDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    } else {
      if (input === 'iso') {
        endDate = new Date(end);
      } else if (input === 'epochMs') {
        endDate = new Date(Number(end));
      } else if (input === 'epochSec') {
        endDate = new Date(Number(end) * 1000);
      }
    }

    if (
      !actualDate ||
      !startDate ||
      !endDate ||
      isNaN(actualDate.getTime()) ||
      isNaN(startDate.getTime()) ||
      isNaN(endDate.getTime())
    ) {
      return false;
    }

    // Apply granularity
    if (granularity === 'date') {
      actualDate = new Date(actualDate.getFullYear(), actualDate.getMonth(), actualDate.getDate());
      startDate = new Date(startDate.getFullYear(), startDate.getMonth(), startDate.getDate());
      endDate = new Date(endDate.getFullYear(), endDate.getMonth(), endDate.getDate());
    } else if (granularity === 'time') {
      actualDate = new Date(
        0,
        0,
        0,
        actualDate.getHours(),
        actualDate.getMinutes(),
        actualDate.getSeconds(),
        actualDate.getMilliseconds()
      );
      startDate = new Date(
        0,
        0,
        0,
        startDate.getHours(),
        startDate.getMinutes(),
        startDate.getSeconds(),
        startDate.getMilliseconds()
      );
      endDate = new Date(
        0,
        0,
        0,
        endDate.getHours(),
        endDate.getMinutes(),
        endDate.getSeconds(),
        endDate.getMilliseconds()
      );
    }

    const actualTime = actualDate.getTime();
    const startTime = startDate.getTime();
    const endTime = endDate.getTime();

    if (inclusive) {
      return actualTime >= startTime && actualTime <= endTime;
    } else {
      return actualTime > startTime && actualTime < endTime;
    }
  },

  DATETIME_DIFFERENCE: (
    actual: DateTimeDifferenceActual,
    expected: string | number,
    options: DateTimeDifferenceOptions = {}
  ) => {
    const { tz = 'UTC', input = 'iso', toleranceMs = 0 } = options;
    const { start, end } = actual;

    if (!start || !end) {
      throw new Error('start and end paths are required for DATETIME_DIFFERENCE');
    }

    let startDate: Date | undefined, endDate: Date | undefined;

    // Parse start date
    if (input === 'iso') {
      startDate = new Date(start);
    } else if (input === 'epochMs') {
      startDate = new Date(Number(start));
    } else if (input === 'epochSec') {
      startDate = new Date(Number(start) * 1000);
    }

    // Parse end date
    if (input === 'iso') {
      endDate = new Date(end);
    } else if (input === 'epochMs') {
      endDate = new Date(Number(end));
    } else if (input === 'epochSec') {
      endDate = new Date(Number(end) * 1000);
    }

    if (!startDate || !endDate || isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
      return false;
    }

    const actualDurationMs = endDate.getTime() - startDate.getTime();
    let expectedDurationMs;

    // Parse expected duration
    if (typeof expected === 'string') {
      // ISO-8601 duration parsing (simplified)
      const match = expected.match(/PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+(?:\.\d+)?)S)?/);
      if (match) {
        const hours = parseInt(match[1] || '0', 10);
        const minutes = parseInt(match[2] || '0', 10);
        const seconds = parseFloat(match[3] || '0');
        expectedDurationMs = (hours * 3600 + minutes * 60 + seconds) * 1000;
      } else {
        return false;
      }
    } else if (typeof expected === 'number') {
      expectedDurationMs = expected;
    } else {
      return false;
    }

    const diff = Math.abs(actualDurationMs - expectedDurationMs);
    return diff <= toleranceMs;
  },

  LLM_RUBRIC_JUDGE: async (
    actual: any,
    expected: any,
    options: { judge: { prompt_template: string } }
  ) => {
    const assertion = {
      expected,
      options,
    };
    return await handleLLMAssertion(assertion, actual);
  },
};

export const operatorsWithNoExpected = ['EXISTS', 'NOT_EXISTS'];
