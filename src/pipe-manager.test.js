import { describe, it, expect, beforeEach } from 'vitest';
import { PipeManager } from './pipe-manager.js';
import { CONFIG } from './config.js';

/**
 * Create a mock canvas 2D context with call tracking.
 */
function createMockCtx() {
  const calls = [];
  return {
    fillStyle: '',
    fillRect: (x, y, w, h) => calls.push({ method: 'fillRect', args: [x, y, w, h] }),
    calls,
  };
}

describe('PipeManager', () => {
  let pipeManager;

  beforeEach(() => {
    pipeManager = new PipeManager(CONFIG.CANVAS_WIDTH, CONFIG.CANVAS_HEIGHT);
  });

  describe('constructor', () => {
    it('initializes with empty pipes array', () => {
      expect(pipeManager.getPipes()).toEqual([]);
    });

    it('initializes spawn timer to zero', () => {
      expect(pipeManager.spawnTimer).toBe(0);
    });

    it('stores canvas dimensions', () => {
      expect(pipeManager.canvasWidth).toBe(CONFIG.CANVAS_WIDTH);
      expect(pipeManager.canvasHeight).toBe(CONFIG.CANVAS_HEIGHT);
    });
  });

  describe('update(deltaTime)', () => {
    it('moves pipes to the left by PIPE_SPEED * deltaTime', () => {
      // Manually add a pipe to test movement
      pipeManager.pipes.push({
        x: 300,
        gapY: 300,
        gapSize: CONFIG.GAP_SIZE,
        width: CONFIG.PIPE_WIDTH,
        scored: false,
      });

      pipeManager.update(0.016);

      expect(pipeManager.pipes[0].x).toBeCloseTo(300 - CONFIG.PIPE_SPEED * 0.016);
    });

    it('spawns a new pipe when spawn timer exceeds interval', () => {
      expect(pipeManager.getPipes().length).toBe(0);

      // Advance time past the spawn interval
      pipeManager.update(CONFIG.PIPE_SPAWN_INTERVAL);

      expect(pipeManager.getPipes().length).toBe(1);
    });

    it('spawns pipe at the right edge of the canvas', () => {
      pipeManager.update(CONFIG.PIPE_SPAWN_INTERVAL);

      const pipe = pipeManager.getPipes()[0];
      // Pipe is spawned after movement phase, so it starts at canvasWidth
      expect(pipe.x).toBe(CONFIG.CANVAS_WIDTH);
    });

    it('spawns pipe with correct gapSize and width', () => {
      pipeManager.update(CONFIG.PIPE_SPAWN_INTERVAL);

      const pipe = pipeManager.getPipes()[0];
      expect(pipe.gapSize).toBe(CONFIG.GAP_SIZE);
      expect(pipe.width).toBe(CONFIG.PIPE_WIDTH);
    });

    it('spawns pipe with scored set to false', () => {
      pipeManager.update(CONFIG.PIPE_SPAWN_INTERVAL);

      const pipe = pipeManager.getPipes()[0];
      expect(pipe.scored).toBe(false);
    });

    it('spawns pipe with gapY within playable bounds', () => {
      // Run multiple spawns to test randomness stays in bounds
      for (let i = 0; i < 50; i++) {
        pipeManager.reset();
        pipeManager.update(CONFIG.PIPE_SPAWN_INTERVAL);

        const pipe = pipeManager.getPipes()[0];
        expect(pipe.gapY).toBeGreaterThanOrEqual(CONFIG.GAP_MIN_Y);
        expect(pipe.gapY).toBeLessThanOrEqual(CONFIG.CANVAS_HEIGHT - CONFIG.GAP_MAX_Y_OFFSET);
      }
    });

    it('removes pipes that move entirely off-screen', () => {
      // Add a pipe that is almost off-screen
      pipeManager.pipes.push({
        x: -CONFIG.PIPE_WIDTH + 1, // just barely on screen
        gapY: 300,
        gapSize: CONFIG.GAP_SIZE,
        width: CONFIG.PIPE_WIDTH,
        scored: false,
      });

      // Move it enough to go off-screen
      pipeManager.update(0.1);

      expect(pipeManager.getPipes().length).toBe(0);
    });

    it('keeps pipes that are still partially on-screen', () => {
      pipeManager.pipes.push({
        x: 10,
        gapY: 300,
        gapSize: CONFIG.GAP_SIZE,
        width: CONFIG.PIPE_WIDTH,
        scored: false,
      });

      pipeManager.update(0.016);

      expect(pipeManager.getPipes().length).toBe(1);
    });

    it('accumulates spawn timer across multiple updates', () => {
      // Update with half the interval
      pipeManager.update(CONFIG.PIPE_SPAWN_INTERVAL / 2);
      expect(pipeManager.getPipes().length).toBe(0);

      // Update with the other half
      pipeManager.update(CONFIG.PIPE_SPAWN_INTERVAL / 2);
      expect(pipeManager.getPipes().length).toBe(1);
    });

    it('does not spawn multiple pipes in a single frame for normal deltaTime', () => {
      pipeManager.update(0.016);
      expect(pipeManager.getPipes().length).toBe(0);
    });
  });

  describe('getPipes()', () => {
    it('returns the pipes array', () => {
      const pipes = pipeManager.getPipes();
      expect(Array.isArray(pipes)).toBe(true);
    });

    it('returns the same array reference', () => {
      const pipes1 = pipeManager.getPipes();
      const pipes2 = pipeManager.getPipes();
      expect(pipes1).toBe(pipes2);
    });
  });

  describe('reset()', () => {
    it('clears all pipes', () => {
      pipeManager.update(CONFIG.PIPE_SPAWN_INTERVAL);
      expect(pipeManager.getPipes().length).toBeGreaterThan(0);

      pipeManager.reset();

      expect(pipeManager.getPipes()).toEqual([]);
    });

    it('resets spawn timer to zero', () => {
      pipeManager.update(CONFIG.PIPE_SPAWN_INTERVAL / 2);
      expect(pipeManager.spawnTimer).toBeGreaterThan(0);

      pipeManager.reset();

      expect(pipeManager.spawnTimer).toBe(0);
    });
  });

  describe('render(ctx)', () => {
    it('sets fill style to green', () => {
      const ctx = createMockCtx();
      pipeManager.pipes.push({
        x: 200,
        gapY: 300,
        gapSize: CONFIG.GAP_SIZE,
        width: CONFIG.PIPE_WIDTH,
        scored: false,
      });

      pipeManager.render(ctx);

      expect(ctx.fillStyle).toBe('#2ecc40');
    });

    it('draws two rectangles per pipe (top and bottom)', () => {
      const ctx = createMockCtx();
      pipeManager.pipes.push({
        x: 200,
        gapY: 300,
        gapSize: CONFIG.GAP_SIZE,
        width: CONFIG.PIPE_WIDTH,
        scored: false,
      });

      pipeManager.render(ctx);

      expect(ctx.calls.length).toBe(2);
    });

    it('draws top pipe from y=0 to gap top edge', () => {
      const ctx = createMockCtx();
      const pipe = {
        x: 200,
        gapY: 300,
        gapSize: CONFIG.GAP_SIZE,
        width: CONFIG.PIPE_WIDTH,
        scored: false,
      };
      pipeManager.pipes.push(pipe);

      pipeManager.render(ctx);

      const topRect = ctx.calls[0];
      expect(topRect.args[0]).toBe(200); // x
      expect(topRect.args[1]).toBe(0);   // y
      expect(topRect.args[2]).toBe(CONFIG.PIPE_WIDTH); // width
      expect(topRect.args[3]).toBe(300 - CONFIG.GAP_SIZE / 2); // height = gapY - gapSize/2
    });

    it('draws bottom pipe from gap bottom edge to canvas bottom', () => {
      const ctx = createMockCtx();
      const pipe = {
        x: 200,
        gapY: 300,
        gapSize: CONFIG.GAP_SIZE,
        width: CONFIG.PIPE_WIDTH,
        scored: false,
      };
      pipeManager.pipes.push(pipe);

      pipeManager.render(ctx);

      const bottomRect = ctx.calls[1];
      const bottomPipeTop = 300 + CONFIG.GAP_SIZE / 2;
      expect(bottomRect.args[0]).toBe(200); // x
      expect(bottomRect.args[1]).toBe(bottomPipeTop); // y
      expect(bottomRect.args[2]).toBe(CONFIG.PIPE_WIDTH); // width
      expect(bottomRect.args[3]).toBe(CONFIG.CANVAS_HEIGHT - bottomPipeTop); // height
    });

    it('draws nothing when there are no pipes', () => {
      const ctx = createMockCtx();

      pipeManager.render(ctx);

      expect(ctx.calls.length).toBe(0);
    });

    it('draws rectangles for multiple pipes', () => {
      const ctx = createMockCtx();
      pipeManager.pipes.push(
        { x: 100, gapY: 250, gapSize: CONFIG.GAP_SIZE, width: CONFIG.PIPE_WIDTH, scored: false },
        { x: 300, gapY: 350, gapSize: CONFIG.GAP_SIZE, width: CONFIG.PIPE_WIDTH, scored: true }
      );

      pipeManager.render(ctx);

      // 2 pipes * 2 rects each = 4 fillRect calls
      expect(ctx.calls.length).toBe(4);
    });
  });
});
