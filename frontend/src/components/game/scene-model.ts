import type { Phase01ElevatorState } from '@/game-core';

type Vec3 = [number, number, number];

type TrackSegment = {
  start: Vec3;
  end: Vec3;
  center: Vec3;
  rotation: Vec3;
  length: number;
};

type SceneModel = {
  elevator: {
    progress: number;
    position: Vec3;
    rotation: Vec3;
    carAnchorOffset: Vec3;
    entryPoint: Vec3;
    exitPoint: Vec3;
  };
  lowerTrack: TrackSegment;
  upperTracks: TrackSegment[];
  car: {
    position: Vec3;
    rotation: Vec3;
    isCoupledToElevator: boolean;
  };
};

const ELEVATOR_BASE_X = -3;
const ELEVATOR_BASE_Y = 0;
const ELEVATOR_TRAVEL_Y = 4;
const UPPER_TRACK_SEGMENT_LENGTH = 5.0;
const LOWER_TRACK_START_X = -6.3;
const LOWER_TRACK_START_Y = 0.3;

function lerp(start: number, end: number, progress: number): number {
  return start + (end - start) * progress;
}

export function buildPhase01SceneModel(phase: Phase01ElevatorState): SceneModel {
  const elevatorProgress = phase.elevator.position / phase.elevator.maxHeight;
  const carAnchorOffset: Vec3 = [0.55, 0.3, 0];

  // Upper track origin is derived from elevator exit (ensures zero-gap handoff)
  const trackStartX = ELEVATOR_BASE_X + carAnchorOffset[0];
  const trackStartY = ELEVATOR_BASE_Y + ELEVATOR_TRAVEL_Y + carAnchorOffset[1];

  // Build one TrackSegment per entry in phase.tracks, chaining start→end
  let segX = trackStartX;
  let segY = trackStartY;
  const upperTracks: TrackSegment[] = phase.tracks.map((trackConfig) => {
    const angleRad = -(trackConfig.inclinationDeg * Math.PI) / 180;
    const startX = segX;
    const startY = segY;
    const endX = startX + UPPER_TRACK_SEGMENT_LENGTH;
    const endY = startY + Math.tan(angleRad) * UPPER_TRACK_SEGMENT_LENGTH;
    segX = endX;
    segY = endY;
    return {
      start: [startX, startY, 0],
      end: [endX, endY, 0],
      center: [(startX + endX) / 2, (startY + endY) / 2, 0],
      rotation: [0, 0, angleRad],
      length: Math.hypot(endX - startX, endY - startY),
    };
  });

  // Elevator rotation aligns with the first track
  const track0AngleRad = -(phase.tracks[0].inclinationDeg * Math.PI) / 180;

  const elevatorPosition: Vec3 = [
    ELEVATOR_BASE_X,
    ELEVATOR_BASE_Y + ELEVATOR_TRAVEL_Y * elevatorProgress,
    0,
  ];
  const elevatorRotation: Vec3 = [0, 0, track0AngleRad];
  const elevatorEntryPoint: Vec3 = [ELEVATOR_BASE_X - 1.15, ELEVATOR_BASE_Y + 0.3, 0];
  const elevatorExitPoint: Vec3 = [trackStartX, trackStartY, 0];
  const lowerTrackEndX = elevatorEntryPoint[0];
  const lowerTrackEndY = elevatorEntryPoint[1];
  const lowerTrackRotation: Vec3 = [0, 0, 0];
  const lowerTrackCenter: Vec3 = [(LOWER_TRACK_START_X + lowerTrackEndX) / 2, LOWER_TRACK_START_Y, 0];
  const lowerTrackLength = Math.abs(lowerTrackEndX - LOWER_TRACK_START_X);

  // Coupled: car sits on elevator platform
  const coupledCarPosition: Vec3 = [
    elevatorPosition[0] + carAnchorOffset[0],
    elevatorPosition[1] + carAnchorOffset[1],
    0.4,
  ];

  // Released: car runs along the appropriate track segment
  const posPerTrack = 100 / upperTracks.length;
  let carTrackIndex: number;
  let carLocalProgress: number;
  if (phase.car.position >= 100) {
    carTrackIndex = upperTracks.length - 1;
    carLocalProgress = 1;
  } else {
    carTrackIndex = Math.floor(phase.car.position / posPerTrack);
    carLocalProgress = (phase.car.position % posPerTrack) / posPerTrack;
  }
  const carTrack = upperTracks[carTrackIndex];
  const releasedCarPosition: Vec3 = [
    lerp(carTrack.start[0], carTrack.end[0], carLocalProgress),
    lerp(carTrack.start[1], carTrack.end[1], carLocalProgress),
    0.4,
  ];
  const releasedCarRotation: Vec3 = carTrack.rotation;

  return {
    elevator: {
      progress: elevatorProgress,
      position: elevatorPosition,
      rotation: elevatorRotation,
      carAnchorOffset,
      entryPoint: elevatorEntryPoint,
      exitPoint: elevatorExitPoint,
    },
    lowerTrack: {
      start: [LOWER_TRACK_START_X, LOWER_TRACK_START_Y, 0],
      end: [lowerTrackEndX, lowerTrackEndY, 0],
      center: lowerTrackCenter,
      rotation: lowerTrackRotation,
      length: lowerTrackLength,
    },
    upperTracks,
    car: {
      position: phase.car.isCoupledToElevator ? coupledCarPosition : releasedCarPosition,
      rotation: phase.car.isCoupledToElevator ? elevatorRotation : releasedCarRotation,
      isCoupledToElevator: phase.car.isCoupledToElevator,
    },
  };
}
