/**
 * Type definitions for the Number Cannon game.
 */

export interface Bar {
  id: number
  total: number     // sum value (4-10)
  partA: number     // first addend (0 = single-segment remainder)
  partB: number     // second addend (0 = single-segment remainder)
  x: number         // column
  y: number         // top edge in pixels
}

export interface Fx { id: number; text: string; x: number; y: number; t0: number; ok: boolean }

export interface Shot {
  id: number
  num: number       // number fired
  col: number       // target column
  charCol: number   // cannon column at time of firing
  phase: 'rising' | 'hit' | 'miss' | 'done'
  phaseStart: number
  targetY: number
  targetBar: Bar    // snapshot of the bar at time of firing
  exact: boolean    // whether num === bar.total
}

export interface Game {
  bars: Bar[]; fx: Fx[]; shots: Shot[]
  cannonX: number; score: number; hp: number
  nid: number; lastSpawn: number; alive: boolean
  hurtUntil: number; startedAt: number
}

/** Signals returned by tick() so the component knows which React setters to call. */
export interface TickResult {
  scoreChanged: boolean
  hpChanged: boolean
  gameOver: boolean
  targetBar: Bar | null
}
