import { createPhase01Elevator, stepPhase01Elevator } from '@/game-core';

import { buildPhase01SceneModel } from './scene-model';

describe('buildPhase01SceneModel', () => {
  it('keeps the car on the elevator while it is still coupled', () => {
    const phase = createPhase01Elevator({
      maxHeight: 12,
      inclinationDeg: 30,
      maxVelocity: 5,
      maxTicks: 200,
    });

    const scene = buildPhase01SceneModel(phase);

    expect(scene.car.isCoupledToElevator).toBe(true);
    expect(scene.car.position[0]).toBeCloseTo(scene.elevator.position[0] + scene.elevator.carAnchorOffset[0]);
    expect(scene.car.position[1]).toBeCloseTo(scene.elevator.position[1] + scene.elevator.carAnchorOffset[1]);
    expect(scene.car.rotation[2]).toBeCloseTo(scene.elevator.rotation[2]);
  });

  it('raises the elevator vertically as elevator progress increases', () => {
    let phase = createPhase01Elevator({ maxHeight: 12, inclinationDeg: 30, maxVelocity: 5, maxTicks: 200 });

    for (let tick = 0; tick < 6; tick += 1) {
      phase = stepPhase01Elevator(phase, 'raise');
    }

    const scene = buildPhase01SceneModel(phase);

    expect(scene.elevator.progress).toBeCloseTo(0.5);
    expect(scene.elevator.position[1]).toBeCloseTo(2);
  });

  it('places the car on the upper track after it is released', () => {
    let phase = createPhase01Elevator({ maxHeight: 12, inclinationDeg: 30, maxVelocity: 5, maxTicks: 200 });

    for (let tick = 0; tick < 20; tick += 1) {
      phase = stepPhase01Elevator(phase, 'raise');
    }

    const scene = buildPhase01SceneModel(phase);

    expect(scene.car.isCoupledToElevator).toBe(false);
    expect(scene.car.position[0]).toBeGreaterThan(scene.track.start[0]);
    expect(scene.car.position[1]).toBeLessThan(scene.track.start[1]);
    expect(scene.car.rotation[2]).toBeCloseTo(scene.track.rotation[2]);
  });

  it('aligns the elevator exit point with the upper track start at full height', () => {
    let phase = createPhase01Elevator({ maxHeight: 12, inclinationDeg: 30, maxVelocity: 5, maxTicks: 200 });

    for (let tick = 0; tick < 12; tick += 1) {
      phase = stepPhase01Elevator(phase, 'raise');
    }

    const scene = buildPhase01SceneModel(phase);

    expect(scene.elevator.exitPoint[0]).toBeCloseTo(scene.upperTrack.start[0]);
    expect(scene.elevator.exitPoint[1]).toBeCloseTo(scene.upperTrack.start[1]);
  });

  it('includes a lower approach track that meets the elevator at the base', () => {
    const phase = createPhase01Elevator({ maxHeight: 12, inclinationDeg: 30, maxVelocity: 5, maxTicks: 200 });
    const scene = buildPhase01SceneModel(phase);

    expect(scene.lowerTrack.end[0]).toBeCloseTo(scene.elevator.entryPoint[0]);
    expect(scene.lowerTrack.end[1]).toBeCloseTo(scene.elevator.entryPoint[1]);
  });

  it('maps car progress to the end of the track at 100%', () => {
    const phase = createPhase01Elevator({ maxHeight: 12, inclinationDeg: 30, maxVelocity: 5, maxTicks: 200 });
    phase.car.position = 100;
    phase.car.isCoupledToElevator = false;

    const scene = buildPhase01SceneModel(phase);

    expect(scene.car.position[0]).toBeCloseTo(scene.track.end[0]);
    expect(scene.car.position[1]).toBeCloseTo(scene.track.end[1]);
  });

  it('exit point equals the coupled car anchor when elevator is at max height', () => {
    let phase = createPhase01Elevator({ maxHeight: 12, inclinationDeg: 30, maxVelocity: 5, maxTicks: 200 });

    for (let tick = 0; tick < 12; tick += 1) {
      phase = stepPhase01Elevator(phase, 'raise');
    }

    const scene = buildPhase01SceneModel(phase);
    const expectedX = scene.elevator.position[0] + scene.elevator.carAnchorOffset[0];
    const expectedY = scene.elevator.position[1] + scene.elevator.carAnchorOffset[1];

    expect(scene.elevator.exitPoint[0]).toBeCloseTo(expectedX);
    expect(scene.elevator.exitPoint[1]).toBeCloseTo(expectedY);
  });

  it('car position is continuous at the moment of decoupling', () => {
    let phase = createPhase01Elevator({ maxHeight: 12, inclinationDeg: 30, maxVelocity: 5, maxTicks: 200 });

    for (let tick = 0; tick < 12; tick += 1) {
      phase = stepPhase01Elevator(phase, 'raise');
    }

    const coupledAtMax = { ...phase, car: { ...phase.car, isCoupledToElevator: true } };
    const justReleased = { ...phase, car: { ...phase.car, position: 0, isCoupledToElevator: false } };

    const sceneCoupled = buildPhase01SceneModel(coupledAtMax);
    const sceneReleased = buildPhase01SceneModel(justReleased);

    expect(sceneReleased.car.position[0]).toBeCloseTo(sceneCoupled.car.position[0]);
    expect(sceneReleased.car.position[1]).toBeCloseTo(sceneCoupled.car.position[1]);
  });

  it('released car at trackProgress 0 starts exactly at upper track start', () => {
    let phase = createPhase01Elevator({ maxHeight: 12, inclinationDeg: 30, maxVelocity: 5, maxTicks: 200 });

    for (let tick = 0; tick < 12; tick += 1) {
      phase = stepPhase01Elevator(phase, 'raise');
    }

    phase = { ...phase, car: { ...phase.car, position: 0, isCoupledToElevator: false } };

    const scene = buildPhase01SceneModel(phase);

    expect(scene.car.position[0]).toBeCloseTo(scene.upperTrack.start[0]);
    expect(scene.car.position[1]).toBeCloseTo(scene.upperTrack.start[1]);
  });
});