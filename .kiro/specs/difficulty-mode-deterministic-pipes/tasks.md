# Implementation Plan: Difficulty Mode & Deterministic Pipes

## Overview

Implement difficulty mode selection (Easy/Hard) and deterministic pipe positions using a seeded PRNG. The implementation proceeds bottom-up: PRNG module first, then config changes, PipeManager modifications, state/engine changes, input handling, and finally UI rendering. Each step builds on the previous and integrates immediately.

## Tasks

- [x] 1. Create SeededRandom module
  - [x] 1.1 Implement SeededRandom class in `src/seeded-random.js`
    - Create class with `constructor(seed)`, `next()`, and `reset()` methods
    - Use mulberry32 algorithm: 32-bit state, single multiplication + bit shifts
    - `next()` returns float in [0, 1)
    - `reset()` restores internal state to initial seed
    - Throw `Error` if seed is NaN or Infinity
    - _Requirements: 6.1, 6.2, 6.3, 6.4_

  - [ ]* 1.2 Write property test: PRNG Reset Determinism
    - **Property 1: PRNG Reset Determinism**
    - For any seed (uint32) and N (1–500), generate N values, reset, generate N again — sequences must be identical
    - **Validates: Requirements 6.3, 3.2**

  - [ ]* 1.3 Write property test: PRNG Output Range
    - **Property 2: PRNG Output Range**
    - For any seed (uint32) and N (1–1000), every value from `next()` must be >= 0 and < 1
    - **Validates: Requirements 6.1**

  - [ ]* 1.4 Write unit tests for SeededRandom
    - Test construction with valid seed
    - Test two instances with same seed produce identical sequences
    - Test different seeds produce different sequences
    - Test constructor throws on NaN/Infinity seed
    - _Requirements: 6.1, 6.2, 6.3, 6.4_

- [x] 2. Add difficulty constants to CONFIG and Difficulty enum to state
  - [x] 2.1 Add new constants to `src/config.js`
    - Add `GAP_SIZE_EASY: 200`
    - Add `GAP_SIZE_HARD: 140`
    - Add `PIPE_SEED: 12345`
    - Keep existing `GAP_SIZE: 140` for backward compatibility
    - _Requirements: 2.1, 2.2, 6.1_

  - [x] 2.2 Add Difficulty enum to `src/state.js`
    - Export `Difficulty` object with `EASY: 'easy'` and `HARD: 'hard'`
    - Keep existing `GameState` export unchanged
    - _Requirements: 1.1, 1.2_

  - [ ]* 2.3 Write unit tests for new config values and Difficulty enum
    - Verify GAP_SIZE_EASY is 200, GAP_SIZE_HARD is 140, PIPE_SEED is 12345
    - Verify Difficulty.EASY and Difficulty.HARD values
    - _Requirements: 2.1, 2.2_

- [x] 3. Modify PipeManager to accept gapSize and randomFn
  - [x] 3.1 Update PipeManager constructor and `_spawnPipe()` in `src/pipe-manager.js`
    - Add optional 4th parameter `{ gapSize, randomFn }` to constructor
    - Store `this.gapSize = gapSize || CONFIG.GAP_SIZE` (backward compatible)
    - Store `this.randomFn = randomFn || Math.random` (backward compatible with console warning)
    - In `_spawnPipe()`, replace `Math.random()` with `this.randomFn()`
    - In `_spawnPipe()`, replace `CONFIG.GAP_SIZE` with `this.gapSize`
    - Update pipe object to use `this.gapSize` for `gapSize` field
    - _Requirements: 2.1, 2.2, 2.3, 3.1, 3.4_

  - [ ]* 3.2 Write property test: Deterministic Pipe Positions Across Rounds
    - **Property 3: Deterministic Pipe Positions Across Rounds**
    - For any N (1–50), create PipeManager with SeededRandom, spawn N pipes, record gapY values; reset SeededRandom, create new PipeManager, spawn N pipes — sequences must be identical
    - **Validates: Requirements 3.3, 3.2**

  - [ ]* 3.3 Write property test: Gap Positions Within Valid Range
    - **Property 4: Gap Positions Within Valid Range**
    - For any seed (uint32) and N (1–50), every spawned pipe's gapY must be in [GAP_MIN_Y, CANVAS_HEIGHT - GAP_MAX_Y_OFFSET]
    - **Validates: Requirements 3.4**

  - [ ]* 3.4 Write unit tests for PipeManager changes
    - Test Easy mode uses 200px gap size
    - Test Hard mode uses 140px gap size
    - Test spawned pipes use provided randomFn (not Math.random)
    - Test backward compatibility: no options parameter still works
    - _Requirements: 2.1, 2.2, 3.1_

- [x] 4. Checkpoint - Ensure all tests pass
  - Ensure all tests pass, ask the user if questions arise.

