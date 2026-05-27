# Implementation Plan: Flappy Bird Game

## Overview

Build a browser-based Flappy Bird clone using HTML5 Canvas and vanilla JavaScript. The player controls a rabbit character (`usagi.webp`) navigating through pipe gaps. The implementation follows an incremental approach: project setup → core physics → pipe system → collision → scoring → game states → polish and integration.

## Tasks

- [x] 1. Set up project structure and game constants
  - Create `index.html` with a canvas element at 400×600 resolution and basic page styling
  - Create `src/config.js` with all game constants (GRAVITY, FLAP_VELOCITY, PIPE_SPEED, GAP_SIZE, etc.)
  - Create `src/state.js` with the GameState enum (READY, PLAYING, GAME_OVER)
  - Set up Vitest and fast-check in `package.json` for testing
  - _Requirements: 1.1, 7.1_

- [x] 2. Implement Player character
  - [x] 2.1 Create `src/player.js` with the Player class
    - Load sprite from `usagi.webp`, store position (x, y), velocity, rotation, and dimensions
    - Implement `flap()` to set velocity to FLAP_VELOCITY
    - Implement `update(deltaTime)` to apply gravity (velocity += GRAVITY * deltaTime), update y position, and clamp rotation within [MIN_ROTATION, MAX_ROTATION]
    - Implement `getHitbox()` returning {x, y, width, height}
    - Implement `render(ctx)` to draw the sprite with rotation transform
    - _Requirements: 2.1, 2.2, 2.3, 2.4_

  - [ ]* 2.2 Write property test: Gravity applies constant acceleration
    - **Property 1: Gravity applies constant acceleration**
    - For any positive deltaTime and any player state, after update (without flap), velocity increases by exactly GRAVITY * deltaTime
    - **Validates: Requirements 2.2**

  - [ ] 2.3 Write property test: Flap resets velocity regardless of state
    - **Property 2: Flap resets velocity regardless of state**
    - For any player state, calling flap() sets velocity to exactly FLAP_VELOCITY
    - **Validates: Requirements 2.3**

  - [ ]* 2.4 Write property test: Rotation reflects movement direction
    - **Property 3: Rotation reflects movement direction**
    - For any velocity, rotation is negative when velocity is negative, positive when velocity is positive, and clamped within bounds
    - **Validates: Requirements 2.4**

- [x] 3. Implement PipeManager
  - [x] 3.1 Create `src/pipe-manager.js` with the PipeManager class
    - Track active pipe pairs as an array of {x, gapY, gapSize, width, scored} objects
    - Implement `update(deltaTime)` to move pipes left by PIPE_SPEED * deltaTime, spawn new pipes at PIPE_SPAWN_INTERVAL, and remove off-screen pipes
    - Implement `getPipes()` returning the active pipes array
    - Implement `reset()` to clear all pipes and reset spawn timer
    - Implement `render(ctx)` to draw top and bottom pipe rectangles for each pair
    - _Requirements: 3.1, 3.2, 3.3, 3.4, 3.5_

  - [ ]* 3.2 Write property test: Gap position within playable bounds
    - **Property 5: Gap position is always within playable bounds**
    - For any generated pipe, gapY is within [GAP_MIN_Y, canvasHeight - GAP_MAX_Y_OFFSET]
    - **Validates: Requirements 3.2**

  - [ ]* 3.3 Write property test: Pipes move at constant speed
    - **Property 6: Pipes move at constant speed**
    - For any pipes and positive deltaTime, each pipe's x decreases by exactly PIPE_SPEED * deltaTime
    - **Validates: Requirements 3.3**

  - [ ]* 3.4 Write property test: Off-screen pipes are removed
    - **Property 7: Off-screen pipes are removed**
    - After update, no pipe has x + width < 0
    - **Validates: Requirements 3.4**

  - [ ]* 3.5 Write property test: Gap size is invariant
    - **Property 8: Gap size is invariant**
    - For any pipe pair, the vertical distance between top pipe bottom edge and bottom pipe top edge equals GAP_SIZE
    - **Validates: Requirements 3.5**

  - [ ]* 3.6 Write property test: Pipe generation respects spawn interval
    - **Property 4: Pipe generation respects spawn interval**
    - A new pipe is generated if and only if elapsed time >= PIPE_SPAWN_INTERVAL
    - **Validates: Requirements 3.1**

- [x] 4. Implement CollisionDetector
  - [x] 4.1 Create `src/collision-detector.js` as a pure function module
    - Implement `checkPipeCollision(playerHitbox, pipes)` using AABB overlap test against top and bottom pipe rects
    - Implement `checkBoundaryCollision(playerHitbox, canvasHeight)` checking y < 0 or y + height > canvasHeight
    - _Requirements: 4.1, 4.2, 4.3, 4.4_

  - [ ]* 4.2 Write property test: AABB collision correctness
    - **Property 9: Rectangle overlap detection is correct**
    - For any two rectangles, checkPipeCollision returns true iff they share non-zero area
    - **Validates: Requirements 4.2**

  - [ ]* 4.3 Write property test: Boundary collision detection
    - **Property 10: Boundary collision detection**
    - For any player hitbox, checkBoundaryCollision returns true iff y < 0 or y + height > canvasHeight
    - **Validates: Requirements 4.3, 4.4**

