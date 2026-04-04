import type { SwitchDirection, SwitchState } from '../../types';

export type { SwitchDirection, SwitchState };

export function createSwitch(): SwitchState {
  return { direction: 'alternate' };
}

export function applySwitchToggle(state: SwitchState): SwitchState {
  return { direction: state.direction === 'main' ? 'alternate' : 'main' };
}
