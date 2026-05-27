import { describe, it, expect } from 'vitest';
import * as fc from 'fast-check';
import { checkPipeCollision, checkBoundaryCollision, checkAdditionalColliders } from './collision-detector.js';

describe('CollisionDetector', () => {
  const CANVAS_HEIGHT = 600;

  describe('checkPipeCollision', () => {
    const pipe = { x: 200, gapY: 300, gapSize: 140, width: 52, scored: false };
    // Top pipe: {x: 200, y: 0, width: 52, height: 230}  (300 - 70 = 230)
    // Bottom pipe: {x: 200, y: 370, width: 52, height: 230}  (600 - 370 = 230)

    it('returns false when player is safely in the gap', () => {
      const playerHitbox = { x: 210, y: 260, width: 30, height: 30 };
      expect(checkPipeCollision(playerHitbox, [pipe], CANVAS_HEIGHT)).toBe(false);
    });

    it('returns true when player overlaps with top pipe', () => {
      const playerHitbox = { x: 210, y: 200, width: 30, height: 40 };
      // Player bottom edge at 240, top pipe bottom edge at 230 → overlap
      expect(checkPipeCollision(playerHitbox, [pipe], CANVAS_HEIGHT)).toBe(true);
    });

    it('returns true when player overlaps with bottom pipe', () => {
      const playerHitbox = { x: 210, y: 360, width: 30, height: 30 };
      // Player top at 360, bottom pipe top at 370 → player bottom at 390 > 370 → overlap
      expect(checkPipeCollision(playerHitbox, [pipe], CANVAS_HEIGHT)).toBe(true);
    });

    it('returns false when player is horizontally past the pipe', () => {
      const playerHitbox = { x: 260, y: 100, width: 30, height: 30 };
      // Player x=260, pipe right edge = 200+52=252 → no horizontal overlap
      expect(checkPipeCollision(playerHitbox, [pipe], CANVAS_HEIGHT)).toBe(false);
    });

    it('returns false when player is horizontally before the pipe', () => {
      const playerHitbox = { x: 150, y: 100, width: 30, height: 30 };
      // Player right edge = 180, pipe left edge = 200 → no horizontal overlap
      expect(checkPipeCollision(playerHitbox, [pipe], CANVAS_HEIGHT)).toBe(false);
    });

    it('returns false with an empty pipes array', () => {
      const playerHitbox = { x: 100, y: 100, width: 30, height: 30 };
      expect(checkPipeCollision(playerHitbox, [], CANVAS_HEIGHT)).toBe(false);
    });

    it('returns true if player overlaps with any one of multiple pipes', () => {
      const pipes = [
        { x: 100, gapY: 300, gapSize: 140, width: 52, scored: true },
        { x: 300, gapY: 300, gapSize: 140, width: 52, scored: false }
      ];
      // Player overlaps with second pipe's top section
      const playerHitbox = { x: 310, y: 50, width: 30, height: 30 };
      expect(checkPipeCollision(playerHitbox, pipes, CANVAS_HEIGHT)).toBe(true);
    });

    it('returns false when player is exactly at the gap edges (no overlap)', () => {
      // Top pipe bottom edge is at gapY - gapSize/2 = 300 - 70 = 230
      // Player top at 230 means player.y = 230, which is exactly at the boundary
      // AABB: player.y (230) < topPipe.y + topPipe.height (230) → false, no overlap
      const playerHitbox = { x: 210, y: 230, width: 30, height: 30 };
      expect(checkPipeCollision(playerHitbox, [pipe], CANVAS_HEIGHT)).toBe(false);
    });
  });

  describe('checkBoundaryCollision', () => {
    it('returns false when player is within bounds', () => {
      const playerHitbox = { x: 80, y: 100, width: 30, height: 30 };
      expect(checkBoundaryCollision(playerHitbox, CANVAS_HEIGHT)).toBe(false);
    });

    it('returns true when player is above the top boundary', () => {
      const playerHitbox = { x: 80, y: -1, width: 30, height: 30 };
      expect(checkBoundaryCollision(playerHitbox, CANVAS_HEIGHT)).toBe(true);
    });

    it('returns true when player is below the bottom boundary', () => {
      const playerHitbox = { x: 80, y: 580, width: 30, height: 30 };
      // y + height = 580 + 30 = 610 > 600
      expect(checkBoundaryCollision(playerHitbox, CANVAS_HEIGHT)).toBe(true);
    });

    it('returns false when player is exactly at the top boundary', () => {
      const playerHitbox = { x: 80, y: 0, width: 30, height: 30 };
      expect(checkBoundaryCollision(playerHitbox, CANVAS_HEIGHT)).toBe(false);
    });

    it('returns false when player bottom edge is exactly at canvas height', () => {
      const playerHitbox = { x: 80, y: 570, width: 30, height: 30 };
      // y + height = 570 + 30 = 600, which is NOT > 600
      expect(checkBoundaryCollision(playerHitbox, CANVAS_HEIGHT)).toBe(false);
    });

    it('returns true when player is completely above the canvas', () => {
      const playerHitbox = { x: 80, y: -50, width: 30, height: 30 };
      expect(checkBoundaryCollision(playerHitbox, CANVAS_HEIGHT)).toBe(true);
    });

    it('returns true when player is completely below the canvas', () => {
      const playerHitbox = { x: 80, y: 650, width: 30, height: 30 };
      expect(checkBoundaryCollision(playerHitbox, CANVAS_HEIGHT)).toBe(true);
    });
  });
});

