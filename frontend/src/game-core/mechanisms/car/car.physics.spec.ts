import { applyCarPhysicsStep, createCar } from './car.physics';
import type { CarState, TrackConfig } from '../../types';

describe('Car Physics', () => {
  const defaultTrack: TrackConfig = {
    inclinationDeg: 30,
    maxVelocity: 5,
  };

  const defaultCar: CarState = {
    position: 0,
    velocity: 0,
    isGrounded: true,
    isCoupledToElevator: true,
  };

  describe('createCar', () => {
    it('creates car at position 0 with no velocity', () => {
      const car = createCar();
      expect(car.position).toBe(0);
      expect(car.velocity).toBe(0);
      expect(car.isGrounded).toBe(true);
      expect(car.isCoupledToElevator).toBe(true);
    });

    it('creates car at custom position', () => {
      const car = createCar(25);
      expect(car.position).toBe(25);
    });
  });

  describe('applyCarPhysicsStep — flat track (0°)', () => {
    it('does not accelerate on flat track', () => {
      const flatTrack: TrackConfig = { ...defaultTrack, inclinationDeg: 0 };
      const next = applyCarPhysicsStep(defaultCar, flatTrack, 0, 10);
      expect(next.velocity).toBe(0);
    });

    it('does not move if velocity is 0', () => {
      const flatTrack: TrackConfig = { ...defaultTrack, inclinationDeg: 0 };
      const next = applyCarPhysicsStep(defaultCar, flatTrack, 0, 10);
      expect(next.position).toBe(0);
    });
  });

  describe('applyCarPhysicsStep — inclined track with gravity', () => {
    it('does not accelerate while coupled to rising elevator', () => {
      const step = applyCarPhysicsStep(defaultCar, defaultTrack, 5, 10); // elevator rising (5 < 10)
      expect(step.velocity).toBe(0);
      expect(step.position).toBe(0);
    });

    it('accelerates downward once elevator reaches top', () => {
      const next = applyCarPhysicsStep(defaultCar, defaultTrack, 10, 10); // elevator at max (10 == 10)
      expect(next.velocity).toBeGreaterThan(0);
    });

    it('accelerates more on steeper incline (45° > 30°)', () => {
      const step30 = applyCarPhysicsStep(defaultCar, defaultTrack, 10, 10);
      const track45 = { ...defaultTrack, inclinationDeg: 45 };
      const step45 = applyCarPhysicsStep(defaultCar, track45, 10, 10);

      expect(step45.velocity).toBeGreaterThan(step30.velocity);
    });

    it('velocity does not exceed maxVelocity (terminal velocity)', () => {
      let car = { ...defaultCar };
      const track = { ...defaultTrack, inclinationDeg: 60, maxVelocity: 5 };

      for (let i = 0; i < 20; i++) {
        car = applyCarPhysicsStep(car, track, 10, 10); // always at top
      }

      expect(car.velocity).toBeLessThanOrEqual(track.maxVelocity);
    });

    it('moves forward with velocity each tick', () => {
      const track = { ...defaultTrack, inclinationDeg: 30 };
      const car1 = applyCarPhysicsStep(defaultCar, track, 10, 10); // always at top
      expect(car1.position).toBeGreaterThan(0);

      const car2 = applyCarPhysicsStep(car1, track, 10, 10);
      expect(car2.position).toBeGreaterThan(car1.position);
    });
  });

  describe('applyCarPhysicsStep — elevator coupling', () => {
    it('car stays coupled at position 0 while elevator is below maxHeight', () => {
      const car = { ...defaultCar, position: 5, velocity: 2 };
      const next = applyCarPhysicsStep(car, defaultTrack, 8, 10); // elevator at 8, max is 10
      expect(next.position).toBe(0); // car resets to 0 (coupled to elevator at base)
      expect(next.velocity).toBe(0); // velocity resets while coupled
    });

    it('car decouples from elevator when elevator reaches maxHeight', () => {
      const car = { ...defaultCar, position: 0, velocity: 0, isGrounded: true };
      const next = applyCarPhysicsStep(car, defaultTrack, 10, 10); // elevator at top
      expect(next.velocity).toBeGreaterThan(0);
      expect(next.isCoupledToElevator).toBe(false);
    });

    it('keeps moving forward after release even if the elevator goes down again', () => {
      const releasedCar = applyCarPhysicsStep(defaultCar, defaultTrack, 10, 10);
      const next = applyCarPhysicsStep(releasedCar, defaultTrack, 0, 10);

      expect(next.position).toBeGreaterThan(releasedCar.position);
      expect(next.velocity).toBeGreaterThanOrEqual(releasedCar.velocity);
      expect(next.isCoupledToElevator).toBe(false);
    });

    it('returns new object, immutable', () => {
      const car = { ...defaultCar };
      const next = applyCarPhysicsStep(car, defaultTrack, 0, 10);
      expect(next).not.toBe(car);
      expect(car.velocity).toBe(0); // original unchanged
    });
  });

  describe('applyCarPhysicsStep — reaching end of track', () => {
    it('clamps position to 100 (end of track)', () => {
      const car = { position: 98, velocity: 5, isGrounded: true, isCoupledToElevator: false };
      const next = applyCarPhysicsStep(car, defaultTrack, 10, 10);
      expect(next.position).toBeLessThanOrEqual(100);
    });
  });
});
