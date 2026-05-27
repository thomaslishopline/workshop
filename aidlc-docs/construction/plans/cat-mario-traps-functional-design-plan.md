# Functional Design Plan: Cat Mario Traps

## Plan Steps

- [x] 1. Define TrapManager component — deterministic trap sequencer
- [x] 2. Define trap type interface — common contract for all trap implementations
- [x] 3. Design Trap Type 1: Invisible Obstacles — hidden collision zones that appear on proximity
- [x] 4. Design Trap Type 2: Moving Pipes — pipes that shift gap position after spawning
- [x] 5. Design Trap Type 3: Fake Safe Gaps — gaps with hidden kill zones inside
- [x] 6. Design Trap Type 4: Gravity Flip Zones — temporary gravity reversal/intensification
- [x] 7. Design Trap Type 5: Speed Traps — pipes that accelerate toward player
- [x] 8. Define deterministic trap sequence data structure
- [x] 9. Define integration points with existing components (GameEngine, PipeManager, Player)
- [x] 10. Identify PBT testable properties (PBT-01 compliance)
- [x] 11. Define business rules and constraints

## Clarification Questions

The requirements are clear and well-defined from the earlier analysis. Based on the deterministic Cat Mario design philosophy, I have a few targeted questions to finalize the functional design:

## Question 1
For the deterministic trap sequence, how long should the repeating pattern be before it loops?

A) 10 pipes (short loop — players memorize quickly, high replayability)

B) 20 pipes (medium loop — good balance of challenge and memorization)

C) 30+ pipes (long loop — extended challenge before pattern repeats)

D) Other (please describe after [Answer]: tag below)

[Answer]: A

## Question 2
For Moving Pipes (trap type 2), when should the pipe start moving?

A) Immediately when it spawns on screen (player sees it moving from the right edge)

B) When the pipe reaches the middle of the screen (sudden movement when player is committed)

C) When the player is within a fixed distance of the pipe (proximity-triggered, maximum surprise)

D) Other (please describe after [Answer]: tag below)

[Answer]: A

## Question 3
For Gravity Flip Zones (trap type 4), how long should the gravity effect last?

A) Very brief (0.3-0.5 seconds) — a quick jolt that disrupts timing

B) Medium duration (1-2 seconds) — forces player to adapt mid-flight

C) Until the player passes the pipe — tied to the trap pipe's position

D) Other (please describe after [Answer]: tag below)

[Answer]: B

## Question 4
Should traps be visually distinct AFTER they activate (so the player learns for next run), or should they remain invisible even after triggering?

A) Traps become visible after activation (player sees what killed them, learns for next attempt)

B) Traps remain invisible always (pure memorization from death positions)

C) Other (please describe after [Answer]: tag below)

[Answer]: A
