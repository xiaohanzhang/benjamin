import { describe, it, expect } from 'vitest'
import { activeStart, gridWidth, stackCells, mkGame, spawn, findTarget, tryShoot, tick } from './logic'
import type { Game } from './types'
import {
  MAX_GRID_W, GRID_H, INITIAL_HP, BASE_SPEED, SPEED_PER_POINT,
  POINTS_PER_LEVEL, LEVEL_UP_MS, PLANKS_PER_BUILDING, BUILDING_ANIM_MS,
  COLORS,
} from './constants'

const CELL = 20
const GROUND_Y = (GRID_H - 1) * CELL

// ── Helper ──────────────────────────────────────────────────

/** Create a fresh Game with optional overrides. */
function game(overrides: Partial<Game> = {}): Game {
  return { ...mkGame(), ...overrides }
}

// ── gridWidth ───────────────────────────────────────────────

describe('gridWidth', () => {
  it('returns level when below MAX_GRID_W', () => {
    expect(gridWidth(1)).toBe(1)
    expect(gridWidth(5)).toBe(5)
  })

  it('caps at MAX_GRID_W', () => {
    expect(gridWidth(MAX_GRID_W)).toBe(MAX_GRID_W)
    expect(gridWidth(15)).toBe(MAX_GRID_W)
    expect(gridWidth(100)).toBe(MAX_GRID_W)
  })
})

// ── activeStart ─────────────────────────────────────────────

describe('activeStart', () => {
  it('centers a single column', () => {
    // (10 - 1) / 2 = 4
    expect(activeStart(1)).toBe(4)
  })

  it('returns 0 when level fills the grid', () => {
    expect(activeStart(MAX_GRID_W)).toBe(0)
  })

  it('centers 5 columns', () => {
    // (10 - 5) / 2 = 2
    expect(activeStart(5)).toBe(2)
  })

  it('clamps at 0 for levels beyond MAX_GRID_W', () => {
    expect(activeStart(15)).toBe(0)
    expect(activeStart(100)).toBe(0)
  })
})

// ── stackCells ──────────────────────────────────────────────

describe('stackCells', () => {
  it('returns MIN_STACK_CELLS when no building', () => {
    expect(stackCells(0)).toBe(2)
  })

  it('returns buildingW + gap + plankCols for level 1', () => {
    // BUILDING_SIZES[0] = [1,1], so 1 + 1 + 2 = 4
    expect(stackCells(1)).toBe(4)
  })

  it('grows with building level', () => {
    // BUILDING_SIZES[6] = [7,7], so 7 + 1 + 2 = 10
    expect(stackCells(7)).toBe(10)
  })
})

// ── mkGame ──────────────────────────────────────────────────

describe('mkGame', () => {
  it('returns valid initial state', () => {
    const g = mkGame()
    expect(g.score).toBe(0)
    expect(g.hp).toBe(INITIAL_HP)
    expect(g.level).toBe(1)
    expect(g.alive).toBe(true)
    expect(g.planks).toEqual([])
    expect(g.fx).toEqual([])
    expect(g.shots).toEqual([])
    expect(g.stack).toEqual([])
    expect(g.charX).toBe(activeStart(1))
    expect(g.buildingLevel).toBe(0)
    expect(g.nid).toBe(1)
  })
})

// ── spawn ───────────────────────────────────────────────────

describe('spawn', () => {
  it('adds a plank with valid properties', () => {
    const g = game()
    spawn(g, CELL)
    expect(g.planks).toHaveLength(1)
    const p = g.planks[0]
    expect(p.len).toBeGreaterThanOrEqual(2)
    expect(p.len).toBeLessThanOrEqual(8)
    expect(p.y).toBeLessThan(0)
    const as = activeStart(g.level)
    expect(p.x).toBeGreaterThanOrEqual(as)
    expect(p.x).toBeLessThan(as + g.level)
  })

  it('increments nid', () => {
    const g = game()
    const before = g.nid
    spawn(g, CELL)
    expect(g.nid).toBe(before + 1)
  })

  it('does nothing when all columns are occupied near the top', () => {
    const g = game()
    const as = activeStart(g.level)
    // Level 1 has only 1 active column. Put a plank at y=0 (< cell*2) to occupy it.
    g.planks.push({ id: 99, len: 3, x: as, y: 0 })
    const before = g.planks.length
    spawn(g, CELL)
    expect(g.planks).toHaveLength(before) // nothing added
  })
})

// ── findTarget ──────────────────────────────────────────────

