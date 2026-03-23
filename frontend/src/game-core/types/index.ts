export type HoldAction =
  | 'raise'
  | 'lower'
  | 'rotate_cw'
  | 'rotate_ccw'
  | 'enable_magnet'
  | 'none';

// ── Mechanism states ────────────────────────────────────────────────────────

export interface ElevatorState {
  position: number; // current height in abstract units
  minHeight: number;
  maxHeight: number;
  isMoving: boolean;
}

export interface RotaryState {
  angleDeg: number; // 0 | 90 | 180 | 270
  isLocked: boolean; // true when aligned (snapped to 90° multiple)
  isRotating: boolean;
}

export interface DrawbridgeState {
  isOpen: boolean;
  isMoving: boolean;
}

export interface CraneLiftState {
  position: number; // current height in abstract units
  minHeight: number;
  maxHeight: number;
  isMoving: boolean;
}

// ── Level / config ───────────────────────────────────────────────────────────

export type MechanismType = 'elevator' | 'rotary_platform' | 'drawbridge' | 'crane_lift';

export interface MechanismConfig {
  id: string;
  type: MechanismType;
}

export interface LevelConfig {
  id: string;
  mechanisms: MechanismConfig[];
  /** seconds available to complete the level */
  timeLimitSecs: number;
}

// ── Events / scoring ─────────────────────────────────────────────────────────

export type GameEventType =
  | 'car_passed'
  | 'car_blocked'
  | 'level_complete'
  | 'level_failed';

export interface GameEvent {
  type: GameEventType;
  mechanismId?: string;
  timestamp: number;
}

export interface Score {
  carsDelivered: number;
  carsBlocked: number;
  timeTakenSecs: number;
  total: number;
}
