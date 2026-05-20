import * as fs from 'fs';
import * as path from 'path';
import type { EvalReport } from './runner';

const RUN_DIR = path.join(process.cwd(), 'data', 'reco-runs');

export function saveReport(report: EvalReport): string {
  fs.mkdirSync(RUN_DIR, { recursive: true });
  const file = path.join(RUN_DIR, `${report.runId}.json`);
  fs.writeFileSync(file, JSON.stringify(report, null, 2));
  return file;
}

export function loadReport(runId: string): EvalReport | null {
  const file = path.join(RUN_DIR, `${runId}.json`);
  if (!fs.existsSync(file)) return null;
  try {
    return JSON.parse(fs.readFileSync(file, 'utf-8')) as EvalReport;
  } catch {
    return null;
  }
}

export function listRunIds(): string[] {
  if (!fs.existsSync(RUN_DIR)) return [];
  return fs
    .readdirSync(RUN_DIR)
    .filter(f => f.endsWith('.json'))
    .map(f => f.slice(0, -5))
    .sort()
    .reverse();
}
