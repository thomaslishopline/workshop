import { describe, it, expect } from 'vitest';
import * as fc from 'fast-check';
import { DEFAULT_SEQUENCE, validateSequence } from './trap-sequence.js';
import { TrapType, createNoneTrap, createSpeedTrap } from './trap-types.js';
import { CONFIG } from './config.js';

describe('DEFAULT_SEQUENCE', () => {
  it('has exactly TRAP_SEQUENCE_LENGTH entries', () => {
    expect(DEFAULT_SEQUENCE).toHaveLength(CONFIG.TRAP_SEQUENCE_LENGTH);
  });

  it('contains at least 2 NONE entries', () => {
    const noneCount = DEFAULT_SEQUENCE.filter(t => t.type === TrapType.NONE).length;
    expect(noneCount).toBeGreaterThanOrEqual(2);
  });

  it('all entries have valid trap types', () => {
    const validTypes = Object.values(TrapType);
    for (const entry of DEFAULT_SEQUENCE) {
      expect(validTypes).toContain(entry.type);
    }
  });

  it('passes validation', () => {
    const result = validateSequence(DEFAULT_SEQUENCE);
    expect(result.valid).toBe(true);
    expect(result.errors).toHaveLength(0);
  });
});

describe('validateSequence', () => {
  it('rejects non-array input', () => {
    const result = validateSequence('not an array');
    expect(result.valid).toBe(false);
  });

  it('rejects wrong length', () => {
    const seq = [createNoneTrap(), createNoneTrap()];
    const result = validateSequence(seq);
    expect(result.valid).toBe(false);
    expect(result.errors[0]).toContain('length');
  });

  it('rejects sequence with fewer than 2 NONE entries', () => {
    const seq = Array(10).fill(null).map(() => createSpeedTrap({ speedMultiplier: 2.0 }));
    seq[0] = createNoneTrap(); // only 1 NONE
    const result = validateSequence(seq);
    expect(result.valid).toBe(false);
    expect(result.errors.some(e => e.includes('NONE'))).toBe(true);
  });

  it('accepts valid sequence with exactly 2 NONE entries', () => {
    const seq = Array(10).fill(null).map(() => createSpeedTrap({ speedMultiplier: 2.0 }));
    seq[0] = createNoneTrap();
    seq[5] = createNoneTrap();
    const result = validateSequence(seq);
    expect(result.valid).toBe(true);
  });

  it('rejects entries with invalid type', () => {
    const seq = Array(10).fill(null).map(() => createNoneTrap());
    seq[3] = { type: 'invalid_type', params: null };
    const result = validateSequence(seq);
    expect(result.valid).toBe(false);
  });
});

// PBT: Property P7 — any valid sequence has at least 2 NONE entries
describe('PBT: Sequence NONE count invariant (P7)', () => {
  it('validateSequence rejects sequences with fewer than 2 NONE entries', () => {
    // Generate sequences of length 10 with 0 or 1 NONE entries
    const speedTrapArb = fc.constant(createSpeedTrap({ speedMultiplier: 2.0 }));
    const noneTrapArb = fc.constant(createNoneTrap());

    fc.assert(
      fc.property(
        fc.integer({ min: 0, max: 9 }), // position of single NONE (or -1 for zero NONEs)
        (nonePos) => {
          const seq = Array(10).fill(null).map(() => createSpeedTrap({ speedMultiplier: 2.0 }));
          if (nonePos >= 0 && nonePos < 10) {
            seq[nonePos] = createNoneTrap(); // exactly 1 NONE
          }
          const result = validateSequence(seq);
          expect(result.valid).toBe(false);
        }
      )
    );
  });

  it('validateSequence accepts sequences with 2+ NONE entries', () => {
    fc.assert(
      fc.property(
        fc.uniqueArray(fc.integer({ min: 0, max: 9 }), { minLength: 2, maxLength: 5 }),
        (nonePositions) => {
          const seq = Array(10).fill(null).map(() => createSpeedTrap({ speedMultiplier: 2.0 }));
          for (const pos of nonePositions) {
            seq[pos] = createNoneTrap();
          }
          const result = validateSequence(seq);
          expect(result.valid).toBe(true);
        }
      )
    );
  });
});