describe('findTarget', () => {
  it('returns null when no planks', () => {
    const g = game()
    expect(findTarget(g, GROUND_Y, CELL)).toBeNull()
  })

  it('returns null when planks are in different column', () => {
    const g = game({ charX: 4 })
    g.planks.push({ id: 1, len: 3, x: 5, y: 100 })
    expect(findTarget(g, GROUND_Y, CELL)).toBeNull()
  })

  it('returns the closest plank above ground in the character column', () => {
    const g = game({ charX: 4 })
    // Plank A: bottom = 100 + 3*20 = 160
    g.planks.push({ id: 1, len: 3, x: 4, y: 100 })
    // Plank B: bottom = 200 + 2*20 = 240 (closer to ground)
    g.planks.push({ id: 2, len: 2, x: 4, y: 200 })
    const target = findTarget(g, GROUND_Y, CELL)
    expect(target).not.toBeNull()
    expect(target!.id).toBe(2) // plank B is closer to ground
  })

  it('ignores planks that are at or past the ground', () => {
    const g = game({ charX: 4 })
    // bottom = GROUND_Y exactly → not above ground
    g.planks.push({ id: 1, len: 2, x: 4, y: GROUND_Y - 2 * CELL })
    expect(findTarget(g, GROUND_Y, CELL)).toBeNull()
  })
})

// ── tryShoot ────────────────────────────────────────────────

describe('tryShoot', () => {
  it('returns false when no target exists', () => {
    const g = game()
    expect(tryShoot(g, 5, CELL, 1000)).toBe(false)
    expect(g.shots).toHaveLength(0)
  })

  it('creates a hit shot when numbers sum to 10', () => {
    const g = game({ charX: 4 })
    g.planks.push({ id: 1, len: 7, x: 4, y: 100 }) // 7 + 3 = 10
    const result = tryShoot(g, 3, CELL, 1000)
    expect(result).toBe(true)
    expect(g.shots).toHaveLength(1)
    expect(g.shots[0].hit).toBe(true)
    expect(g.shots[0].shotLen).toBe(3)
    expect(g.shots[0].targetLen).toBe(7)
    expect(g.shots[0].phase).toBe('rising')
    expect(g.planks).toHaveLength(0) // target removed
  })

  it('creates a miss shot when numbers do not sum to 10', () => {
    const g = game({ charX: 4 })
    g.planks.push({ id: 1, len: 5, x: 4, y: 100 }) // 5 + 3 = 8 ≠ 10
    tryShoot(g, 3, CELL, 1000)
    expect(g.shots[0].hit).toBe(false)
    expect(g.planks).toHaveLength(0) // target still removed
  })

  it('uses correct colors from COLORS map', () => {
    const g = game({ charX: 4 })
    g.planks.push({ id: 1, len: 6, x: 4, y: 100 })
    tryShoot(g, 4, CELL, 1000)
    expect(g.shots[0].shotColor).toBe(COLORS[4])
    expect(g.shots[0].targetColor).toBe(COLORS[6])
  })
})

// ── tick ────────────────────────────────────────────────────

