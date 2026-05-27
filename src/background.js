import { CONFIG } from './config.js';

export class Background {
  constructor(canvasWidth, canvasHeight) {
    this.canvasWidth = canvasWidth;
    this.canvasHeight = canvasHeight;
    this.groundHeight = 50;
    this.groundScrollX = 0;
    this.groundTileWidth = 48;
    this.cloudScrollX = 0;
    this.cloudSpeed = CONFIG.PIPE_SPEED * 0.5;
    this.groundSpeed = CONFIG.PIPE_SPEED;

    // Simple cloud positions (fixed y, repeating pattern)
    this.clouds = [
      { x: 60, y: 80, width: 80, height: 30 },
      { x: 200, y: 140, width: 60, height: 20 },
      { x: 340, y: 60, width: 70, height: 25 },
      { x: 500, y: 120, width: 90, height: 28 },
    ];
    this.cloudPatternWidth = canvasWidth + 200;
  }

  update(deltaTime) {
    // Scroll ground at pipe speed
    this.groundScrollX += this.groundSpeed * deltaTime;
    if (this.groundScrollX >= this.groundTileWidth) {
      this.groundScrollX -= this.groundTileWidth;
    }

    // Scroll clouds at half pipe speed (parallax)
    this.cloudScrollX += this.cloudSpeed * deltaTime;
    if (this.cloudScrollX >= this.cloudPatternWidth) {
      this.cloudScrollX -= this.cloudPatternWidth;
    }
  }

  render(ctx) {
    // Layer 1: Sky gradient
    this._renderSky(ctx);

    // Layer 2: Clouds (parallax - slower)
    this._renderClouds(ctx);

    // Layer 3: Ground (scrolls at pipe speed)
    this._renderGround(ctx);
  }

  _renderSky(ctx) {
    const gradient = ctx.createLinearGradient(0, 0, 0, this.canvasHeight);
    gradient.addColorStop(0, '#87CEEB');
    gradient.addColorStop(1, '#4A90D9');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, this.canvasWidth, this.canvasHeight);
  }

  _renderClouds(ctx) {
    ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
    for (const cloud of this.clouds) {
      const x = cloud.x - this.cloudScrollX;
      // Draw cloud at its position and a wrapped copy
      this._drawCloud(ctx, x, cloud.y, cloud.width, cloud.height);
      this._drawCloud(ctx, x + this.cloudPatternWidth, cloud.y, cloud.width, cloud.height);
    }
  }

  _drawCloud(ctx, x, y, width, height) {
    // Simple ellipse-based cloud shape
    ctx.beginPath();
    ctx.ellipse(x + width / 2, y + height / 2, width / 2, height / 2, 0, 0, Math.PI * 2);
    ctx.fill();
  }

  _renderGround(ctx) {
    const groundY = this.canvasHeight - this.groundHeight;

    // Draw green ground base
    ctx.fillStyle = '#4CAF50';
    ctx.fillRect(0, groundY, this.canvasWidth, this.groundHeight);

    // Draw darker grass line at top of ground
    ctx.fillStyle = '#388E3C';
    ctx.fillRect(0, groundY, this.canvasWidth, 4);

    // Draw scrolling ground pattern (vertical stripes for texture)
    ctx.fillStyle = '#43A047';
    const stripeWidth = this.groundTileWidth;
    const startX = -this.groundScrollX;
    for (let x = startX; x < this.canvasWidth; x += stripeWidth) {
      ctx.fillRect(x, groundY + 10, stripeWidth / 2, this.groundHeight - 10);
    }
  }
}
