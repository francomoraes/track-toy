import { create } from 'zustand';

import { createPhase01Elevator, stepPhase01Elevator, type HoldAction, type Phase01ElevatorState } from '@/game-core';

const DEFAULT_PHASE_OPTIONS = {
  maxHeight: 12,
  inclinationDeg: 30,
  maxVelocity: 5,
  maxTicks: 200,
} as const;

function createInitialPhase(): Phase01ElevatorState {
  return createPhase01Elevator(DEFAULT_PHASE_OPTIONS);
}

type GameStore = {
  phase: Phase01ElevatorState;
  heldAction: HoldAction;
  setHeldAction: (action: HoldAction) => void;
  tick: () => void;
  reset: () => void;
};

export const useGameStore = create<GameStore>((set, get) => ({
  phase: createInitialPhase(),
  heldAction: 'none',
  setHeldAction: (action) => set({ heldAction: action }),
  tick: () => {
    const { phase, heldAction } = get();
    const nextPhase = stepPhase01Elevator(phase, heldAction);

    set({
      phase: nextPhase,
      heldAction: nextPhase.status === 'running' ? heldAction : 'none',
    });
  },
  reset: () => set({ phase: createInitialPhase(), heldAction: 'none' }),
}));
