# Design Document: Difficulty Mode & Deterministic Pipes

## Overview

This feature introduces two changes to the Flappy Usagi game:

1. **Difficulty Mode Selection** — A Hard/Easy toggle on the Ready screen that controls the pipe gap size (140px for Hard, 200px for Easy).
2. **Deterministic Pipe Positions** — Replace `Math.random()` in `PipeManager._spawnPipe()` with a seeded PRNG so that every round with the same difficulty produces identical pipe layouts, enabling memorization-based gameplay.

These changes align with the Cat Mario design philosophy: the game is meant to be learned through repetition. Deterministic layouts make that possible, while Easy mode provides a gentler on-ramp.

### Design Rationale

- **Seeded PRNG as a module** — A standalone `src/seeded-random.js` module keeps the PRNG logic pure, testable, and reusable. The mulberry32 algorithm is chosen for its simplicity (4 lines of code), good distribution properties, and widespread use in game development.
- **Difficulty as game-level state** — Difficulty is stored on `GameEngine` (not global/localStorage) because it only needs to persist within a session and affects multiple components (PipeManager gap size, Ready screen rendering).
- **Minimal API surface** — PipeManager receives `gapSize` and a random-number function at construction time rather than a full difficulty config object. This keeps coupling low and testing simple.

## Architecture

```mermaid
graph TD
    subgraph "Ready Screen"
        RS[Ready Screen UI] -->|displays| DM[Difficulty Selector]
        DM -->|user selects| GE[GameEngine.difficulty]
    end

    subgraph "Game Engine"
        GE -->|passes gapSize & rng| PM[PipeManager]
        GE -->|resets on new round| PRNG[SeededRandom]
    end

    subgraph "Pipe Generation"
        PRNG -->|next()| PM
        PM -->|spawns pipes with deterministic gapY| PIPES[Pipe Array]
    end

    subgraph "Existing (unchanged)"
        TM[TrapManager] -->|deterministic sequence| PIPES
    end
```

**Data flow on game reset:**
1. `GameEngine.reset()` resets `SeededRandom` to initial seed
2. `GameEngine.reset()` resets `TrapManager` sequence index to 0
3. `PipeManager.reset()` clears pipes and spawn timer
4. Next round produces identical pipe positions + trap assignments

## Components and Interfaces

### New: `SeededRandom` (src/seeded-random.js)

A pure, stateful PRNG using the mulberry32 algorithm.

```javascript
export class SeededRandom {
  constructor(seed: number)
  next(): number          // Returns float in [0, 1)
  reset(): void           // Resets internal state to initial seed
}
```

**Algorithm choice: mulberry32**
- 32-bit state, single multiplication + bit shifts
- Passes PractRand and SmallCrush statistical tests
- Deterministic: same seed → same sequence, guaranteed
- No external dependencies

### Modified: `PipeManager` (src/pipe-manager.js)

**Changes:**
- Constructor accepts `gapSize` and `randomFn` parameters instead of using `CONFIG.GAP_SIZE` and `Math.random()` directly
- `_spawnPipe()` calls `this.randomFn()` instead of `Math.random()`
- Uses `this.gapSize` instead of `CONFIG.GAP_SIZE`

```javascript
export class PipeManager {
  constructor(canvasWidth, canvasHeight, trapManager, { gapSize, randomFn }) {
    // ...existing fields...
    this.gapSize = gapSize;
    this.randomFn = randomFn;
  }

  _spawnPipe() {
    const minY = CONFIG.GAP_MIN_Y;
    const maxY = this.canvasHeight - CONFIG.GAP_MAX_Y_OFFSET;
    const gapY = minY + this.randomFn() * (maxY - minY);
    // ...rest uses this.gapSize instead of CONFIG.GAP_SIZE...
  }
}
```

### Modified: `GameEngine` (src/game-engine.js)

**Changes:**
- New `difficulty` property (`'easy'` | `'hard'`), defaults to `'easy'`
- Creates `SeededRandom` instance with a fixed seed (e.g., `12345`)
- Passes appropriate `gapSize` and `randomFn` to `PipeManager`
- `reset()` calls `this.seededRandom.reset()` to restart the sequence
- Ready screen renders difficulty selector buttons
- Input handling in READY state includes difficulty toggle (left/right arrow keys or tap on buttons)

```javascript
// New constants in CONFIG
GAP_SIZE_EASY: 200,
GAP_SIZE_HARD: 140,
PIPE_SEED: 12345,
```

### Modified: `CONFIG` (src/config.js)

**Changes:**
- Add `GAP_SIZE_EASY: 200`
- Add `GAP_SIZE_HARD: 140`
- Add `PIPE_SEED: 12345`
- Keep existing `GAP_SIZE: 140` for backward compatibility (used as Hard default)

### Modified: `InputHandler` (src/input-handler.js)

**Changes:**
- Add a second callback registration: `onDifficultyChange(callback)` for left/right arrow key presses
- Arrow keys only fire in READY state (controlled by GameEngine)

### Modified: Ready Screen Rendering

**Changes:**
- Display "EASY" and "HARD" labels with visual indicator of current selection
- Use left/right arrow keys or clickable regions to toggle

