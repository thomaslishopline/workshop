import { CONFIG } from './config.js';
import {
  TrapType,
  createNoneTrap,
  createInvisibleTrap,
  createMovingTrap,
  createFakeGapTrap,
  createGravityTrap,
  createSpeedTrap,
} from './trap-types.js';

/**
 * Default deterministic trap sequence (10 entries, repeating).
 * Designed for Cat Mario-style surprise gameplay.
 *
 * Pattern:
 * 0: SPEED (fast pipe, reduced reaction time)
 * 1: NONE (safe — brief respite)
 * 2: INVISIBLE (hidden block in upper gap)
 * 3: MOVING (gap moves down)
 * 4: NONE (safe)
 * 5: FAKE_GAP (kill zone in lower half)
 * 6: GRAVITY (brief gravity reversal)
 * 7: SPEED (very fast pipe)
 * 8: INVISIBLE (hidden block in lower gap)
 * 9: MOVING (gap oscillates)
 */
export const DEFAULT_SEQUENCE = [
  createSpeedTrap({ speedMultiplier: 2.5 }),
  createNoneTrap(),
  createInvisibleTrap({ blockX: 10, blockY: -20, blockWidth: 32, blockHeight: 24 }),
  createMovingTrap({ moveSpeed: 60, moveDirection: 'down', moveRange: 40 }),
  createNoneTrap(),
  createFakeGapTrap({ killZoneY: 30, killZoneHeight: 50, safeSubGapSize: 60 }),
  createGravityTrap({ gravityMultiplier: -0.5, duration: 1.5 }),
  createSpeedTrap({ speedMultiplier: 3.0 }),
  createInvisibleTrap({ blockX: 10, blockY: 20, blockWidth: 32, blockHeight: 24 }),
  createMovingTrap({ moveSpeed: 50, moveDirection: 'oscillate', moveRange: 30 }),
];

/**
 * Validate a trap sequence meets all business rules.
 * @param {Array} sequence - Array of TrapDefinition objects
 * @returns {{valid: boolean, errors: string[]}}
 */
export function validateSequence(sequence) {
  const errors = [];

  // VR-1: Sequence length must be exactly TRAP_SEQUENCE_LENGTH
  if (!Array.isArray(sequence)) {
    return { valid: false, errors: ['Sequence must be an array'] };
  }

  if (sequence.length !== CONFIG.TRAP_SEQUENCE_LENGTH) {
    errors.push(
      `Sequence length must be ${CONFIG.TRAP_SEQUENCE_LENGTH}, got ${sequence.length}`
    );
  }

  // Check each entry has valid type
  const validTypes = Object.values(TrapType);
  for (let i = 0; i < sequence.length; i++) {
    const entry = sequence[i];
    if (!entry || !validTypes.includes(entry.type)) {
      errors.push(`Entry ${i} has invalid type: ${entry?.type}`);
    }
  }

  // BR-7 / VR-1: At least 2 NONE entries
  const noneCount = sequence.filter(e => e && e.type === TrapType.NONE).length;
  if (noneCount < 2) {
    errors.push(`Sequence must have at least 2 NONE entries, got ${noneCount}`);
  }

  return { valid: errors.length === 0, errors };
}
