/**
 * SeededRandom — A deterministic PRNG using the mulberry32 algorithm.
 *
 * Produces a repeatable sequence of floating-point numbers in [0, 1)
 * given a numeric seed. Calling reset() restores the generator to its
 * initial state so the same sequence can be replayed.
 */
export class SeededRandom {
  /**
   * @param {number} seed - A finite numeric seed value.
   * @throws {Error} If seed is NaN or Infinity.
   */
  constructor(seed) {
    if (!Number.isFinite(seed)) {
      throw new Error(`SeededRandom: seed must be a finite number, got ${seed}`);
    }
    this._initialSeed = seed | 0; // coerce to 32-bit integer
    this._state = this._initialSeed;
  }

  /**
   * Returns the next pseudorandom float in [0, 1) and advances internal state.
   * Uses the mulberry32 algorithm: 32-bit state, single multiplication + bit shifts.
   * @returns {number} A float >= 0 and < 1.
   */
  next() {
    this._state |= 0;
    this._state = (this._state + 0x6d2b79f5) | 0;
    let t = Math.imul(this._state ^ (this._state >>> 15), 1 | this._state);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  }

  /**
   * Resets internal state to the initial seed so the sequence replays from the start.
   */
  reset() {
    this._state = this._initialSeed;
  }
}
