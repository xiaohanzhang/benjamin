/**
 * Game logic for Making 10.
 *
 * Pure game-state functions. Mutates the Game object in-place and returns
 * a TickResult so the React component knows which state setters to call.
 * Side effects (localStorage, saveBlocksResult) stay in the component.
 */

import type { Game, Plank, TickResult } from './types'
import {
  MAX_GRID_W, GRID_H, MIN_STACK_CELLS, STACK_PLANK_COLS, STACK_GAP,
  INITIAL_HP, BASE_SPEED, SPEED_PER_POINT, POINTS_PER_LEVEL, LEVEL_UP_MS,
  BASE_SPAWN_MS, MIN_SPAWN_MS, SPAWN_DEC, PLANKS_PER_BUILDING,
  BUILDING_ANIM_MS, BUILDING_SIZES, COLORS,
} from './constants'

/** Effective number of active columns (capped at MAX_GRID_W). */
export function gridWidth(level: number) { return Math.min(level, MAX_GRID_W) }

export function activeStart(lv: number) { return Math.floor((MAX_GRID_W - gridWidth(lv)) / 2) }

/** Stack area widens as buildings grow: buildingW + gap + plank cols */
export function stackCells(bLevel: number) {
  if (bLevel <= 0) return MIN_STACK_CELLS
  const bw = BUILDING_SIZES[Math.min(bLevel, 7) - 1][0]
  return bw + STACK_GAP + STACK_PLANK_COLS
}

export function mkGame(): Game {
  const as = activeStart(1)
  return {
    planks: [], fx: [], shots: [], stack: [],
    charX: as, score: 0, hp: INITIAL_HP,
    nid: 1, lastSpawn: 0, alive: true,
    hurtUntil: 0, level: 1, levelUpUntil: 0,
    buildingLevel: 0, buildingUntil: 0, startedAt: Date.now(),
  }
}

export function spawn(g: Game, cell: number) {
  const gw = gridWidth(g.level)
  const as = activeStart(g.level)
  // Find columns that are free (no plank tail still in the top area)
  const occupied = new Set<number>()
  for (const p of g.planks) {
    if (p.y < cell * 2) occupied.add(p.x)
  }
  const freeCols = []
  for (let i = as; i < as + gw; i++) if (!occupied.has(i)) freeCols.push(i)
  if (freeCols.length === 0) return

  const maxLen = Math.min(8, 10 - 2)
  const len = 2 + Math.floor(Math.random() * (maxLen - 1))
  const x = freeCols[Math.floor(Math.random() * freeCols.length)]
  g.planks.push({ id: g.nid++, len, x, y: -len * cell })
}

export function findTarget(g: Game, groundY: number, cell: number): Plank | null {
  let closest: Plank | null = null
  for (const p of g.planks) {
    const bottom = p.y + p.len * cell
    if (p.x === g.charX && bottom < groundY) {
      if (!closest || bottom > closest.y + closest.len * cell) closest = p
    }
  }
  return closest
}

/** Attempt to shoot number n at the targeted plank. Returns true if a shot was created. */
export function tryShoot(g: Game, n: number, cell: number, t: number): boolean {
  const groundY = (GRID_H - 1) * cell
  const target = findTarget(g, groundY, cell)
  if (!target) return false

  const isHit = n + target.len === 10
  g.shots.push({
    id: g.nid++,
    shotLen: n, shotColor: COLORS[n],
    targetLen: target.len, targetColor: COLORS[target.len],
    col: target.x, charCol: g.charX,
    phase: 'rising', phaseStart: t,
    targetY: target.y, stackIdx: g.stack.length,
    hit: isHit,
  })
  g.planks = g.planks.filter(p => p.id !== target.id)
  return true
}

