import type { CarState, TrackConfig } from '../../types';
import { GRAVITY_FACTOR } from '../../types';

export function createCar(initialPosition = 0): CarState {
  return {
    position: initialPosition,
    velocity: 0,
    isGrounded: true,
    isCoupledToElevator: true,
  };
}

export function applyCarPhysicsStep(
  state: CarState,
  track: TrackConfig,
  elevatorPosition: number,
  elevatorMaxHeight: number,
): CarState {
  // While the car is still coupled, it only gets released once the elevator reaches track level.
  if (state.isCoupledToElevator && elevatorPosition < elevatorMaxHeight) {
    return {
      ...state,
      position: 0,
      velocity: 0,
      isGrounded: true,
      isCoupledToElevator: true,
    };
  }

  // After release, the elevator no longer affects the car.
  const inclineRadians = (track.inclinationDeg * Math.PI) / 180;
  const acceleration = Math.sin(inclineRadians) * GRAVITY_FACTOR;

  const nextVelocity = Math.min(state.velocity + acceleration, track.maxVelocity);
  const nextPosition = Math.min(state.position + nextVelocity, 100);

  return {
    ...state,
    velocity: nextVelocity,
    position: nextPosition,
    isGrounded: true,
    isCoupledToElevator: false,
  };
}
