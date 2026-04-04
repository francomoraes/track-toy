type AdvanceTickAccumulatorParams = {
  accumulator: number;
  deltaSeconds: number;
  tickSeconds: number;
};

type AdvanceTickAccumulatorResult = {
  accumulator: number;
  ticksToRun: number;
};

export function advanceTickAccumulator({
  accumulator,
  deltaSeconds,
  tickSeconds,
}: AdvanceTickAccumulatorParams): AdvanceTickAccumulatorResult {
  const nextAccumulator = accumulator + deltaSeconds;
  const ticksToRun = Math.floor(nextAccumulator / tickSeconds);

  return {
    ticksToRun,
    accumulator: nextAccumulator - ticksToRun * tickSeconds,
  };
}
