/**
 * Shared type definitions for arcade-style games (Making 10, Number Cannon, etc.).
 */

export interface Fx {
  id: number
  text: string
  x: number
  y: number
  t0: number
  ok: boolean
}

export interface BaseGame {
  fx: Fx[]
  score: number
  hp: number
  nid: number
  lastSpawn: number
  alive: boolean
  hurtUntil: number
  startedAt: number
  level: number
  levelUpUntil: number
}

export interface BaseTickResult {
  scoreChanged: boolean
  hpChanged: boolean
  levelChanged: boolean
  gameOver: boolean
}