describe('tick', () => {
  describe('plank falling', () => {
    it('moves planks downward by fallSpeed * dt', () => {
      const g = game()
      g.planks.push({ id: 1, len: 3, x: 4, y: 100 })
      g.lastSpawn = 99999 // prevent auto-spawn
      const dt = 0.05
      const fallSpeed = BASE_SPEED + g.score * SPEED_PER_POINT
      tick(g, dt, 100, CELL)
      expect(g.planks[0].y).toBeCloseTo(100 + fallSpeed * dt)
    })

    it('does not move planks when shots are active (freeze)', () => {
      const g = game()
      g.planks.push({ id: 1, len: 3, x: 4, y: 100 })
      g.shots.push({
        id: 2, shotLen: 3, shotColor: '#000', targetLen: 7, targetColor: '#000',
        col: 4, charCol: 4, phase: 'rising', phaseStart: 0,
        targetY: 50, stackIdx: 0, hit: true,
      })
      tick(g, 0.05, 100, CELL)
      expect(g.planks[0].y).toBe(100) // unchanged
    })

    it('does not move planks during level-up animation', () => {
      const g = game({ levelUpUntil: 5000 })
      g.planks.push({ id: 1, len: 3, x: 4, y: 100 })
      g.lastSpawn = 99999
      tick(g, 0.05, 3000, CELL) // t=3000 < levelUpUntil=5000
      expect(g.planks[0].y).toBe(100)
    })

    it('does not move planks during building animation', () => {
      const g = game({ buildingUntil: 5000 })
      g.planks.push({ id: 1, len: 3, x: 4, y: 100 })
      g.lastSpawn = 99999
      tick(g, 0.05, 3000, CELL)
      expect(g.planks[0].y).toBe(100)
    })
  })

  describe('ground collision', () => {
    it('removes plank and decreases hp when hitting ground', () => {
      const g = game()
      // Place plank so bottom >= groundY (triggers collision)
      g.planks.push({ id: 1, len: 2, x: 4, y: GROUND_Y - CELL })
      // Add a second plank high up so force-spawn doesn't trigger
      g.planks.push({ id: 2, len: 3, x: 4, y: 10 })
      g.lastSpawn = 99999
      const result = tick(g, 0, 1000, CELL)
      // Plank 1 removed (hit ground), plank 2 still alive
      expect(g.planks.every(p => p.id !== 1)).toBe(true)
      expect(g.hp).toBe(INITIAL_HP - 1)
      expect(result.hpChanged).toBe(true)
      expect(g.fx.length).toBeGreaterThan(0) // damage FX created
    })

    it('signals gameOver when hp reaches 0', () => {
      const g = game({ hp: 1 })
      g.planks.push({ id: 1, len: 2, x: 4, y: GROUND_Y })
      g.lastSpawn = 99999
      const result = tick(g, 0, 1000, CELL)
      expect(result.gameOver).toBe(true)
      expect(g.alive).toBe(false)
      expect(g.hp).toBe(0)
    })
  })

  describe('spawn timing', () => {
    it('spawns a plank when interval has elapsed and planks < max', () => {
      const g = game({ lastSpawn: 0 })
      // With score=0: interval = max(1000, 3500 - 0) = 3500, maxP = 1
      const t = 4000
      tick(g, 0, t, CELL)
      expect(g.planks.length).toBeGreaterThanOrEqual(1)
      expect(g.lastSpawn).toBe(t)
    })

    it('force-spawns when there are no planks', () => {
      const g = game({ lastSpawn: 99999 }) // recent spawn
      // No planks → force spawn
      tick(g, 0, 100000, CELL)
      expect(g.planks.length).toBeGreaterThanOrEqual(1)
    })
  })

  describe('shot animation: hit path', () => {
    function gameWithHitShot(phaseStart: number) {
      const g = game()
      g.shots.push({
        id: 2, shotLen: 3, shotColor: COLORS[3],
        targetLen: 7, targetColor: COLORS[7],
        col: 4, charCol: 4, phase: 'rising', phaseStart,
        targetY: 100, stackIdx: 0, hit: true,
      })
      return g
    }

    it('rising → flying after 700ms, increments score', () => {
      const g = gameWithHitShot(0)
      const result = tick(g, 0, 700, CELL)
      expect(g.shots[0].phase).toBe('flying')
      expect(g.score).toBe(1)
      expect(result.scoreChanged).toBe(true)
    })

    it('stays rising before 700ms', () => {
      const g = gameWithHitShot(0)
      tick(g, 0, 699, CELL)
      expect(g.shots[0].phase).toBe('rising')
    })

    it('flying → done after 800ms, adds to stack', () => {
      const g = game()
      g.shots.push({
        id: 2, shotLen: 3, shotColor: COLORS[3],
        targetLen: 7, targetColor: COLORS[7],
        col: 4, charCol: 4, phase: 'flying', phaseStart: 0,
        targetY: 100, stackIdx: 0, hit: true,
      })
      tick(g, 0, 800, CELL)
      expect(g.shots).toHaveLength(0) // 'done' is filtered out
      expect(g.stack).toHaveLength(1)
      expect(g.stack[0]).toBe(COLORS[7])
    })

    it('triggers level up when score crosses POINTS_PER_LEVEL boundary', () => {
      const g = game({ score: POINTS_PER_LEVEL - 1 }) // score will become POINTS_PER_LEVEL
      g.shots.push({
        id: 2, shotLen: 3, shotColor: COLORS[3],
        targetLen: 7, targetColor: COLORS[7],
        col: 4, charCol: 4, phase: 'rising', phaseStart: 0,
        targetY: 100, stackIdx: 0, hit: true,
      })
      const t = 700
      const result = tick(g, 0, t, CELL)
      expect(g.level).toBe(2)
      expect(result.levelChanged).toBe(true)
      expect(g.levelUpUntil).toBe(t + LEVEL_UP_MS)
      expect(g.planks).toEqual([]) // planks cleared on level up
    })

    it('caps active columns at MAX_GRID_W even for levels beyond 10', () => {
      // Set score so level will go from 10 to 11 — columns should stay at 10
      const g = game({ score: POINTS_PER_LEVEL * 10 - 1, level: 10, charX: 0 })
      g.shots.push({
        id: 2, shotLen: 3, shotColor: COLORS[3],
        targetLen: 7, targetColor: COLORS[7],
        col: 0, charCol: 0, phase: 'rising', phaseStart: 0,
        targetY: 100, stackIdx: 0, hit: true,
      })
      const t = 700
      const result = tick(g, 0, t, CELL)
      expect(g.level).toBe(11) // level still increments
      expect(result.levelChanged).toBe(true)
      // charX should remain valid within 0..(MAX_GRID_W-1)
      expect(g.charX).toBeGreaterThanOrEqual(0)
      expect(g.charX).toBeLessThan(MAX_GRID_W)
    })

    it('triggers building milestone when score crosses PLANKS_PER_BUILDING boundary', () => {
      const g = game({ score: PLANKS_PER_BUILDING - 1, level: 4 })
      g.shots.push({
        id: 2, shotLen: 3, shotColor: COLORS[3],
        targetLen: 7, targetColor: COLORS[7],
        col: 4, charCol: 4, phase: 'rising', phaseStart: 0,
        targetY: 100, stackIdx: 0, hit: true,
      })
      g.stack = ['#abc', '#def'] // will be cleared
      const t = 700
      const result = tick(g, 0, t, CELL)
      expect(g.buildingLevel).toBe(1)
      expect(result.buildingChanged).toBe(true)
      expect(g.buildingUntil).toBe(t + BUILDING_ANIM_MS)
      expect(g.stack).toEqual([]) // stack cleared on building
    })
  })

  describe('shot animation: miss path', () => {
    it('rising → wrong_flash after 700ms on miss', () => {
      const g = game()
      g.shots.push({
        id: 2, shotLen: 3, shotColor: COLORS[3],
        targetLen: 5, targetColor: COLORS[5],
        col: 4, charCol: 4, phase: 'rising', phaseStart: 0,
        targetY: 100, stackIdx: 0, hit: false,
      })
      tick(g, 0, 700, CELL)
      expect(g.shots[0].phase).toBe('wrong_flash')
      expect(g.fx.some(f => f.text.includes('5 + 3 = 8'))).toBe(true)
    })

    it('wrong_flash → falling after 800ms', () => {
      const g = game()
      g.shots.push({
        id: 2, shotLen: 3, shotColor: COLORS[3],
        targetLen: 5, targetColor: COLORS[5],
        col: 4, charCol: 4, phase: 'wrong_flash', phaseStart: 0,
        targetY: 100, stackIdx: 0, hit: false,
      })
      tick(g, 0, 800, CELL)
      expect(g.shots[0].phase).toBe('falling')
    })

    it('falling → done after 500ms, decreases hp', () => {
      const g = game()
      g.shots.push({
        id: 2, shotLen: 3, shotColor: COLORS[3],
        targetLen: 5, targetColor: COLORS[5],
        col: 4, charCol: 4, phase: 'falling', phaseStart: 0,
        targetY: 100, stackIdx: 0, hit: false,
      })
      const result = tick(g, 0, 500, CELL)
      expect(g.shots).toHaveLength(0) // filtered out
      expect(g.hp).toBe(INITIAL_HP - 1)
      expect(result.hpChanged).toBe(true)
    })

    it('falling causes gameOver when hp reaches 0', () => {
      const g = game({ hp: 1 })
      g.shots.push({
        id: 2, shotLen: 3, shotColor: COLORS[3],
        targetLen: 5, targetColor: COLORS[5],
        col: 4, charCol: 4, phase: 'falling', phaseStart: 0,
        targetY: 100, stackIdx: 0, hit: false,
      })
      const result = tick(g, 0, 500, CELL)
      expect(result.gameOver).toBe(true)
      expect(g.alive).toBe(false)
    })
  })

  describe('FX cleanup', () => {
    it('removes fx older than 1500ms', () => {
      const g = game()
      g.fx.push({ id: 1, text: 'old', x: 0, y: 0, t0: 0, ok: true })
      g.fx.push({ id: 2, text: 'new', x: 0, y: 0, t0: 1000, ok: true })
      g.lastSpawn = 99999
      tick(g, 0, 1500, CELL)
      expect(g.fx).toHaveLength(1)
      expect(g.fx[0].text).toBe('new')
    })
  })

  describe('targetW in result', () => {
    it('returns target plank len when one exists', () => {
      const g = game({ charX: 4 })
      g.planks.push({ id: 1, len: 6, x: 4, y: 100 })
      g.lastSpawn = 99999
      const result = tick(g, 0, 100, CELL)
      expect(result.targetW).toBe(6)
    })

    it('returns null when no target in character column', () => {
      const g = game({ charX: 4 })
      // Place plank in a different column so there's no target, but planks > 0 prevents force-spawn
      g.planks.push({ id: 1, len: 3, x: 5, y: 10 })
      g.lastSpawn = 99999
      const result = tick(g, 0, 100, CELL)
      expect(result.targetW).toBeNull()
    })
  })
})
