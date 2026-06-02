'use client';

import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type RecoRun = {
  id: string;
  personaId: string;
  personaUserId: number;
  personaName: string;
  engineId: string;
  label: string;
  model?: string;
  ranked_ids: number[];
  scores?: Record<number, number>;
  capturedAt: string;
};

type RecoSelectionStore = {
  activeRunId: string | null;
  setActiveRun: (id: string | null) => void;
};

export const useRecoSelectionStore = create<RecoSelectionStore>()(
  persist(
    (set) => ({
      activeRunId: null,
      setActiveRun: (id) => set({ activeRunId: id }),
    }),
    { name: 'reco-active-run' }
  )
);
