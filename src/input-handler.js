/**
 * InputHandler - Normalizes input from keyboard, mouse, and touch.
 * Listens for spacebar (keydown), mousedown, and touchstart events
 * and invokes a single registered callback for any of them.
 * Also supports ArrowLeft/ArrowRight for difficulty toggling.
 */
export class InputHandler {
  /**
   * @param {HTMLCanvasElement} canvas - The canvas element for mouse/touch events
   * @param {Document} [doc=document] - The document for keyboard events (injectable for testing)
   */
  constructor(canvas, doc) {
    this.canvas = canvas;
    this.doc = doc || document;
    this.callback = null;
    this.difficultyCallback = null;

    this._handleKeydown = (event) => {
      if (event.code === 'Space') {
        event.preventDefault();
        if (this.callback) {
          this.callback();
        }
      } else if (event.code === 'ArrowLeft') {
        event.preventDefault();
        if (this.difficultyCallback) {
          this.difficultyCallback('left');
        }
      } else if (event.code === 'ArrowRight') {
        event.preventDefault();
        if (this.difficultyCallback) {
          this.difficultyCallback('right');
        }
      }
    };

    this._handleMousedown = () => {
      if (this.callback) {
        this.callback();
      }
    };

    this._handleTouchstart = (event) => {
      event.preventDefault();
      if (this.callback) {
        this.callback();
      }
    };

    this.doc.addEventListener('keydown', this._handleKeydown);
    this.canvas.addEventListener('mousedown', this._handleMousedown);
    this.canvas.addEventListener('touchstart', this._handleTouchstart);
  }

  /**
   * Register a callback for flap/start/restart actions.
   * @param {Function} callback - The function to call on input
   */
  onAction(callback) {
    this.callback = callback;
  }

  /**
   * Register a callback for difficulty toggle (ArrowLeft/ArrowRight).
   * @param {Function} callback - Called with 'left' or 'right' when arrow keys are pressed
   */
  onDifficultyChange(callback) {
    this.difficultyCallback = callback;
  }

  /**
   * Remove all event listeners to prevent memory leaks.
   */
  destroy() {
    this.doc.removeEventListener('keydown', this._handleKeydown);
    this.canvas.removeEventListener('mousedown', this._handleMousedown);
    this.canvas.removeEventListener('touchstart', this._handleTouchstart);
  }
}
