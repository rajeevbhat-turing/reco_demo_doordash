import * as fs from 'fs';
import * as path from 'path';
import type { RecoSurface, RecoItemKind } from '@/lib/reco/types';

/**
 * A task we can score an engine on: who is asking, where from, and what
 * the expected (ranked) answer set is.
 */
export interface RecoTask {
  taskId: string;
  surface: RecoSurface;
  /** User email — resolved to a numeric user id at eval time. */
  userEmail?: string;
  /** Lat/lng of the user's default delivery address. */
  userLat: number;
  userLng: number;
  /** Free-form task description (used in the demo UI drilldown). */
  statement: string;
  /** Ground-truth ids the engine is expected to return. Order matters. */
  expectedItemIds: string[];
  expectedKind: RecoItemKind;
  /** Optional human-readable names for the expected ids (demo only). */
  expectedNames?: string[];
}

interface SeedEntry {
  taskId: string;
  statement: string;
  surface?: RecoSurface;
  user: string;
  userLat: number;
  userLng: number;
  expectedKind: RecoItemKind;
  expectedItemIds: string[];
  expectedNames?: string[];
}

/**
 * Load the hand-curated seed tasks from `data/reco-tasks/seed.json`.
 *
 * The seed is pre-resolved (expected ids already looked up against the
 * dashdoor DB) so the eval runner doesn't need to re-execute the
 * `expected_state_functions` defined in `tasks/dashdoor.csv`. That CSV
 * is still the source of truth for the task statements; the loader
 * picks the simplest "find restaurant X" tasks where the expected
 * answer is a single id.
 */
export function loadSeedTasks(): RecoTask[] {
  const file = path.join(process.cwd(), 'data', 'reco-tasks', 'seed.json');
  if (!fs.existsSync(file)) return [];

  const raw = JSON.parse(fs.readFileSync(file, 'utf-8')) as SeedEntry[];
  return raw.map(entry => ({
    taskId: entry.taskId,
    surface: entry.surface ?? 'home_feed',
    userEmail: entry.user,
    userLat: entry.userLat,
    userLng: entry.userLng,
    statement: entry.statement,
    expectedItemIds: entry.expectedItemIds,
    expectedKind: entry.expectedKind,
    expectedNames: entry.expectedNames,
  }));
}

/**
 * Parse `tasks/dashdoor.csv` and return raw rows keyed by task id.
 * Reuses the CSV parser shape from
 * `app/api/v1/get_expected_state/route.ts`. Server-only.
 */
export function loadRawTasks(): Record<string, unknown> {
  const file = path.join(process.cwd(), 'tasks', 'dashdoor.csv');
  if (!fs.existsSync(file)) return {};

  const content = fs.readFileSync(file, 'utf-8');
  const rows = parseCsv(content);
  const out: Record<string, unknown> = {};
  for (const row of rows) {
    const id = row['task_id'];
    const json = row['full_task_json'];
    if (!id || !json) continue;
    try {
      out[id.toUpperCase()] = JSON.parse(json);
    } catch {
      // skip unparseable rows — they're not reco-relevant anyway
    }
  }
  return out;
}

function parseCsv(content: string): Record<string, string>[] {
  const rows: Record<string, string>[] = [];
  let cur: string[] = [];
  let field = '';
  let inQuotes = false;
  let headers: string[] = [];
  for (let i = 0; i < content.length; i++) {
    const c = content[i];
    const n = content[i + 1];
    if (inQuotes) {
      if (c === '"' && n === '"') {
        field += '"';
        i++;
      } else if (c === '"') {
        inQuotes = false;
      } else {
        field += c;
      }
    } else if (c === '"') {
      inQuotes = true;
    } else if (c === ',') {
      cur.push(field);
      field = '';
    } else if (c === '\n' || (c === '\r' && n === '\n')) {
      cur.push(field);
      field = '';
      if (headers.length === 0) {
        headers = cur;
      } else if (cur.some(x => x.trim())) {
        const obj: Record<string, string> = {};
        headers.forEach((h, j) => (obj[h] = cur[j] || ''));
        rows.push(obj);
      }
      cur = [];
      if (c === '\r') i++;
    } else {
      field += c;
    }
  }
  if (field || cur.length) {
    cur.push(field);
    if (headers.length && cur.some(x => x.trim())) {
      const obj: Record<string, string> = {};
      headers.forEach((h, j) => (obj[h] = cur[j] || ''));
      rows.push(obj);
    }
  }
  return rows;
}
