import { describe, it, expect } from 'vitest';
import * as fc from 'fast-check';
import {
  TrapType,
  createNoneTrap,
  createInvisibleTrap,
  createMovingTrap,
  createFakeGapTrap,
  createGravityTrap,
  createSpeedTrap,
} from './trap-types.js';
import { CONFIG } from './config.js';

describe('TrapType enum', () => {
  it('has all expected trap types', () => {
    expect(TrapType.NONE).toBe('none');
    expect(TrapType.INVISIBLE).toBe('invisible');
    expect(TrapType.MOVING).toBe('moving');
    expect(TrapType.FAKE_GAP).toBe('fake_gap');
    expect(TrapType.GRAVITY).toBe('gravity');
    expect(TrapType.SPEED).toBe('speed');
  });

  it('has exactly 6 types', () => {
    expect(Object.keys(TrapType)).toHaveLength(6);
  });
});

describe('createNoneTrap', () => {
  it('creates a NONE trap with null params', () => {
    const trap = createNoneTrap();
    expect(trap.type).toBe(TrapType.NONE);
    expect(trap.params).toBeNull();
  });
});

describe('createInvisibleTrap', () => {
  it('creates valid invisible trap', () => {
    const trap = createInvisibleTrap({ blockX: 10, blockY: 0, blockWidth: 30, blockHeight: 25 });
    expect(trap.type).toBe(TrapType.INVISIBLE);
    expect(trap.params.blockWidth).toBe(30);
    expect(trap.params.blockHeight).toBe(25);
  });

  it('rejects blockWidth below minimum', () => {
    expect(() => createInvisibleTrap({ blockX: 0, blockY: 0, blockWidth: 10, blockHeight: 25 }))
      .toThrow();
  });

  it('rejects blockWidth above maximum', () => {
    expect(() => createInvisibleTrap({ blockX: 0, blockY: 0, blockWidth: 70, blockHeight: 25 }))
      .toThrow();
  });

  it('rejects blockHeight below minimum', () => {
    expect(() => createInvisibleTrap({ blockX: 0, blockY: 0, blockWidth: 30, blockHeight: 10 }))
      .toThrow();
  });

  it('rejects blockHeight above maximum', () => {
    expect(() => createInvisibleTrap({ blockX: 0, blockY: 0, blockWidth: 30, blockHeight: 50 }))
      .toThrow();
  });
});

describe('createMovingTrap', () => {
  it('creates valid moving trap', () => {
    const trap = createMovingTrap({ moveSpeed: 50, moveDirection: 'oscillate', moveRange: 30 });
    expect(trap.type).toBe(TrapType.MOVING);
    expect(trap.params.moveDirection).toBe('oscillate');
  });

  it('rejects invalid moveDirection', () => {
    expect(() => createMovingTrap({ moveSpeed: 50, moveDirection: 'left', moveRange: 30 }))
      .toThrow();
  });

  it('rejects moveRange above maximum', () => {
    expect(() => createMovingTrap({ moveSpeed: 50, moveDirection: 'up', moveRange: 100 }))
      .toThrow();
  });
});

describe('createFakeGapTrap', () => {
  it('creates valid fake gap trap', () => {
    const trap = createFakeGapTrap({ killZoneY: 20, killZoneHeight: 50, safeSubGapSize: 60 });
    expect(trap.type).toBe(TrapType.FAKE_GAP);
    expect(trap.params.safeSubGapSize).toBe(60);
  });

  it('rejects safeSubGapSize below minimum (P3)', () => {
    expect(() => createFakeGapTrap({ killZoneY: 20, killZoneHeight: 80, safeSubGapSize: 30 }))
      .toThrow();
  });
});

describe('createGravityTrap', () => {
  it('creates valid gravity trap', () => {
    const trap = createGravityTrap({ gravityMultiplier: -0.5, duration: 1.5 });
    expect(trap.type).toBe(TrapType.GRAVITY);
    expect(trap.params.gravityMultiplier).toBe(-0.5);
  });

  it('rejects gravityMultiplier below minimum (P6)', () => {
    expect(() => createGravityTrap({ gravityMultiplier: -2.0, duration: 1.5 }))
      .toThrow();
  });

  it('rejects gravityMultiplier above maximum (P6)', () => {
    expect(() => createGravityTrap({ gravityMultiplier: 4.0, duration: 1.5 }))
      .toThrow();
  });

  it('rejects duration below minimum', () => {
    expect(() => createGravityTrap({ gravityMultiplier: 1.5, duration: 0.5 }))
      .toThrow();
  });

  it('rejects duration above maximum', () => {
    expect(() => createGravityTrap({ gravityMultiplier: 1.5, duration: 3.0 }))
      .toThrow();
  });
});

