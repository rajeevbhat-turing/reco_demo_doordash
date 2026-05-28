import { NextResponse } from 'next/server';
import { loadSeedTasks } from '@/lib/reco/eval/task-loader';

export const dynamic = 'force-dynamic';

/**
 * Returns the seed task list so the /reco-eval UI can show users what's
 * actually being scored without making them open the JSON file.
 *
 * History tasks aren't included here — they're derived per-run from the
 * users table, not a static file, so listing them out of run context
 * would be misleading.
 */
export async function GET() {
  const tasks = loadSeedTasks().map(t => ({
    taskId: t.taskId,
    surface: t.surface,
    statement: t.statement,
    expectedNames: t.expectedNames ?? [],
    expectedItemIds: t.expectedItemIds,
  }));
  return NextResponse.json({ tasks });
}
