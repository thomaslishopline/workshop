import { CONFIG } from './config.js';

export class PipeManager {
  /**
   * @param {number} canvasWidth - Width of the game canvas
   * @param {number} canvasHeight - Height of the game canvas
   * @param {object} [trapManager] - Optional TrapManager instance for trap assignment
   * @param {object} [options] - Optional configuration for deterministic pipe generation
   * @param {number} [options.gapSize] - Gap size in pixels (defaults to CONFIG.GAP_SIZE)
   * @param {function} [options.randomFn] - Random number generator function returning [0, 1) (defaults to Math.random with warning)
   */
  constructor(canvasWidth, canvasHeight, trapManager, options) {
    this.canvasWidth = canvasWidth;
    this.canvasHeight = canvasHeight;
    this.trapManager = trapManager || null;

    const opts = options || {};
    this.gapSize = opts.gapSize || CONFIG.GAP_SIZE;

    if (opts.randomFn) {
      this.randomFn = opts.randomFn;
    } else {
      console.warn('PipeManager: no randomFn provided, falling back to Math.random(). Provide a seeded PRNG for deterministic pipe generation.');
      this.randomFn = Math.random;
    }

    this.pipes = [];
    this.spawnTimer = 0;
  }

  /**
   * Update pipe positions, spawn new pipes at intervals, and remove off-screen pipes.
   * @param {number} deltaTime - Time elapsed since last frame in seconds
   */
  update(deltaTime) {
    // Move all pipes to the left (respecting per-pipe speed multiplier from SPEED traps)
    for (const pipe of this.pipes) {
      const speedMult = (pipe.trapState && pipe.trap && pipe.trap.type === 'speed')
        ? pipe.trap.params.speedMultiplier
        : 1;
      pipe.x -= CONFIG.PIPE_SPEED * speedMult * deltaTime;
    }

    // Remove pipes that have moved entirely off-screen
    this.pipes = this.pipes.filter(pipe => pipe.x + pipe.width >= 0);

    // Spawn new pipes at regular intervals
    this.spawnTimer += deltaTime;
    if (this.spawnTimer >= CONFIG.PIPE_SPAWN_INTERVAL) {
      this.spawnTimer -= CONFIG.PIPE_SPAWN_INTERVAL;
      this._spawnPipe();
    }
  }

  /**
   * Spawn a new pipe pair at the right edge of the canvas.
   * @private
   */
  _spawnPipe() {
    const minY = CONFIG.GAP_MIN_Y;
    const maxY = this.canvasHeight - CONFIG.GAP_MAX_Y_OFFSET;
    const gapY = minY + this.randomFn() * (maxY - minY);

    const trap = this.trapManager ? this.trapManager.getNextTrap() : null;

    this.pipes.push({
      x: this.canvasWidth,
      gapY,
      gapSize: this.gapSize,
      width: CONFIG.PIPE_WIDTH,
      scored: false,
      trap: trap,
      trapState: null,
    });
  }

  /**
   * Get the array of active pipe pairs.
   * @returns {Array<{x: number, gapY: number, gapSize: number, width: number, scored: boolean}>}
   */
  getPipes() {
    return this.pipes;
  }

  /**
   * Reset all pipes and the spawn timer.
   */
  reset() {
    this.pipes = [];
    this.spawnTimer = 0;
  }

  /**
   * Render all pipe pairs as green rectangles, with trap visuals for activated traps.
   * @param {CanvasRenderingContext2D} ctx
   */
  render(ctx) {
    ctx.fillStyle = '#2ecc40';

    for (const pipe of this.pipes) {
      const topPipeBottom = pipe.gapY - pipe.gapSize / 2;
      const bottomPipeTop = pipe.gapY + pipe.gapSize / 2;

      // Draw top pipe: from y=0 to the top of the gap
      ctx.fillRect(pipe.x, 0, pipe.width, topPipeBottom);

      // Draw bottom pipe: from the bottom of the gap to canvas bottom
      ctx.fillRect(pipe.x, bottomPipeTop, pipe.width, this.canvasHeight - bottomPipeTop);

      // Render activated trap visuals
      if (pipe.trapState && pipe.trapState.activated && pipe.trap) {
        this._renderTrapVisual(ctx, pipe);
      }
    }
  }

  /**
   * Render visual indicator for an activated trap.
   * @private
   * @param {CanvasRenderingContext2D} ctx
   * @param {object} pipe
   */
  _renderTrapVisual(ctx, pipe) {
    const gapTop = pipe.gapY - pipe.gapSize / 2;

    switch (pipe.trap.type) {
      case 'invisible': {
        const { blockX, blockY, blockWidth, blockHeight } = pipe.trap.params;
        ctx.fillStyle = 'rgba(255, 0, 0, 0.7)';
        ctx.fillRect(
          pipe.x + blockX,
          gapTop + (pipe.gapSize / 2) + blockY - blockHeight / 2,
          blockWidth,
          blockHeight
        );
        break;
      }
      case 'fake_gap': {
        const { killZoneY, killZoneHeight } = pipe.trap.params;
        ctx.fillStyle = 'rgba(255, 0, 0, 0.4)';
        ctx.fillRect(pipe.x, gapTop + killZoneY, pipe.width, killZoneHeight);
        break;
      }
      case 'gravity': {
        ctx.fillStyle = 'rgba(128, 0, 255, 0.3)';
        ctx.fillRect(pipe.x, gapTop, pipe.width, pipe.gapSize);
        break;
      }
      // MOVING and SPEED are inherently visible (movement/speed is observable)
      default:
        break;
    }
  }
}
