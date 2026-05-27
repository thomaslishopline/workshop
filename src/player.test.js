import { describe, it, expect } from 'vitest';
import * as fc from 'fast-check';
import { Player } from './player.js';
import { CONFIG } from './config.js';

/**
 * Create a mock sprite image with given dimensions.
 */
function createMockSprite(width = 64, height = 64) {
  return { width, height };
}

/**
 * Create a mock canvas 2D context with tracking of method calls.
 */
function createMockCtx() {
  return {
    save: () => {},
    restore: () => {},
    translate: () => {},
    rotate: () => {},
    drawImage: () => {},
    calls: [],
  };
}

describe('Player', () => {
  describe('constructor', () => {
    it('initializes position from arguments', () => {
      const sprite = createMockSprite(64, 64);
      const player = new Player(sprite, 80, 300);

      expect(player.x).toBe(80);
      expect(player.y).toBe(300);
    });

    it('initializes velocity and rotation to zero', () => {
      const sprite = createMockSprite(64, 64);
      const player = new Player(sprite, 80, 300);

      expect(player.velocity).toBe(0);
      expect(player.rotation).toBe(0);
    });

    it('derives dimensions from sprite aspect ratio', () => {
      const sprite = createMockSprite(128, 64);
      const player = new Player(sprite, 80, 300);

      expect(player.width).toBe(40);
      // aspect ratio 128/64 = 2, so height = 40 / 2 = 20
      expect(player.height).toBe(20);
    });

    it('defaults to 40x40 for square sprites', () => {
      const sprite = createMockSprite(64, 64);
      const player = new Player(sprite, 80, 300);

      expect(player.width).toBe(40);
      expect(player.height).toBe(40);
    });

    it('handles sprite with zero dimensions gracefully', () => {
      const sprite = createMockSprite(0, 0);
      const player = new Player(sprite, 80, 300);

      expect(player.width).toBe(40);
      expect(player.height).toBe(40);
    });

    it('stores the sprite reference', () => {
      const sprite = createMockSprite(64, 64);
      const player = new Player(sprite, 80, 300);

      expect(player.sprite).toBe(sprite);
    });
  });

  describe('flap()', () => {
    it('sets velocity to FLAP_VELOCITY', () => {
      const player = new Player(createMockSprite(), 80, 300);
      player.velocity = 200; // falling

      player.flap();

      expect(player.velocity).toBe(CONFIG.FLAP_VELOCITY);
    });

    it('resets velocity regardless of current velocity', () => {
      const player = new Player(createMockSprite(), 80, 300);

      // From positive velocity
      player.velocity = 500;
      player.flap();
      expect(player.velocity).toBe(CONFIG.FLAP_VELOCITY);

      // From negative velocity
      player.velocity = -100;
      player.flap();
      expect(player.velocity).toBe(CONFIG.FLAP_VELOCITY);

      // From zero velocity
      player.velocity = 0;
      player.flap();
      expect(player.velocity).toBe(CONFIG.FLAP_VELOCITY);
    });
  });

  describe('update(deltaTime)', () => {
    it('applies gravity to velocity', () => {
      const player = new Player(createMockSprite(), 80, 300);
      player.velocity = 0;

      player.update(0.016); // ~60fps frame

      expect(player.velocity).toBeCloseTo(CONFIG.GRAVITY * 0.016);
    });

    it('updates y position based on velocity', () => {
      const player = new Player(createMockSprite(), 80, 300);
      player.velocity = 100;

      player.update(0.016);

      // After gravity: velocity = 100 + 980 * 0.016 = 115.68
      // y = 300 + 115.68 * 0.016 = 301.85...
      const expectedVelocity = 100 + CONFIG.GRAVITY * 0.016;
      const expectedY = 300 + expectedVelocity * 0.016;
      expect(player.y).toBeCloseTo(expectedY);
    });

    it('calculates rotation based on velocity direction', () => {
      const player = new Player(createMockSprite(), 80, 300);

      // Negative velocity should give negative rotation (upward tilt)
      player.velocity = -300;
      player.update(0.001); // tiny dt to keep velocity mostly negative
      expect(player.rotation).toBeLessThan(0);
    });

    it('clamps rotation to MAX_ROTATION', () => {
      const player = new Player(createMockSprite(), 80, 300);
      player.velocity = 10000; // very high positive velocity

      player.update(0.016);

      expect(player.rotation).toBeLessThanOrEqual(CONFIG.MAX_ROTATION);
    });

    it('clamps rotation to MIN_ROTATION', () => {
      const player = new Player(createMockSprite(), 80, 300);
      player.velocity = -10000; // very high negative velocity

      player.update(0.001); // tiny dt so gravity doesn't flip it

      expect(player.rotation).toBeGreaterThanOrEqual(CONFIG.MIN_ROTATION);
    });

    it('positive velocity results in positive rotation (downward tilt)', () => {
      const player = new Player(createMockSprite(), 80, 300);
      player.velocity = 0;

      // After update, gravity makes velocity positive
      player.update(0.1);

      expect(player.velocity).toBeGreaterThan(0);
      expect(player.rotation).toBeGreaterThan(0);
    });
  });

  describe('getHitbox()', () => {
    it('returns a hitbox object with x, y, width, height', () => {
      const player = new Player(createMockSprite(), 80, 300);
      const hitbox = player.getHitbox();

      expect(hitbox).toHaveProperty('x');
      expect(hitbox).toHaveProperty('y');
      expect(hitbox).toHaveProperty('width');
      expect(hitbox).toHaveProperty('height');
    });

    it('returns a hitbox smaller than the sprite dimensions', () => {
      const player = new Player(createMockSprite(), 80, 300);
      const hitbox = player.getHitbox();

      expect(hitbox.width).toBeLessThan(player.width);
      expect(hitbox.height).toBeLessThan(player.height);
    });

    it('hitbox is centered relative to sprite position', () => {
      const player = new Player(createMockSprite(), 80, 300);
      const hitbox = player.getHitbox();

      // Padding should be symmetric
      const xPadding = hitbox.x - player.x;
      const expectedWidth = player.width - xPadding * 2;
      expect(hitbox.width).toBe(expectedWidth);

      const yPadding = hitbox.y - player.y;
      const expectedHeight = player.height - yPadding * 2;
      expect(hitbox.height).toBe(expectedHeight);
    });

    it('reflects current player position', () => {
      const player = new Player(createMockSprite(), 80, 300);
      player.y = 150;

      const hitbox = player.getHitbox();

      expect(hitbox.y).toBeGreaterThan(150);
      expect(hitbox.y).toBeLessThan(150 + player.height);
    });
  });

  describe('render(ctx)', () => {
    it('calls save and restore on the context', () => {
      const player = new Player(createMockSprite(), 80, 300);
      const calls = [];
      const ctx = {
        save: () => calls.push('save'),
        restore: () => calls.push('restore'),
        translate: () => calls.push('translate'),
        rotate: () => calls.push('rotate'),
        drawImage: () => calls.push('drawImage'),
      };

      player.render(ctx);

      expect(calls[0]).toBe('save');
      expect(calls[calls.length - 1]).toBe('restore');
    });

    it('translates to sprite center and applies rotation', () => {
      const player = new Player(createMockSprite(), 80, 300);
      player.rotation = 0.5;

      let translateArgs = null;
      let rotateArg = null;

      const ctx = {
        save: () => {},
        restore: () => {},
        translate: (x, y) => { translateArgs = { x, y }; },
        rotate: (angle) => { rotateArg = angle; },
        drawImage: () => {},
      };

      player.render(ctx);

      expect(translateArgs.x).toBe(80 + player.width / 2);
      expect(translateArgs.y).toBe(300 + player.height / 2);
      expect(rotateArg).toBe(0.5);
    });

    it('draws the sprite image', () => {
      const sprite = createMockSprite();
      const player = new Player(sprite, 80, 300);
      let drawImageCalled = false;
      let drawnSprite = null;

      const ctx = {
        save: () => {},
        restore: () => {},
        translate: () => {},
        rotate: () => {},
        drawImage: (img) => {
          drawImageCalled = true;
          drawnSprite = img;
        },
      };

      player.render(ctx);

      expect(drawImageCalled).toBe(true);
      expect(drawnSprite).toBe(sprite);
    });
  });
});

