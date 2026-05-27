# Requirements Document

## Introduction

A browser-based Flappy Bird clone game featuring a custom rabbit character (usagi). The player controls the rabbit character, making it flap to navigate through gaps between pipes. The game runs in a web browser using HTML5 Canvas and JavaScript, requiring no server-side components.

## Glossary

- **Game_Engine**: The core game loop and rendering system built on HTML5 Canvas
- **Player_Character**: The rabbit sprite rendered from the `usagi.webp` image file that the player controls
- **Pipe**: Vertical obstacles that appear in pairs (top and bottom) with a gap between them
- **Gap**: The vertical space between a top pipe and bottom pipe that the Player_Character must pass through
- **Score_Counter**: The system that tracks and displays the number of pipes successfully passed
- **Collision_Detector**: The system that determines when the Player_Character contacts a Pipe or boundary
- **Game_State_Manager**: The system that manages transitions between game states (ready, playing, game over)
- **Gravity**: The constant downward acceleration applied to the Player_Character
- **Flap**: The upward velocity impulse applied to the Player_Character when the player provides input

## Requirements

### Requirement 1: Game Initialization

**User Story:** As a player, I want the game to load and display a start screen, so that I know the game is ready to play.

#### Acceptance Criteria

1. WHEN the web page loads, THE Game_Engine SHALL render the game canvas at a fixed resolution suitable for gameplay
2. WHEN the game initializes, THE Game_Engine SHALL load the Player_Character sprite from the `usagi.webp` file
3. WHEN the game is in the ready state, THE Game_State_Manager SHALL display the Player_Character at a centered vertical position with a visual prompt to start playing
4. THE Game_Engine SHALL render a scrolling background to provide visual motion feedback

### Requirement 2: Player Character Control

**User Story:** As a player, I want to control the rabbit character by pressing a key or clicking, so that I can navigate through obstacles.

#### Acceptance Criteria

1. WHEN the player presses the spacebar or clicks the mouse or taps the screen, THE Game_Engine SHALL apply a Flap impulse to the Player_Character
2. WHILE the game is in the playing state, THE Game_Engine SHALL apply Gravity to the Player_Character on every frame
3. WHEN a Flap impulse is applied, THE Player_Character SHALL move upward with a fixed velocity that counteracts Gravity
4. WHILE the game is in the playing state, THE Game_Engine SHALL rotate the Player_Character sprite to visually indicate the direction of movement

### Requirement 3: Pipe Generation and Movement

**User Story:** As a player, I want pipes to appear at regular intervals with random gap positions, so that the game presents a continuous challenge.

#### Acceptance Criteria

1. WHILE the game is in the playing state, THE Game_Engine SHALL generate new Pipe pairs at regular horizontal intervals
2. WHEN a new Pipe pair is generated, THE Game_Engine SHALL position the Gap at a random vertical location within playable bounds
3. WHILE the game is in the playing state, THE Game_Engine SHALL move all Pipes from right to left at a constant speed
4. WHEN a Pipe moves entirely off the left edge of the canvas, THE Game_Engine SHALL remove that Pipe from memory
5. THE Game_Engine SHALL maintain a consistent Gap size between top and bottom Pipes within each pair

### Requirement 4: Collision Detection

**User Story:** As a player, I want the game to accurately detect when my character hits an obstacle, so that the game is fair and predictable.

#### Acceptance Criteria

1. WHILE the game is in the playing state, THE Collision_Detector SHALL check for overlap between the Player_Character hitbox and all visible Pipe hitboxes on every frame
2. WHEN the Player_Character overlaps with any Pipe, THE Collision_Detector SHALL trigger a game over event
3. WHEN the Player_Character moves above the top boundary of the canvas, THE Collision_Detector SHALL trigger a game over event
4. WHEN the Player_Character moves below the bottom boundary of the canvas, THE Collision_Detector SHALL trigger a game over event

### Requirement 5: Scoring

**User Story:** As a player, I want to see my score increase as I pass through pipes, so that I can track my progress.

#### Acceptance Criteria

1. WHEN the Player_Character passes the horizontal midpoint of a Pipe pair, THE Score_Counter SHALL increment the score by one
2. WHILE the game is in the playing state, THE Score_Counter SHALL display the current score on the canvas
3. THE Score_Counter SHALL display the score in a clearly visible font size and position that does not obstruct gameplay

### Requirement 6: Game Over State

**User Story:** As a player, I want to see my final score and be able to restart the game after a game over, so that I can try again.

#### Acceptance Criteria

1. WHEN a game over event is triggered, THE Game_State_Manager SHALL transition the game to the game over state
2. WHEN the game enters the game over state, THE Game_State_Manager SHALL display the final score
3. WHEN the game enters the game over state, THE Game_State_Manager SHALL display the highest score achieved in the current session
4. WHEN the game is in the game over state and the player provides input, THE Game_State_Manager SHALL reset the game to the ready state
5. WHILE the game is in the game over state, THE Game_Engine SHALL stop Pipe generation and movement

### Requirement 7: Game Performance

**User Story:** As a player, I want the game to run smoothly, so that the gameplay experience is enjoyable.

#### Acceptance Criteria

1. THE Game_Engine SHALL render frames using requestAnimationFrame for smooth animation
2. THE Game_Engine SHALL maintain frame-rate-independent physics using delta time calculations
3. THE Game_Engine SHALL scale the canvas appropriately to fit the browser viewport while maintaining aspect ratio
