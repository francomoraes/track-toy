import type { Phase01ElevatorState } from '@/game-core';

type Vec3 = [number, number, number];

type SceneModel = {
  elevator: {
    progress: number;
    position: Vec3;
    rotation: Vec3;
    carAnchorOffset: Vec3;
    entryPoint: Vec3;
    exitPoint: Vec3;
  };
  track: {
    start: Vec3;
    end: Vec3;
    center: Vec3;
    rotation: Vec3;
    length: number;
  };
  lowerTrack: {
    start: Vec3;
    end: Vec3;
    center: Vec3;
    rotation: Vec3;
    length: number;
  };
  upperTrack: {
    start: Vec3;
    end: Vec3;
    center: Vec3;
    rotation: Vec3;
    length: number;
  };
  car: {
    position: Vec3;
    rotation: Vec3;
    isCoupledToElevator: boolean;
  };
};

const ELEVATOR_BASE_X = -3;
const ELEVATOR_BASE_Y = 0;
const ELEVATOR_TRAVEL_Y = 4;
const TRACK_START_X = -1.3;
const TRACK_START_Y = 4.3;
const TRACK_LENGTH_X = 7.2;
const LOWER_TRACK_START_X = -6.3;
const LOWER_TRACK_START_Y = 0.3;

function lerp(start: number, end: number, progress: number): number {
  return start + (end - start) * progress;
}

export function buildPhase01SceneModel(phase: Phase01ElevatorState): SceneModel {
  const elevatorProgress = phase.elevator.position / phase.elevator.maxHeight;
  const trackAngleRad = -(phase.track.inclinationDeg * Math.PI) / 180;
  const trackEndX = TRACK_START_X + TRACK_LENGTH_X;
  const trackEndY = TRACK_START_Y + Math.tan(trackAngleRad) * TRACK_LENGTH_X;
  const trackProgress = phase.car.position / 100;

  const elevatorPosition: Vec3 = [
    ELEVATOR_BASE_X,
    ELEVATOR_BASE_Y + ELEVATOR_TRAVEL_Y * elevatorProgress,
    0,
  ];
  const elevatorRotation: Vec3 = [0, 0, trackAngleRad];
  const carAnchorOffset: Vec3 = [0.55, 0.3, 0];
  const elevatorEntryPoint: Vec3 = [ELEVATOR_BASE_X - 1.15, ELEVATOR_BASE_Y + 0.3, 0];
  const elevatorExitPoint: Vec3 = [TRACK_START_X, TRACK_START_Y, 0];
  const lowerTrackEndX = elevatorEntryPoint[0];
  const lowerTrackEndY = elevatorEntryPoint[1];
  const lowerTrackRotation: Vec3 = [0, 0, 0];
  const lowerTrackCenter: Vec3 = [(LOWER_TRACK_START_X + lowerTrackEndX) / 2, LOWER_TRACK_START_Y, 0];
  const lowerTrackLength = Math.abs(lowerTrackEndX - LOWER_TRACK_START_X);

  const coupledCarPosition: Vec3 = [
    elevatorPosition[0] + carAnchorOffset[0],
    elevatorPosition[1] + carAnchorOffset[1],
    0.4,
  ];

  const releasedCarPosition: Vec3 = [
    lerp(TRACK_START_X, trackEndX, trackProgress),
    lerp(TRACK_START_Y, trackEndY, trackProgress),
    0.4,
  ];

  return {
    elevator: {
      progress: elevatorProgress,
      position: elevatorPosition,
      rotation: elevatorRotation,
      carAnchorOffset,
      entryPoint: elevatorEntryPoint,
      exitPoint: elevatorExitPoint,
    },
    track: {
      start: [TRACK_START_X, TRACK_START_Y, 0],
      end: [trackEndX, trackEndY, 0],
      center: [(TRACK_START_X + trackEndX) / 2, (TRACK_START_Y + trackEndY) / 2, 0],
      rotation: [0, 0, trackAngleRad],
      length: Math.hypot(trackEndX - TRACK_START_X, trackEndY - TRACK_START_Y),
    },
    lowerTrack: {
      start: [LOWER_TRACK_START_X, LOWER_TRACK_START_Y, 0],
      end: [lowerTrackEndX, lowerTrackEndY, 0],
      center: lowerTrackCenter,
      rotation: lowerTrackRotation,
      length: lowerTrackLength,
    },
    upperTrack: {
      start: [TRACK_START_X, TRACK_START_Y, 0],
      end: [trackEndX, trackEndY, 0],
      center: [(TRACK_START_X + trackEndX) / 2, (TRACK_START_Y + trackEndY) / 2, 0],
      rotation: [0, 0, trackAngleRad],
      length: Math.hypot(trackEndX - TRACK_START_X, trackEndY - TRACK_START_Y),
    },
    car: {
      position: phase.car.isCoupledToElevator ? coupledCarPosition : releasedCarPosition,
      rotation: phase.car.isCoupledToElevator ? elevatorRotation : [0, 0, trackAngleRad],
      isCoupledToElevator: phase.car.isCoupledToElevator,
    },
  };
}
