import { createPhase01Elevator } from '@/game-core';

import { buildPhase01PieceModel } from './piece-model';
import { buildPhase01SceneModel } from './scene-model';

describe('buildPhase01PieceModel', () => {
  it('creates four mirrored wheels around the car body', () => {
    const phase = createPhase01Elevator({ maxHeight: 12, inclinationDeg: 30, maxVelocity: 5, maxTicks: 200 });
    const scene = buildPhase01SceneModel(phase);
    const pieces = buildPhase01PieceModel(scene);

    expect(pieces.car.wheels).toHaveLength(4);
    expect(pieces.car.wheels[0][0]).toBeCloseTo(-pieces.car.wheels[3][0]);
    expect(pieces.car.wheels[0][2]).toBeCloseTo(-pieces.car.wheels[1][2]);
    expect(pieces.car.wheels[2][0]).toBeCloseTo(-pieces.car.wheels[1][0]);
  });

  it('places two elevator guard rails symmetrically on the platform edges', () => {
    const phase = createPhase01Elevator({ maxHeight: 12, inclinationDeg: 30, maxVelocity: 5, maxTicks: 200 });
    const scene = buildPhase01SceneModel(phase);
    const pieces = buildPhase01PieceModel(scene);

    expect(pieces.elevator.guardRails).toHaveLength(2);
    expect(pieces.elevator.guardRails[0][2]).toBeCloseTo(-pieces.elevator.guardRails[1][2]);
    expect(pieces.elevator.guardRails[0][0]).toBeCloseTo(pieces.elevator.guardRails[1][0]);
  });

  it('adds support columns under both tracks', () => {
    const phase = createPhase01Elevator({ maxHeight: 12, inclinationDeg: 30, maxVelocity: 5, maxTicks: 200 });
    const scene = buildPhase01SceneModel(phase);
    const pieces = buildPhase01PieceModel(scene);

    expect(pieces.lowerTrack.supports.length).toBeGreaterThanOrEqual(2);
    expect(pieces.upperTracks[0].supports.length).toBeGreaterThanOrEqual(2);
    expect(pieces.upperTracks[0].supports[0][1]).toBeLessThan(scene.upperTracks[0].center[1]);
  });
});
