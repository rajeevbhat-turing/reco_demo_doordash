import { describe, it, expect } from 'vitest';
import { extractRecommendation } from '@/lib/reco/agent/extract';
import type { AgentStepRecord, VerifierEvent } from '@/lib/reco/agent/types';

function step(n: number, urlAfter: string | undefined): AgentStepRecord {
  return {
    step: n,
    action: { type: 'clickBySelector', selector: 'a' },
    observation: '',
    durationMs: 1,
    urlAfter,
  };
}

describe('extractRecommendation: home_feed', () => {
  it('extracts distinct restaurant ids in URL-visit order', () => {
    const actions: AgentStepRecord[] = [
      step(0, 'http://localhost:3000/home'),
      step(1, 'http://localhost:3000/store/42'),
      step(2, 'http://localhost:3000/store/42?ref=x'), // duplicate
      step(3, 'http://localhost:3000/store/17'),
      step(4, 'http://localhost:3000/home'),
    ];
    const res = extractRecommendation({
      actions,
      verifierEvents: [],
      surface: 'home_feed',
      k: 5,
      latencyMs: 1234,
      version: 'test',
    });
    expect(res.items.map(i => i.id)).toEqual(['42', '17']);
    expect(res.items[0]?.kind).toBe('restaurant');
    expect(res.engine).toBe('agent');
    expect(res.latencyMs).toBe(1234);
  });

  it('caps at k', () => {
    const actions: AgentStepRecord[] = Array.from({ length: 10 }, (_, i) =>
      step(i, `http://localhost:3000/store/${100 + i}`)
    );
    const res = extractRecommendation({
      actions,
      verifierEvents: [],
      surface: 'home_feed',
      k: 3,
      latencyMs: 1,
      version: 'test',
    });
    expect(res.items.map(i => i.id)).toEqual(['100', '101', '102']);
  });

  it('returns empty items when no /store/ visits', () => {
    const actions: AgentStepRecord[] = [
      step(0, 'http://localhost:3000/home'),
      step(1, 'http://localhost:3000/search'),
    ];
    const res = extractRecommendation({
      actions,
      verifierEvents: [],
      surface: 'home_feed',
      k: 5,
      latencyMs: 1,
      version: 'test',
    });
    expect(res.items).toEqual([]);
  });
});

describe('extractRecommendation: store_items', () => {
  it('pulls items from the latest verifier-snapshot lastOrderInfo.items', () => {
    const events: VerifierEvent[] = [
      {
        type: 'verifier-snapshot',
        ts: 1,
        payload: {
          state: {
            lastOrderInfo: {
              items: [
                { id: 202, itemName: 'mac & cheese' },
                { id: 202, itemName: 'mac & cheese' }, // dup id
                { id: '331', itemName: 'soda' },
              ],
            },
          },
        },
      },
    ];
    const res = extractRecommendation({
      actions: [],
      verifierEvents: events,
      surface: 'store_items',
      k: 5,
      latencyMs: 1,
      version: 'test',
    });
    expect(res.items.map(i => i.id)).toEqual(['202', '331']);
    expect(res.items[0]?.kind).toBe('item');
    expect(res.items[0]?.meta).toEqual({ itemName: 'mac & cheese' });
  });

  it('returns empty items when no verifier snapshot exists', () => {
    const res = extractRecommendation({
      actions: [],
      verifierEvents: [],
      surface: 'store_items',
      k: 5,
      latencyMs: 1,
      version: 'test',
    });
    expect(res.items).toEqual([]);
  });
});

describe('extractRecommendation: unsupported surfaces', () => {
  it('returns empty items for home_promo / search', () => {
    for (const surface of ['home_promo', 'search'] as const) {
      const res = extractRecommendation({
        actions: [step(0, 'http://localhost:3000/store/42')],
        verifierEvents: [],
        surface,
        k: 5,
        latencyMs: 1,
        version: 'test',
      });
      expect(res.items).toEqual([]);
      expect(res.engine).toBe('agent');
    }
  });
});
