import { create } from 'zustand';

import {
  createPhase02,
  stepPhase02,
  type Phase02HeldAction,
  type Phase02State,
} from '@/game-core';

const DEFAULT_OPTIONS = {
  maxHeightA: 12,
  maxHeightB: 10,
  inclinationDeg: 25,
  maxVelocity: 5,
  maxTicks: 500,
};

type Phase02Store = {
  phase: Phase02State;
  heldAction: Phase02HeldAction;
  setHeldAction: (action: Phase02HeldAction) => void;
  tick: () => void;
  reset: () => void;
};

export const usePhase02Store = create<Phase02Store>((set, get) => ({
  phase: createPhase02(DEFAULT_OPTIONS),
  heldAction: 'none',
  setHeldAction: (action) => set({ heldAction: action }),
  tick: () => {
    const { phase, heldAction } = get();
    const next = stepPhase02(phase, { held: heldAction });
    set({
      phase: next,
      heldAction: next.status === 'running' ? heldAction : 'none',
    });
  },
  reset: () => set({ phase: createPhase02(DEFAULT_OPTIONS), heldAction: 'none' }),
}));
