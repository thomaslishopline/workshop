# Integration Test Instructions

## Purpose
Test interactions between the trap system and existing game components to ensure they work together correctly.

## Test Scenarios

### Scenario 1: TrapManager → PipeManager Integration
- **Description**: Verify that pipes spawned by PipeManager correctly receive trap assignments from TrapManager
- **Test File**: `src/trap-integration.test.js`
- **Test Steps**: Spawn pipe → verify trap attached → update → verify effects produced
- **Expected Results**: Each pipe gets the correct trap from the deterministic sequence

### Scenario 2: TrapManager → GameEngine → Player Integration
- **Description**: Verify that gravity trap effects are correctly applied to the player through the game engine
- **Test File**: `src/trap-integration.test.js`
- **Test Steps**: Create gravity trap pipe → position player in range → update → verify gravity modified
- **Expected Results**: Player's gravity is modified for the configured duration

### Scenario 3: TrapManager → CollisionDetector Integration
- **Description**: Verify that invisible obstacles and fake gap kill zones produce collisions
- **Test File**: `src/trap-integration.test.js`
- **Test Steps**: Create invisible/fake_gap trap → update → verify addCollider returned → check collision
- **Expected Results**: Additional colliders are checked and produce game over on overlap

### Scenario 4: Deterministic Replay
- **Description**: Verify that two independent game sessions with same inputs produce identical trap sequences
- **Test File**: `src/trap-integration.test.js`
- **Test Steps**: Create two TrapManagers → call getNextTrap same number of times → compare results
- **Expected Results**: Identical trap assignments at every position

### Scenario 5: Game Reset Clears Trap State
- **Description**: Verify that resetting the game properly resets all trap state
- **Test File**: `src/trap-integration.test.js`
- **Test Steps**: Advance game state → reset → verify TrapManager at index 0, no active effects
- **Expected Results**: Clean slate after reset, sequence starts from beginning

## Run Integration Tests

### 1. Execute Integration Test Suite
```bash
npx vitest --run src/trap-integration.test.js
```

### 2. Verify Service Interactions
All integration scenarios are automated in the test file. Manual verification can be done by:
1. Opening the game in a browser
2. Playing through the first 10 pipes
3. Dying and restarting
4. Verifying the same traps appear at the same positions

## Browser-Based Manual Testing

For visual verification of trap mechanics:
1. Serve the game: `npx serve .`
2. Open in browser
3. Verify each trap type activates correctly:
   - Pipe 1 (SPEED): noticeably faster pipe
   - Pipe 2 (NONE): normal pipe
   - Pipe 3 (INVISIBLE): hidden block appears on death
   - Pipe 4 (MOVING): gap visibly shifts downward
   - Pipe 5 (NONE): normal pipe
   - Pipe 6 (FAKE_GAP): red zone visible after death
   - Pipe 7 (GRAVITY): gravity reversal when entering pipe zone
   - Pipe 8 (SPEED): very fast pipe
   - Pipe 9 (INVISIBLE): hidden block appears on death
   - Pipe 10 (MOVING): gap oscillates
4. After pipe 10, sequence repeats from pipe 1
