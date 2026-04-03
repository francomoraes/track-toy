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

// ── Car physics ──────────────────────────────────────────────────────────────

export interface CarState {
  position: number; // 0-100: progress along track from start to end
  velocity: number; // units/tick, positive = forward, negative = backward
  isGrounded: boolean; // true if on elevator or track
  isCoupledToElevator: boolean; // true until the car is released at the top
}

export interface TrackConfig {
  /** Inclination angle in degrees (0 = flat, 90 = vertical) */
  inclinationDeg: number;
  /** Total track length (position goes from 0 to 100 regardless) */
  length: number;
  /** Terminal velocity limit to maintain playability */
  maxVelocity: number;
}

/** Physics constant: scales acceleration based on incline angle */
export const GRAVITY_FACTOR = 1.5;

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
