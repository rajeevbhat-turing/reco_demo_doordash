import * as fs from 'fs';
import * as path from 'path';
import type { RecommendationEngine } from '@/lib/reco/types';
import { randomEngine } from './random';
import { popularityEngine } from './popularity';
import { gorseEngine } from './gorse';
import { makeGorseEngine } from './gorse';
import { lightfmEngine } from './lightfm';
import { implicitEngine } from './implicit';
import { getAgentEngine } from './agent';
import { makeHttpEngine } from './http';

interface EngineConfigEntry {
  enabled?: boolean;
  url?: string;
}

interface EngineConfig {
  engines?: Record<string, EngineConfigEntry>;
}

/**
 * Engine registry. Anything in `builtin` shows up in `/api/reco/engines`
 * and the `/reco-eval` demo UI, *unless* `config/reco-engines.json`
 * disables it. URLs in the config override the engine's default URL
 * (useful for pointing lightfm/implicit at a remote host).
 *
 * If the config file is missing or unparseable, all built-ins register
 * with their defaults — the registry never goes empty.
 */
const agentEngine = getAgentEngine();

const builtin: RecommendationEngine[] = [
  randomEngine,
  popularityEngine,
  gorseEngine,
  lightfmEngine,
  implicitEngine,
  ...(agentEngine ? [agentEngine] : []),
];

function loadConfig(): EngineConfig {
  const file = path.join(process.cwd(), 'config', 'reco-engines.json');
  if (!fs.existsSync(file)) return {};
  try {
    return JSON.parse(fs.readFileSync(file, 'utf-8')) as EngineConfig;
  } catch (err) {
    console.warn(`[reco] reco-engines.json present but unparseable: ${(err as Error).message}`);
    return {};
  }
}

function applyConfig(
  defaults: RecommendationEngine[],
  cfg: EngineConfig
): RecommendationEngine[] {
  const entries = cfg.engines ?? {};
  return defaults.flatMap(engine => {
    const entry = entries[engine.name];
    if (entry?.enabled === false) return [];
    if (!entry?.url) return [engine];
    // URL override: rebuild HTTP-shaped engines pointed at the new URL.
    if (engine.name === 'gorse') {
      return [makeGorseEngine({ baseUrl: entry.url })];
    }
    return [
      makeHttpEngine({
        name: engine.name,
        version: engine.version,
        description: engine.description,
        endpoint: entry.url,
      }),
    ];
  });
}

const configured = applyConfig(builtin, loadConfig());
const registry = new Map<string, RecommendationEngine>(configured.map(e => [e.name, e]));

export function listEngines(): RecommendationEngine[] {
  return [...registry.values()];
}

export function getEngine(name: string): RecommendationEngine | undefined {
  return registry.get(name);
}

export function registerEngine(engine: RecommendationEngine): void {
  if (registry.has(engine.name)) {
    throw new Error(`engine '${engine.name}' is already registered`);
  }
  registry.set(engine.name, engine);
}
