import { createPhase01Elevator, stepPhase01Elevator } from './phase-01-elevator';

describe('Phase 01 Elevator flow', () => {
  it('completes level when player keeps raising until top', () => {
    let state = createPhase01Elevator({ minHeight: 0, maxHeight: 3, maxTicks: 20 });

    state = stepPhase01Elevator(state, 'raise');
    state = stepPhase01Elevator(state, 'raise');
    state = stepPhase01Elevator(state, 'raise');

    expect(state.status).toBe('success');
    expect(state.carPosition).toBe(3);
    expect(state.events.at(-1)?.type).toBe('level_complete');
  });

  it('fails if time runs out before reaching goal', () => {
    let state = createPhase01Elevator({ minHeight: 0, maxHeight: 3, maxTicks: 2 });

    state = stepPhase01Elevator(state, 'none');
    state = stepPhase01Elevator(state, 'none');

    expect(state.status).toBe('failed');
    expect(state.events.at(-1)?.type).toBe('level_failed');
  });
});
