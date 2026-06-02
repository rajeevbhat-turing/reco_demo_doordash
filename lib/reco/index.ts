export * from './types';
export {
  buildExpected,
  buildExpectedWithOverrides,
  applyOverride,
  HOT_CUISINE_THRESHOLD,
  CANDIDATE_RADIUS_MILES,
  SECTION_SIZE,
  FAMILIAR_COUNT,
  OUTLIER_BASKET_MAD_K,
  MIN_CUISINE_SUPPORT,
  EXPLORE_HI,
  EXPLORE_LO,
  exploreCount,
} from './eval/persona-truth';
export { buildCandidates } from './candidates';
export { scoreTask, scoreTaskBySection, aggregate } from './metrics';
export type { ScoreResult } from './metrics';
export { makeHttpEngine } from './engines/http';
export { adjacentCuisines, loadAdjacencies } from './adjacency';
export type { AdjacencyMap } from './adjacency';
