import { describe, it, expect } from 'vitest';
import * as fc from 'fast-check';
import { TrapManager } from './trap-manager.js';
import { TrapType, createNoneTrap, createSpeedTrap, createInvisibleTrap, createGravityTrap } from './trap-types.js';
import { DEFAULT_SEQUENCE } from './trap-sequence.js';
import { CONFIG } from './config.js';

function createTestSequence() {
  // A simple valid sequence for testing
  const seq = Array(10).fill(null).map(() => createSpeedTrap({ speedMultiplier: 2.0 }));
  seq[0] = createNoneTrap();
  seq[5] = createNoneTrap();
  return seq;
}

describe('TrapManager constructor', () => {
  it('creates with default sequence', () => {
    const tm = new TrapManager();
    expect(tm.sequence).toBe(DEFAULT_SEQUENCE);
    expect(tm.pipeIndex).toBe(0);
  });

  it('creates with custom sequence', () => {
    const seq = createTestSequence();
    const tm = new TrapManager(seq);
    expect(tm.sequence).toBe(seq);
  });

  it('throws on invalid sequence', () => {
    expect(() => new TrapManager([createNoneTrap()])).toThrow();
  });
});

describe('TrapManager.getNextTrap', () => {
  it('returns sequence entries in order', () => {
    const seq = createTestSequence();
    const tm = new TrapManager(seq);

    for (let i = 0; i < 10; i++) {
      expect(tm.getNextTrap()).toBe(seq[i]);
    }
  });

  it('wraps around after sequence length', () => {
    const seq = createTestSequence();
    const tm = new TrapManager(seq);

    // Exhaust first cycle
    for (let i = 0; i < 10; i++) {
      tm.getNextTrap();
    }

    // Second cycle should repeat
    expect(tm.getNextTrap()).toBe(seq[0]);
    expect(tm.getNextTrap()).toBe(seq[1]);
  });
});

describe('TrapManager.reset', () => {
  it('resets pipeIndex to 0', () => {
    const seq = createTestSequence();
    const tm = new TrapManager(seq);

    tm.getNextTrap();
    tm.getNextTrap();
    tm.getNextTrap();
    tm.reset();

    expect(tm.getNextTrap()).toBe(seq[0]);
  });
});

describe('TrapManager.update', () => {
  it('returns empty array for pipes with no traps', () => {
    const tm = new TrapManager();
    const pipes = [
      { x: 200, gapY: 300, gapSize: 140, width: 52, trap: null, trapState: null },
    ];
    const effects = tm.update(0.016, pipes, { x: 80, y: 300, width: 40 });
    expect(effects).toHaveLength(0);
  });

  it('returns empty array for NONE traps', () => {
    const tm = new TrapManager();
    const pipes = [
      { x: 200, gapY: 300, gapSize: 140, width: 52, trap: createNoneTrap(), trapState: null },
    ];
    const effects = tm.update(0.016, pipes, { x: 80, y: 300, width: 40 });
    expect(effects).toHaveLength(0);
  });

  it('returns addCollider for INVISIBLE trap', () => {
    const tm = new TrapManager();
    const trap = createInvisibleTrap({ blockX: 10, blockY: 0, blockWidth: 30, blockHeight: 24 });
    const pipes = [
      { x: 200, gapY: 300, gapSize: 140, width: 52, trap, trapState: null },
    ];
    const effects = tm.update(0.016, pipes, { x: 80, y: 300, width: 40 });
    expect(effects).toHaveLength(1);
    expect(effects[0].type).toBe(TrapType.INVISIBLE);
    expect(effects[0].addCollider).not.toBeNull();
    expect(effects[0].addCollider.width).toBe(30);
  });

  it('returns modifyPlayer for GRAVITY trap when player in range', () => {
    const tm = new TrapManager();
    const trap = createGravityTrap({ gravityMultiplier: -0.5, duration: 1.5 });
    const pipes = [
      { x: 80, gapY: 300, gapSize: 140, width: 52, trap, trapState: null },
    ];
    // Player overlaps pipe x range
    const effects = tm.update(0.016, pipes, { x: 80, y: 300, width: 40 });
    expect(effects).toHaveLength(1);
    expect(effects[0].type).toBe(TrapType.GRAVITY);
    expect(effects[0].modifyPlayer.gravityMultiplier).toBe(-0.5);
  });

  it('returns null for GRAVITY trap when player not in range', () => {
    const tm = new TrapManager();
    const trap = createGravityTrap({ gravityMultiplier: -0.5, duration: 1.5 });
    const pipes = [
      { x: 300, gapY: 300, gapSize: 140, width: 52, trap, trapState: null },
    ];
    // Player far from pipe
    const effects = tm.update(0.016, pipes, { x: 80, y: 300, width: 40 });
    expect(effects).toHaveLength(0);
  });

  it('returns modifyPipe for SPEED trap', () => {
    const tm = new TrapManager();
    const trap = createSpeedTrap({ speedMultiplier: 2.5 });
    const pipes = [
      { x: 200, gapY: 300, gapSize: 140, width: 52, trap, trapState: null },
    ];
    const effects = tm.update(0.016, pipes, { x: 80, y: 300, width: 40 });
    expect(effects).toHaveLength(1);
    expect(effects[0].type).toBe(TrapType.SPEED);
    expect(effects[0].modifyPipe.speedMultiplier).toBe(2.5);
  });
});

