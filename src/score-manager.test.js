import { describe, it, expect, beforeEach } from 'vitest';
import { ScoreManager } from './score-manager.js';

describe('ScoreManager', () => {
  let scoreManager;

  beforeEach(() => {
    scoreManager = new ScoreManager();
  });

  describe('constructor', () => {
    it('initializes score to 0', () => {
      expect(scoreManager.getScore()).toBe(0);
    });

    it('initializes high score to 0', () => {
      expect(scoreManager.getHighScore()).toBe(0);
    });
  });

  describe('checkScore', () => {
    it('increments score when player passes pipe midpoint', () => {
      const pipes = [{ x: 50, width: 52, scored: false }];
      // midpoint = 50 + 52/2 = 76, playerX = 80 > 76
      scoreManager.checkScore(80, pipes);
      expect(scoreManager.getScore()).toBe(1);
    });

    it('marks pipe as scored after incrementing', () => {
      const pipes = [{ x: 50, width: 52, scored: false }];
      scoreManager.checkScore(80, pipes);
      expect(pipes[0].scored).toBe(true);
    });

    it('does not increment score if player has not passed midpoint', () => {
      const pipes = [{ x: 50, width: 52, scored: false }];
      // midpoint = 76, playerX = 70 < 76
      scoreManager.checkScore(70, pipes);
      expect(scoreManager.getScore()).toBe(0);
    });

    it('does not increment score if pipe is already scored', () => {
      const pipes = [{ x: 50, width: 52, scored: true }];
      scoreManager.checkScore(80, pipes);
      expect(scoreManager.getScore()).toBe(0);
    });

    it('does not increment when playerX equals midpoint exactly', () => {
      const pipes = [{ x: 50, width: 52, scored: false }];
      // midpoint = 76, playerX = 76 is NOT greater than 76
      scoreManager.checkScore(76, pipes);
      expect(scoreManager.getScore()).toBe(0);
    });

    it('increments score for multiple unscored pipes passed', () => {
      const pipes = [
        { x: 20, width: 52, scored: false },
        { x: 100, width: 52, scored: false },
        { x: 200, width: 52, scored: false }
      ];
      // midpoints: 46, 126, 226. playerX = 130 passes first two
      scoreManager.checkScore(130, pipes);
      expect(scoreManager.getScore()).toBe(2);
    });

    it('does not double-count pipes on subsequent calls', () => {
      const pipes = [{ x: 50, width: 52, scored: false }];
      scoreManager.checkScore(80, pipes);
      scoreManager.checkScore(80, pipes);
      expect(scoreManager.getScore()).toBe(1);
    });
  });

  describe('getScore', () => {
    it('returns the current score', () => {
      const pipes = [{ x: 10, width: 20, scored: false }];
      scoreManager.checkScore(100, pipes);
      expect(scoreManager.getScore()).toBe(1);
    });
  });

  describe('getHighScore', () => {
    it('returns 0 before any game is completed', () => {
      expect(scoreManager.getHighScore()).toBe(0);
    });

    it('returns the high score after reset', () => {
      const pipes = [
        { x: 10, width: 20, scored: false },
        { x: 40, width: 20, scored: false }
      ];
      scoreManager.checkScore(100, pipes);
      scoreManager.reset();
      expect(scoreManager.getHighScore()).toBe(2);
    });
  });

  describe('reset', () => {
    it('resets current score to 0', () => {
      const pipes = [{ x: 10, width: 20, scored: false }];
      scoreManager.checkScore(100, pipes);
      scoreManager.reset();
      expect(scoreManager.getScore()).toBe(0);
    });

    it('preserves high score across resets', () => {
      const pipes1 = [
        { x: 10, width: 20, scored: false },
        { x: 40, width: 20, scored: false },
        { x: 70, width: 20, scored: false }
      ];
      scoreManager.checkScore(100, pipes1);
      scoreManager.reset(); // high score = 3

      const pipes2 = [{ x: 10, width: 20, scored: false }];
      scoreManager.checkScore(100, pipes2);
      scoreManager.reset(); // score = 1, high score stays 3

      expect(scoreManager.getHighScore()).toBe(3);
    });

    it('updates high score if current score is higher', () => {
      const pipes1 = [{ x: 10, width: 20, scored: false }];
      scoreManager.checkScore(100, pipes1);
      scoreManager.reset(); // high score = 1

      const pipes2 = [
        { x: 10, width: 20, scored: false },
        { x: 40, width: 20, scored: false },
        { x: 70, width: 20, scored: false },
        { x: 100, width: 20, scored: false },
        { x: 130, width: 20, scored: false }
      ];
      scoreManager.checkScore(200, pipes2);
      scoreManager.reset(); // high score = 5

      expect(scoreManager.getHighScore()).toBe(5);
    });
  });

  describe('render', () => {
    it('draws score text centered at top of canvas', () => {
      const calls = [];
      const ctx = {
        save: () => calls.push('save'),
        restore: () => calls.push('restore'),
        fillText: (text, x, y) => calls.push({ method: 'fillText', text, x, y }),
        fillStyle: '',
        font: '',
        textAlign: ''
      };

      scoreManager.render(ctx, 400);

      expect(ctx.fillStyle).toBe('white');
      expect(ctx.font).toBe('bold 48px sans-serif');
      expect(ctx.textAlign).toBe('center');
      expect(calls).toContainEqual({ method: 'fillText', text: 0, x: 200, y: 60 });
      expect(calls[0]).toBe('save');
      expect(calls[calls.length - 1]).toBe('restore');
    });

    it('renders the current score value', () => {
      const pipes = [
        { x: 10, width: 20, scored: false },
        { x: 40, width: 20, scored: false }
      ];
      scoreManager.checkScore(100, pipes);

      let renderedText;
      const ctx = {
        save: () => {},
        restore: () => {},
        fillText: (text) => { renderedText = text; },
        fillStyle: '',
        font: '',
        textAlign: ''
      };

      scoreManager.render(ctx, 400);
      expect(renderedText).toBe(2);
    });
  });
});
