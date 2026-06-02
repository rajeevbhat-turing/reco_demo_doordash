import { readFileSync } from 'fs';
import { join } from 'path';
import { marked } from 'marked';
import RecoEvalClient from './reco-eval-client';
import type { Persona } from '@/lib/reco/types';

export const metadata = { title: 'Reco Eval | Dashdoor' };

export default function RecoEvalPage() {
  const root = process.cwd();
  const personas: Persona[] = JSON.parse(
    readFileSync(join(root, 'data/reco-personas/personas.json'), 'utf8')
  );
  let guideHtml = '';
  try {
    const md = readFileSync(join(root, 'docs/CLIENT_DEMO.md'), 'utf8');
    guideHtml = marked(md) as string;
  } catch {
    // guide not available in this build
  }
  return <RecoEvalClient initialPersonas={personas} guideHtml={guideHtml} />;
}
