# Requirements: Cat Mario Flavor for Flappy Usagi

## Intent Analysis

- **User Request**: Add Cat Mario flavor to Flappy Usagi, making the game surprising and challenging
- **Request Type**: Enhancement — adding new gameplay mechanics to existing game
- **Scope Estimate**: Multiple Components — affects PipeManager, GameEngine, CollisionDetector, and new TrapManager component
- **Complexity Estimate**: Moderate — new game mechanics with deterministic sequencing, multiple trap types, and integration with existing systems

## Functional Requirements

### FR-1: Trap System Core
The game SHALL implement a trap/surprise system that introduces deceptive and unexpected mechanics inspired by Cat Mario. Traps activate without any visual hints or warnings — the player experiences pure surprise.

### FR-2: Trap Types (4-5 mechanics)
The game SHALL implement the following surprise mechanics:

#### FR-2.1: Invisible Obstacles
Hidden obstacles that become visible only when the player is within a close proximity threshold. These appear as additional pipe segments or blocks in unexpected positions within or near the gap.

#### FR-2.2: Moving Pipes
Pipes that shift position after spawning. A pipe may close its gap (top and bottom move toward each other), shift the gap vertically, or reverse scroll direction briefly.

#### FR-2.3: Fake Safe Gaps
Gaps that appear safe but contain a hidden kill zone. The gap visually looks passable but has an invisible collision area within it, forcing the player to find the actual safe path (e.g., a smaller sub-gap within the visible gap).

#### FR-2.4: Gravity Flip Zones
Specific pipe positions where gravity temporarily reverses or intensifies, causing the player to overshoot or undershoot the gap unexpectedly.

#### FR-2.5: Speed Traps
Pipes that suddenly accelerate toward the player, reducing reaction time dramatically.

### FR-3: Deterministic Trap Sequencing
All trap events SHALL be deterministic — the same traps occur at the same pipe positions every playthrough. This allows players to memorize patterns and improve through repetition (core Cat Mario design philosophy).

### FR-4: Immediate Difficulty
Traps SHALL be present from the very first pipe onward. There is no "safe" introductory period.

### FR-5: No Visual Warnings
The game SHALL NOT provide any visual hints, warnings, or indicators before a trap activates. The surprise must be complete.

### FR-6: Scoring Unchanged
The scoring system SHALL remain unchanged — score increments when passing pipes. Traps simply make survival harder. No bonus points or separate death counters.

### FR-7: Trap Sequence Configuration
The trap sequence (which pipe gets which trap) SHALL be defined as a repeating pattern/configuration, making it easy to design and modify trap layouts.

## Non-Functional Requirements

### NFR-1: Performance
Trap mechanics SHALL not degrade frame rate below 60fps on modern browsers. All trap calculations must complete within the existing deltaTime frame budget.

### NFR-2: Testability
All trap mechanics SHALL be implemented as pure, deterministic functions where possible, enabling comprehensive property-based testing. The trap sequencer must be testable independently of rendering.

### NFR-3: Maintainability
The trap system SHALL be modular — new trap types can be added without modifying existing trap implementations. Each trap type SHALL be a self-contained unit.

### NFR-4: Compatibility
Trap mechanics SHALL work with the existing component architecture (GameEngine, PipeManager, Player, CollisionDetector) without breaking existing interfaces.

### NFR-5: Fairness
Despite being deliberately unfair in the Cat Mario tradition, each trap SHALL have a learnable solution. No trap shall be literally impossible to survive once the player knows it exists.

## Technical Constraints

- Must integrate with existing ES module architecture
- Must use existing vitest + fast-check testing infrastructure
- Must maintain deltaTime-based physics (frame-rate independent)
- Deterministic behavior requires no use of Math.random() in trap sequencing (only in initial pipe gap positioning which is separate)
- Property-based testing (PBT) rules are fully enforced per extension configuration

## Out of Scope

- Sound effects or audio feedback
- Visual particle effects for trap activation
- Persistent storage of trap progress
- Multiplayer or leaderboard features
- Mobile-specific UI changes
