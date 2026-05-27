# Requirements Document

## Introduction

This feature adds a difficulty mode selection (Hard/Easy) and makes pipe positions deterministic across rounds. The game is currently too difficult for most players because pipe gap positions are randomized each round, making memorization impossible. By introducing an Easy mode with larger gaps and making all pipe layouts repeatable, players can learn patterns and improve through practice — a core mechanic of Cat Mario-style games.

## Glossary

- **Game**: The browser-based Flappy Bird clone with Cat Mario-style traps, rendered on an HTML5 Canvas
- **Difficulty_Mode**: A player-selectable setting (Hard or Easy) that controls gap size and trap behavior
- **Pipe_Pair**: A top and bottom pipe with a vertical gap between them that the player must fly through
- **Gap_Size**: The vertical distance in pixels between the top pipe's bottom edge and the bottom pipe's top edge
- **Gap_Position**: The vertical center coordinate (Y) of the gap between a Pipe_Pair
- **Seeded_PRNG**: A pseudorandom number generator initialized with a fixed seed that produces the same sequence of numbers on every invocation with that seed
- **PipeManager**: The component responsible for spawning, positioning, and rendering Pipe_Pairs
- **TrapManager**: The component responsible for assigning deterministic trap sequences to pipes
- **Ready_Screen**: The screen displayed when the Game is in the READY state, before gameplay begins
- **Round**: A single playthrough from the READY state through PLAYING to GAME_OVER

## Requirements

### Requirement 1: Difficulty Mode Selection

**User Story:** As a player, I want to select between Hard and Easy difficulty modes before starting a round, so that I can choose a challenge level appropriate to my skill.

#### Acceptance Criteria

1. WHILE the Game is in the READY state, THE Ready_Screen SHALL display a Difficulty_Mode selector with two options: Hard and Easy
2. WHEN the player selects a Difficulty_Mode, THE Game SHALL store the selected mode and apply it to the subsequent Round
3. THE Game SHALL default the Difficulty_Mode to Easy when no prior selection has been made
4. WHILE the Game is in the GAME_OVER state, THE Game SHALL retain the previously selected Difficulty_Mode for the next Round
5. WHEN the player returns to the READY state after GAME_OVER, THE Ready_Screen SHALL display the Difficulty_Mode selector with the previously selected mode highlighted

### Requirement 2: Easy Mode Gap Size

**User Story:** As a casual player, I want the gap between pipes to be larger in Easy mode, so that I have more room to fly through and can survive longer.

#### Acceptance Criteria

1. WHILE the Difficulty_Mode is set to Easy, THE PipeManager SHALL use a Gap_Size of 200 pixels when spawning each Pipe_Pair
2. WHILE the Difficulty_Mode is set to Hard, THE PipeManager SHALL use a Gap_Size of 140 pixels when spawning each Pipe_Pair
3. WHEN the Difficulty_Mode changes between Rounds, THE PipeManager SHALL apply the new Gap_Size starting from the next Round

### Requirement 3: Deterministic Pipe Positions

**User Story:** As a player, I want pipe positions to be identical every round, so that I can memorize the layout and improve through repetition.

#### Acceptance Criteria

1. THE PipeManager SHALL use a Seeded_PRNG with a fixed seed to generate Gap_Positions for all Pipe_Pairs
2. WHEN the Game resets for a new Round, THE PipeManager SHALL reset the Seeded_PRNG to its initial seed state
3. FOR ALL Rounds with the same Difficulty_Mode, THE PipeManager SHALL produce identical Gap_Position sequences (round-trip property: reset then generate N positions yields the same N values every time)
4. THE Seeded_PRNG SHALL produce Gap_Positions within the valid range defined by GAP_MIN_Y and CANVAS_HEIGHT minus GAP_MAX_Y_OFFSET

### Requirement 4: Deterministic Trap Behavior Preservation

**User Story:** As a player, I want traps to appear in the same order every round, so that I can learn and anticipate them alongside the pipe layout.

#### Acceptance Criteria

1. WHEN the Game resets for a new Round, THE TrapManager SHALL reset its sequence index to zero
2. THE TrapManager SHALL assign traps from the fixed DEFAULT_SEQUENCE in order, repeating the sequence after every 10 pipes
3. THE combination of deterministic Gap_Positions and deterministic trap assignment SHALL produce an identical gameplay experience for every Round with the same Difficulty_Mode

### Requirement 5: Hard Mode Retains Current Behavior

**User Story:** As an experienced player, I want Hard mode to preserve the original game difficulty, so that the challenge remains unchanged for skilled players.

#### Acceptance Criteria

1. WHILE the Difficulty_Mode is set to Hard, THE PipeManager SHALL use a Gap_Size of 140 pixels
2. WHILE the Difficulty_Mode is set to Hard, THE TrapManager SHALL apply all trap types from the DEFAULT_SEQUENCE without modification
3. WHILE the Difficulty_Mode is set to Hard, THE PipeManager SHALL use the same Seeded_PRNG and fixed seed as Easy mode to generate Gap_Positions

### Requirement 6: Seeded PRNG Implementation

**User Story:** As a developer, I want a reliable seeded PRNG module, so that deterministic pipe generation is testable and produces uniform distribution.

#### Acceptance Criteria

1. THE Seeded_PRNG SHALL accept a numeric seed value and produce a deterministic sequence of floating-point numbers between 0 (inclusive) and 1 (exclusive)
2. THE Seeded_PRNG SHALL implement a well-known algorithm (such as mulberry32 or xoshiro128) to ensure uniform distribution
3. WHEN the Seeded_PRNG is reset with the same seed, THE Seeded_PRNG SHALL produce the identical sequence of numbers (round-trip property: seed → generate N values → reset → generate N values yields identical results)
4. THE Seeded_PRNG SHALL be a pure function of its internal state with no dependency on external randomness sources such as Math.random()
5. FOR ALL valid seed values, THE Seeded_PRNG SHALL produce values that, when scaled to the Gap_Position range, cover the full range between GAP_MIN_Y and CANVAS_HEIGHT minus GAP_MAX_Y_OFFSET (metamorphic property: distribution coverage)
