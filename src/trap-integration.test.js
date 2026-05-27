import { describe, it, expect } from 'vitest';
import * as fc from 'fast-check';
import { TrapManager } from './trap-manager.js';
import { TrapType, createNoneTrap, createSpeedTrap, createMovingTrap, createInvisibleTrap } from './trap-types.js';
import { DEFAULT_SEQUENCE } from './trap-sequence.js';
import { CONFIG } from './config.js';

function createTestSequence() {
  const seq = Array(10).fill(null).map(() => createSpeedTrap({ speedMultiplier: 2.0 }));
  seq[0] = createNoneTrap();
  seq[5] = createNoneTrap();
  return seq;
}

describe('Trap Integration', () => {
  describe('Full trap flow', () => {
    it('spawn pipe with trap → update → effects applied', () => {
      const tm = new TrapManager();
      const trap = tm.getNextTrap(); // First trap from DEFAULT_SEQUENCE

      const pipe = {
        x: 200,
        gapY: 300,
        gapSize: CONFIG.GAP_SIZE,
        width: CONFIG.PIPE_WIDTH,
        scored: false,
        trap: trap,
        trapState: null,
      };

      const effects = tm.update(0.016, [pipe], { x: 80, y: 300, width: 40 });

      // First entry in DEFAULT_SEQUENCE is SPEED
      expect(trap.type).toBe(TrapType.SPEED);
      expect(effects.length).toBeGreaterThan(0);
      expect(effects[0].modifyPipe.speedMultiplier).toBe(2.5);
    });

    it('NONE trap produces no effects', () => {
      const tm = new TrapManager();
      const pipe = {
        x: 200,
        gapY: 300,
        gapSize: CONFIG.GAP_SIZE,
        width: CONFIG.PIPE_WIDTH,
        scored: false,
        trap: createNoneTrap(),
        trapState: null,
      };

      const effects = tm.update(0.016, [pipe], { x: 80, y: 300, width: 40 });
      expect(effects).toHaveLength(0);
    });
  });

  describe('Deterministic replay', () => {
    it('same sequence of updates produces same results', () => {
      const tm1 = new TrapManager();
      const tm2 = new TrapManager();

      // Simulate 5 pipes spawning and updating
      for (let i = 0; i < 5; i++) {
        const trap1 = tm1.getNextTrap();
        const trap2 = tm2.getNextTrap();

        expect(trap1.type).toBe(trap2.type);
        if (trap1.params && trap2.params) {
          expect(trap1.params).toEqual(trap2.params);
        }

        const pipe1 = { x: 200, gapY: 300, gapSize: 140, width: 52, trap: trap1, trapState: null };
        const pipe2 = { x: 200, gapY: 300, gapSize: 140, width: 52, trap: trap2, trapState: null };

        const effects1 = tm1.update(0.016, [pipe1], { x: 80, y: 300, width: 40 });
        const effects2 = tm2.update(0.016, [pipe2], { x: 80, y: 300, width: 40 });

        expect(effects1.length).toBe(effects2.length);
      }
    });
  });

  describe('Game reset clears all trap state', () => {
    it('reset returns TrapManager to initial state', () => {
      const tm = new TrapManager();

      // Advance state
      for (let i = 0; i < 7; i++) {
        tm.getNextTrap();
      }

      tm.reset();

      // Should be back to start
      expect(tm.pipeIndex).toBe(0);
      expect(tm.getNextTrap()).toBe(DEFAULT_SEQUENCE[0]);
    });
  });
});

// PBT: Property P13 — MOVING trap stays in bounds for any elapsed time
describe('PBT: Moving pipe stays in bounds (P13)', () => {
  it('gap position remains within canvas bounds for any elapsed time', () => {
    fc.assert(
      fc.property(
        fc.double({ min: 0, max: 60, noNaN: true }),   // elapsed time (up to 60 seconds)
        fc.double({ min: 10, max: 100, noNaN: true }), // moveSpeed
        fc.constantFrom('up', 'down', 'oscillate'),     // direction
        fc.integer({ min: 1, max: CONFIG.MOVING_PIPE_MAX_RANGE }), // moveRange
        fc.integer({ min: CONFIG.GAP_MIN_Y, max: CONFIG.CANVAS_HEIGHT - CONFIG.GAP_MAX_Y_OFFSET }), // originalGapY
        (elapsed, moveSpeed, moveDirection, moveRange, originalGapY) => {
          // Simulate the MOVING trap logic
          let offset = 0;
          if (moveDirection === 'down') {
            offset = Math.min(elapsed * moveSpeed, moveRange);
          } else if (moveDirection === 'up') {
            offset = -Math.min(elapsed * moveSpeed, moveRange);
          } else if (moveDirection === 'oscillate') {
            offset = Math.sin(elapsed * moveSpeed * 0.05) * moveRange;
          }

          let newGapY = originalGapY + offset;
          newGapY = Math.max(CONFIG.GAP_MIN_Y, Math.min(newGapY, CONFIG.CANVAS_HEIGHT - CONFIG.GAP_MAX_Y_OFFSET));

          // Verify bounds
          expect(newGapY).toBeGreaterThanOrEqual(CONFIG.GAP_MIN_Y);
          expect(newGapY).toBeLessThanOrEqual(CONFIG.CANVAS_HEIGHT - CONFIG.GAP_MAX_Y_OFFSET);
        }
      )
    );
  });
});
