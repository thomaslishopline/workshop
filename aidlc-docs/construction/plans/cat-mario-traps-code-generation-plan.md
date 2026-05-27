# Code Generation Plan: Cat Mario Traps

## Unit Context
- **Unit**: Cat Mario Trap System
- **Project Type**: Brownfield (existing Flappy Usagi game)
- **Code Location**: `src/` (workspace root)
- **Test Location**: `src/` (co-located with source, pattern: `*.test.js`)
- **Existing Files to Modify**: `src/game-engine.js`, `src/pipe-manager.js`, `src/player.js`, `src/collision-detector.js`, `src/config.js`
- **New Files to Create**: `src/trap-manager.js`, `src/trap-types.js`, `src/trap-sequence.js`
- **Test Framework**: vitest + fast-check (already configured)

## Dependencies
- All existing components remain functional (backward compatible)
- TrapManager depends on CONFIG, TrapTypes, TrapSequence
- GameEngine integrates TrapManager into game loop
- PipeManager assigns traps to pipes via TrapManager
- Player supports gravity modification
- CollisionDetector supports additional colliders

## Generation Steps

### Step 1: Create Trap Type Definitions
- [x] Create `src/trap-types.js`

### Step 2: Create Default Trap Sequence
- [x] Create `src/trap-sequence.js`

### Step 3: Create TrapManager
- [x] Create `src/trap-manager.js`

### Step 4: Update CONFIG
- [x] Modify `src/config.js`

### Step 5: Update Player for Gravity Effects
- [x] Modify `src/player.js`

### Step 6: Update CollisionDetector for Additional Colliders
- [x] Modify `src/collision-detector.js`

### Step 7: Update PipeManager for Trap Assignment
- [x] Modify `src/pipe-manager.js`

### Step 8: Update GameEngine for Trap Integration
- [x] Modify `src/game-engine.js`

### Step 9: Write Unit Tests — Trap Types
- [x] Create `src/trap-types.test.js`

### Step 10: Write Unit Tests — Trap Sequence
- [x] Create `src/trap-sequence.test.js`

### Step 11: Write Unit Tests — TrapManager
- [x] Create `src/trap-manager.test.js`

### Step 12: Write Unit Tests — Updated Player
- [x] Create/update `src/player.test.js`

### Step 13: Write Unit Tests — Updated CollisionDetector
- [x] Create/update `src/collision-detector.test.js`

### Step 14: Write Integration-Level Tests
- [x] Create `src/trap-integration.test.js`

### Step 15: Generate Code Summary Documentation
- [x] Create `aidlc-docs/construction/cat-mario-traps/code/code-generation-summary.md`
