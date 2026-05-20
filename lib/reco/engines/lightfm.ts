import { makeHttpEngine } from './http';

/**
 * LightFM sidecar adapter. The model lives in
 * `tools/reco-engines/lightfm/` and is brought up by
 * `config/docker-compose.reco.yaml`. Wire contract:
 * `docs/reco-http-contract.md`.
 */
export const lightfmEngine = makeHttpEngine({
  name: 'lightfm',
  version: '1.17-warp',
  description:
    'Hybrid CF + content recommender (WARP loss) trained on orders × restaurant features.',
  endpoint: process.env.RECO_LIGHTFM_URL ?? 'http://lightfm:8001/recommend',
  timeoutMs: 10_000, // first cold call after restart can be slower
});
