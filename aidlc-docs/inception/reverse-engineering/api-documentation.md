# API Documentation

## REST APIs
None - this is a fully client-side browser game with no server communication.

## Internal APIs

### GameEngine
- **Methods**:
  - `init()` - Load sprite, set up components and event listeners
  - `start()` - Begin the requestAnimationFrame game loop
  - `update(deltaTime: number)` - Update all game components for one frame
  - `render()` - Draw current frame to canvas
  - `reset()` - Reset game to READY state

### Player
- **Methods**:
  - `constructor(sprite: HTMLImageElement, x: number, y: number)` - Create player at position
  - `flap()` - Apply upward impulse (sets velocity to FLAP_VELOCITY)
  - `update(deltaTime: number)` - Apply gravity, update position and rotation
  - `getHitbox()` - Returns `{x, y, width, height}` with 4px padding inset
  - `render(ctx: CanvasRenderingContext2D)` - Draw rotated sprite

### PipeManager
- **Methods**:
  - `constructor(canvasWidth: number, canvasHeight: number)` - Initialize pipe system
  - `update(deltaTime: number)` - Move pipes, spawn new ones, remove off-screen
  - `getPipes()` - Returns array of `{x, gapY, gapSize, width, scored}`
  - `reset()` - Clear all pipes and timer
  - `render(ctx: CanvasRenderingContext2D)` - Draw green pipe rectangles

### CollisionDetector (pure functions)
- **Functions**:
  - `checkPipeCollision(playerHitbox, pipes, canvasHeight)` - Returns boolean
  - `checkBoundaryCollision(playerHitbox, canvasHeight)` - Returns boolean

### ScoreManager
- **Methods**:
  - `checkScore(playerX: number, pipes: Array)` - Increment score for passed pipes
  - `getScore()` - Returns current score (number)
  - `getHighScore()` - Returns session high score (number)
  - `reset()` - Update high score, reset current to 0
  - `render(ctx: CanvasRenderingContext2D, canvasWidth: number)` - Draw score text

### InputHandler
- **Methods**:
  - `constructor(canvas: HTMLCanvasElement, doc?: Document)` - Set up event listeners
  - `onAction(callback: Function)` - Register input callback
  - `destroy()` - Remove all event listeners

### Background
- **Methods**:
  - `constructor(canvasWidth: number, canvasHeight: number)` - Initialize layers
  - `update(deltaTime: number)` - Scroll ground and clouds
  - `render(ctx: CanvasRenderingContext2D)` - Draw sky, clouds, ground

## Data Models

### Pipe Object
- **Fields**: `{x: number, gapY: number, gapSize: number, width: number, scored: boolean}`
- **Relationships**: Managed by PipeManager, consumed by CollisionDetector and ScoreManager
- **Validation**: gapY constrained between GAP_MIN_Y and canvasHeight - GAP_MAX_Y_OFFSET

### Hitbox Object
- **Fields**: `{x: number, y: number, width: number, height: number}`
- **Relationships**: Produced by Player.getHitbox(), consumed by CollisionDetector
- **Validation**: 4px inset from sprite bounds

### CONFIG Object
- **Fields**: CANVAS_WIDTH, CANVAS_HEIGHT, GRAVITY, FLAP_VELOCITY, PIPE_SPEED, PIPE_SPAWN_INTERVAL, PIPE_WIDTH, GAP_SIZE, GAP_MIN_Y, GAP_MAX_Y_OFFSET, PLAYER_X, MAX_ROTATION, MIN_ROTATION
- **Relationships**: Imported by Player, PipeManager, Background
- **Validation**: All numeric, physics values tuned for playability
