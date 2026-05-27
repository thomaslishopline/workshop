# Component Inventory

## Application Packages
- `src/game-engine.js` - Central game orchestrator
- `src/player.js` - Player character with physics
- `src/pipe-manager.js` - Obstacle generation and management
- `src/collision-detector.js` - Pure collision detection functions
- `src/score-manager.js` - Score tracking and display
- `src/input-handler.js` - Multi-device input normalization
- `src/background.js` - Parallax background rendering
- `src/config.js` - Game configuration constants
- `src/state.js` - Game state enumeration
- `src/main.js` - Application bootstrap

## Infrastructure Packages
- None (static files served directly, no build pipeline)

## Shared Packages
- `src/config.js` - Shared configuration (used by Player, PipeManager, Background)
- `src/state.js` - Shared state enum (used by GameEngine)

## Test Packages
- `src/background.test.js` - Unit tests for Background
- `src/collision-detector.test.js` - Unit tests for CollisionDetector
- `src/config.test.js` - Unit tests for CONFIG validation
- `src/game-engine.test.js` - Unit tests for GameEngine
- `src/input-handler.test.js` - Unit tests for InputHandler
- `src/pipe-manager.test.js` - Unit tests for PipeManager
- `src/player.test.js` - Unit tests for Player
- `src/score-manager.test.js` - Unit tests for ScoreManager
- `src/state.test.js` - Unit tests for GameState

## Total Count
- **Total Source Files**: 10 (application)
- **Application**: 10
- **Infrastructure**: 0
- **Shared**: 2 (config.js, state.js - dual role)
- **Test**: 9
