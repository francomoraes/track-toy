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
});
