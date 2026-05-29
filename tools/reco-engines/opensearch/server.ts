import express from 'express';
import { readFileSync } from 'fs';
import { join } from 'path';
import type { Persona } from '../../../lib/reco/types';
import { recommend } from './recommend';

const PORT = Number(process.env.PORT ?? 4001);
const ROOT = join(__dirname, '../../..');
const PERSONAS_PATH = join(ROOT, 'data/reco-personas/personas.json');

const app = express();
app.use(express.json());

function loadPersonas(): Persona[] {
  return JSON.parse(readFileSync(PERSONAS_PATH, 'utf8')) as Persona[];
}

app.get('/health', (_req, res) => {
  res.json({ status: 'ok', engine: 'opensearch' });
});

app.post('/recommend', async (req, res) => {
  const { personaId, topK } = req.body as { personaId?: string; topK?: number };

  if (!personaId) {
    res.status(400).json({ error: 'personaId is required' });
    return;
  }

  const personas = loadPersonas();
  const persona = personas.find((p) => p.id === personaId);
  if (!persona) {
    res.status(404).json({ error: `persona '${personaId}' not found` });
    return;
  }

  try {
    const result = await recommend(persona, { personaId, topK });
    res.json(result);
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    res.status(500).json({ error: message });
  }
});

app.listen(PORT, () => {
  console.log(`reco-opensearch listening on :${PORT}`);
});
