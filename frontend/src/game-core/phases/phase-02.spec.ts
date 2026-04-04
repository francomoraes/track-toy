import { createPhase02, stepPhase02, type Phase02Input } from './phase-02';

const defaultOptions = {
  maxHeightA: 10,
  maxHeightB: 8,
  inclinationDeg: 25,
  maxVelocity: 5,
  maxTicks: 400,
};

const holdA: Phase02Input = { held: 'raise_a' };
const holdB: Phase02Input = { held: 'raise_b' };
const holdNone: Phase02Input = { held: 'none' };

function tick(state: ReturnType<typeof createPhase02>, input: Phase02Input, times = 1) {
  let s = state;
  for (let i = 0; i < times; i++) {
    s = stepPhase02(s, input);
  }
  return s;
}

/** Raise A to max, let car roll — B is at 0 so car auto-couples. */
function runToCoupled(base: ReturnType<typeof createPhase02>) {
  let state = tick(base, holdA, defaultOptions.maxHeightA);
  for (let i = 0; i < 30; i++) {
    state = stepPhase02(state, holdNone);
    if (state.carCoupling === 'elevatorB' || state.status !== 'running') break;
  }
  return state;
}

describe('Phase 02 — two elevators in sequence', () => {
  it('car starts coupled to elevatorA', () => {
    const state = createPhase02(defaultOptions);
    expect(state.carCoupling).toBe('elevatorA');
    expect(state.car.position).toBe(0);
  });

  it('car is released from elevatorA when it reaches max height', () => {
    let state = createPhase02(defaultOptions);
    state = tick(state, holdA, defaultOptions.maxHeightA);
    expect(state.elevatorA.position).toBe(defaultOptions.maxHeightA);
    expect(state.carCoupling).toBe('free');
  });

  it('car rolls on track 1 from position 0 after elevator A releases it', () => {
    let state = createPhase02(defaultOptions);
    state = tick(state, holdA, defaultOptions.maxHeightA);
    const posAfterRelease = state.car.position;
    state = stepPhase02(state, holdNone);
    expect(state.car.position).toBeGreaterThan(posAfterRelease);
  });

  it('car fails if elevatorB is raised when car arrives at position 50', () => {
    let state = createPhase02(defaultOptions);
    state = tick(state, holdA, defaultOptions.maxHeightA);
    // Hold B while car rolls — B rises > 0, car fails when it crosses 50
    state = tick(state, holdB, 50);
    expect(state.status).toBe('failed');
  });

  it('car couples to elevatorB when B is at position 0', () => {
    const state = runToCoupled(createPhase02(defaultOptions));
    expect(state.carCoupling).toBe('elevatorB');
    expect(state.elevatorB.position).toBe(0);
    expect(state.status).toBe('running');
  });

  it('elevatorB rises with car when raise_b is held while coupled', () => {
    let state = runToCoupled(createPhase02(defaultOptions));
    const bBefore = state.elevatorB.position; // = 0
    state = stepPhase02(state, holdB);
    expect(state.elevatorB.position).toBeGreaterThan(bBefore);
  });

  it('car is released from elevatorB when it reaches max height', () => {
    let state = runToCoupled(createPhase02(defaultOptions));
    state = tick(state, holdB, defaultOptions.maxHeightB + 2);
    expect(state.carCoupling).toBe('free');
    expect(state.car.position).toBeGreaterThanOrEqual(50);
  });

  it('car reaches position 100 after being released from elevatorB', () => {
    let state = runToCoupled(createPhase02(defaultOptions));
    state = tick(state, holdB, defaultOptions.maxHeightB + 2);
    expect(state.carCoupling).toBe('free');
    state = tick(state, holdNone, 100);
    expect(state.status).toBe('success');
    expect(state.car.position).toBe(100);
  });

  it('track2 has half the inclination of track1', () => {
    const state = createPhase02(defaultOptions);
    expect(state.track2.inclinationDeg).toBe(state.track1.inclinationDeg / 2);
  });

  it('stops stepping once status is not running', () => {
    let state = createPhase02(defaultOptions);
    state = tick(state, holdA, defaultOptions.maxHeightA);
    state = tick(state, holdB, 50); // B raised → fails when car arrives
    expect(state.status).toBe('failed');
    const failedState = state;
    expect(stepPhase02(state, holdA)).toStrictEqual(failedState);
  });

  it('fails on timeout', () => {
    const state = createPhase02({ ...defaultOptions, maxTicks: 3 });
    const final = tick(state, holdNone, 3);
    expect(final.status).toBe('failed');
  });
});
