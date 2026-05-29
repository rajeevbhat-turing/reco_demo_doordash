import { readFileSync } from 'fs';
import { join } from 'path';
import RecoEvalClient from './reco-eval-client';
import type { Persona } from '@/lib/reco/types';

export const metadata = { title: 'Reco Eval | Dashdoor' };

export default function RecoEvalPage() {
  const personas: Persona[] = JSON.parse(
    readFileSync(join(process.cwd(), 'data/reco-personas/personas.json'), 'utf8')
  );
  return <RecoEvalClient initialPersonas={personas} />;
}
