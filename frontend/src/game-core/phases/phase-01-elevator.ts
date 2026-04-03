import { applyElevatorStep, createElevator } from '../mechanisms/elevator/elevator.machine';
import { applyCarPhysicsStep, createCar } from '../mechanisms/car/car.physics';
import { evaluateCarFlow, type PhaseStatus } from '../rules/evaluate-car-flow';
import type { ElevatorState, CarState, GameEvent, HoldAction, TrackConfig } from '../types';

export interface Phase01ElevatorState {
  elevator: ElevatorState;
  car: CarState;
  track: TrackConfig;
  tick: number;
  maxTicks: number;
  status: PhaseStatus;
  events: GameEvent[];
}

interface CreatePhase01ElevatorOptions {
  minHeight?: number;
  maxHeight?: number;
  inclinationDeg?: number;
  maxVelocity?: number;
  maxTicks?: number;
}

export function createPhase01Elevator(options: CreatePhase01ElevatorOptions = {}): Phase01ElevatorState {
  const minHeight = options.minHeight ?? 0;
  const maxHeight = options.maxHeight ?? 10;

  return {
    elevator: createElevator({ minHeight, maxHeight }),
    car: createCar(0),
    track: {
      inclinationDeg: options.inclinationDeg ?? 30,
      length: 100,
      maxVelocity: options.maxVelocity ?? 5,
    },
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
  const nextCar = applyCarPhysicsStep(state.car, state.track, nextElevator.position, state.elevator.maxHeight);
  const nextTick = state.tick + 1;

  const flow = evaluateCarFlow({
    carPosition: nextCar.position,
    goalPosition: 100,
    tick: nextTick,
    maxTicks: state.maxTicks,
    mechanismId: 'elevator',
  });

  return {
    ...state,
    elevator: nextElevator,
    car: nextCar,
    tick: nextTick,
    status: flow.status,
    events: flow.event ? [...state.events, flow.event] : state.events,
  };
}
