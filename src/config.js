export const CONFIG = {
  CANVAS_WIDTH: 400,
  CANVAS_HEIGHT: 600,
  GRAVITY: 980,              // pixels/sec^2
  FLAP_VELOCITY: -300,       // pixels/sec (negative = upward)
  PIPE_SPEED: 150,           // pixels/sec
  PIPE_SPAWN_INTERVAL: 1.8,  // seconds
  PIPE_WIDTH: 52,
  GAP_SIZE: 140,             // pixels between top and bottom pipe
  GAP_SIZE_EASY: 200,        // gap size for Easy difficulty
  GAP_SIZE_HARD: 140,        // gap size for Hard difficulty
  PIPE_SEED: 12345,          // fixed seed for deterministic pipe generation
  GAP_MIN_Y: 100,            // minimum gap center from top
  GAP_MAX_Y_OFFSET: 100,    // minimum gap center from bottom
  PLAYER_X: 80,             // fixed horizontal position
  MAX_ROTATION: Math.PI / 4, // max downward tilt
  MIN_ROTATION: -Math.PI / 6, // max upward tilt

  // Trap system constants
  TRAP_SEQUENCE_LENGTH: 10,
  INVISIBLE_BLOCK_MIN_SIZE: 20,
  INVISIBLE_BLOCK_MAX_WIDTH: 60,
  INVISIBLE_BLOCK_MAX_HEIGHT: 40,
  FAKE_GAP_MIN_SAFE_SIZE: 50,
  GRAVITY_EFFECT_MIN_DURATION: 1.0,
  GRAVITY_EFFECT_MAX_DURATION: 2.0,
  GRAVITY_MULTIPLIER_MIN: -1.0,
  GRAVITY_MULTIPLIER_MAX: 3.0,
  SPEED_MULTIPLIER_MIN: 1.5,
  SPEED_MULTIPLIER_MAX: 4.0,
  MOVING_PIPE_MAX_RANGE: 60,
};