## Data Models

### Difficulty Mode

```javascript
// String enum approach (consistent with existing GameState pattern)
export const Difficulty = {
  EASY: 'easy',
  HARD: 'hard',
};
```

### SeededRandom Internal State

```javascript
{
  initialSeed: number,  // The seed passed at construction (immutable)
  state: number,        // Current 32-bit PRNG state (mutates on each next() call)
}
```

### PipeManager Configuration

```javascript
{
  gapSize: number,      // 200 for Easy, 140 for Hard
  randomFn: () => number, // Bound to SeededRandom.next()
}
```

### Pipe Object (existing, unchanged shape)

```javascript
{
  x: number,
  gapY: number,       // Now deterministic via seeded PRNG
  gapSize: number,    // Now per-difficulty (was always CONFIG.GAP_SIZE)
  width: number,
  scored: boolean,
  trap: object | null,
  trapState: object | null,
}
```


## Correctness Properties

*A property is a characteristic or behavior that should hold true across all valid executions of a system — essentially, a formal statement about what the system should do. Properties serve as the bridge between human-readable specifications and machine-verifiable correctness guarantees.*

### Property 1: PRNG Reset Determinism

*For any* numeric seed and *for any* positive integer N, creating a SeededRandom with that seed, calling `next()` N times, then calling `reset()`, then calling `next()` N times again SHALL produce two identical sequences of numbers.

**Validates: Requirements 6.3, 3.2**

### Property 2: PRNG Output Range

*For any* numeric seed and *for any* number of calls to `next()`, every returned value SHALL be greater than or equal to 0 and strictly less than 1.

**Validates: Requirements 6.1**

### Property 3: Deterministic Pipe Positions Across Rounds

*For any* positive integer N representing the number of pipes spawned, two separate rounds using the same difficulty mode (and therefore the same seed and gap size) SHALL produce identical sequences of N gap Y positions.

**Validates: Requirements 3.3, 3.2**

### Property 4: Gap Positions Within Valid Range

*For any* seed and *for any* number of spawned pipes, every generated gap Y position SHALL fall within the range [GAP_MIN_Y, CANVAS_HEIGHT - GAP_MAX_Y_OFFSET].

**Validates: Requirements 3.4**

### Property 5: Trap Sequence Cycling

*For any* positive integer N representing the number of pipes spawned, the trap assigned to pipe at index i SHALL equal DEFAULT_SEQUENCE[i % TRAP_SEQUENCE_LENGTH] for all i in [0, N).

**Validates: Requirements 4.2**

## Error Handling

| Scenario | Handling |
|----------|----------|
| Invalid seed value (NaN, Infinity) | `SeededRandom` constructor throws `Error` with descriptive message |
| Seed of 0 | Accepted — mulberry32 handles 0 seed correctly (state advances on first call) |
| PipeManager receives no randomFn | Falls back to `Math.random()` with console warning (backward compatibility) |
| PipeManager receives no gapSize | Falls back to `CONFIG.GAP_SIZE` (140px) |
| Invalid difficulty string | `GameEngine` ignores invalid values, retains current difficulty |

**Design decision:** Errors in PRNG construction are fail-fast (throw) because they indicate programmer error. Missing optional parameters in PipeManager use sensible defaults for backward compatibility with existing tests.

## Testing Strategy

### Property-Based Tests (using fast-check)

Each correctness property maps to a single property-based test with minimum 100 iterations:

| Property | Test File | What Varies |
|----------|-----------|-------------|
| 1: PRNG Reset Determinism | `src/seeded-random.test.js` | seed (uint32), N (1–500) |
| 2: PRNG Output Range | `src/seeded-random.test.js` | seed (uint32), N (1–1000) |
| 3: Deterministic Pipe Positions | `src/pipe-manager.test.js` | N pipes (1–50) |
| 4: Gap Positions Valid Range | `src/pipe-manager.test.js` | seed (uint32), N pipes (1–50) |
| 5: Trap Sequence Cycling | `src/trap-manager.test.js` | N pipes (1–100) |

**Configuration:**
- Library: `fast-check` (already in devDependencies)
- Iterations: 100 minimum per property
- Tag format: `Feature: difficulty-mode-deterministic-pipes, Property {N}: {title}`

### Unit Tests (example-based)

| Component | Test Cases |
|-----------|------------|
| `SeededRandom` | Construction with valid seed, two instances with same seed produce same values, different seeds produce different values |
| `PipeManager` | Easy mode uses 200px gap, Hard mode uses 140px gap, spawned pipes use provided randomFn |
| `GameEngine` | Default difficulty is 'easy', difficulty persists across game-over, difficulty toggle works in READY state |
| `InputHandler` | Arrow keys fire difficulty change callback, space still fires action callback |
| Ready Screen | Renders difficulty selector, highlights current selection |

### Integration Tests

| Scenario | Verification |
|----------|-------------|
| Full round determinism | Play N pipes in round 1, reset, play N pipes in round 2 — positions and traps identical |
| Difficulty switch | Switch from Easy to Hard between rounds — gap size changes, positions stay deterministic |
| Backward compatibility | Existing trap-integration tests pass without modification |