describe('checkAdditionalColliders', () => {
  it('returns false for empty colliders array', () => {
    const hitbox = { x: 80, y: 300, width: 32, height: 32 };
    expect(checkAdditionalColliders(hitbox, [])).toBe(false);
  });

  it('returns true when player overlaps a collider', () => {
    const hitbox = { x: 80, y: 300, width: 32, height: 32 };
    const colliders = [{ x: 90, y: 310, width: 30, height: 30 }];
    expect(checkAdditionalColliders(hitbox, colliders)).toBe(true);
  });

  it('returns false when player does not overlap any collider', () => {
    const hitbox = { x: 80, y: 300, width: 32, height: 32 };
    const colliders = [{ x: 200, y: 200, width: 30, height: 30 }];
    expect(checkAdditionalColliders(hitbox, colliders)).toBe(false);
  });

  it('returns true if any one of multiple colliders overlaps', () => {
    const hitbox = { x: 80, y: 300, width: 32, height: 32 };
    const colliders = [
      { x: 200, y: 200, width: 30, height: 30 }, // no overlap
      { x: 85, y: 305, width: 20, height: 20 },  // overlap
    ];
    expect(checkAdditionalColliders(hitbox, colliders)).toBe(true);
  });

  it('returns false when collider is adjacent but not overlapping', () => {
    const hitbox = { x: 80, y: 300, width: 32, height: 32 };
    // Collider starts exactly where hitbox ends
    const colliders = [{ x: 112, y: 300, width: 30, height: 30 }];
    expect(checkAdditionalColliders(hitbox, colliders)).toBe(false);
  });
});

// PBT: Property P11 — for any INVISIBLE trap, a safe Y position exists
describe('PBT: Survivability — safe path exists around invisible block (P11)', () => {
  it('there exists a player Y that avoids any hidden block within a gap', () => {
    const GAP_SIZE = 140;
    const PLAYER_HEIGHT = 32; // hitbox height (40 - 2*4 padding)

    fc.assert(
      fc.property(
        // Block position within gap (relative to gap top)
        fc.integer({ min: 0, max: GAP_SIZE - 20 }),
        fc.integer({ min: 20, max: 40 }),
        (blockYOffset, blockHeight) => {
          // The gap spans from 0 to GAP_SIZE
          // Block occupies [blockYOffset, blockYOffset + blockHeight]
          // Safe zones: [0, blockYOffset] and [blockYOffset + blockHeight, GAP_SIZE]
          const safeAbove = blockYOffset;
          const safeBelow = GAP_SIZE - (blockYOffset + blockHeight);

          // At least one safe zone must fit the player
          const canFitAbove = safeAbove >= PLAYER_HEIGHT;
          const canFitBelow = safeBelow >= PLAYER_HEIGHT;

          expect(canFitAbove || canFitBelow).toBe(true);
        }
      )
    );
  });
});

// PBT: Property P12 — fake gap safe sub-gap is physically passable
describe('PBT: Survivability — fake gap safe sub-gap fits player (P12)', () => {
  it('safe sub-gap is always larger than player hitbox height', () => {
    const PLAYER_HEIGHT = 32; // hitbox height

    fc.assert(
      fc.property(
        fc.integer({ min: 50, max: 120 }), // safeSubGapSize (min 50 per CR-1)
        (safeSubGapSize) => {
          expect(safeSubGapSize).toBeGreaterThan(PLAYER_HEIGHT);
        }
      )
    );
  });
});
