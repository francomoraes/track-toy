export type PhaseId = 'phase01' | 'phase02';

export type PhaseStatus = 'available' | 'locked' | 'completed';

export type PhaseMapEntry = {
  id: PhaseId;
  label: string;
  route: string;
  status: PhaseStatus;
};

export type ProgressData = {
  completedPhases: PhaseId[];
};

type PhaseDefinition = {
  id: PhaseId;
  label: string;
  route: string;
  /** Phase that must be completed before this one is unlocked. Null = always available. */
  requires: PhaseId | null;
};

const PHASE_DEFINITIONS: PhaseDefinition[] = [
  { id: 'phase01', label: 'Fase 1 — Elevador e pista inclinada', route: '/phase/01', requires: null },
  { id: 'phase02', label: 'Fase 2 — Duas rampas', route: '/phase/02', requires: 'phase01' },
];

export function buildPhaseMapModel(data: ProgressData): PhaseMapEntry[] {
  return PHASE_DEFINITIONS.map((def) => {
    let status: PhaseStatus;
    if (data.completedPhases.includes(def.id)) {
      status = 'completed';
    } else if (def.requires === null || data.completedPhases.includes(def.requires)) {
      status = 'available';
    } else {
      status = 'locked';
    }
    return { id: def.id, label: def.label, route: def.route, status };
  });
}

export function unlockNextPhase(data: ProgressData, completed: PhaseId): ProgressData {
  if (data.completedPhases.includes(completed)) {
    return data;
  }
  return { ...data, completedPhases: [...data.completedPhases, completed] };
}
