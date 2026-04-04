import { create } from 'zustand';
import { persist } from 'zustand/middleware';

import { buildPhaseMapModel, unlockNextPhase, type PhaseId, type PhaseMapEntry, type ProgressData } from './progress-model';

type ProgressStore = {
  data: ProgressData;
  phaseMap: () => PhaseMapEntry[];
  completePhase: (id: PhaseId) => void;
  reset: () => void;
};

const INITIAL_DATA: ProgressData = { completedPhases: [] };

export const useProgressStore = create<ProgressStore>()(
  persist(
    (set, get) => ({
      data: INITIAL_DATA,
      phaseMap: () => buildPhaseMapModel(get().data),
      completePhase: (id) => set((state) => ({ data: unlockNextPhase(state.data, id) })),
      reset: () => set({ data: INITIAL_DATA }),
    }),
    {
      name: 'track-toy-progress',
    },
  ),
);
