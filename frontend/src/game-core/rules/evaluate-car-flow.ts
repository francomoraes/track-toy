import type { GameEvent } from '../types';

export type PhaseStatus = 'running' | 'success' | 'failed';

interface EvaluateCarFlowParams {
  carPosition: number;
  goalPosition: number;
  tick: number;
  maxTicks: number;
  mechanismId: string;
}

interface EvaluateCarFlowResult {
  status: PhaseStatus;
  event?: GameEvent;
}

export function evaluateCarFlow(params: EvaluateCarFlowParams): EvaluateCarFlowResult {
  const now = Date.now();

  if (params.carPosition >= params.goalPosition) {
    return {
      status: 'success',
      event: {
        type: 'level_complete',
        mechanismId: params.mechanismId,
        timestamp: now,
      },
    };
  }

  if (params.tick >= params.maxTicks) {
    return {
      status: 'failed',
      event: {
        type: 'level_failed',
        mechanismId: params.mechanismId,
        timestamp: now,
      },
    };
  }

  return { status: 'running' };
}