describe('Player gravity effect', () => {
  function createMockSprite(width = 64, height = 64) {
    return { width, height };
  }

  describe('applyGravityEffect', () => {
    it('sets gravityEffect with multiplier and duration', () => {
      const player = new Player(createMockSprite(), 80, 300);
      player.applyGravityEffect(-0.5, 1.5);

      expect(player.gravityEffect).not.toBeNull();
      expect(player.gravityEffect.multiplier).toBe(-0.5);
      expect(player.gravityEffect.remainingDuration).toBe(1.5);
    });
  });

  describe('clearGravityEffect', () => {
    it('removes active gravity effect', () => {
      const player = new Player(createMockSprite(), 80, 300);
      player.applyGravityEffect(-0.5, 1.5);
      player.clearGravityEffect();

      expect(player.gravityEffect).toBeNull();
    });
  });

  describe('update with gravity effect', () => {
    it('applies modified gravity when effect is active', () => {
      const player = new Player(createMockSprite(), 80, 300);
      player.velocity = 0;
      player.applyGravityEffect(2.0, 5.0);

      player.update(0.016);

      // Effective gravity = 980 * 2.0 = 1960
      const expectedVelocity = CONFIG.GRAVITY * 2.0 * 0.016;
      expect(player.velocity).toBeCloseTo(expectedVelocity);
    });

    it('applies negative gravity (reversal) when multiplier is negative', () => {
      const player = new Player(createMockSprite(), 80, 300);
      player.velocity = 0;
      player.applyGravityEffect(-1.0, 5.0);

      player.update(0.016);

      // Effective gravity = 980 * -1.0 = -980 (upward)
      expect(player.velocity).toBeLessThan(0);
    });

    it('decrements remaining duration each frame', () => {
      const player = new Player(createMockSprite(), 80, 300);
      player.applyGravityEffect(2.0, 1.0);

      player.update(0.5);

      expect(player.gravityEffect.remainingDuration).toBeCloseTo(0.5);
    });

    it('clears effect when duration expires', () => {
      const player = new Player(createMockSprite(), 80, 300);
      player.applyGravityEffect(2.0, 0.5);

      player.update(0.6); // exceeds duration

      expect(player.gravityEffect).toBeNull();
    });

    it('uses normal gravity after effect expires', () => {
      const player = new Player(createMockSprite(), 80, 300);
      player.applyGravityEffect(2.0, 0.01);
      player.update(0.02); // expire the effect

      player.velocity = 0;
      player.update(0.016);

      // Should use normal gravity now
      expect(player.velocity).toBeCloseTo(CONFIG.GRAVITY * 0.016);
    });

    it('existing behavior unchanged when no effect active', () => {
      const player = new Player(createMockSprite(), 80, 300);
      player.velocity = 0;

      player.update(0.016);

      expect(player.velocity).toBeCloseTo(CONFIG.GRAVITY * 0.016);
    });
  });

  // PBT: Property P6 — gravity multiplier bounds
  describe('PBT: Gravity effect with valid multipliers (P6)', () => {
    it('gravity effect correctly modifies velocity for any valid multiplier', () => {
      fc.assert(
        fc.property(
          fc.double({ min: CONFIG.GRAVITY_MULTIPLIER_MIN, max: CONFIG.GRAVITY_MULTIPLIER_MAX, noNaN: true }),
          fc.double({ min: CONFIG.GRAVITY_EFFECT_MIN_DURATION, max: CONFIG.GRAVITY_EFFECT_MAX_DURATION, noNaN: true }),
          fc.double({ min: 0.001, max: 0.1, noNaN: true }),
          (multiplier, duration, dt) => {
            const player = new Player(createMockSprite(), 80, 300);
            player.velocity = 0;
            player.applyGravityEffect(multiplier, duration);

            player.update(dt);

            const expectedVelocity = CONFIG.GRAVITY * multiplier * dt;
            // velocity should be close to expected (accounting for position update)
            expect(player.velocity).toBeCloseTo(expectedVelocity, 0);
          }
        )
      );
    });
  });
});
