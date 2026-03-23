import { applyElevatorStep, createElevator } from './elevator.machine';
import type { ElevatorState } from '../../types';

describe('ElevatorPlatform', () => {
  const defaults: ElevatorState = {
    position: 0,
    minHeight: 0,
    maxHeight: 10,
    isMoving: false,
  };

  describe('createElevator', () => {
    it('creates elevator with given config', () => {
      const state = createElevator({ minHeight: 0, maxHeight: 5 });
      expect(state.position).toBe(0);
      expect(state.minHeight).toBe(0);
      expect(state.maxHeight).toBe(5);
      expect(state.isMoving).toBe(false);
    });
  });

  describe('applyElevatorStep — raise', () => {
    it('increments position by 1 when action is raise', () => {
      const next = applyElevatorStep({ ...defaults, position: 3 }, 'raise');
      expect(next.position).toBe(4);
    });

    it('sets isMoving to true while raising', () => {
      const next = applyElevatorStep(defaults, 'raise');
      expect(next.isMoving).toBe(true);
    });

    it('does not exceed maxHeight', () => {
      const next = applyElevatorStep({ ...defaults, position: 10 }, 'raise');
      expect(next.position).toBe(10);
    });

    it('clamps to maxHeight when position would exceed it', () => {
      const next = applyElevatorStep({ ...defaults, position: 9, maxHeight: 10 }, 'raise');
      expect(next.position).toBe(10);
    });
  });

  describe('applyElevatorStep — lower', () => {
    it('decrements position by 1 when action is lower', () => {
      const next = applyElevatorStep({ ...defaults, position: 5 }, 'lower');
      expect(next.position).toBe(4);
    });

    it('sets isMoving to true while lowering', () => {
      const next = applyElevatorStep({ ...defaults, position: 5 }, 'lower');
      expect(next.isMoving).toBe(true);
    });

    it('does not go below minHeight', () => {
      const next = applyElevatorStep({ ...defaults, position: 0 }, 'lower');
      expect(next.position).toBe(0);
    });
  });

  describe('applyElevatorStep — none (idle)', () => {
    it('returns toward minHeight when action is none', () => {
      const next = applyElevatorStep({ ...defaults, position: 5 }, 'none');
      expect(next.position).toBe(4);
    });

    it('sets isMoving to true while returning to minHeight', () => {
      const state: ElevatorState = { ...defaults, position: 5, isMoving: true };
      const next = applyElevatorStep(state, 'none');
      expect(next.isMoving).toBe(true);
    });

    it('stops moving when already at minHeight', () => {
      const next = applyElevatorStep({ ...defaults, position: 0, isMoving: true }, 'none');
      expect(next.position).toBe(0);
      expect(next.isMoving).toBe(false);
    });
  });

  describe('applyElevatorStep — irrelevant actions', () => {
    it('ignores rotate_cw (not an elevator action)', () => {
      const next = applyElevatorStep({ ...defaults, position: 5 }, 'rotate_cw');
      expect(next.position).toBe(5);
      expect(next.isMoving).toBe(false);
    });

    it('ignores enable_magnet', () => {
      const next = applyElevatorStep({ ...defaults, position: 5 }, 'enable_magnet');
      expect(next.position).toBe(5);
    });
  });

  describe('immutability', () => {
    it('returns a new object, never mutates the input', () => {
      const state = { ...defaults, position: 5 };
      const next = applyElevatorStep(state, 'raise');
      expect(next).not.toBe(state);
      expect(state.position).toBe(5); // original unchanged
    });
  });
});
