import { CONFIG } from './config.js';
import { TrapType } from './trap-types.js';
import { DEFAULT_SEQUENCE, validateSequence } from './trap-sequence.js';

/**
 * TrapManager - Deterministic trap sequencer and per-frame trap processor.
 * Assigns traps to pipes based on a fixed repeating sequence and computes
 * per-frame TrapEffects that modify game behavior.
 */
export class TrapManager {
  /**
   * @param {Array} [sequence] - Custom trap sequence (defaults to DEFAULT_SEQUENCE)
   */
  constructor(sequence) {
    const seq = sequence || DEFAULT_SEQUENCE;
    const validation = validateSequence(seq);
    if (!validation.valid) {
      throw new Error(`Invalid trap sequence: ${validation.errors.join(', ')}`);
    }
    this.sequence = seq;
    this.pipeIndex = 0;
  }

  /**
   * Get the next trap definition for a newly spawned pipe.
   * Advances the internal index (wraps at sequence length).
   * @returns {{type: string, params: object|null}}
   */
  getNextTrap() {
    const trap = this.sequence[this.pipeIndex];
    this.pipeIndex = (this.pipeIndex + 1) % this.sequence.length;
    return trap;
  }

  /**
   * Process all active traps for the current frame.
   * @param {number} deltaTime - Time elapsed since last frame in seconds
   * @param {Array} pipes - Array of pipe objects (with trap and trapState fields)
   * @param {{x: number, y: number, width: number}} player - Player position info
   * @returns {Array<{type: string, pipeIndex: number, modifyPlayer: object|null, modifyPipe: object|null, addCollider: object|null, activated: boolean}>}
   */
  update(deltaTime, pipes, player) {
    const effects = [];

    for (let i = 0; i < pipes.length; i++) {
      const pipe = pipes[i];
      if (!pipe.trap || pipe.trap.type === TrapType.NONE) {
        continue;
      }

      // Initialize trapState if not present
      if (!pipe.trapState) {
        pipe.trapState = { elapsed: 0, originalGapY: pipe.gapY, activated: false };
      }

      pipe.trapState.elapsed += deltaTime;

      const effect = this._processTrap(pipe, player, deltaTime);
      if (effect) {
        effect.pipeIndex = i;
        effects.push(effect);
      }
    }

    return effects;
  }

  /**
   * Process a single trap and return its effect.
   * @private
   * @param {object} pipe - Pipe object with trap and trapState
   * @param {object} player - Player position info
   * @param {number} deltaTime - Frame delta time
   * @returns {object|null} TrapEffect or null
   */
  _processTrap(pipe, player, deltaTime) {
    const { trap, trapState } = pipe;

    switch (trap.type) {
      case TrapType.INVISIBLE:
        return this._processInvisible(pipe, trapState);

      case TrapType.MOVING:
        return this._processMoving(pipe, trapState);

      case TrapType.FAKE_GAP:
        return this._processFakeGap(pipe, trapState);

      case TrapType.GRAVITY:
        return this._processGravity(pipe, player, trapState);

      case TrapType.SPEED:
        return this._processSpeed(pipe, trapState);

      default:
        return null;
    }
  }

  /**
   * Process INVISIBLE trap — returns hidden block collider.
   * @private
   */
  _processInvisible(pipe, trapState) {
    const { blockX, blockY, blockWidth, blockHeight } = pipe.trap.params;
    const gapTop = pipe.gapY - pipe.gapSize / 2;

    return {
      type: TrapType.INVISIBLE,
      pipeIndex: 0,
      modifyPlayer: null,
      modifyPipe: null,
      addCollider: {
        x: pipe.x + blockX,
        y: gapTop + (pipe.gapSize / 2) + blockY - blockHeight / 2,
        width: blockWidth,
        height: blockHeight,
      },
      activated: trapState.activated,
    };
  }

  /**
   * Process MOVING trap — shifts pipe gap position over time.
   * @private
   */
  _processMoving(pipe, trapState) {
    const { moveSpeed, moveDirection, moveRange } = pipe.trap.params;
    const elapsed = trapState.elapsed;
    let offset = 0;

    if (moveDirection === 'down') {
      offset = Math.min(elapsed * moveSpeed, moveRange);
    } else if (moveDirection === 'up') {
      offset = -Math.min(elapsed * moveSpeed, moveRange);
    } else if (moveDirection === 'oscillate') {
      // Sine wave oscillation
      offset = Math.sin(elapsed * moveSpeed * 0.05) * moveRange;
    }

    // Clamp to canvas bounds
    let newGapY = trapState.originalGapY + offset;
    newGapY = Math.max(CONFIG.GAP_MIN_Y, Math.min(newGapY, CONFIG.CANVAS_HEIGHT - CONFIG.GAP_MAX_Y_OFFSET));

    trapState.activated = true;

    return {
      type: TrapType.MOVING,
      pipeIndex: 0,
      modifyPlayer: null,
      modifyPipe: { gapY: newGapY, speedMultiplier: null },
      addCollider: null,
      activated: true,
    };
  }

  /**
   * Process FAKE_GAP trap — returns kill zone collider within the gap.
   * @private
   */
  _processFakeGap(pipe, trapState) {
    const { killZoneY, killZoneHeight } = pipe.trap.params;
    const gapTop = pipe.gapY - pipe.gapSize / 2;

    return {
      type: TrapType.FAKE_GAP,
      pipeIndex: 0,
      modifyPlayer: null,
      modifyPipe: null,
      addCollider: {
        x: pipe.x,
        y: gapTop + killZoneY,
        width: pipe.width,
        height: killZoneHeight,
      },
      activated: trapState.activated,
    };
  }

  /**
   * Process GRAVITY trap — modifies player gravity when in proximity.
   * @private
   */
  _processGravity(pipe, player, trapState) {
    const { gravityMultiplier, duration } = pipe.trap.params;

    // Activate when player x overlaps with pipe x range
    const playerRight = player.x + (player.width || 40);
    const pipeRight = pipe.x + pipe.width;

    if (playerRight >= pipe.x && player.x <= pipeRight) {
      trapState.activated = true;
      return {
        type: TrapType.GRAVITY,
        pipeIndex: 0,
        modifyPlayer: { gravityMultiplier, remainingDuration: duration },
        modifyPipe: null,
        addCollider: null,
        activated: true,
      };
    }

    return null;
  }

  /**
   * Process SPEED trap — returns speed multiplier for the pipe.
   * @private
   */
  _processSpeed(pipe, trapState) {
    trapState.activated = true;

    return {
      type: TrapType.SPEED,
      pipeIndex: 0,
      modifyPlayer: null,
      modifyPipe: { gapY: null, speedMultiplier: pipe.trap.params.speedMultiplier },
      addCollider: null,
      activated: true,
    };
  }

  /**
   * Mark all active traps as activated (called on game over for visual feedback).
   * @param {Array} pipes - Array of pipe objects
   */
  markAllActivated(pipes) {
    for (const pipe of pipes) {
      if (pipe.trapState) {
        pipe.trapState.activated = true;
      }
    }
  }

  /**
   * Reset trap manager state for new game.
   */
  reset() {
    this.pipeIndex = 0;
  }
}
