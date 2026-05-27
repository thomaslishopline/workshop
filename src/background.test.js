import { describe, it, expect } from 'vitest';
import { Background } from './background.js';
import { CONFIG } from './config.js';

/**
 * Create a mock canvas 2D context that tracks calls.
 */
function createMockCtx() {
  const calls = [];
  return {
    calls,
    fillStyle: null,
    createLinearGradient: (x0, y0, x1, y1) => {
      calls.push({ method: 'createLinearGradient', args: [x0, y0, x1, y1] });
      return {
        addColorStop: (offset, color) => {
          calls.push({ method: 'addColorStop', args: [offset, color] });
        },
      };
    },
    fillRect: (x, y, w, h) => {
      calls.push({ method: 'fillRect', args: [x, y, w, h] });
    },
    beginPath: () => {
      calls.push({ method: 'beginPath' });
    },
    ellipse: (x, y, rx, ry, rotation, startAngle, endAngle) => {
      calls.push({ method: 'ellipse', args: [x, y, rx, ry, rotation, startAngle, endAngle] });
    },
    fill: () => {
      calls.push({ method: 'fill' });
    },
  };
}

describe('Background', () => {
  describe('constructor', () => {
    it('stores canvas dimensions', () => {
      const bg = new Background(400, 600);
      expect(bg.canvasWidth).toBe(400);
      expect(bg.canvasHeight).toBe(600);
    });

    it('initializes scroll positions to zero', () => {
      const bg = new Background(400, 600);
      expect(bg.groundScrollX).toBe(0);
      expect(bg.cloudScrollX).toBe(0);
    });

    it('sets ground speed to PIPE_SPEED', () => {
      const bg = new Background(400, 600);
      expect(bg.groundSpeed).toBe(CONFIG.PIPE_SPEED);
    });

    it('sets cloud speed to half of PIPE_SPEED for parallax', () => {
      const bg = new Background(400, 600);
      expect(bg.cloudSpeed).toBe(CONFIG.PIPE_SPEED * 0.5);
    });

    it('defines cloud positions', () => {
      const bg = new Background(400, 600);
      expect(bg.clouds.length).toBeGreaterThan(0);
      for (const cloud of bg.clouds) {
        expect(cloud).toHaveProperty('x');
        expect(cloud).toHaveProperty('y');
        expect(cloud).toHaveProperty('width');
        expect(cloud).toHaveProperty('height');
      }
    });
  });

  describe('update(deltaTime)', () => {
    it('scrolls ground by groundSpeed * deltaTime', () => {
      const bg = new Background(400, 600);
      bg.update(0.1);
      expect(bg.groundScrollX).toBeCloseTo(CONFIG.PIPE_SPEED * 0.1);
    });

    it('scrolls clouds by cloudSpeed * deltaTime', () => {
      const bg = new Background(400, 600);
      bg.update(0.1);
      expect(bg.cloudScrollX).toBeCloseTo(CONFIG.PIPE_SPEED * 0.5 * 0.1);
    });

    it('wraps ground scroll when exceeding tile width', () => {
      const bg = new Background(400, 600);
      const tileWidth = bg.groundTileWidth;

      // Advance enough to exceed one tile width
      const dt = tileWidth / bg.groundSpeed + 0.01;
      bg.update(dt);

      expect(bg.groundScrollX).toBeLessThan(tileWidth);
      expect(bg.groundScrollX).toBeGreaterThanOrEqual(0);
    });

    it('wraps cloud scroll when exceeding pattern width', () => {
      const bg = new Background(400, 600);
      const patternWidth = bg.cloudPatternWidth;

      // Advance enough to exceed pattern width
      const dt = patternWidth / bg.cloudSpeed + 0.01;
      bg.update(dt);

      expect(bg.cloudScrollX).toBeLessThan(patternWidth);
      expect(bg.cloudScrollX).toBeGreaterThanOrEqual(0);
    });

    it('accumulates scroll over multiple updates', () => {
      const bg = new Background(400, 600);
      bg.update(0.016);
      bg.update(0.016);

      const expectedGround = CONFIG.PIPE_SPEED * 0.032;
      expect(bg.groundScrollX).toBeCloseTo(expectedGround);
    });

    it('does not scroll when deltaTime is zero', () => {
      const bg = new Background(400, 600);
      bg.update(0);
      expect(bg.groundScrollX).toBe(0);
      expect(bg.cloudScrollX).toBe(0);
    });
  });

  describe('render(ctx)', () => {
    it('renders sky gradient from light blue to darker blue', () => {
      const bg = new Background(400, 600);
      const ctx = createMockCtx();

      bg.render(ctx);

      const gradientCall = ctx.calls.find(c => c.method === 'createLinearGradient');
      expect(gradientCall).toBeDefined();
      // Vertical gradient from top to bottom
      expect(gradientCall.args).toEqual([0, 0, 0, 600]);

      const colorStops = ctx.calls.filter(c => c.method === 'addColorStop');
      expect(colorStops.length).toBe(2);
      expect(colorStops[0].args[0]).toBe(0);
      expect(colorStops[0].args[1]).toBe('#87CEEB');
      expect(colorStops[1].args[0]).toBe(1);
      expect(colorStops[1].args[1]).toBe('#4A90D9');
    });

    it('renders sky as full canvas rectangle', () => {
      const bg = new Background(400, 600);
      const ctx = createMockCtx();

      bg.render(ctx);

      const fillRects = ctx.calls.filter(c => c.method === 'fillRect');
      // First fillRect should be the sky
      expect(fillRects[0].args).toEqual([0, 0, 400, 600]);
    });

    it('renders clouds using ellipse', () => {
      const bg = new Background(400, 600);
      const ctx = createMockCtx();

      bg.render(ctx);

      const ellipseCalls = ctx.calls.filter(c => c.method === 'ellipse');
      // Each cloud drawn twice (original + wrapped copy)
      expect(ellipseCalls.length).toBe(bg.clouds.length * 2);
    });

    it('renders ground at bottom of canvas', () => {
      const bg = new Background(400, 600);
      const ctx = createMockCtx();

      bg.render(ctx);

      const fillRects = ctx.calls.filter(c => c.method === 'fillRect');
      // Ground base should be at canvasHeight - groundHeight
      const groundY = 600 - bg.groundHeight;
      const groundRect = fillRects.find(
        c => c.args[1] === groundY && c.args[3] === bg.groundHeight
      );
      expect(groundRect).toBeDefined();
    });

    it('renders ground grass line', () => {
      const bg = new Background(400, 600);
      const ctx = createMockCtx();

      bg.render(ctx);

      const fillRects = ctx.calls.filter(c => c.method === 'fillRect');
      const groundY = 600 - bg.groundHeight;
      // Grass line is 4px tall at groundY
      const grassLine = fillRects.find(
        c => c.args[1] === groundY && c.args[3] === 4
      );
      expect(grassLine).toBeDefined();
    });

    it('parallax effect: clouds scroll slower than ground', () => {
      const bg = new Background(400, 600);
      bg.update(1.0); // 1 second

      expect(bg.cloudScrollX).toBeLessThan(bg.groundScrollX);
    });
  });
});
