# Unit Test Execution

## Run Unit Tests

### 1. Execute All Unit Tests
```bash
npm test
```

This runs `vitest --run` which executes all `*.test.js` files in `src/`.

### 2. Run Specific Test Files
```bash
# Trap system tests only
npx vitest --run src/trap-types.test.js src/trap-sequence.test.js src/trap-manager.test.js

# Integration tests only
npx vitest --run src/trap-integration.test.js

# All existing (non-trap) tests
npx vitest --run src/player.test.js src/pipe-manager.test.js src/collision-detector.test.js src/game-engine.test.js src/score-manager.test.js src/input-handler.test.js src/background.test.js src/config.test.js src/state.test.js
```

### 3. Review Test Results
- **Expected**: 213+ tests pass, 0 failures
- **Test Report Location**: Console output (vitest default reporter)
- **PBT Tests**: Property-based tests run 100 iterations by default (fast-check default)

### 4. Test File Inventory

| Test File | Tests | Coverage Area |
|---|---|---|
| `src/trap-types.test.js` | 27 | Trap type factories, validation, PBT bounds |
| `src/trap-sequence.test.js` | 11 | Sequence validation, PBT NONE count |
| `src/trap-manager.test.js` | 19 | TrapManager logic, PBT determinism/stateful |
| `src/trap-integration.test.js` | 5 | Full flow, deterministic replay, PBT bounds |
| `src/player.test.js` | 30 | Player physics + gravity effect + PBT |
| `src/collision-detector.test.js` | 22 | Collision detection + additional colliders + PBT |
| `src/game-engine.test.js` | 19 | Game engine integration |
| `src/pipe-manager.test.js` | 23 | Pipe spawning and management |
| `src/score-manager.test.js` | 17 | Score tracking |
| `src/input-handler.test.js` | 13 | Input normalization |
| `src/background.test.js` | 17 | Background rendering |
| `src/config.test.js` | 6 | Configuration validation |
| `src/state.test.js` | 4 | State enum |

### 5. Fix Failing Tests
If tests fail:
1. Review test output in console
2. Check if failure is in PBT (will show seed and shrunk counterexample)
3. If PBT failure: use the seed to reproduce (`{ seed: <value> }`)
4. Fix code issues
5. Rerun tests until all pass

### 6. PBT Seed Reproduction
If a property-based test fails, fast-check outputs the seed. To reproduce:
```javascript
// In the failing test, add seed to fc.assert options:
fc.assert(
  fc.property(...),
  { seed: <failing_seed> }
);
```
