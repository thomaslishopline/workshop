import { describe, it, expect } from 'vitest';
import { GameState } from './state.js';

describe('GameState', () => {
  it('has READY state', () => {
    expect(GameState.READY).toBe('ready');
  });

  it('has PLAYING state', () => {
    expect(GameState.PLAYING).toBe('playing');
  });

  it('has GAME_OVER state', () => {
    expect(GameState.GAME_OVER).toBe('gameover');
  });

  it('has exactly three states', () => {
    expect(Object.keys(GameState)).toHaveLength(3);
  });
});
