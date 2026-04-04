import type { Phase01ElevatorState } from '@/game-core';

export type CarState = 'coupled' | 'rolling';

export type HudOverlay = 'success' | 'failed';

export type HudModel = {
  overlay: HudOverlay | null;
  elevatorProgress: number;
  carProgress: number;
  carState: CarState;
  timeUrgency: number;
};

export function buildHudModel(phase: Phase01ElevatorState): HudModel {
  const overlay: HudOverlay | null =
    phase.status === 'success' ? 'success'
    : phase.status === 'failed' ? 'failed'
    : null;

  const elevatorProgress = Math.min(1, phase.elevator.position / phase.elevator.maxHeight);
  const carProgress = Math.min(1, phase.car.position / 100);
  const carState: CarState = phase.car.isCoupledToElevator ? 'coupled' : 'rolling';
  const timeUrgency = Math.min(1, phase.tick / phase.maxTicks);

  return { overlay, elevatorProgress, carProgress, carState, timeUrgency };
}
