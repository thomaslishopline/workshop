# Business Rules: Cat Mario Trap System

## Core Rules

### BR-1: Deterministic Sequencing
The trap sequence MUST produce identical results across playthroughs. Given the same pipe spawn index, the same trap type and parameters MUST be returned. No randomness in trap assignment or behavior.

### BR-2: Sequence Length and Looping
The trap sequence is exactly 10 entries. After the 10th pipe, the sequence wraps to index 0. Formula: `trapIndex = pipeSpawnCount % 10`

### BR-3: Immediate Activation
Traps are present from the very first pipe (index 0). There is no grace period or introductory safe zone.

### BR-4: No Visual Warnings
No trap SHALL display any visual indicator before activation. The player must encounter the trap blind on their first attempt.

### BR-5: Post-Activation Visibility
After a trap activates (player dies to it OR passes through its zone), the trap becomes visually marked for the remainder of that run. On game restart, all traps reset to invisible.

### BR-6: Survivability
Every trap MUST have a learnable solution:
- **INVISIBLE**: The safe path exists around the hidden block
- **MOVING**: The movement pattern is predictable (constant speed/direction)
- **FAKE_GAP**: The safe sub-gap is large enough to pass through (minimum 50px)
- **GRAVITY**: The effect is survivable with correct flap timing
- **SPEED**: The pipe is passable with faster reaction (gap size unchanged)

### BR-7: Scoring Unchanged
Traps do not affect scoring logic. Score increments when player passes a pipe's midpoint, regardless of whether the pipe has a trap.

### BR-8: Single Trap Per Pipe
Each pipe has at most one trap. No pipe can have multiple simultaneous trap effects.

### BR-9: Trap Independence
Each trap operates independently. One trap's activation does not affect another trap's behavior. Exception: gravity effects from a GRAVITY trap persist across subsequent pipes until duration expires.

### BR-10: Gravity Effect Duration
Gravity modification lasts exactly the configured duration (1-2 seconds), regardless of pipe positions. The effect is time-based, not position-based.

## Constraint Rules

### CR-1: Safe Sub-Gap Minimum
For FAKE_GAP traps, the safe sub-gap MUST be at least 50px (player height + margin). This ensures the trap is physically possible to survive.

### CR-2: Movement Range Bounds
For MOVING traps, the gap MUST remain within canvas bounds after movement:
- `gapY + moveRange <= canvasHeight - GAP_MAX_Y_OFFSET`
- `gapY - moveRange >= GAP_MIN_Y`

### CR-3: Speed Multiplier Bounds
SPEED trap multiplier MUST be between 1.5 and 4.0. Below 1.5 is barely noticeable; above 4.0 is physically impossible to react to.

### CR-4: Gravity Multiplier Bounds
GRAVITY trap multiplier MUST be between -1.0 and 3.0. Values outside this range make the game uncontrollable.

### CR-5: Invisible Block Size
Hidden blocks MUST be at least 20px x 20px (visible enough to learn from) and at most 60px x 40px (leaves room for safe passage).

### CR-6: Frame Budget
All trap calculations for a single frame MUST complete within 2ms to maintain 60fps. Trap logic is O(n) where n = active pipes on screen (typically 2-3).

## Validation Rules

### VR-1: Sequence Validation
On TrapManager initialization, validate that:
- Sequence length is exactly 10
- Each entry has a valid TrapType
- Each entry's params satisfy the constraint rules above
- At least 2 entries are NONE (safe pipes) to prevent impossible sequences

### VR-2: Pipe Trap Assignment
When assigning a trap to a pipe:
- Verify the trap's spatial parameters are compatible with the pipe's gapY
- For FAKE_GAP: verify safe sub-gap fits within the pipe's gap
- For INVISIBLE: verify hidden block is within or adjacent to the gap area
- For MOVING: verify movement range stays within canvas bounds given the pipe's initial gapY

### VR-3: Effect Application
When applying TrapEffects:
- Verify gravity multiplier is within bounds before applying
- Verify modified gapY stays within canvas bounds
- Verify additional colliders have positive width and height
