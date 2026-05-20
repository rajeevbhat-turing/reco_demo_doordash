#!/usr/bin/env node
/**
 * Fail if `tsc --noEmit` reports any errors. Use in CI to keep the repo at 0.
 */
import { execSync } from 'node:child_process';

let output = '';
try {
  output = execSync('npx tsc --noEmit', { encoding: 'utf8', stdio: ['pipe', 'pipe', 'pipe'] });
} catch (err) {
  output = `${err.stdout ?? ''}${err.stderr ?? ''}`;
  const count = (output.match(/error TS\d+/g) ?? []).length;
  console.error(output.trimEnd());
  console.error(`\ntsc failed with ${count} error(s).`);
  process.exit(1);
}

const count = (output.match(/error TS\d+/g) ?? []).length;
if (count > 0) {
  console.error(output.trimEnd());
  console.error(`\ntsc failed with ${count} error(s).`);
  process.exit(1);
}

console.log('tsc --noEmit: 0 errors');
