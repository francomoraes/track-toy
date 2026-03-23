import type { ElevatorState, HoldAction } from '../../types';

export function createElevator(config: Pick<ElevatorState, 'minHeight' | 'maxHeight'>): ElevatorState {
  return {
    position: config.minHeight,
    minHeight: config.minHeight,
    maxHeight: config.maxHeight,
    isMoving: false,
  };
}

export function applyElevatorStep(state: ElevatorState, action: HoldAction): ElevatorState {
  switch (action) {
    case 'raise':
      return {
        ...state,
        position: Math.min(state.position + 1, state.maxHeight),
        isMoving: true,
      };
    case 'lower':
      return {
        ...state,
        position: Math.max(state.position - 1, state.minHeight),
        isMoving: true,
      };
    case 'none': {
      const nextPosition = Math.max(state.position - 1, state.minHeight);

      return {
        ...state,
        position: nextPosition,
        isMoving: nextPosition !== state.position,
      };
    }
    default:
      return { ...state, isMoving: false };
  }
}
