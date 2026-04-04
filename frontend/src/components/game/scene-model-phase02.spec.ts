import { createPhase02 } from '@/game-core';

import { buildPhase02SceneModel } from './scene-model-phase02';

const defaultOpts = { maxHeightA: 10, maxHeightB: 8, inclinationDeg: 25, maxVelocity: 5, maxTicks: 400 };

describe('buildPhase02SceneModel', () => {
  it('car starts at elevatorA anchor while coupled', () => {
    const state = createPhase02(defaultOpts);
    const scene = buildPhase02SceneModel(state);
    expect(scene.car.isCoupledToElevator).toBe(true);
    expect(scene.car.position[0]).toBeCloseTo(scene.elevatorA.position[0] + scene.elevatorA.carAnchorOffset[0]);
  });

  it('elevatorA exit point aligns with track1 start', () => {
    const scene = buildPhase02SceneModel(createPhase02(defaultOpts));
    expect(scene.elevatorA.exitPoint[0]).toBeCloseTo(scene.track1.start[0]);
    expect(scene.elevatorA.exitPoint[1]).toBeCloseTo(scene.track1.start[1]);
  });

  it('track1 end aligns with elevatorB entry at switch point', () => {
    const scene = buildPhase02SceneModel(createPhase02(defaultOpts));
    expect(scene.track1.end[0]).toBeCloseTo(scene.elevatorB.entryPoint[0], 0);
  });

  it('track2 start aligns with elevatorB exit', () => {
    const scene = buildPhase02SceneModel(createPhase02(defaultOpts));
    expect(scene.elevatorB.exitPoint[0]).toBeCloseTo(scene.track2.start[0]);
    expect(scene.elevatorB.exitPoint[1]).toBeCloseTo(scene.track2.start[1]);
  });

  it('car position on track1 progresses from start to end at positions 0-50', () => {
    const state = createPhase02(defaultOpts);
    state.car.position = 25;
    state.car.isCoupledToElevator = false;
    state.carCoupling = 'free';

    const scene = buildPhase02SceneModel(state);
    expect(scene.car.position[0]).toBeGreaterThan(scene.track1.start[0]);
    expect(scene.car.position[0]).toBeLessThan(scene.track1.end[0]);
  });

  it('car position at 100 is at track2 end', () => {
    const state = createPhase02(defaultOpts);
    state.car.position = 100;
    state.car.isCoupledToElevator = false;
    state.carCoupling = 'free';

    const scene = buildPhase02SceneModel(state);
    expect(scene.car.position[0]).toBeCloseTo(scene.track2.end[0]);
    expect(scene.car.position[1]).toBeCloseTo(scene.track2.end[1]);
  });
});
