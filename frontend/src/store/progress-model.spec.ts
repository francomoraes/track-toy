import { buildPhaseMapModel, unlockNextPhase, type ProgressData } from './progress-model';

const EMPTY: ProgressData = { completedPhases: [] };
const PHASE01_DONE: ProgressData = { completedPhases: ['phase01'] };
const BOTH_DONE: ProgressData = { completedPhases: ['phase01', 'phase02'] };

describe('buildPhaseMapModel', () => {
  it('phase01 is always available regardless of progress', () => {
    const map = buildPhaseMapModel(EMPTY);
    expect(map[0].id).toBe('phase01');
    expect(map[0].status).toBe('available');
  });

  it('phase02 is locked until phase01 is completed', () => {
    const map = buildPhaseMapModel(EMPTY);
    const p2 = map.find((p) => p.id === 'phase02')!;
    expect(p2.status).toBe('locked');
  });

  it('phase02 becomes available after phase01 is completed', () => {
    const map = buildPhaseMapModel(PHASE01_DONE);
    const p2 = map.find((p) => p.id === 'phase02')!;
    expect(p2.status).toBe('available');
  });

  it('completed phases are marked as completed', () => {
    const map = buildPhaseMapModel(PHASE01_DONE);
    expect(map[0].status).toBe('completed');
  });

  it('all phases completed when both are done', () => {
    const map = buildPhaseMapModel(BOTH_DONE);
    expect(map.every((p) => p.status === 'completed')).toBe(true);
  });

  it('each entry has id, label, route, and status', () => {
    const map = buildPhaseMapModel(EMPTY);
    for (const entry of map) {
      expect(entry.id).toBeTruthy();
      expect(entry.label).toBeTruthy();
      expect(entry.route).toMatch(/^\/phase\//);
      expect(['available', 'locked', 'completed']).toContain(entry.status);
    }
  });
});

describe('unlockNextPhase', () => {
  it('does nothing if the phase is already completed', () => {
    const next = unlockNextPhase(PHASE01_DONE, 'phase01');
    expect(next.completedPhases).toContain('phase01');
    expect(next.completedPhases.filter((p) => p === 'phase01')).toHaveLength(1);
  });

  it('adds the phase to completedPhases', () => {
    const next = unlockNextPhase(EMPTY, 'phase01');
    expect(next.completedPhases).toContain('phase01');
  });

  it('does not mutate the original data', () => {
    unlockNextPhase(EMPTY, 'phase01');
    expect(EMPTY.completedPhases).toHaveLength(0);
  });
});
