import { createPhase01Elevator, stepPhase01Elevator } from '@/game-core';

import { buildHudModel } from './hud-model';

function makeRunningPhase() {
  return createPhase01Elevator({ maxHeight: 12, inclinationDeg: 30, maxVelocity: 5, maxTicks: 200 });
}

describe('buildHudModel', () => {
  it('overlay is null while phase is running', () => {
    const phase = makeRunningPhase();
    expect(buildHudModel(phase).overlay).toBeNull();
  });

  it('overlay is success when phase status is success', () => {
    const phase = makeRunningPhase();
    phase.status = 'success';
    expect(buildHudModel(phase).overlay).toBe('success');
  });

  it('overlay is failed when phase status is failed', () => {
    const phase = makeRunningPhase();
    phase.status = 'failed';
    expect(buildHudModel(phase).overlay).toBe('failed');
  });

  it('car state is coupled while car is coupled to elevator', () => {
    const phase = makeRunningPhase();
    expect(phase.car.isCoupledToElevator).toBe(true);
    expect(buildHudModel(phase).carState).toBe('coupled');
  });

  it('car state is rolling after car is released', () => {
    let phase = makeRunningPhase();
    for (let tick = 0; tick < 20; tick += 1) {
      phase = stepPhase01Elevator(phase, 'raise');
    }
    expect(phase.car.isCoupledToElevator).toBe(false);
    expect(phase.car.position).toBeGreaterThan(0);
    expect(buildHudModel(phase).carState).toBe('rolling');
  });

  it('elevator progress is a value from 0 to 1', () => {
    let phase = makeRunningPhase();
    for (let tick = 0; tick < 6; tick += 1) {
      phase = stepPhase01Elevator(phase, 'raise');
    }
    const { elevatorProgress } = buildHudModel(phase);
    expect(elevatorProgress).toBeGreaterThan(0);
    expect(elevatorProgress).toBeLessThanOrEqual(1);
  });

  it('car progress is a value from 0 to 1', () => {
    let phase = makeRunningPhase();
    for (let tick = 0; tick < 20; tick += 1) {
      phase = stepPhase01Elevator(phase, 'raise');
    }
    const { carProgress } = buildHudModel(phase);
    expect(carProgress).toBeGreaterThanOrEqual(0);
    expect(carProgress).toBeLessThanOrEqual(1);
  });

  it('time urgency is 0 at start and increases as ticks pass', () => {
    const fresh = makeRunningPhase();
    expect(buildHudModel(fresh).timeUrgency).toBeCloseTo(0);

    const almostDone = { ...fresh, tick: 180 };
    expect(buildHudModel(almostDone).timeUrgency).toBeGreaterThan(0.8);
  });

  it('time urgency is clamped to 1 when ticks exceed maxTicks', () => {
    const phase = { ...makeRunningPhase(), tick: 9999 };
    expect(buildHudModel(phase).timeUrgency).toBe(1);
  });
});
