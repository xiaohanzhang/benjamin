/**
 * Type definitions for the Making 10 game.
 */

export interface Plank { id: number; len: number; x: number; y: number }

export interface Fx { id: number; text: string; x: number; y: number; t0: number; ok: boolean }

export interface ShotAnim {
  id: number
  shotLen: number; shotColor: string
  targetLen: number; targetColor: string
  col: number; charCol: number
  phase: 'rising' | 'flying' | 'wrong_flash' | 'falling' | 'done'
  phaseStart: number; targetY: number; stackIdx: number
  hit: boolean
}

export interface Game {
  planks: Plank[]; fx: Fx[]; shots: ShotAnim[]
  stack: string[]
  charX: number; score: number; hp: number
  nid: number; lastSpawn: number; alive: boolean
  hurtUntil: number
  level: number; levelUpUntil: number
  buildingLevel: number; buildingUntil: number
  startedAt: number
}

/** Signals returned by tick() so the component knows which React setters to call. */
export interface TickResult {
  scoreChanged: boolean
  hpChanged: boolean
  levelChanged: boolean
  buildingChanged: boolean
  gameOver: boolean
  targetW: number | null
}
