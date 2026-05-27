export class ScoreManager {
  constructor() {
    this.score = 0;
    this.highScore = 0;
  }

  /**
   * Check if the player has passed any pipe midpoints and increment score.
   * A pipe's midpoint is at pipe.x + pipe.width / 2.
   * Score increments when playerX > midpoint and pipe hasn't been scored yet.
   * @param {number} playerX - The player's x position (left edge)
   * @param {Array} pipes - Array of pipe objects with {x, width, scored} properties
   */
  checkScore(playerX, pipes) {
    for (const pipe of pipes) {
      const midpoint = pipe.x + pipe.width / 2;
      if (!pipe.scored && playerX > midpoint) {
        pipe.scored = true;
        this.score++;
      }
    }
  }

  /**
   * @returns {number} The current score
   */
  getScore() {
    return this.score;
  }

  /**
   * @returns {number} The session high score
   */
  getHighScore() {
    return this.highScore;
  }

  /**
   * Reset current score to 0, preserving and updating high score.
   */
  reset() {
    this.highScore = Math.max(this.highScore, this.score);
    this.score = 0;
  }

  /**
   * Render the score centered at the top of the canvas.
   * @param {CanvasRenderingContext2D} ctx - The canvas rendering context
   * @param {number} canvasWidth - The width of the canvas
   */
  render(ctx, canvasWidth) {
    ctx.save();
    ctx.fillStyle = 'white';
    ctx.font = 'bold 48px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(this.score, canvasWidth / 2, 60);
    ctx.restore();
  }
}
