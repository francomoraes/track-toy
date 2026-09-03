import type { Phase02State } from '@/game-core';

type Vec3 = [number, number, number];

type ElevatorSceneData = {
  progress: number;
  position: Vec3;
  rotation: Vec3;
  carAnchorOffset: Vec3;
  entryPoint: Vec3;
  exitPoint: Vec3;
};

type TrackSegment = {
  start: Vec3;
  end: Vec3;
  center: Vec3;
  rotation: Vec3;
  length: number;
};

export type Phase02SceneModel = {
  elevatorA: ElevatorSceneData;
  elevatorB: ElevatorSceneData;
  track1: TrackSegment;
  track2: TrackSegment;
  lowerTrack: TrackSegment;
  car: {
    position: Vec3;
    rotation: Vec3;
    isCoupledToElevator: boolean;
  };
};

// ── Layout constants ─────────────────────────────────────────────────────────
const ELEV_A_BASE_X = -5;
const ELEV_A_BASE_Y = 0;
const ELEV_A_TRAVEL_Y = 4;

const ELEV_B_BASE_X = 4;
const ELEV_B_BASE_Y = 0;
const ELEV_B_TRAVEL_Y = 3.5;

const TRACK_SEGMENT_LENGTH = 4.5;
const LOWER_TRACK_START_X = -8;
const LOWER_TRACK_START_Y = 0.3;

const CAR_ANCHOR: Vec3 = [0.55, 0.3, 0];

function lerp(a: number, b: number, t: number) {
  return a + (b - a) * t;
}

function makeTrackSegment(startX: number, startY: number, inclineDeg: number): TrackSegment {
  const angleRad = -(inclineDeg * Math.PI) / 180;
  const endX = startX + TRACK_SEGMENT_LENGTH;
  const endY = startY + Math.tan(angleRad) * TRACK_SEGMENT_LENGTH;
  return {
    start: [startX, startY, 0],
    end: [endX, endY, 0],
    center: [(startX + endX) / 2, (startY + endY) / 2, 0],
    rotation: [0, 0, angleRad],
    length: Math.hypot(endX - startX, endY - startY),
  };
}

export function buildPhase02SceneModel(phase: Phase02State): Phase02SceneModel {
  const inclineDeg = phase.track1.inclinationDeg;
  const angleRad = -(inclineDeg * Math.PI) / 180;

  // Elevator A — brings car UP (same pattern as Phase 1)
  const elevAProgress = phase.elevatorA.position / phase.elevatorA.maxHeight;
  const elevAPosition: Vec3 = [ELEV_A_BASE_X, ELEV_A_BASE_Y + ELEV_A_TRAVEL_Y * elevAProgress, 0];
  const elevAExitPoint: Vec3 = [ELEV_A_BASE_X + CAR_ANCHOR[0], ELEV_A_BASE_Y + ELEV_A_TRAVEL_Y + CAR_ANCHOR[1], 0];
  const elevAEntryPoint: Vec3 = [ELEV_A_BASE_X - 1.0, ELEV_A_BASE_Y + 0.3, 0];

  // Track 1: from Elevator A exit, ends at Elevator B's X position
  const track1EndX = ELEV_B_BASE_X - CAR_ANCHOR[0];
  const track1LengthX = track1EndX - elevAExitPoint[0];
  const track1EndY = elevAExitPoint[1] + Math.tan(angleRad) * track1LengthX;
  const track1: TrackSegment = {
    start: [elevAExitPoint[0], elevAExitPoint[1], 0],
    end: [track1EndX, track1EndY, 0],
    center: [(elevAExitPoint[0] + track1EndX) / 2, (elevAExitPoint[1] + track1EndY) / 2, 0],
    rotation: [0, 0, angleRad],
    length: Math.hypot(track1LengthX, track1EndY - elevAExitPoint[1]),
  };

  // Elevator B: car arrives at BASE (position 0), player holds B to raise it, car exits at TOP
  const elevBProgress = phase.elevatorB.position / phase.elevatorB.maxHeight;
  const elevBMaxY = ELEV_B_BASE_Y + ELEV_B_TRAVEL_Y;
  const elevBPosition: Vec3 = [ELEV_B_BASE_X, ELEV_B_BASE_Y + ELEV_B_TRAVEL_Y * elevBProgress, 0];
  // Car arrives at the base of B from track 1
  const elevBEntryPoint: Vec3 = [ELEV_B_BASE_X - CAR_ANCHOR[0], ELEV_B_BASE_Y + CAR_ANCHOR[1], 0];
  // Car is released at the TOP of B onto track 2
  const elevBExitPoint: Vec3 = [ELEV_B_BASE_X + CAR_ANCHOR[0], elevBMaxY + CAR_ANCHOR[1], 0];

  // Track 2: from Elevator B exit point (ground level), slopes right/down
  const track2InclineDeg = phase.track2.inclinationDeg;
  const track2 = makeTrackSegment(elevBExitPoint[0], elevBExitPoint[1], track2InclineDeg);

  // Lower approach track (decorative, leads to Elevator A base)
  const lowerTrackEndX = elevAEntryPoint[0];
  const lowerTrackLength = Math.abs(lowerTrackEndX - LOWER_TRACK_START_X);
  const lowerTrack: TrackSegment = {
    start: [LOWER_TRACK_START_X, LOWER_TRACK_START_Y, 0],
    end: [lowerTrackEndX, LOWER_TRACK_START_Y, 0],
    center: [(LOWER_TRACK_START_X + lowerTrackEndX) / 2, LOWER_TRACK_START_Y, 0],
    rotation: [0, 0, 0],
    length: lowerTrackLength,
  };

  // Car position
  let carPosition: Vec3;
  let carRotation: Vec3;
  const elevARotation: Vec3 = [0, 0, angleRad];

  if (phase.carCoupling === 'elevatorA') {
    carPosition = [elevAPosition[0] + CAR_ANCHOR[0], elevAPosition[1] + CAR_ANCHOR[1], 0.4];
    carRotation = elevARotation;
  } else if (phase.carCoupling === 'elevatorB') {
    carPosition = [elevBPosition[0] + CAR_ANCHOR[0], elevBPosition[1] + CAR_ANCHOR[1], 0.4];
    carRotation = [0, 0, 0];
  } else {
    // Free rolling — position 0-50 = track1, 50-100 = track2
    const onTrack1 = phase.car.position <= 50;
    const localProgress = onTrack1
      ? phase.car.position / 50
      : (phase.car.position - 50) / 50;
    const seg = onTrack1 ? track1 : track2;
    const t = Math.min(1, Math.max(0, localProgress));
    carPosition = [
      lerp(seg.start[0], seg.end[0], t),
      lerp(seg.start[1], seg.end[1], t),
      0.4,
    ];
    carRotation = seg.rotation;
  }

  return {
    elevatorA: {
      progress: elevAProgress,
      position: elevAPosition,
      rotation: elevARotation,
      carAnchorOffset: CAR_ANCHOR,
      entryPoint: elevAEntryPoint,
      exitPoint: elevAExitPoint,
    },
    elevatorB: {
      progress: elevBProgress,
      position: elevBPosition,
      rotation: [0, 0, 0],
      carAnchorOffset: CAR_ANCHOR,
      entryPoint: elevBEntryPoint,
      exitPoint: elevBExitPoint,
    },
    track1,
    track2,
    lowerTrack,
    car: {
      position: carPosition,
      rotation: carRotation,
      isCoupledToElevator: phase.carCoupling !== 'free',
    },
  };
}
