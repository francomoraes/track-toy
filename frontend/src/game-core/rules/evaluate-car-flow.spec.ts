import { evaluateCarFlow } from './evaluate-car-flow';

describe('evaluateCarFlow', () => {
  it('returns success when car reaches goal', () => {
    const result = evaluateCarFlow({
      carPosition: 5,
      goalPosition: 5,
      tick: 2,
      maxTicks: 10,
      mechanismId: 'elevator',
    });

    expect(result.status).toBe('success');
    expect(result.event?.type).toBe('level_complete');
  });

  it('returns failed when tick exceeds maxTicks', () => {
    const result = evaluateCarFlow({
      carPosition: 2,
      goalPosition: 5,
      tick: 10,
      maxTicks: 10,
      mechanismId: 'elevator',
    });

    expect(result.status).toBe('failed');
    expect(result.event?.type).toBe('level_failed');
  });
});