describe('TrapManager.markAllActivated', () => {
  it('marks all pipe trapStates as activated', () => {
    const tm = new TrapManager();
    const pipes = [
      { x: 200, gapY: 300, gapSize: 140, width: 52, trap: createSpeedTrap({ speedMultiplier: 2.0 }), trapState: { elapsed: 1, originalGapY: 300, activated: false } },
      { x: 300, gapY: 300, gapSize: 140, width: 52, trap: createNoneTrap(), trapState: { elapsed: 0, originalGapY: 300, activated: false } },
    ];
    tm.markAllActivated(pipes);
    expect(pipes[0].trapState.activated).toBe(true);
    expect(pipes[1].trapState.activated).toBe(true);
  });
});

// PBT: Property P1 — same index always returns same trap
describe('PBT: Deterministic sequence (P1)', () => {
  it('getNextTrap returns same trap for same index across instances', () => {
    fc.assert(
      fc.property(
        fc.integer({ min: 0, max: 99 }),
        (callCount) => {
          const tm1 = new TrapManager();
          const tm2 = new TrapManager();

          for (let i = 0; i < callCount; i++) {
            tm1.getNextTrap();
            tm2.getNextTrap();
          }

          const trap1 = tm1.getNextTrap();
          const trap2 = tm2.getNextTrap();
          expect(trap1).toBe(trap2);
        }
      )
    );
  });
});

// PBT: Property P2 — pipeIndex wraps correctly
describe('PBT: Index wrapping (P2)', () => {
  it('after N calls, pipeIndex === N % 10', () => {
    fc.assert(
      fc.property(
        fc.integer({ min: 0, max: 200 }),
        (n) => {
          const tm = new TrapManager();
          for (let i = 0; i < n; i++) {
            tm.getNextTrap();
          }
          expect(tm.pipeIndex).toBe(n % CONFIG.TRAP_SEQUENCE_LENGTH);
        }
      )
    );
  });
});

// PBT: Property P8 — reset then getNextTrap returns sequence[0]
describe('PBT: Reset idempotence (P8, P9)', () => {
  it('reset followed by getNextTrap always returns sequence[0]', () => {
    fc.assert(
      fc.property(
        fc.integer({ min: 0, max: 50 }),
        (callsBefore) => {
          const tm = new TrapManager();
          for (let i = 0; i < callsBefore; i++) {
            tm.getNextTrap();
          }
          tm.reset();
          expect(tm.getNextTrap()).toBe(DEFAULT_SEQUENCE[0]);
        }
      )
    );
  });

  it('multiple resets are same as single reset (P9)', () => {
    fc.assert(
      fc.property(
        fc.integer({ min: 1, max: 10 }),
        fc.integer({ min: 0, max: 50 }),
        (resetCount, callsBefore) => {
          const tm = new TrapManager();
          for (let i = 0; i < callsBefore; i++) {
            tm.getNextTrap();
          }
          for (let i = 0; i < resetCount; i++) {
            tm.reset();
          }
          expect(tm.pipeIndex).toBe(0);
          expect(tm.getNextTrap()).toBe(DEFAULT_SEQUENCE[0]);
        }
      )
    );
  });
});

// PBT: Property P14 — update with no trapped pipes returns empty
describe('PBT: Empty effects for no traps (P14)', () => {
  it('update returns empty array when no pipes have traps', () => {
    fc.assert(
      fc.property(
        fc.integer({ min: 0, max: 10 }),
        fc.double({ min: 0.001, max: 0.1, noNaN: true }),
        (pipeCount, dt) => {
          const tm = new TrapManager();
          const pipes = Array(pipeCount).fill(null).map((_, i) => ({
            x: 100 + i * 100,
            gapY: 300,
            gapSize: 140,
            width: 52,
            trap: null,
            trapState: null,
          }));
          const effects = tm.update(dt, pipes, { x: 80, y: 300, width: 40 });
          expect(effects).toHaveLength(0);
        }
      )
    );
  });
});

// PBT: Property P15 — index after N calls equals N % 10
describe('PBT: Mathematical oracle for index (P15)', () => {
  it('pipeIndex matches N % TRAP_SEQUENCE_LENGTH after N getNextTrap calls', () => {
    fc.assert(
      fc.property(
        fc.array(fc.oneof(fc.constant('get'), fc.constant('reset')), { minLength: 1, maxLength: 100 }),
        (commands) => {
          const tm = new TrapManager();
          let expectedIndex = 0;

          for (const cmd of commands) {
            if (cmd === 'get') {
              tm.getNextTrap();
              expectedIndex = (expectedIndex + 1) % CONFIG.TRAP_SEQUENCE_LENGTH;
            } else {
              tm.reset();
              expectedIndex = 0;
            }
          }

          expect(tm.pipeIndex).toBe(expectedIndex);
        }
      )
    );
  });
});
