import { advanceTickAccumulator } from './frame-ticker';

describe('advanceTickAccumulator', () => {
  it('accumulates time without emitting ticks before the threshold', () => {
    const result = advanceTickAccumulator({
      accumulator: 0,
      deltaSeconds: 0.05,
      tickSeconds: 0.12,
    });

    expect(result.ticksToRun).toBe(0);
    expect(result.accumulator).toBeCloseTo(0.05);
  });

  it('emits one tick when the threshold is crossed', () => {
    const result = advanceTickAccumulator({
      accumulator: 0.04,
      deltaSeconds: 0.08,
      tickSeconds: 0.12,
    });

    expect(result.ticksToRun).toBe(1);
    expect(result.accumulator).toBeCloseTo(0);
  });

  it('emits multiple ticks and preserves remainder on long frames', () => {
    const result = advanceTickAccumulator({
      accumulator: 0.02,
      deltaSeconds: 0.29,
      tickSeconds: 0.12,
    });

    expect(result.ticksToRun).toBe(2);
    expect(result.accumulator).toBeCloseTo(0.07);
  });
});
