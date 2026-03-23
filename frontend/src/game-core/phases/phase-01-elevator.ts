import { applyElevatorStep, createElevator } from '../mechanisms/elevator/elevator.machine';
import { evaluateCarFlow, type PhaseStatus } from '../rules/evaluate-car-flow';
import type { ElevatorState, GameEvent, HoldAction } from '../types';

export interface Phase01ElevatorState {
  elevator: ElevatorState;
  carPosition: number;
  goalPosition: number;
  tick: number;
  maxTicks: number;
  status: PhaseStatus;
  events: GameEvent[];
}

interface CreatePhase01ElevatorOptions {
  minHeight?: number;
  maxHeight?: number;
  maxTicks?: number;
}

export function createPhase01Elevator(options: CreatePhase01ElevatorOptions = {}): Phase01ElevatorState {
  const minHeight = options.minHeight ?? 0;
  const maxHeight = options.maxHeight ?? 10;

  return {
    elevator: createElevator({ minHeight, maxHeight }),
    carPosition: minHeight,
    goalPosition: maxHeight,
    tick: 0,
    maxTicks: options.maxTicks ?? 180,
    status: 'running',
    events: [],
  };
}

export function stepPhase01Elevator(
  state: Phase01ElevatorState,
  action: HoldAction,
): Phase01ElevatorState {
  if (state.status !== 'running') {
    return state;
  }

  const nextElevator = applyElevatorStep(state.elevator, action);
  const nextTick = state.tick + 1;

  // In phase 1 the car is coupled to the elevator platform.
  const nextCarPosition = nextElevator.position;

  const flow = evaluateCarFlow({
    carPosition: nextCarPosition,
    goalPosition: state.goalPosition,
    tick: nextTick,
    maxTicks: state.maxTicks,
    mechanismId: 'elevator',
  });

  return {
    ...state,
    elevator: nextElevator,
    carPosition: nextCarPosition,
    tick: nextTick,
    status: flow.status,
    events: flow.event ? [...state.events, flow.event] : state.events,
  };
}
