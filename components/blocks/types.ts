/**
 * Type definitions for the Making 10 game.
 */

import type { Fx, BaseGame, BaseTickResult } from '@/lib/game/types'

export type { Fx } from '@/lib/game/types'

export interface Plank { id: number; len: number; x: number; y: number }

export interface ShotAnim {
  id: number
  shotLen: number; shotColor: string
  targetLen: number; targetColor: string
  col: number; charCol: number
  phase: 'rising' | 'flying' | 'wrong_flash' | 'falling' | 'done'
  phaseStart: number; targetY: number; stackIdx: number
  hit: boolean
}

export interface Game extends BaseGame {
  planks: Plank[]; shots: ShotAnim[]
  stack: string[]
  charX: number
  buildingLevel: number; buildingUntil: number
}

/** Signals returned by tick() so the component knows which React setters to call. */
export interface TickResult extends BaseTickResult {
  buildingChanged: boolean
  targetW: number | null
}
