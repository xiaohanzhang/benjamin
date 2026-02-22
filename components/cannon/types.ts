/**
 * Type definitions for the Number Cannon game.
 */

import type { BaseGame, BaseTickResult } from '@/lib/game/types'

export type { Fx } from '@/lib/game/types'

export interface Bar {
  id: number
  total: number     // sum value (4-10)
  partA: number     // first addend (0 = single-segment remainder)
  partB: number     // second addend (0 = single-segment remainder)
  x: number         // column
  y: number         // top edge in pixels
}

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

export interface Game extends BaseGame {
  bars: Bar[]; shots: Shot[]
  cannonX: number
}

/** Signals returned by tick() so the component knows which React setters to call. */
export interface TickResult extends BaseTickResult {
  targetBar: Bar | null
}
