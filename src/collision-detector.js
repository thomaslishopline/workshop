/**
 * CollisionDetector - Pure function module for detecting overlaps.
 * Uses AABB (Axis-Aligned Bounding Box) overlap tests.
 */

/**
 * Check if the player hitbox collides with any pipe.
 * For each pipe, calculates top and bottom pipe rectangles and tests AABB overlap.
 *
 * @param {{x: number, y: number, width: number, height: number}} playerHitbox
 * @param {Array<{x: number, gapY: number, gapSize: number, width: number, scored: boolean}>} pipes
 * @param {number} canvasHeight - Height of the canvas (needed to calculate bottom pipe rect)
 * @returns {boolean} true if player overlaps with any pipe rect
 */
export function checkPipeCollision(playerHitbox, pipes, canvasHeight) {
  for (const pipe of pipes) {
    // Top pipe rect: from top of canvas to the top edge of the gap
    const topPipeRect = {
      x: pipe.x,
      y: 0,
      width: pipe.width,
      height: pipe.gapY - pipe.gapSize / 2
    };

    // Bottom pipe rect: from bottom edge of the gap to the bottom of canvas
    const bottomPipeTop = pipe.gapY + pipe.gapSize / 2;
    const bottomPipeRect = {
      x: pipe.x,
      y: bottomPipeTop,
      width: pipe.width,
      height: canvasHeight - bottomPipeTop
    };

    // AABB overlap test against top pipe
    if (aabbOverlap(playerHitbox, topPipeRect)) {
      return true;
    }

    // AABB overlap test against bottom pipe
    if (aabbOverlap(playerHitbox, bottomPipeRect)) {
      return true;
    }
  }

  return false;
}

/**
 * Check if the player hitbox collides with the canvas boundaries.
 *
 * @param {{x: number, y: number, width: number, height: number}} playerHitbox
 * @param {number} canvasHeight
 * @returns {boolean} true if player is out of bounds (above top or below bottom)
 */
export function checkBoundaryCollision(playerHitbox, canvasHeight) {
  return playerHitbox.y < 0 || playerHitbox.y + playerHitbox.height > canvasHeight;
}

/**
 * Check if the player hitbox collides with any additional colliders (trap-generated).
 *
 * @param {{x: number, y: number, width: number, height: number}} playerHitbox
 * @param {Array<{x: number, y: number, width: number, height: number}>} colliders
 * @returns {boolean} true if player overlaps with any collider
 */
export function checkAdditionalColliders(playerHitbox, colliders) {
  for (const collider of colliders) {
    if (aabbOverlap(playerHitbox, collider)) {
      return true;
    }
  }
  return false;
}

/**
 * Standard AABB overlap test.
 * Two rectangles overlap if they share a non-zero area.
 *
 * @param {{x: number, y: number, width: number, height: number}} rect1
 * @param {{x: number, y: number, width: number, height: number}} rect2
 * @returns {boolean}
 */
function aabbOverlap(rect1, rect2) {
  return (
    rect1.x < rect2.x + rect2.width &&
    rect1.x + rect1.width > rect2.x &&
    rect1.y < rect2.y + rect2.height &&
    rect1.y + rect1.height > rect2.y
  );
}
