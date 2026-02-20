/**
 * Game logic for Number Cannon.
 *
 * Pure game-state functions. Mutates the Game object in-place and returns
 * a TickResult so the React component knows which state setters to call.
 */

import type { Game, Bar, Shot, TickResult } from './types'
import {
  START_GRID_W, MAX_GRID_W, GRID_H, INITIAL_HP, BASE_SPEED, SPEED_PER_POINT,
  BASE_SPAWN_MS, MIN_SPAWN_MS, SPAWN_DEC, POINTS_PER_LEVEL, LEVEL_UP_MS,
  CANNON_FILES, COLORS,
} from './constants'

/** Grid columns for a given level: starts at 2, +2 per level, capped at MAX_GRID_W. */
export function gridWidth(level: number): number {
  return Math.min(MAX_GRID_W, START_GRID_W + (level - 1) * 2)
}

/** Cannon sprite tier (0-7) for a given level. Evolves every 2 levels. */
export function cannonTier(level: number): number {
  return Math.min(CANNON_FILES.length - 1, Math.floor((level - 1) / 2))
}

/** Visual height in cells: two-column bars use max(partA,partB); remainder bars use total. */
export function barHeight(b: Bar): number {
  if (b.partA > 0 && b.partB > 0) return Math.max(b.partA, b.partB)
  return b.total
}

/** Width in columns: split bars occupy 2 columns; remainder bars occupy 1. */
export function barWidth(b: Bar): number {
  if (b.partA > 0 && b.partB > 0) return 2
  return 1
}

export function mkGame(): Game {
  return {
    bars: [], fx: [], shots: [],
    cannonX: Math.floor(gridWidth(1) / 2),
    score: 0, hp: INITIAL_HP,
    nid: 1, lastSpawn: 0, alive: true,
    hurtUntil: 0, startedAt: Date.now(),
    level: 1, levelUpUntil: 0,
  }
}

/** Generate a random bar with value 4-10, split into two addends > 1. */
export function generateBar(id: number, cell: number, gridW: number): Bar {
  const total = 4 + Math.floor(Math.random() * 7) // 4..10
  // Split: partA in [2, total-2], partB = total - partA
  const minA = 2
  const maxA = total - 2
  const partA = minA + Math.floor(Math.random() * (maxA - minA + 1))
  const partB = total - partA
  const x = Math.floor(Math.random() * (gridW - 1)) // 0..gridW-2 (needs 2 cols)
  const bar: Bar = { id, total, partA, partB, x, y: 0 }
  bar.y = -barHeight(bar) * cell
  return bar
}

export function spawn(g: Game, cell: number, gridW: number) {
  // Find columns occupied near the top (accounting for bar widths)
  const occupied = new Set<number>()
  for (const b of g.bars) {
    if (b.y < cell * 2) {
      const bw = barWidth(b)
      for (let c = b.x; c < b.x + bw; c++) occupied.add(c)
    }
  }
  // Split bars need 2 adjacent free columns
  const freePositions: number[] = []
  for (let i = 0; i <= gridW - 2; i++) {
    if (!occupied.has(i) && !occupied.has(i + 1)) freePositions.push(i)
  }
  if (freePositions.length === 0) return

  const bar = generateBar(g.nid++, cell, gridW)
  bar.x = freePositions[Math.floor(Math.random() * freePositions.length)]
  g.bars.push(bar)
}

/** Find the lowest bar above the ground that the cannon is under. */
export function findTarget(g: Game, groundY: number, cell: number): Bar | null {
  let closest: Bar | null = null
  for (const b of g.bars) {
    const bottom = b.y + barHeight(b) * cell
    const bw = barWidth(b)
    if (g.cannonX >= b.x && g.cannonX < b.x + bw && bottom < groundY) {
      if (!closest || bottom > closest.y + barHeight(closest) * cell) closest = b
    }
  }
  return closest
}

/** Fire number `num` at the targeted bar. Returns true if a shot was created. */
export function tryShoot(g: Game, num: number, cell: number, t: number): boolean {
  const groundY = (GRID_H - 1) * cell
  const target = findTarget(g, groundY, cell)
  if (!target) return false

  const exact = num === target.total
  g.shots.push({
    id: g.nid++,
    num,
    col: target.x,
    charCol: g.cannonX,
    phase: 'rising',
    phaseStart: t,
    targetY: target.y,
    targetBar: { ...target },
    exact,
  })
  g.bars = g.bars.filter(b => b.id !== target.id)
  return true
}

