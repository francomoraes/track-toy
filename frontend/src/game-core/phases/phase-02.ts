import { applyElevatorStep, createElevator } from '../mechanisms/elevator/elevator.machine';
import { applyCarPhysicsStep, createCar } from '../mechanisms/car/car.physics';
import { evaluateCarFlow, type PhaseStatus } from '../rules/evaluate-car-flow';
import type { ElevatorState, CarState, GameEvent, TrackConfig } from '../types';

export type CarCoupling = 'elevatorA' | 'elevatorB' | 'free';

export type Phase02HeldAction = 'raise_a' | 'raise_b' | 'none';

export type Phase02Input = {
  held: Phase02HeldAction;
};

export interface Phase02State {
  elevatorA: ElevatorState;
  elevatorB: ElevatorState;
  car: CarState;
  carCoupling: CarCoupling;
  track1: TrackConfig;
  track2: TrackConfig;
  tick: number;
  maxTicks: number;
  status: PhaseStatus;
  events: GameEvent[];
}

interface CreatePhase02Options {
  maxHeightA?: number;
  maxHeightB?: number;
  inclinationDeg?: number;
  maxVelocity?: number;
  maxTicks?: number;
}

export function createPhase02(options: CreatePhase02Options = {}): Phase02State {
  const maxHeightA = options.maxHeightA ?? 10;
  const maxHeightB = options.maxHeightB ?? 8;
  const inclinationDeg = options.inclinationDeg ?? 25;
  const maxVelocity = options.maxVelocity ?? 5;
  const trackConfig: TrackConfig = { inclinationDeg, maxVelocity };

  return {
    elevatorA: createElevator({ minHeight: 0, maxHeight: maxHeightA }),
    elevatorB: createElevator({ minHeight: 0, maxHeight: maxHeightB }),
    car: createCar(0),
    carCoupling: 'elevatorA',
    track1: trackConfig,
    track2: { inclinationDeg: inclinationDeg / 2, maxVelocity },
    tick: 0,
    maxTicks: options.maxTicks ?? 400,
    status: 'running',
    events: [],
  };
}

export function stepPhase02(state: Phase02State, input: Phase02Input): Phase02State {
  if (state.status !== 'running') return state;

  // Resolve elevator actions
  const elevatorAAction = input.held === 'raise_a' ? ('raise' as const) : ('none' as const);
  const elevatorBAction = input.held === 'raise_b' ? ('raise' as const) : ('none' as const);

  const nextElevatorA = applyElevatorStep(state.elevatorA, elevatorAAction);
  const nextElevatorB = applyElevatorStep(state.elevatorB, elevatorBAction);
  const nextTick = state.tick + 1;

  let nextCar = state.car;
  let nextCarCoupling = state.carCoupling;
  let earlyStatus: PhaseStatus | null = null;
  let earlyEvent: GameEvent | undefined;

  if (state.carCoupling === 'elevatorA') {
    if (nextElevatorA.position >= nextElevatorA.maxHeight) {
      // Release car onto track 1
      nextCarCoupling = 'free';
      nextCar = { ...state.car, isCoupledToElevator: false, position: 0, velocity: 0 };
    } else {
      nextCar = { ...state.car, position: 0, velocity: 0 };
    }
  } else if (state.carCoupling === 'elevatorB') {
    if (nextElevatorB.position >= nextElevatorB.maxHeight) {
      // ElevatorB reached top — release car onto track 2
      nextCarCoupling = 'free';
      nextCar = { ...state.car, isCoupledToElevator: false, position: 51, velocity: 0 };
    } else {
      nextCar = { ...state.car, position: 50, velocity: 0 };
    }
  } else {
    // Car is free — apply physics on the appropriate track
    const onTrack1 = state.car.position < 50;
    const trackConfig = onTrack1 ? state.track1 : state.track2;
    nextCar = applyCarPhysicsStep(state.car, trackConfig, 0, 0);

    // Car crossed position 50 — couple to ElevatorB only if B is at ground (position 0)
    if (onTrack1 && nextCar.position >= 50) {
      if (nextElevatorB.position === 0) {
        nextCarCoupling = 'elevatorB';
        nextCar = { ...nextCar, position: 50, velocity: 0, isCoupledToElevator: true };
      } else {
        // ElevatorB raised — blocks the car
        earlyStatus = 'failed';
        earlyEvent = { type: 'level_failed', timestamp: nextTick, mechanismId: 'elevatorB' };
      }
    }
  }

  if (earlyStatus) {
    return {
      ...state,
      elevatorA: nextElevatorA,
      elevatorB: nextElevatorB,
      car: nextCar,
      carCoupling: nextCarCoupling,
      tick: nextTick,
      status: earlyStatus,
      events: earlyEvent ? [...state.events, earlyEvent] : state.events,
    };
  }

  const flow = evaluateCarFlow({
    carPosition: nextCar.position,
    goalPosition: 100,
    tick: nextTick,
    maxTicks: state.maxTicks,
    mechanismId: 'phase02',
  });

  return {
    ...state,
    elevatorA: nextElevatorA,
    elevatorB: nextElevatorB,
    car: nextCar,
    carCoupling: nextCarCoupling,
    tick: nextTick,
    status: flow.status,
    events: flow.event ? [...state.events, flow.event] : state.events,
  };
}
