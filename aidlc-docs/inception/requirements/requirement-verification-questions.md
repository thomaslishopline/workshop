# Requirements Clarification Questions

Your request is to add "Cat Mario flavor" to Flappy Usagi — making the game surprising and challenging with deceptive/trolling mechanics. Please answer the following questions to help clarify the requirements.

## Question 1
What types of surprise/troll mechanics would you like? (Cat Mario is known for invisible blocks, fake paths, sudden deaths, and objects that behave opposite to expectations)

A) Invisible/hidden obstacles that appear suddenly when the player approaches

B) Pipes that move unexpectedly (shift position, close gaps, or reverse direction)

C) Fake safe paths that actually kill the player (e.g., a coin/collectible that triggers death)

D) All of the above — full Cat Mario chaos with multiple surprise types

E) Other (please describe after [Answer]: tag below)

[Answer]: D

## Question 2
How should difficulty progression work with the surprise mechanics?

A) Surprises from the very first pipe — immediately trolling (pure Cat Mario style)

B) Start normal for 3-5 pipes, then introduce surprises gradually

C) Randomized — surprises can happen at any time with increasing probability

D) Level-based — specific surprise patterns that repeat so players can memorize them

E) Other (please describe after [Answer]: tag below)

[Answer]: A

## Question 3
Should the game give any visual hints or warnings before a surprise, or should they be completely unexpected?

A) No hints at all — pure surprise/trolling (authentic Cat Mario experience)

B) Subtle visual cues that experienced players might notice (slight color difference, tiny animation)

C) Brief warning indicator (like a "!" symbol) a split second before the surprise

D) Other (please describe after [Answer]: tag below)

[Answer]: A

## Question 4
What should happen to scoring when surprise mechanics are involved?

A) Keep the same scoring — just passing pipes counts (surprises make it harder to survive)

B) Bonus points for surviving surprise events

C) Separate "death counter" displayed alongside score (Cat Mario style — celebrating deaths)

D) Other (please describe after [Answer]: tag below)

[Answer]: A

## Question 5
Should the surprise events be deterministic (same every playthrough) or randomized?

A) Deterministic — same surprises at same pipe positions every time (players can memorize and improve)

B) Semi-random — surprise types are random but occur at fixed intervals (e.g., every 3rd pipe has a surprise)

C) Fully random — any pipe could have any surprise at any time

D) Seeded random — random but with a daily/session seed so players can compare runs

E) Other (please describe after [Answer]: tag below)

[Answer]: A

## Question 6
How many types of surprise/trap mechanics should be implemented in this first version?

A) 2-3 core mechanics (focused, polished)

B) 4-5 mechanics (good variety)

C) 6+ mechanics (maximum chaos)

D) Other (please describe after [Answer]: tag below)

[Answer]: B

## Question: Security Extensions
Should security extension rules be enforced for this project?

A) Yes — enforce all SECURITY rules as blocking constraints (recommended for production-grade applications)

B) No — skip all SECURITY rules (suitable for PoCs, prototypes, and experimental projects)

X) Other (please describe after [Answer]: tag below)

[Answer]: B

## Question: Property-Based Testing Extension
Should property-based testing (PBT) rules be enforced for this project?

A) Yes — enforce all PBT rules as blocking constraints (recommended for projects with business logic, data transformations, serialization, or stateful components)

B) Partial — enforce PBT rules only for pure functions and serialization round-trips (suitable for projects with limited algorithmic complexity)

C) No — skip all PBT rules (suitable for simple CRUD applications, UI-only projects, or thin integration layers with no significant business logic)

X) Other (please describe after [Answer]: tag below)

[Answer]: A
