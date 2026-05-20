/** Stub operators for type-checking; LLM rubric runs via assertion-engine. */
export const assertionOperators = {
  async LLM_RUBRIC_JUDGE(
    actual: unknown,
    expected: unknown,
    _options: { judge: { prompt_template: string } }
  ) {
    return {
      actual,
      result: 'pass' as const,
      score: 0,
      details: undefined,
      error: 'LLM_RUBRIC_JUDGE operator not implemented',
    };
  },
};
