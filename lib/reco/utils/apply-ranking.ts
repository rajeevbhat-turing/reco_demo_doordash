/**
 * Re-order `items` so that ids in `rankedIds` come first, in the order
 * they appear in `rankedIds`. Items not mentioned in `rankedIds`
 * append at the end in their original order. Never drops items.
 *
 * This is the central re-rank primitive for Phase 3 — keeping it
 * in one place makes "we never drop a restaurant" easy to audit.
 */
export function applyRanking<T extends { id: string }>(
  items: T[],
  rankedIds: readonly string[] | null | undefined
): T[] {
  if (!rankedIds || rankedIds.length === 0) return items;

  const byId = new Map(items.map(it => [it.id, it]));
  const out: T[] = [];
  const seen = new Set<string>();

  for (const id of rankedIds) {
    const it = byId.get(id);
    if (it && !seen.has(id)) {
      out.push(it);
      seen.add(id);
    }
  }
  for (const it of items) {
    if (!seen.has(it.id)) out.push(it);
  }
  return out;
}
