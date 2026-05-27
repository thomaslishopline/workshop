import { describe, it, expect, beforeEach, vi } from 'vitest';
import { GameEngine } from './game-engine.js';
import { GameState, Difficulty } from './state.js';
import { CONFIG } from './config.js';
import { TrapManager } from './trap-manager.js';

/**
 * Create a minimal mock canvas and 2D context for testing.
 */
function createMockCanvas() {
  const ctx = {
    fillStyle: '',
    font: '',
    textAlign: '',
    fillRect: vi.fn(),
    fillText: vi.fn(),
    clearRect: vi.fn(),
    save: vi.fn(),
    restore: vi.fn(),
    translate: vi.fn(),
    rotate: vi.fn(),
    drawImage: vi.fn(),
    beginPath: vi.fn(),
    ellipse: vi.fn(),
    fill: vi.fn(),
    createLinearGradient: vi.fn(() => ({
      addColorStop: vi.fn(),
    })),
  };

  const canvas = {
    width: CONFIG.CANVAS_WIDTH,
    height: CONFIG.CANVAS_HEIGHT,
    getContext: vi.fn(() => ctx),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
  };

  return { canvas, ctx };
}

/**
 * Create a GameEngine with a pre-loaded player (bypassing async image load).
 */
function createInitializedEngine() {
  const { canvas, ctx } = createMockCanvas();

  // Mock document for InputHandler
  const mockDoc = {
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
  };

  const engine = new GameEngine(canvas);

  // Manually initialize components to bypass image loading
  const mockSprite = { width: 40, height: 40 };

  // Import and instantiate components directly
  const { Player } = require('./player.js');
  const { PipeManager } = require('./pipe-manager.js');
  const { ScoreManager } = require('./score-manager.js');
  const { InputHandler } = require('./input-handler.js');
  const { Background } = require('./background.js');
  const { SeededRandom } = require('./seeded-random.js');

  engine.player = new Player(mockSprite, CONFIG.PLAYER_X, CONFIG.CANVAS_HEIGHT / 2);
  engine.trapManager = new TrapManager();
  engine.seededRandom = new SeededRandom(CONFIG.PIPE_SEED);

  const gapSize = engine.difficulty === 'hard' ? CONFIG.GAP_SIZE_HARD : CONFIG.GAP_SIZE_EASY;
  engine.pipeManager = new PipeManager(CONFIG.CANVAS_WIDTH, CONFIG.CANVAS_HEIGHT, engine.trapManager, {
    gapSize,
    randomFn: () => engine.seededRandom.next(),
  });

  engine.scoreManager = new ScoreManager();
  engine.background = new Background(CONFIG.CANVAS_WIDTH, CONFIG.CANVAS_HEIGHT);
  engine.inputHandler = new InputHandler(canvas, mockDoc);
  engine.inputHandler.onAction(() => engine._handleInput());
  engine.ready = true;

  return { engine, canvas, ctx };
}