- [x] 5. Checkpoint
  - Ensure all tests pass, ask the user if questions arise.

- [x] 6. Implement ScoreManager
  - [x] 6.1 Create `src/score-manager.js` with the ScoreManager class
    - Track current score and session high score
    - Implement `checkScore(playerX, pipes)` to increment score when player passes pipe midpoint (pipe.x + pipe.width / 2), marking pipe as scored
    - Implement `getScore()`, `getHighScore()`, `reset()` (preserves high score)
    - Implement `render(ctx, canvasWidth)` to draw score text centered at top of canvas
    - _Requirements: 5.1, 5.2, 5.3, 6.2, 6.3_

  - [ ]* 6.2 Write property test: Score increments exactly once per pipe
    - **Property 11: Score increments exactly once per pipe**
    - For any pipe where player crosses midpoint, score increments by 1 and does not increment again for same pipe
    - **Validates: Requirements 5.1**

  - [ ]* 6.3 Write property test: High score is maximum of all game scores
    - **Property 12: High score is the maximum of all game scores**
    - For any sequence of completed games, high score equals the maximum value
    - **Validates: Requirements 6.3**

- [x] 7. Implement InputHandler
  - [x] 7.1 Create `src/input-handler.js` with the InputHandler class
    - Listen for keydown (spacebar), mousedown, and touchstart events on the canvas
    - Implement `onAction(callback)` to register a single action callback
    - Implement `destroy()` to remove all event listeners
    - Prevent default on spacebar to avoid page scrolling
    - _Requirements: 2.1_

- [x] 8. Implement Background
  - [x] 8.1 Create `src/background.js` with the Background class
    - Render a scrolling gradient or pattern background
    - Implement `update(deltaTime)` to scroll the background
    - Implement `render(ctx)` to draw background layers with parallax effect
    - _Requirements: 1.4_

- [x] 9. Implement GameEngine and wire everything together
  - [x] 9.1 Create `src/game-engine.js` with the GameEngine class
    - Initialize canvas, load sprite asset, instantiate all components (Player, PipeManager, CollisionDetector, ScoreManager, InputHandler, Background)
    - Implement `init()` with asset loading (handle onerror for usagi.webp)
    - Implement game loop using requestAnimationFrame with delta-time calculation (cap deltaTime at 100ms)
    - Implement `update(deltaTime)` to orchestrate state-based updates: in PLAYING state update player, pipes, check collisions, check score; in GAME_OVER state stop updates
    - Implement `render()` to draw background, pipes, player, and score based on current state
    - Implement state transitions: READY → PLAYING on input, PLAYING → GAME_OVER on collision, GAME_OVER → READY on input
    - Display start prompt in READY state, final score and high score in GAME_OVER state
    - _Requirements: 1.1, 1.2, 1.3, 6.1, 6.2, 6.3, 6.4, 6.5, 7.1, 7.2_

  - [x] 9.2 Create `src/main.js` entry point
    - Instantiate GameEngine with the canvas element
    - Call init() and start the game loop
    - _Requirements: 1.1_

  - [x] 9.3 Update `index.html` to load modules
    - Add script tag with type="module" pointing to src/main.js
    - Style canvas to be centered and scale to viewport while maintaining aspect ratio
    - _Requirements: 7.3_

- [x] 10. Checkpoint
  - Ensure all tests pass, ask the user if questions arise.

- [ ]* 11. Write property test: Frame-rate-independent physics
  - **Property 13: Frame-rate-independent physics**
  - For any total time T, simulating with N small steps produces approximately the same result as M larger steps (within epsilon)
  - **Validates: Requirements 7.2**

- [ ]* 12. Write integration tests
  - [ ]* 12.1 Write integration test: Full game loop
    - Start game, simulate multiple frames, verify pipes appear and move left
    - _Requirements: 3.1, 3.3, 7.1_
  - [ ]* 12.2 Write integration test: Score flow
    - Simulate player passing multiple pipes, verify score increments correctly
    - _Requirements: 5.1_
  - [ ]* 12.3 Write integration test: Game over flow
    - Simulate collision with pipe, verify state transitions to GAME_OVER and scores display
    - _Requirements: 4.2, 6.1, 6.2_

- [x] 13. Final checkpoint
  - Ensure all tests pass, ask the user if questions arise.

## Notes

- Tasks marked with `*` are optional and can be skipped for faster MVP
- Each task references specific requirements for traceability
- Checkpoints ensure incremental validation
- Property tests validate universal correctness properties from the design document using fast-check
- Unit/integration tests validate specific scenarios and state transitions
- The game uses vanilla JavaScript ES modules — no bundler required
- Canvas mocking (manual 2D context stub) is needed for render tests
