import { createPhase01Elevator, stepPhase01Elevator } from './phase-01-elevator';

describe('Phase 01 Elevator flow', () => {
  it('car reaches 100 position (end of track) when player holds raise long enough', () => {
    let state = createPhase01Elevator({
      minHeight: 0,
      maxHeight: 10,
      inclinationDeg: 30,
      maxVelocity: 5,
      maxTicks: 200,
    });

    // Simulate player holding raise for many ticks
    for (let i = 0; i < 50; i++) {
      state = stepPhase01Elevator(state, 'raise');
    }

    expect(state.status).toBe('success');
    expect(state.car.position).toBe(100);
    expect(state.events.at(-1)?.type).toBe('level_complete');
  });

  it('fails if time runs out before car reaches end', () => {
    let state = createPhase01Elevator({
      minHeight: 0,
      maxHeight: 10,
      inclinationDeg: 30,
      maxVelocity: 5,
      maxTicks: 5, // very short time limit
    });

    // Let elevator run but then player fails
    for (let i = 0; i < 5; i++) {
      state = stepPhase01Elevator(state, 'none');
    }

    expect(state.status).toBe('failed');
    expect(state.events.at(-1)?.type).toBe('level_failed');
  });

  it('car keeps progressing after leaving the elevator even if the player releases the button', () => {
    let state = createPhase01Elevator({
      minHeight: 0,
      maxHeight: 10,
      inclinationDeg: 30,
      maxVelocity: 5,
      maxTicks: 200,
    });

    for (let i = 0; i < 10; i++) {
      state = stepPhase01Elevator(state, 'raise');
    }

    const releasedPosition = state.car.position;
    state = stepPhase01Elevator(state, 'none');
    state = stepPhase01Elevator(state, 'none');

    expect(releasedPosition).toBeGreaterThan(0);
    expect(state.car.position).toBeGreaterThan(releasedPosition);
    expect(state.car.isCoupledToElevator).toBe(false);
  });

  it('applies physics from tracks[1] when car position is above the midpoint', () => {
    let state = createPhase01Elevator({
      maxHeight: 10,
      tracks: [
        { inclinationDeg: 30, maxVelocity: 20 },
        { inclinationDeg: 10, maxVelocity: 20 },
      ],
      maxTicks: 500,
    });

    // Force car to position 51, already decoupled, velocity reset to 0
    state = {
      ...state,
      car: { ...state.car, position: 51, velocity: 0, isCoupledToElevator: false },
    };

    state = stepPhase01Elevator(state, 'none');

    // sin(10°) * GRAVITY_FACTOR ≈ 0.26; sin(30°) * 1.5 ≈ 0.75
    expect(state.car.velocity).toBeGreaterThan(0.1);
    expect(state.car.velocity).toBeLessThan(0.4);
  });

  it('car completes both tracks and reaches position 100 on a two-track phase', () => {
    let state = createPhase01Elevator({
      maxHeight: 10,
      tracks: [
        { inclinationDeg: 30, maxVelocity: 5 },
        { inclinationDeg: 20, maxVelocity: 5 },
      ],
      maxTicks: 300,
    });

    for (let i = 0; i < 200; i++) {
      state = stepPhase01Elevator(state, i < 10 ? 'raise' : 'none');
      if (state.status !== 'running') break;
    }

    expect(state.status).toBe('success');
    expect(state.car.position).toBe(100);
  });
});