/** Advance one frame of game state. Returns signals for the React component. */
export function tick(g: Game, dt: number, t: number, cell: number): TickResult {
  const result: TickResult = {
    scoreChanged: false,
    hpChanged: false,
    levelChanged: false,
    buildingChanged: false,
    gameOver: false,
    targetW: null,
  }

  const groundY = (GRID_H - 1) * cell
  const gridOffX = stackCells(g.buildingLevel) * cell

  const shooting = g.shots.length > 0
  const levelingUp = t < g.levelUpUntil
  const buildingUp = t < g.buildingUntil

  // Freeze everything while shot animation, level-up, or building plays
  if (!shooting && !levelingUp && !buildingUp) {
    const fallSpeed = BASE_SPEED + g.score * SPEED_PER_POINT
    for (const p of g.planks) p.y += fallSpeed * dt

    const dead: number[] = []
    for (const p of g.planks) {
      if (p.y + p.len * cell >= groundY) {
        dead.push(p.id)
        g.hp--
        g.fx.push({ id: g.nid++, text: '-1', x: gridOffX + (p.x + 0.5) * cell, y: groundY - p.len * cell, t0: t, ok: false })
      }
    }
    if (dead.length) {
      g.planks = g.planks.filter(p => !dead.includes(p.id))
      g.hurtUntil = t + 1200
      result.hpChanged = true
      if (g.hp <= 0) {
        g.alive = false
        result.gameOver = true
        return result
      }
    }

    const maxP = Math.min(5, 1 + Math.floor(g.score / 3))
    const interval = Math.max(MIN_SPAWN_MS, BASE_SPAWN_MS - g.score * SPAWN_DEC)
    if (g.planks.length < maxP && t - g.lastSpawn >= interval) { spawn(g, cell); g.lastSpawn = t }
    if (g.planks.length === 0) { spawn(g, cell); g.lastSpawn = t }
  }

  // Update shot animations
  for (const s of g.shots) {
    const elapsed = t - s.phaseStart
    if (s.phase === 'rising' && elapsed >= 700) {
      s.phaseStart = t
      if (s.hit) {
        s.phase = 'flying'
        g.score++
        result.scoreChanged = true
        // Level up check
        const newLevel = 1 + Math.floor(g.score / POINTS_PER_LEVEL)
        if (newLevel > g.level) {
          g.level = newLevel
          g.levelUpUntil = t + LEVEL_UP_MS
          g.planks = []
          const newGw = gridWidth(newLevel)
          const newAs = activeStart(newLevel)
          g.charX = Math.max(newAs, Math.min(newAs + newGw - 1, g.charX))
          result.levelChanged = true
        }
        // Building milestone check
        if (g.score % PLANKS_PER_BUILDING === 0 && g.buildingLevel < 7) {
          g.buildingLevel++
          g.buildingUntil = t + BUILDING_ANIM_MS
          g.stack = []
          g.planks = []
          result.buildingChanged = true
        }
        g.fx.push({
          id: g.nid++,
          text: `${s.targetLen} + ${s.shotLen} = 10!`,
          x: gridOffX + (s.col + 0.5) * cell,
          y: s.targetY,
          t0: t, ok: true,
        })
      } else {
        s.phase = 'wrong_flash'
        g.fx.push({
          id: g.nid++,
          text: `${s.targetLen} + ${s.shotLen} = ${s.targetLen + s.shotLen}`,
          x: gridOffX + (s.col + 0.5) * cell,
          y: s.targetY - cell * 0.5,
          t0: t, ok: false,
        })
      }
    } else if (s.phase === 'flying' && elapsed >= 800) {
      g.stack.push(s.targetColor)
      s.phase = 'done'
    } else if (s.phase === 'wrong_flash' && elapsed >= 800) {
      s.phase = 'falling'
      s.phaseStart = t
    } else if (s.phase === 'falling' && elapsed >= 500) {
      g.hp--
      result.hpChanged = true
      g.hurtUntil = t + 1200
      g.fx.push({ id: g.nid++, text: '-1', x: gridOffX + (s.col + 0.5) * cell, y: groundY - cell, t0: t, ok: false })
      if (g.hp <= 0) {
        g.alive = false
        result.gameOver = true
      }
      s.phase = 'done'
    }
  }
  g.shots = g.shots.filter(s => s.phase !== 'done')

  g.fx = g.fx.filter(f => t - f.t0 < 1500)

  const tgt = findTarget(g, groundY, cell)
  result.targetW = tgt?.len ?? null

  return result
}
