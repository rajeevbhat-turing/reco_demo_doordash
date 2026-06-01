import express from 'express';
import { readFileSync } from 'fs';
import { join } from 'path';
import type { Persona, Candidate } from '../../../lib/reco/types';
import { recommend } from './recommend';

const PORT = Number(process.env.PORT ?? 4002);
const ROOT = join(__dirname, '../../..');
const PERSONAS_PATH = join(ROOT, 'data/reco-personas/personas.json');

const app = express();

app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') {
    res.sendStatus(204);
    return;
  }
  next();
});

app.use(express.json());

function loadPersonas(): Persona[] {
  return JSON.parse(readFileSync(PERSONAS_PATH, 'utf8')) as Persona[];
}

app.get('/health', (_req, res) => {
  res.json({ status: 'ok', engine: 'llm-ranker' });
});

app.post('/recommend', async (req, res) => {
  const { personaId, topK, candidates, llm } = req.body as {
    personaId?: string;
    topK?: number;
    candidates?: Candidate[];
    llm?: { baseUrl: string; apiKey: string; model: string };
  };

  if (!personaId) {
    res.status(400).json({ error: 'personaId is required' });
    return;
  }
  if (!candidates || candidates.length === 0) {
    res.status(400).json({ error: 'candidates array is required' });
    return;
  }

  const personas = loadPersonas();
  const persona = personas.find((p) => p.id === personaId);
  if (!persona) {
    res.status(404).json({ error: `persona '${personaId}' not found` });
    return;
  }

  try {
    const result = await recommend(persona, { personaId, topK, candidates, llm });
    res.json(result);
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    res.status(500).json({ error: message });
  }
});

app.listen(PORT, () => {
  console.log(`reco-llm-ranker listening on :${PORT}`);
});