- [x] 5. Modify GameEngine to manage difficulty and SeededRandom
  - [x] 5.1 Update GameEngine in `src/game-engine.js`
    - Import `SeededRandom` from `./seeded-random.js`
    - Import `Difficulty` from `./state.js`
    - Import `CONFIG` additions (GAP_SIZE_EASY, GAP_SIZE_HARD, PIPE_SEED)
    - Add `this.difficulty = Difficulty.EASY` in constructor (default to Easy)
    - Create `this.seededRandom = new SeededRandom(CONFIG.PIPE_SEED)` in `_setup()`
    - Pass `{ gapSize, randomFn: () => this.seededRandom.next() }` to PipeManager constructor based on current difficulty
    - In `reset()`: call `this.seededRandom.reset()`, recreate PipeManager with current difficulty's gapSize
    - Retain `this.difficulty` across game-over (do not reset it)
    - _Requirements: 1.2, 1.3, 1.4, 2.3, 3.1, 3.2_

  - [ ]* 5.2 Write unit tests for GameEngine difficulty management
    - Test default difficulty is 'easy'
    - Test difficulty persists across game-over/reset
    - Test SeededRandom is reset on game reset
    - Test PipeManager receives correct gapSize for each difficulty
    - _Requirements: 1.2, 1.3, 1.4, 2.3_

- [x] 6. Modify InputHandler to support difficulty toggle
  - [x] 6.1 Update InputHandler in `src/input-handler.js`
    - Add `this.difficultyCallback = null` field
    - Add `onDifficultyChange(callback)` method for registering difficulty toggle callback
    - In `_handleKeydown`, detect `ArrowLeft` and `ArrowRight` key codes
    - When arrow key pressed, call `this.difficultyCallback('left')` or `this.difficultyCallback('right')` if callback is registered
    - Keep existing Space/mouse/touch behavior unchanged
    - _Requirements: 1.1, 1.2_

  - [ ]* 6.2 Write unit tests for InputHandler difficulty toggle
    - Test arrow keys fire difficulty change callback with correct direction
    - Test space key still fires action callback (no regression)
    - Test no error when difficultyCallback is not registered
    - _Requirements: 1.1, 1.2_

- [x] 7. Wire difficulty toggle in GameEngine and update Ready screen rendering
  - [x] 7.1 Connect InputHandler difficulty callback in GameEngine
    - In `_setup()`, register `this.inputHandler.onDifficultyChange(direction => this._handleDifficultyChange(direction))`
    - Implement `_handleDifficultyChange(direction)`: only toggle difficulty when `this.state === GameState.READY`
    - Toggle between `Difficulty.EASY` and `Difficulty.HARD` on any arrow key press
    - After toggle, re-render the ready screen to reflect new selection
    - _Requirements: 1.1, 1.2, 1.5_

  - [x] 7.2 Update `_renderReadyScreen()` in GameEngine to show difficulty selector
    - Display "EASY" and "HARD" labels horizontally
    - Highlight the currently selected difficulty (e.g., bold/colored text vs dimmed)
    - Show arrow key hint (e.g., "← →" between options)
    - Keep existing "Press Space or Tap to Start" text
    - _Requirements: 1.1, 1.5_

  - [ ]* 7.3 Write unit tests for difficulty toggle wiring and ready screen
    - Test difficulty toggles only in READY state (not PLAYING or GAME_OVER)
    - Test ready screen renders difficulty selector with correct highlight
    - Test difficulty selection persists when returning from GAME_OVER to READY
    - _Requirements: 1.1, 1.4, 1.5_

- [x] 8. Write property test for Trap Sequence Cycling
  - [ ]* 8.1 Write property test: Trap Sequence Cycling
    - **Property 5: Trap Sequence Cycling**
    - For any N (1–100), the trap assigned to pipe at index i must equal DEFAULT_SEQUENCE[i % TRAP_SEQUENCE_LENGTH]
    - Add to `src/trap-manager.test.js`
    - **Validates: Requirements 4.2**

- [x] 9. Update existing tests for backward compatibility
  - [x] 9.1 Update existing PipeManager tests in `src/pipe-manager.test.js`
    - Ensure existing tests still pass without the new options parameter (backward compatibility)
    - Add or adjust tests that verify PipeManager works with default Math.random when no randomFn provided
    - _Requirements: 5.1, 5.2, 5.3_

  - [x] 9.2 Verify TrapManager reset behavior in existing tests
    - Confirm `trapManager.reset()` sets pipeIndex to 0 (already tested, verify no regression)
    - _Requirements: 4.1, 4.2_

- [x] 10. Final checkpoint - Ensure all tests pass
  - Ensure all tests pass, ask the user if questions arise.

## Notes

- Tasks marked with `*` are optional and can be skipped for faster MVP
- Each task references specific requirements for traceability
- Checkpoints ensure incremental validation
- Property tests validate universal correctness properties from the design document
- Unit tests validate specific examples and edge cases
- The implementation is backward compatible: existing code works without the new options parameter
- `fast-check` is already in devDependencies — no additional installation needed