describe('GameEngine', () => {
  describe('constructor', () => {
    it('should initialize with READY state', () => {
      const { canvas } = createMockCanvas();
      const engine = new GameEngine(canvas);
      expect(engine.state).toBe(GameState.READY);
    });

    it('should store canvas reference', () => {
      const { canvas } = createMockCanvas();
      const engine = new GameEngine(canvas);
      expect(engine.canvas).toBe(canvas);
    });
  });

  describe('state transitions via _handleInput', () => {
    it('should transition from READY to PLAYING on input', () => {
      const { engine } = createInitializedEngine();
      expect(engine.state).toBe(GameState.READY);

      engine._handleInput();

      expect(engine.state).toBe(GameState.PLAYING);
    });

    it('should call player.flap() when transitioning from READY to PLAYING', () => {
      const { engine } = createInitializedEngine();
      const flapSpy = vi.spyOn(engine.player, 'flap');

      engine._handleInput();

      expect(flapSpy).toHaveBeenCalled();
    });

    it('should call player.flap() when input received in PLAYING state', () => {
      const { engine } = createInitializedEngine();
      engine.state = GameState.PLAYING;
      const flapSpy = vi.spyOn(engine.player, 'flap');

      engine._handleInput();

      expect(flapSpy).toHaveBeenCalled();
      expect(engine.state).toBe(GameState.PLAYING);
    });

    it('should transition from GAME_OVER to READY on input (reset)', () => {
      const { engine } = createInitializedEngine();
      engine.state = GameState.GAME_OVER;

      engine._handleInput();

      expect(engine.state).toBe(GameState.READY);
    });
  });

  describe('update', () => {
    it('should always update background', () => {
      const { engine } = createInitializedEngine();
      engine.state = GameState.READY;
      const bgSpy = vi.spyOn(engine.background, 'update');

      engine.update(0.016);

      expect(bgSpy).toHaveBeenCalledWith(0.016);
    });

    it('should update player and pipes in PLAYING state', () => {
      const { engine } = createInitializedEngine();
      engine.state = GameState.PLAYING;
      const playerSpy = vi.spyOn(engine.player, 'update');
      const pipeSpy = vi.spyOn(engine.pipeManager, 'update');

      engine.update(0.016);

      expect(playerSpy).toHaveBeenCalledWith(0.016);
      expect(pipeSpy).toHaveBeenCalledWith(0.016);
    });

    it('should not update player or pipes in READY state', () => {
      const { engine } = createInitializedEngine();
      engine.state = GameState.READY;
      const playerSpy = vi.spyOn(engine.player, 'update');
      const pipeSpy = vi.spyOn(engine.pipeManager, 'update');

      engine.update(0.016);

      expect(playerSpy).not.toHaveBeenCalled();
      expect(pipeSpy).not.toHaveBeenCalled();
    });

    it('should not update player or pipes in GAME_OVER state', () => {
      const { engine } = createInitializedEngine();
      engine.state = GameState.GAME_OVER;
      const playerSpy = vi.spyOn(engine.player, 'update');
      const pipeSpy = vi.spyOn(engine.pipeManager, 'update');

      engine.update(0.016);

      expect(playerSpy).not.toHaveBeenCalled();
      expect(pipeSpy).not.toHaveBeenCalled();
    });

    it('should transition to GAME_OVER on boundary collision', () => {
      const { engine } = createInitializedEngine();
      engine.state = GameState.PLAYING;
      // Move player below canvas to trigger boundary collision
      engine.player.y = CONFIG.CANVAS_HEIGHT + 100;

      engine.update(0.016);

      expect(engine.state).toBe(GameState.GAME_OVER);
    });

    it('should call scoreManager.reset() when resetting the game', () => {
      const { engine } = createInitializedEngine();
      engine.state = GameState.GAME_OVER;
      const resetSpy = vi.spyOn(engine.scoreManager, 'reset');

      engine.reset();

      expect(resetSpy).toHaveBeenCalled();
    });

    it('should check score in PLAYING state', () => {
      const { engine } = createInitializedEngine();
      engine.state = GameState.PLAYING;
      const scoreSpy = vi.spyOn(engine.scoreManager, 'checkScore');

      engine.update(0.016);

      expect(scoreSpy).toHaveBeenCalled();
    });
  });

  describe('reset', () => {
    it('should set state to READY', () => {
      const { engine } = createInitializedEngine();
      engine.state = GameState.GAME_OVER;

      engine.reset();

      expect(engine.state).toBe(GameState.READY);
    });

    it('should reset player position to center', () => {
      const { engine } = createInitializedEngine();
      engine.player.y = 100;
      engine.player.velocity = 500;
      engine.player.rotation = 0.5;

      engine.reset();

      expect(engine.player.y).toBe(CONFIG.CANVAS_HEIGHT / 2);
      expect(engine.player.velocity).toBe(0);
      expect(engine.player.rotation).toBe(0);
    });

    it('should reset pipes', () => {
      const { engine } = createInitializedEngine();
      const oldPipeManager = engine.pipeManager;

      engine.reset();

      // PipeManager is recreated on reset (new instance with empty pipes)
      expect(engine.pipeManager).not.toBe(oldPipeManager);
      expect(engine.pipeManager.getPipes()).toEqual([]);
    });
  });

  describe('render', () => {
    it('should render without errors in READY state', () => {
      const { engine } = createInitializedEngine();
      engine.state = GameState.READY;

      expect(() => engine.render()).not.toThrow();
    });

    it('should render without errors in PLAYING state', () => {
      const { engine } = createInitializedEngine();
      engine.state = GameState.PLAYING;

      expect(() => engine.render()).not.toThrow();
    });

    it('should render without errors in GAME_OVER state', () => {
      const { engine } = createInitializedEngine();
      engine.state = GameState.GAME_OVER;

      expect(() => engine.render()).not.toThrow();
    });
  });
});