/** Advance one frame of game state. */
export function tick(g: Game, dt: number, t: number, cell: number): TickResult {
  const result: TickResult = {
    scoreChanged: false,
    hpChanged: false,
    levelChanged: false,
    gameOver: false,
    targetBar: null,
  }

  const groundY = (GRID_H - 1) * cell
  const gridW = gridWidth(g.level)
  const shooting = g.shots.length > 0
  const levelingUp = t < g.levelUpUntil

  // Freeze falling while shot animation or level-up plays
  if (!shooting && !levelingUp) {
    const fallSpeed = BASE_SPEED + g.score * SPEED_PER_POINT
    for (const b of g.bars) b.y += fallSpeed * dt

    // Ground collision
    const dead: number[] = []
    for (const b of g.bars) {
      if (b.y + barHeight(b) * cell >= groundY) {
        dead.push(b.id)
        g.hp--
        g.fx.push({
          id: g.nid++, text: '-1',
          x: (b.x + barWidth(b) / 2) * cell, y: groundY - barHeight(b) * cell,
          t0: t, ok: false,
        })
      }
    }
    if (dead.length) {
      g.bars = g.bars.filter(b => !dead.includes(b.id))
      g.hurtUntil = t + 1200
      result.hpChanged = true
      if (g.hp <= 0) {
        g.alive = false
        result.gameOver = true
        return result
      }
    }

    // Spawn
    const maxB = Math.min(Math.floor(gridW / 2), 1 + Math.floor(g.score / 3))
    const interval = Math.max(MIN_SPAWN_MS, BASE_SPAWN_MS - g.score * SPAWN_DEC)
    if (g.bars.length < maxB && t - g.lastSpawn >= interval) { spawn(g, cell, gridW); g.lastSpawn = t }
    if (g.bars.length === 0) { spawn(g, cell, gridW); g.lastSpawn = t }
  }

  // Shot animation state machine
  for (const s of g.shots) {
    const elapsed = t - s.phaseStart
    const tbw = barWidth(s.targetBar)
    if (s.phase === 'rising' && elapsed >= 500) {
      s.phaseStart = t
      if (s.exact) {
        s.phase = 'hit'
        g.score++
        result.scoreChanged = true

        // Level up check
        const newLevel = 1 + Math.floor(g.score / POINTS_PER_LEVEL)
        if (newLevel > g.level) {
          g.level = newLevel
          g.levelUpUntil = t + LEVEL_UP_MS
          g.bars = []
          const newGw = gridWidth(newLevel)
          g.cannonX = Math.min(g.cannonX, newGw - 1)
          result.levelChanged = true
        }

        g.fx.push({
          id: g.nid++,
          text: `${s.targetBar.total}!`,
          x: (s.col + tbw / 2) * cell,
          y: s.targetY,
          t0: t, ok: true,
        })
      } else {
        s.phase = 'miss'
        g.hp--
        result.hpChanged = true
        g.hurtUntil = t + 1200
        g.fx.push({
          id: g.nid++,
          text: `${s.num} ≠ ${s.targetBar.total}`,
          x: (s.col + tbw / 2) * cell,
          y: s.targetY,
          t0: t, ok: false,
        })
        // If fired < total → shrink bar to remainder (1-column)
        if (s.num < s.targetBar.total) {
          const remainder = s.targetBar.total - s.num
          g.bars.push({
            id: g.nid++,
            total: remainder,
            partA: 0, partB: 0,
            x: s.col,
            y: s.targetY,
          })
        }
        if (g.hp <= 0) {
          g.alive = false
          result.gameOver = true
        }
      }
    } else if (s.phase === 'hit' && elapsed >= 300) {
      s.phase = 'done'
    } else if (s.phase === 'miss' && elapsed >= 500) {
      s.phase = 'done'
    }
  }
  g.shots = g.shots.filter(s => s.phase !== 'done')

  // FX cleanup
  g.fx = g.fx.filter(f => t - f.t0 < 1500)

  // Target detection
  const tgt = findTarget(g, groundY, cell)
  result.targetBar = tgt

  return result
}
