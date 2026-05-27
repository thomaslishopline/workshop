import { Player } from './player.js';
import { PipeManager } from './pipe-manager.js';
import { checkPipeCollision, checkBoundaryCollision, checkAdditionalColliders } from './collision-detector.js';
import { ScoreManager } from './score-manager.js';
import { InputHandler } from './input-handler.js';
import { Background } from './background.js';
import { CONFIG } from './config.js';
import { GameState, Difficulty } from './state.js';
import { TrapManager } from './trap-manager.js';
import { SeededRandom } from './seeded-random.js';

export class GameEngine {
  /**
   * @param {HTMLCanvasElement} canvas
   */
  constructor(canvas) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    this.state = GameState.READY;
    this.difficulty = Difficulty.EASY;
    this.player = null;
    this.pipeManager = null;
    this.scoreManager = null;
    this.inputHandler = null;
    this.background = null;
    this.trapManager = null;
    this.seededRandom = null;
    this.lastTimestamp = null;
    this.animationFrameId = null;
  }

  /**
   * Load assets, set up event listeners, and initialize all components.
   */
  init() {
    const sprite = new Image();
    sprite.src = 'usagi.webp';

    sprite.onload = () => {
      this.player = new Player(sprite, CONFIG.PLAYER_X, CONFIG.CANVAS_HEIGHT / 2);
      this._setup();
    };

    sprite.onerror = () => {
      this.ctx.fillStyle = '#000';
      this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
      this.ctx.fillStyle = '#fff';
      this.ctx.font = '20px sans-serif';
      this.ctx.textAlign = 'center';
      this.ctx.fillText('Failed to load usagi.webp', this.canvas.width / 2, this.canvas.height / 2);
    };
  }

  /**
   * Set up game components after sprite is loaded.
   * @private
   */
  _setup() {
    this.seededRandom = new SeededRandom(CONFIG.PIPE_SEED);
    this.trapManager = new TrapManager();

    const gapSize = this.difficulty === Difficulty.HARD ? CONFIG.GAP_SIZE_HARD : CONFIG.GAP_SIZE_EASY;
    this.pipeManager = new PipeManager(CONFIG.CANVAS_WIDTH, CONFIG.CANVAS_HEIGHT, this.trapManager, {
      gapSize,
      randomFn: () => this.seededRandom.next(),
    });

    this.scoreManager = new ScoreManager();
    this.background = new Background(CONFIG.CANVAS_WIDTH, CONFIG.CANVAS_HEIGHT);
    this.inputHandler = new InputHandler(this.canvas);

    this.inputHandler.onAction(() => {
      this._handleInput();
    });

    this.inputHandler.onDifficultyChange(direction => this._handleDifficultyChange(direction));

    this.state = GameState.READY;
    this.render();
  }

  /**
   * Handle difficulty toggle from arrow key input.
   * Only toggles when in READY state.
   * @private
   */
  _handleDifficultyChange(direction) {
    if (this.state !== GameState.READY) {
      return;
    }
    // Toggle between EASY and HARD on any arrow key press
    this.difficulty = this.difficulty === Difficulty.EASY ? Difficulty.HARD : Difficulty.EASY;
    this.render();
  }

  /**
   * Handle input based on current game state.
   * @private
   */
  _handleInput() {
    if (this.state === GameState.READY) {
      this.state = GameState.PLAYING;
      this.player.flap();
    } else if (this.state === GameState.PLAYING) {
      this.player.flap();
    } else if (this.state === GameState.GAME_OVER) {
      this.reset();
    }
  }

  /**
   * Begin the game loop using requestAnimationFrame.
   */
  start() {
    this.lastTimestamp = null;
    const loop = (timestamp) => {
      if (this.lastTimestamp === null) {
        this.lastTimestamp = timestamp;
      }

      let deltaTime = (timestamp - this.lastTimestamp) / 1000;
      this.lastTimestamp = timestamp;

      // Cap deltaTime at 100ms to prevent physics explosions
      if (deltaTime > 0.1) {
        deltaTime = 0.1;
      }

      // Skip frame if deltaTime is 0 or negative
      if (deltaTime > 0) {
        this.update(deltaTime);
        this.render();
      }

      this.animationFrameId = requestAnimationFrame(loop);
    };

    this.animationFrameId = requestAnimationFrame(loop);
  }

  /**
   * Update game state per frame.
   * @param {number} deltaTime - Time elapsed since last frame in seconds
   */
  update(deltaTime) {
    // Always update background
    this.background.update(deltaTime);

    if (this.state === GameState.PLAYING) {
      this.player.update(deltaTime);
      this.pipeManager.update(deltaTime);

      // Process traps
      const pipes = this.pipeManager.getPipes();
      const trapEffects = this.trapManager.update(deltaTime, pipes, this.player);

      // Apply trap effects
      const additionalColliders = [];
      for (const effect of trapEffects) {
        if (effect.modifyPipe && effect.modifyPipe.gapY !== null) {
          pipes[effect.pipeIndex].gapY = effect.modifyPipe.gapY;
        }
        if (effect.modifyPlayer) {
          this.player.applyGravityEffect(
            effect.modifyPlayer.gravityMultiplier,
            effect.modifyPlayer.remainingDuration
          );
        }
        if (effect.addCollider) {
          additionalColliders.push(effect.addCollider);
        }
      }

      // Check collisions
      const hitbox = this.player.getHitbox();

      const pipeCollision = checkPipeCollision(hitbox, pipes, CONFIG.CANVAS_HEIGHT);
      const boundaryCollision = checkBoundaryCollision(hitbox, CONFIG.CANVAS_HEIGHT);
      const trapCollision = additionalColliders.length > 0
        ? checkAdditionalColliders(hitbox, additionalColliders)
        : false;

      if (pipeCollision || boundaryCollision || trapCollision) {
        this.trapManager.markAllActivated(pipes);
        this.state = GameState.GAME_OVER;
        return;
      }

      // Check score
      this.scoreManager.checkScore(this.player.x, pipes);
    }
  }

  /**
   * Draw current frame based on game state.
   */
  render() {
    const ctx = this.ctx;
    const width = this.canvas.width;
    const height = this.canvas.height;

    // Render background (covers canvas)
    this.background.render(ctx);

    // Render pipes
    this.pipeManager.render(ctx);

    // Render player
    if (this.player) {
      this.player.render(ctx);
    }

    // State-specific rendering
    if (this.state === GameState.PLAYING) {
      this.scoreManager.render(ctx, width);
    } else if (this.state === GameState.READY) {
      this._renderReadyScreen(ctx, width, height);
    } else if (this.state === GameState.GAME_OVER) {
      this._renderGameOverScreen(ctx, width, height);
    }
  }

  /**
   * Render the ready/start screen overlay.
   * @private
   */
  _renderReadyScreen(ctx, width, height) {
    ctx.save();
    ctx.textAlign = 'center';

    // Difficulty selector
    const selectorY = height / 2 + 20;
    const easySelected = this.difficulty === Difficulty.EASY;

    // "EASY" label
    ctx.font = easySelected ? 'bold 22px sans-serif' : '20px sans-serif';
    ctx.fillStyle = easySelected ? '#4CAF50' : '#999';
    ctx.fillText('EASY', width / 2 - 60, selectorY);

    // Arrow hint between options
    ctx.font = '18px sans-serif';
    ctx.fillStyle = '#ccc';
    ctx.fillText('← →', width / 2, selectorY);

    // "HARD" label
    ctx.font = !easySelected ? 'bold 22px sans-serif' : '20px sans-serif';
    ctx.fillStyle = !easySelected ? '#F44336' : '#999';
    ctx.fillText('HARD', width / 2 + 60, selectorY);

    // Start instruction
    ctx.fillStyle = 'white';
    ctx.font = 'bold 24px sans-serif';
    ctx.fillText('Press Space or Tap to Start', width / 2, height / 2 + 60);

    ctx.restore();
  }

  /**
   * Render the game over screen overlay.
   * @private
   */
  _renderGameOverScreen(ctx, width, height) {
    ctx.save();
    ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
    ctx.fillRect(0, 0, width, height);

    ctx.fillStyle = 'white';
    ctx.textAlign = 'center';

    ctx.font = 'bold 48px sans-serif';
    ctx.fillText('Game Over', width / 2, height / 2 - 60);

    ctx.font = 'bold 32px sans-serif';
    ctx.fillText(`Score: ${this.scoreManager.getScore()}`, width / 2, height / 2);

    ctx.font = '24px sans-serif';
    ctx.fillText(`High Score: ${this.scoreManager.getHighScore()}`, width / 2, height / 2 + 40);

    ctx.font = '20px sans-serif';
    ctx.fillText('Press Space or Tap to Restart', width / 2, height / 2 + 90);
    ctx.restore();
  }

  /**
   * Reset game to ready state.
   */
  reset() {
    this.scoreManager.reset();
    this.state = GameState.READY;
    this.player.y = CONFIG.CANVAS_HEIGHT / 2;
    this.player.velocity = 0;
    this.player.rotation = 0;
    this.player.clearGravityEffect();

    // Reset seeded PRNG so pipe sequence replays from the start
    this.seededRandom.reset();

    // Recreate PipeManager with current difficulty's gapSize (in case difficulty changed)
    const gapSize = this.difficulty === Difficulty.HARD ? CONFIG.GAP_SIZE_HARD : CONFIG.GAP_SIZE_EASY;
    this.pipeManager = new PipeManager(CONFIG.CANVAS_WIDTH, CONFIG.CANVAS_HEIGHT, this.trapManager, {
      gapSize,
      randomFn: () => this.seededRandom.next(),
    });

    this.trapManager.reset();
  }
}
