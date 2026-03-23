export type HoldAction = 'raise' | 'lower' | 'rotate_cw' | 'rotate_ccw' | 'enable_magnet' | 'none';

export interface MechanismState {
  id: string;
  type: 'elevator' | 'rotary_platform' | 'drawbridge' | 'crane_lift';
  active: boolean;
}
