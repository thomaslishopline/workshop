import { describe, it, expect } from 'vitest';
import { CONFIG } from './config.js';

describe('CONFIG', () => {
  it('has correct canvas dimensions', () => {
    expect(CONFIG.CANVAS_WIDTH).toBe(400);
    expect(CONFIG.CANVAS_HEIGHT).toBe(600);
  });

  it('has physics constants defined', () => {
    expect(CONFIG.GRAVITY).toBe(980);
    expect(CONFIG.FLAP_VELOCITY).toBe(-300);
    expect(CONFIG.PIPE_SPEED).toBe(150);
  });

  it('has pipe configuration defined', () => {
    expect(CONFIG.PIPE_SPAWN_INTERVAL).toBe(1.8);
    expect(CONFIG.PIPE_WIDTH).toBe(52);
    expect(CONFIG.GAP_SIZE).toBe(140);
    expect(CONFIG.GAP_MIN_Y).toBe(100);
    expect(CONFIG.GAP_MAX_Y_OFFSET).toBe(100);
  });

  it('has player configuration defined', () => {
    expect(CONFIG.PLAYER_X).toBe(80);
    expect(CONFIG.MAX_ROTATION).toBeCloseTo(Math.PI / 4);
    expect(CONFIG.MIN_ROTATION).toBeCloseTo(-Math.PI / 6);
  });

  it('FLAP_VELOCITY is negative (upward)', () => {
    expect(CONFIG.FLAP_VELOCITY).toBeLessThan(0);
  });

  it('GAP_SIZE provides enough space for gameplay', () => {
    expect(CONFIG.GAP_SIZE).toBeGreaterThan(0);
    expect(CONFIG.GAP_SIZE).toBeLessThan(CONFIG.CANVAS_HEIGHT);
  });
});