describe('createSpeedTrap', () => {
  it('creates valid speed trap', () => {
    const trap = createSpeedTrap({ speedMultiplier: 2.5 });
    expect(trap.type).toBe(TrapType.SPEED);
    expect(trap.params.speedMultiplier).toBe(2.5);
  });

  it('rejects speedMultiplier below minimum (P5)', () => {
    expect(() => createSpeedTrap({ speedMultiplier: 1.0 }))
      .toThrow();
  });

  it('rejects speedMultiplier above maximum (P5)', () => {
    expect(() => createSpeedTrap({ speedMultiplier: 5.0 }))
      .toThrow();
  });
});

// PBT: Property P3 — safeSubGapSize always >= FAKE_GAP_MIN_SAFE_SIZE
describe('PBT: Fake gap safe size invariant (P3)', () => {
  it('createFakeGapTrap always rejects safeSubGapSize < minimum', () => {
    fc.assert(
      fc.property(
        fc.integer({ min: 0, max: CONFIG.FAKE_GAP_MIN_SAFE_SIZE - 1 }),
        (size) => {
          expect(() => createFakeGapTrap({ killZoneY: 20, killZoneHeight: 50, safeSubGapSize: size }))
            .toThrow();
        }
      )
    );
  });

  it('createFakeGapTrap always accepts safeSubGapSize >= minimum', () => {
    fc.assert(
      fc.property(
        fc.integer({ min: CONFIG.FAKE_GAP_MIN_SAFE_SIZE, max: 200 }),
        (size) => {
          const trap = createFakeGapTrap({ killZoneY: 20, killZoneHeight: 50, safeSubGapSize: size });
          expect(trap.params.safeSubGapSize).toBe(size);
        }
      )
    );
  });
});

// PBT: Property P5 — speedMultiplier always within bounds
describe('PBT: Speed multiplier bounds invariant (P5)', () => {
  it('rejects multipliers outside valid range', () => {
    fc.assert(
      fc.property(
        fc.oneof(
          fc.double({ min: -10, max: CONFIG.SPEED_MULTIPLIER_MIN - 0.01, noNaN: true }),
          fc.double({ min: CONFIG.SPEED_MULTIPLIER_MAX + 0.01, max: 100, noNaN: true })
        ),
        (mult) => {
          expect(() => createSpeedTrap({ speedMultiplier: mult })).toThrow();
        }
      )
    );
  });

  it('accepts multipliers within valid range', () => {
    fc.assert(
      fc.property(
        fc.double({ min: CONFIG.SPEED_MULTIPLIER_MIN, max: CONFIG.SPEED_MULTIPLIER_MAX, noNaN: true }),
        (mult) => {
          const trap = createSpeedTrap({ speedMultiplier: mult });
          expect(trap.params.speedMultiplier).toBe(mult);
        }
      )
    );
  });
});

// PBT: Property P6 — gravityMultiplier always within bounds
describe('PBT: Gravity multiplier bounds invariant (P6)', () => {
  it('rejects multipliers outside valid range', () => {
    fc.assert(
      fc.property(
        fc.oneof(
          fc.double({ min: -10, max: CONFIG.GRAVITY_MULTIPLIER_MIN - 0.01, noNaN: true }),
          fc.double({ min: CONFIG.GRAVITY_MULTIPLIER_MAX + 0.01, max: 100, noNaN: true })
        ),
        (mult) => {
          expect(() => createGravityTrap({ gravityMultiplier: mult, duration: 1.5 })).toThrow();
        }
      )
    );
  });

  it('accepts multipliers within valid range', () => {
    fc.assert(
      fc.property(
        fc.double({ min: CONFIG.GRAVITY_MULTIPLIER_MIN, max: CONFIG.GRAVITY_MULTIPLIER_MAX, noNaN: true }),
        (mult) => {
          const trap = createGravityTrap({ gravityMultiplier: mult, duration: 1.5 });
          expect(trap.params.gravityMultiplier).toBe(mult);
        }
      )
    );
  });
});
