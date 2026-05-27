# Business Logic Model: Cat Mario Trap System

## Overview

The trap system adds Cat Mario-style surprise mechanics to Flappy Usagi through a deterministic, sequenced trap system. Each pipe in the game can have an associated trap that modifies gameplay in unexpected ways.

## Core Components

### TrapManager

The central orchestrator for the trap system. Maintains a deterministic sequence of traps and assigns them to pipes as they spawn.

**Responsibilities:**
- Maintain a fixed-length trap sequence (10 entries, repeating)
- Assign trap types to pipes based on their spawn index
- Track pipe spawn count to determine current position in sequence
- Provide trap data to GameEngine for per-frame processing
- Reset state on game restart

**State:**
- `sequence: TrapDefinition[]` — fixed array of 10 trap definitions
- `pipeIndex: number` — current position in sequence (wraps at 10)

**Operations:**
- `getNextTrap(): TrapDefinition` — returns trap for next pipe, advances index
- `update(deltaTime, pipes, player): TrapEffect[]` — processes active traps, returns effects
- `reset()` — resets pipeIndex to 0

### TrapDefinition

A data structure describing what trap is assigned to a pipe position.

**Fields:**
- `type: TrapType` — enum identifying the trap category
- `params: object` — type-specific parameters (movement speed, gravity multiplier, etc.)

### TrapType Enum

```
NONE        — no trap (safe pipe)
INVISIBLE   — hidden obstacle in/near the gap
MOVING      — pipe gap shifts position
FAKE_GAP    — gap contains hidden kill zone
GRAVITY     — gravity reversal/intensification zone
SPEED       — pipe accelerates toward player
```

### TrapEffect

Result of processing a trap for the current frame. Consumed by GameEngine to modify game behavior.

**Fields:**
- `type: TrapType` — which trap produced this effect
- `pipeIndex: number` — which pipe this effect belongs to
- `modifyPlayer: object|null` — player modifications (gravity multiplier, etc.)
- `modifyPipe: object|null` — pipe modifications (new gapY, new speed, etc.)
- `addCollider: object|null` — additional collision rectangle to check
- `activated: boolean` — whether the trap has been triggered (for visual feedback)

## Trap Processing Flow

```
Per Frame:
1. GameEngine calls TrapManager.update(dt, pipes, player)
2. TrapManager iterates active pipes with traps
3. For each trapped pipe:
   a. Check activation condition (proximity, position, etc.)
   b. If activated, compute TrapEffect
   c. Mark trap as activated (for visual feedback on death)
4. Return array of TrapEffects
5. GameEngine applies effects:
   - modifyPlayer → adjust player physics
   - modifyPipe → adjust pipe position/speed
   - addCollider → add to collision check list
```

## Trap Type Detailed Logic

### Type 1: Invisible Obstacle (INVISIBLE)

**Activation**: Always active (collision zone exists from spawn)
**Behavior**: An additional collision rectangle exists within or adjacent to the gap that is not rendered until activated (player dies or passes close enough).
**Parameters**:
- `blockX: number` — x-offset within pipe width
- `blockY: number` — y-position of hidden block (within gap area)
- `blockWidth: number` — width of hidden block
- `blockHeight: number` — height of hidden block
**Effect**: Returns `addCollider` with the hidden block rectangle
**Visual**: Block becomes visible (rendered as red rectangle) after activation

### Type 2: Moving Pipe (MOVING)

**Activation**: Immediately on spawn (pipe starts moving right away)
**Behavior**: The pipe's gapY oscillates or shifts linearly over time, changing the safe passage location.
**Parameters**:
- `moveSpeed: number` — pixels/sec of gap movement
- `moveDirection: 'up'|'down'|'oscillate'` — movement pattern
- `moveRange: number` — maximum pixels to move from original position
**Effect**: Returns `modifyPipe` with updated `gapY` each frame
**Visual**: Pipe visibly moves (inherently visible once activated)

### Type 3: Fake Safe Gap (FAKE_GAP)

**Activation**: Always active (kill zone exists from spawn)
**Behavior**: The visible gap contains a hidden kill zone, leaving only a smaller sub-gap that is actually safe. The kill zone is an invisible collision rectangle within the gap.
**Parameters**:
- `killZoneY: number` — y-position of kill zone within gap
- `killZoneHeight: number` — height of kill zone (gap - safeSubGap)
- `safeSubGapSize: number` — actual safe passage size (smaller than visible gap)
**Effect**: Returns `addCollider` with the kill zone rectangle
**Visual**: Kill zone becomes visible (rendered as semi-transparent red) after activation

### Type 4: Gravity Flip Zone (GRAVITY)

**Activation**: When player's x-position is within the pipe's x-range (proximity-based)
**Behavior**: Temporarily modifies gravity for the player. Can reverse gravity (negative multiplier) or intensify it (multiplier > 1).
**Parameters**:
- `gravityMultiplier: number` — multiplier applied to CONFIG.GRAVITY (e.g., -1 for flip, 2 for double)
- `duration: number` — seconds the effect lasts (1-2 seconds per requirements)
**Effect**: Returns `modifyPlayer` with `{ gravityMultiplier, remainingDuration }`
**Visual**: Screen tint or player color shift while gravity is modified (subtle, appears after first activation)

### Type 5: Speed Trap (SPEED)

**Activation**: Immediately on spawn (pipe moves faster from the start)
**Behavior**: The pipe moves at an accelerated speed toward the player, reducing reaction time.
**Parameters**:
- `speedMultiplier: number` — multiplier applied to CONFIG.PIPE_SPEED for this pipe (e.g., 2.5x)
**Effect**: Returns `modifyPipe` with updated speed for this specific pipe
**Visual**: Pipe visibly moves faster (inherently visible)

## Deterministic Sequence Design

The trap sequence is a hardcoded array of 10 TrapDefinitions. Example default sequence:

```
Index 0: SPEED       (speedMultiplier: 2.5)
Index 1: NONE        (safe pipe)
Index 2: INVISIBLE   (block in upper portion of gap)
Index 3: MOVING      (gap moves down, 40px range)
Index 4: NONE        (safe pipe)
Index 5: FAKE_GAP    (kill zone in lower half, safe sub-gap: 60px)
Index 6: GRAVITY     (gravityMultiplier: -0.5, duration: 1.5s)
Index 7: SPEED       (speedMultiplier: 3.0)
Index 8: INVISIBLE   (block in lower portion of gap)
Index 9: MOVING      (gap oscillates, 30px range)
```

After pipe 9, the sequence repeats from index 0.

## Integration with Existing Components

### GameEngine Changes
- Import and instantiate TrapManager
- In `update()`: call `trapManager.update(dt, pipes, player)` after pipe update
- Apply TrapEffects before collision detection
- Pass additional colliders to collision check
- On game over: mark active traps as `activated` for visual feedback
- On reset: call `trapManager.reset()`

### PipeManager Changes
- Each pipe object gains optional `trap: TrapDefinition` field
- On `_spawnPipe()`: request next trap from TrapManager and attach to pipe
- Pipe rendering checks `trap.activated` to show trap visuals

### Player Changes
- Support temporary gravity multiplier (applied in `update()`)
- Track active gravity effect with remaining duration

### CollisionDetector Changes
- `checkPipeCollision()` accepts optional `additionalColliders` array
- Additional colliders checked with same AABB logic
