import { CONFIG } from './config.js';

/**
 * Enum of trap types available in the Cat Mario trap system.
 */
export const TrapType = {
  NONE: 'none',
  INVISIBLE: 'invisible',
  MOVING: 'moving',
  FAKE_GAP: 'fake_gap',
  GRAVITY: 'gravity',
  SPEED: 'speed',
};

/**
 * Create a "no trap" definition (safe pipe).
 * @returns {{type: string, params: null}}
 */
export function createNoneTrap() {
  return { type: TrapType.NONE, params: null };
}

/**
 * Create an invisible obstacle trap definition.
 * @param {object} params
 * @param {number} params.blockX - x-offset within pipe width
 * @param {number} params.blockY - y-position of hidden block (within gap area)
 * @param {number} params.blockWidth - width of hidden block (20-60)
 * @param {number} params.blockHeight - height of hidden block (20-40)
 * @returns {{type: string, params: object}}
 */
export function createInvisibleTrap({ blockX, blockY, blockWidth, blockHeight }) {
  validateInvisibleParams(blockWidth, blockHeight);
  return {
    type: TrapType.INVISIBLE,
    params: { blockX, blockY, blockWidth, blockHeight },
  };
}

/**
 * Create a moving pipe trap definition.
 * @param {object} params
 * @param {number} params.moveSpeed - pixels/sec of gap movement
 * @param {string} params.moveDirection - 'up', 'down', or 'oscillate'
 * @param {number} params.moveRange - maximum pixels to move from original position
 * @returns {{type: string, params: object}}
 */
export function createMovingTrap({ moveSpeed, moveDirection, moveRange }) {
  if (moveRange < 0 || moveRange > CONFIG.MOVING_PIPE_MAX_RANGE) {
    throw new Error(`moveRange must be between 0 and ${CONFIG.MOVING_PIPE_MAX_RANGE}, got ${moveRange}`);
  }
  if (!['up', 'down', 'oscillate'].includes(moveDirection)) {
    throw new Error(`moveDirection must be 'up', 'down', or 'oscillate', got '${moveDirection}'`);
  }
  return {
    type: TrapType.MOVING,
    params: { moveSpeed, moveDirection, moveRange },
  };
}

/**
 * Create a fake safe gap trap definition.
 * @param {object} params
 * @param {number} params.killZoneY - y-position of kill zone within gap
 * @param {number} params.killZoneHeight - height of kill zone
 * @param {number} params.safeSubGapSize - actual safe passage size (>= FAKE_GAP_MIN_SAFE_SIZE)
 * @returns {{type: string, params: object}}
 */
export function createFakeGapTrap({ killZoneY, killZoneHeight, safeSubGapSize }) {
  if (safeSubGapSize < CONFIG.FAKE_GAP_MIN_SAFE_SIZE) {
    throw new Error(
      `safeSubGapSize must be >= ${CONFIG.FAKE_GAP_MIN_SAFE_SIZE}, got ${safeSubGapSize}`
    );
  }
  return {
    type: TrapType.FAKE_GAP,
    params: { killZoneY, killZoneHeight, safeSubGapSize },
  };
}

/**
 * Create a gravity flip zone trap definition.
 * @param {object} params
 * @param {number} params.gravityMultiplier - multiplier for CONFIG.GRAVITY (-1.0 to 3.0)
 * @param {number} params.duration - seconds the effect lasts (1.0 to 2.0)
 * @returns {{type: string, params: object}}
 */
export function createGravityTrap({ gravityMultiplier, duration }) {
  if (gravityMultiplier < CONFIG.GRAVITY_MULTIPLIER_MIN || gravityMultiplier > CONFIG.GRAVITY_MULTIPLIER_MAX) {
    throw new Error(
      `gravityMultiplier must be between ${CONFIG.GRAVITY_MULTIPLIER_MIN} and ${CONFIG.GRAVITY_MULTIPLIER_MAX}, got ${gravityMultiplier}`
    );
  }
  if (duration < CONFIG.GRAVITY_EFFECT_MIN_DURATION || duration > CONFIG.GRAVITY_EFFECT_MAX_DURATION) {
    throw new Error(
      `duration must be between ${CONFIG.GRAVITY_EFFECT_MIN_DURATION} and ${CONFIG.GRAVITY_EFFECT_MAX_DURATION}, got ${duration}`
    );
  }
  return {
    type: TrapType.GRAVITY,
    params: { gravityMultiplier, duration },
  };
}

/**
 * Create a speed trap definition.
 * @param {object} params
 * @param {number} params.speedMultiplier - multiplier for pipe speed (1.5 to 4.0)
 * @returns {{type: string, params: object}}
 */
export function createSpeedTrap({ speedMultiplier }) {
  if (speedMultiplier < CONFIG.SPEED_MULTIPLIER_MIN || speedMultiplier > CONFIG.SPEED_MULTIPLIER_MAX) {
    throw new Error(
      `speedMultiplier must be between ${CONFIG.SPEED_MULTIPLIER_MIN} and ${CONFIG.SPEED_MULTIPLIER_MAX}, got ${speedMultiplier}`
    );
  }
  return {
    type: TrapType.SPEED,
    params: { speedMultiplier },
  };
}

/**
 * Validate invisible block size constraints.
 * @param {number} blockWidth
 * @param {number} blockHeight
 */
function validateInvisibleParams(blockWidth, blockHeight) {
  if (blockWidth < CONFIG.INVISIBLE_BLOCK_MIN_SIZE || blockWidth > CONFIG.INVISIBLE_BLOCK_MAX_WIDTH) {
    throw new Error(
      `blockWidth must be between ${CONFIG.INVISIBLE_BLOCK_MIN_SIZE} and ${CONFIG.INVISIBLE_BLOCK_MAX_WIDTH}, got ${blockWidth}`
    );
  }
  if (blockHeight < CONFIG.INVISIBLE_BLOCK_MIN_SIZE || blockHeight > CONFIG.INVISIBLE_BLOCK_MAX_HEIGHT) {
    throw new Error(
      `blockHeight must be between ${CONFIG.INVISIBLE_BLOCK_MIN_SIZE} and ${CONFIG.INVISIBLE_BLOCK_MAX_HEIGHT}, got ${blockHeight}`
    );
  }
}
