import * as fs from 'node:fs';
import * as path from 'node:path';
import * as url from 'node:url';

/**
 * System prompt loader for the LLM providers. Reads
 * `tools/reco-agent/prompts/agent.md` once and templates the per-run
 * substitutions (`{{userEmail}}`, `{{password}}`).
 *
 * Both providers (Claude, OpenAI) share the same prompt — keep it in
 * the markdown file, not duplicated in code.
 */

const PROMPT_PATH = path.resolve(
  url.fileURLToPath(new URL('.', import.meta.url)),
  '../../prompts/agent.md'
);

let cachedTemplate: string | null = null;

function loadTemplate(): string {
  if (cachedTemplate === null) {
    cachedTemplate = fs.readFileSync(PROMPT_PATH, 'utf-8');
  }
  return cachedTemplate;
}

export interface PromptVars {
  userEmail: string;
  password: string;
}

export function buildSystemPrompt(vars: PromptVars): string {
  return loadTemplate()
    .replaceAll('{{userEmail}}', vars.userEmail)
    .replaceAll('{{password}}', vars.password);
}
