import { CONFIG } from './config.js';

export class Player {
  /**
   * @param {HTMLImageElement} sprite - The loaded image for the player character
   * @param {number} x - Initial x position
   * @param {number} y - Initial y position
   */
  constructor(sprite, x, y) {
    this.sprite = sprite;
    this.x = x;
    this.y = y;
    this.velocity = 0;
    this.rotation = 0;
    this.gravityEffect = null; // { multiplier, remainingDuration } or null

    // Derive dimensions from sprite, scaled to a reasonable game size
    const aspectRatio = sprite.width && sprite.height ? sprite.width / sprite.height : 1;
    this.width = 40;
    this.height = Math.round(this.width / aspectRatio) || 40;
  }

  /**
   * Apply a flap impulse, setting velocity to FLAP_VELOCITY.
   */
  flap() {
    this.velocity = CONFIG.FLAP_VELOCITY;
  }

  /**
   * Update player physics: apply gravity, update position, and clamp rotation.
   * @param {number} deltaTime - Time elapsed since last frame in seconds
   */
  update(deltaTime) {
    // Determine effective gravity (may be modified by trap)
    let effectiveGravity = CONFIG.GRAVITY;
    if (this.gravityEffect) {
      effectiveGravity = CONFIG.GRAVITY * this.gravityEffect.multiplier;
      this.gravityEffect.remainingDuration -= deltaTime;
      if (this.gravityEffect.remainingDuration <= 0) {
        this.gravityEffect = null;
      }
    }

    // Apply gravity to velocity
    this.velocity += effectiveGravity * deltaTime;

    // Update vertical position
    this.y += this.velocity * deltaTime;

    // Calculate rotation based on velocity direction
    this.rotation = this.velocity * 0.002;

    // Clamp rotation within bounds
    if (this.rotation > CONFIG.MAX_ROTATION) {
      this.rotation = CONFIG.MAX_ROTATION;
    } else if (this.rotation < CONFIG.MIN_ROTATION) {
      this.rotation = CONFIG.MIN_ROTATION;
    }
  }

  /**
   * Apply a temporary gravity effect (from GRAVITY trap).
   * @param {number} multiplier - Gravity multiplier (-1.0 to 3.0)
   * @param {number} duration - Duration in seconds
   */
  applyGravityEffect(multiplier, duration) {
    this.gravityEffect = { multiplier, remainingDuration: duration };
  }

  /**
   * Clear any active gravity effect.
   */
  clearGravityEffect() {
    this.gravityEffect = null;
  }

  /**
   * Get the collision hitbox, slightly smaller than the sprite for fair gameplay.
   * @returns {{x: number, y: number, width: number, height: number}}
   */
  getHitbox() {
    const padding = 4;
    return {
      x: this.x + padding,
      y: this.y + padding,
      width: this.width - padding * 2,
      height: this.height - padding * 2,
    };
  }

  /**
   * Render the player sprite with rotation transform.
   * @param {CanvasRenderingContext2D} ctx
   */
  render(ctx) {
    ctx.save();

    // Translate to center of sprite for rotation
    const centerX = this.x + this.width / 2;
    const centerY = this.y + this.height / 2;
    ctx.translate(centerX, centerY);
    ctx.rotate(this.rotation);

    // Draw sprite centered at origin
    ctx.drawImage(
      this.sprite,
      -this.width / 2,
      -this.height / 2,
      this.width,
      this.height
    );

    ctx.restore();
  }
}
