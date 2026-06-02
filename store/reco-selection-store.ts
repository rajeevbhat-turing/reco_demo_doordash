'use client';

import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type RecoSelection = {
  engineId: string;
  label: string;
  model?: string;
  ranked_ids: number[];
  scores?: Record<number, number>;
  capturedAt: string; // ISO date string
};

type RecoSelectionStore = {
  selections: Record<string, RecoSelection>; // keyed by String(user_id)
  applyEngine: (personaKey: string, payload: Omit<RecoSelection, 'capturedAt'>) => void;
  clearSelection: (personaKey: string) => void;
};

export const useRecoSelectionStore = create<RecoSelectionStore>()(
  persist(
    (set) => ({
      selections: {},
      applyEngine: (personaKey, payload) =>
        set((state) => ({
          selections: {
            ...state.selections,
            [personaKey]: { ...payload, capturedAt: new Date().toISOString() },
          },
        })),
      clearSelection: (personaKey) =>
        set((state) => {
          const { [personaKey]: _, ...rest } = state.selections;
          return { selections: rest };
        }),
    }),
    { name: 'reco-selections' }
  )
);

export function useRecoSelection(personaKey: string) {
  return useRecoSelectionStore((state) => state.selections[personaKey]);
}
