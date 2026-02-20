import { describe, it, expect } from 'vitest'
import { mkGame, generateBar, spawn, findTarget, tryShoot, tick, barHeight, barWidth } from './logic'
import type { Game } from './types'
import {
  GRID_W, GRID_H, INITIAL_HP, BASE_SPEED, SPEED_PER_POINT,
  BASE_SPAWN_MS, MIN_SPAWN_MS, SPAWN_DEC, COLORS,
} from './constants'

const CELL = 20
const GROUND_Y = (GRID_H - 1) * CELL

/** Create a fresh Game with optional overrides. */
function game(overrides: Partial<Game> = {}): Game {
  return { ...mkGame(), ...overrides }
}

// -- mkGame --

describe('mkGame', () => {
  it('returns valid initial state', () => {
    const g = mkGame()
    expect(g.score).toBe(0)
    expect(g.hp).toBe(INITIAL_HP)
    expect(g.alive).toBe(true)
    expect(g.bars).toEqual([])
    expect(g.fx).toEqual([])
    expect(g.shots).toEqual([])
    expect(g.cannonX).toBe(Math.floor(GRID_W / 2))
    expect(g.nid).toBe(1)
  })
})

// -- barHeight --

describe('barHeight', () => {
  it('returns max(partA, partB) for split bars', () => {
    expect(barHeight({ id: 1, total: 7, partA: 3, partB: 4, x: 0, y: 0 })).toBe(4)
    expect(barHeight({ id: 1, total: 6, partA: 2, partB: 4, x: 0, y: 0 })).toBe(4)
    expect(barHeight({ id: 1, total: 4, partA: 2, partB: 2, x: 0, y: 0 })).toBe(2)
    expect(barHeight({ id: 1, total: 10, partA: 5, partB: 5, x: 0, y: 0 })).toBe(5)
  })

  it('returns total for remainder bars', () => {
    expect(barHeight({ id: 1, total: 3, partA: 0, partB: 0, x: 0, y: 0 })).toBe(3)
    expect(barHeight({ id: 1, total: 7, partA: 0, partB: 0, x: 0, y: 0 })).toBe(7)
  })
})

// -- barWidth --

describe('barWidth', () => {
  it('returns 2 for split bars', () => {
    expect(barWidth({ id: 1, total: 7, partA: 3, partB: 4, x: 0, y: 0 })).toBe(2)
    expect(barWidth({ id: 1, total: 4, partA: 2, partB: 2, x: 0, y: 0 })).toBe(2)
  })

  it('returns 1 for remainder bars', () => {
    expect(barWidth({ id: 1, total: 3, partA: 0, partB: 0, x: 0, y: 0 })).toBe(1)
  })
})

// -- generateBar --

describe('generateBar', () => {
  it('produces bars with total 4-10', () => {
    for (let i = 0; i < 100; i++) {
      const bar = generateBar(i, CELL)
      expect(bar.total).toBeGreaterThanOrEqual(4)
      expect(bar.total).toBeLessThanOrEqual(10)
    }
  })

  it('produces valid splits where partA + partB = total, both > 1', () => {
    for (let i = 0; i < 100; i++) {
      const bar = generateBar(i, CELL)
      expect(bar.partA + bar.partB).toBe(bar.total)
      expect(bar.partA).toBeGreaterThanOrEqual(2)
      expect(bar.partB).toBeGreaterThanOrEqual(2)
    }
  })

  it('places bar in valid column (2-col bar fits within grid)', () => {
    for (let i = 0; i < 50; i++) {
      const bar = generateBar(i, CELL)
      expect(bar.x).toBeGreaterThanOrEqual(0)
      expect(bar.x + barWidth(bar)).toBeLessThanOrEqual(GRID_W)
    }
  })

  it('starts bar above the viewport using barHeight', () => {
    const bar = generateBar(1, CELL)
    expect(bar.y).toBeLessThan(0)
    expect(bar.y).toBe(-barHeight(bar) * CELL)
  })
})

// -- spawn --

describe('spawn', () => {
  it('adds a bar to the game', () => {
    const g = game()
    spawn(g, CELL)
    expect(g.bars).toHaveLength(1)
  })

  it('increments nid', () => {
    const g = game()
    const before = g.nid
    spawn(g, CELL)
    expect(g.nid).toBe(before + 1)
  })

  it('does nothing when all columns are occupied near the top', () => {
    const g = game()
    for (let i = 0; i < GRID_W; i++) {
      g.bars.push({ id: g.nid++, total: 5, partA: 2, partB: 3, x: i, y: 0 })
    }
    const before = g.bars.length
    spawn(g, CELL)
    expect(g.bars).toHaveLength(before)
  })
})

// -- findTarget --

describe('findTarget', () => {
  it('returns null when no bars', () => {
    const g = game()
    expect(findTarget(g, GROUND_Y, CELL)).toBeNull()
  })

  it('returns null when bars are in different column', () => {
    const g = game({ cannonX: 3 })
    g.bars.push({ id: 1, total: 5, partA: 2, partB: 3, x: 5, y: 100 })
    expect(findTarget(g, GROUND_Y, CELL)).toBeNull()
  })

  it('returns the closest bar above ground in cannon column', () => {
    const g = game({ cannonX: 3 })
    g.bars.push({ id: 1, total: 5, partA: 2, partB: 3, x: 3, y: 100 })
    g.bars.push({ id: 2, total: 4, partA: 2, partB: 2, x: 3, y: 200 })
    const target = findTarget(g, GROUND_Y, CELL)
    expect(target).not.toBeNull()
    expect(target!.id).toBe(2) // bar 2 is closer to ground
  })

  it('finds target when cannon is on second column of a 2-col bar', () => {
    const g = game({ cannonX: 4 })
    g.bars.push({ id: 1, total: 7, partA: 3, partB: 4, x: 3, y: 100 })
    const target = findTarget(g, GROUND_Y, CELL)
    expect(target).not.toBeNull()
    expect(target!.id).toBe(1)
  })

  it('ignores bars at or past the ground', () => {
    const g = game({ cannonX: 3 })
    // barHeight(2,2) = 2, so bottom = y + 2*CELL = GROUND_Y exactly → not above ground
    g.bars.push({ id: 1, total: 4, partA: 2, partB: 2, x: 3, y: GROUND_Y - 2 * CELL })
    expect(findTarget(g, GROUND_Y, CELL)).toBeNull()
  })
})

// -- tryShoot --

describe('tryShoot', () => {
  it('returns false when no target exists', () => {
    const g = game()
    expect(tryShoot(g, 5, CELL, 1000)).toBe(false)
    expect(g.shots).toHaveLength(0)
  })

  it('creates an exact shot when num equals total', () => {
    const g = game({ cannonX: 3 })
    g.bars.push({ id: 1, total: 7, partA: 3, partB: 4, x: 3, y: 100 })
    const result = tryShoot(g, 7, CELL, 1000)
    expect(result).toBe(true)
    expect(g.shots).toHaveLength(1)
    expect(g.shots[0].exact).toBe(true)
    expect(g.shots[0].num).toBe(7)
    expect(g.shots[0].phase).toBe('rising')
    expect(g.bars).toHaveLength(0) // target removed
  })

  it('creates a miss shot when num does not equal total', () => {
    const g = game({ cannonX: 3 })
    g.bars.push({ id: 1, total: 7, partA: 3, partB: 4, x: 3, y: 100 })
    tryShoot(g, 5, CELL, 1000)
    expect(g.shots[0].exact).toBe(false)
    expect(g.bars).toHaveLength(0) // target removed during shot
  })

  it('stores a snapshot of the target bar', () => {
    const g = game({ cannonX: 3 })
    g.bars.push({ id: 1, total: 6, partA: 2, partB: 4, x: 3, y: 100 })
    tryShoot(g, 6, CELL, 1000)
    expect(g.shots[0].targetBar.total).toBe(6)
    expect(g.shots[0].targetBar.partA).toBe(2)
    expect(g.shots[0].targetBar.partB).toBe(4)
  })
})

// -- tick --

describe('tick', () => {
  describe('bar falling', () => {
    it('moves bars downward by fallSpeed * dt', () => {
      const g = game()
      g.bars.push({ id: 1, total: 5, partA: 2, partB: 3, x: 3, y: 100 })
      g.lastSpawn = 99999
      const dt = 0.05
      const fallSpeed = BASE_SPEED + g.score * SPEED_PER_POINT
      tick(g, dt, 100, CELL)
      expect(g.bars[0].y).toBeCloseTo(100 + fallSpeed * dt)
    })

    it('does not move bars when shots are active (freeze)', () => {
      const g = game()
      g.bars.push({ id: 1, total: 5, partA: 2, partB: 3, x: 3, y: 100 })
      g.shots.push({
        id: 2, num: 7, col: 3, charCol: 3,
        phase: 'rising', phaseStart: 0,
        targetY: 50, targetBar: { id: 99, total: 7, partA: 3, partB: 4, x: 3, y: 50 },
        exact: true,
      })
      tick(g, 0.05, 100, CELL)
      expect(g.bars[0].y).toBe(100)
    })
  })

  describe('ground collision', () => {
    it('removes bar and decreases hp when hitting ground', () => {
      const g = game()
      // barHeight(2,2) = 2, so bottom = y + 2*CELL. Place so bottom >= GROUND_Y
      g.bars.push({ id: 1, total: 4, partA: 2, partB: 2, x: 3, y: GROUND_Y - CELL })
      // Add a second bar high up to prevent force-spawn
      g.bars.push({ id: 2, total: 5, partA: 2, partB: 3, x: 5, y: 10 })
      g.lastSpawn = 99999
      const result = tick(g, 0, 1000, CELL)
      expect(g.bars.every(b => b.id !== 1)).toBe(true)
      expect(g.hp).toBe(INITIAL_HP - 1)
      expect(result.hpChanged).toBe(true)
    })

    it('signals gameOver when hp reaches 0', () => {
      const g = game({ hp: 1 })
      g.bars.push({ id: 1, total: 4, partA: 2, partB: 2, x: 3, y: GROUND_Y })
      g.lastSpawn = 99999
      const result = tick(g, 0, 1000, CELL)
      expect(result.gameOver).toBe(true)
      expect(g.alive).toBe(false)
      expect(g.hp).toBe(0)
    })
  })

  describe('spawn timing', () => {
    it('spawns a bar when interval has elapsed and bars < max', () => {
      const g = game({ lastSpawn: 0 })
      const t = 5000
      tick(g, 0, t, CELL)
      expect(g.bars.length).toBeGreaterThanOrEqual(1)
      expect(g.lastSpawn).toBe(t)
    })

    it('force-spawns when there are no bars', () => {
      const g = game({ lastSpawn: 99999 })
      tick(g, 0, 100000, CELL)
      expect(g.bars.length).toBeGreaterThanOrEqual(1)
    })
  })

  describe('shot animation: hit path', () => {
    function gameWithHitShot(phaseStart: number) {
      const g = game()
      g.shots.push({
        id: 2, num: 7, col: 3, charCol: 3,
        phase: 'rising', phaseStart,
        targetY: 100,
        targetBar: { id: 99, total: 7, partA: 3, partB: 4, x: 3, y: 100 },
        exact: true,
      })
      return g
    }

    it('rising -> hit after 500ms, increments score', () => {
      const g = gameWithHitShot(0)
      const result = tick(g, 0, 500, CELL)
      expect(g.shots[0].phase).toBe('hit')
      expect(g.score).toBe(1)
      expect(result.scoreChanged).toBe(true)
    })

    it('stays rising before 500ms', () => {
      const g = gameWithHitShot(0)
      tick(g, 0, 499, CELL)
      expect(g.shots[0].phase).toBe('rising')
    })

    it('hit -> done after 300ms', () => {
      const g = game()
      g.shots.push({
        id: 2, num: 7, col: 3, charCol: 3,
        phase: 'hit', phaseStart: 0,
        targetY: 100,
        targetBar: { id: 99, total: 7, partA: 3, partB: 4, x: 3, y: 100 },
        exact: true,
      })
      tick(g, 0, 300, CELL)
      expect(g.shots).toHaveLength(0) // done filtered out
    })
  })

  describe('shot animation: miss path', () => {
    it('rising -> miss after 500ms, decreases hp', () => {
      const g = game()
      g.shots.push({
        id: 2, num: 5, col: 3, charCol: 3,
        phase: 'rising', phaseStart: 0,
        targetY: 100,
        targetBar: { id: 99, total: 7, partA: 3, partB: 4, x: 3, y: 100 },
        exact: false,
      })
      const result = tick(g, 0, 500, CELL)
      expect(g.shots[0].phase).toBe('miss')
      expect(g.hp).toBe(INITIAL_HP - 1)
      expect(result.hpChanged).toBe(true)
    })

    it('miss creates remainder bar when num < total', () => {
      const g = game()
      g.shots.push({
        id: 2, num: 5, col: 3, charCol: 3,
        phase: 'rising', phaseStart: 0,
        targetY: 100,
        targetBar: { id: 99, total: 7, partA: 3, partB: 4, x: 3, y: 100 },
        exact: false,
      })
      tick(g, 0, 500, CELL)
      // Remainder = 7 - 5 = 2
      const remainder = g.bars.find(b => b.total === 2)
      expect(remainder).toBeDefined()
      expect(remainder!.partA).toBe(0) // single-segment
      expect(remainder!.partB).toBe(0)
      expect(remainder!.x).toBe(3)
    })

    it('miss does not create remainder when num >= total', () => {
      const g = game()
      g.shots.push({
        id: 2, num: 8, col: 3, charCol: 3,
        phase: 'rising', phaseStart: 0,
        targetY: 100,
        targetBar: { id: 99, total: 7, partA: 3, partB: 4, x: 3, y: 100 },
        exact: false,
      })
      tick(g, 0, 500, CELL)
      expect(g.bars).toHaveLength(0) // no remainder
    })

    it('miss -> done after 500ms', () => {
      const g = game()
      g.shots.push({
        id: 2, num: 5, col: 3, charCol: 3,
        phase: 'miss', phaseStart: 0,
        targetY: 100,
        targetBar: { id: 99, total: 7, partA: 3, partB: 4, x: 3, y: 100 },
        exact: false,
      })
      tick(g, 0, 500, CELL)
      expect(g.shots).toHaveLength(0) // done filtered out
    })

    it('miss causes gameOver when hp reaches 0', () => {
      const g = game({ hp: 1 })
      g.shots.push({
        id: 2, num: 5, col: 3, charCol: 3,
        phase: 'rising', phaseStart: 0,
        targetY: 100,
        targetBar: { id: 99, total: 7, partA: 3, partB: 4, x: 3, y: 100 },
        exact: false,
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

  describe('targetBar in result', () => {
    it('returns target bar when one exists', () => {
      const g = game({ cannonX: 3 })
      g.bars.push({ id: 1, total: 6, partA: 2, partB: 4, x: 3, y: 100 })
      g.lastSpawn = 99999
      const result = tick(g, 0, 100, CELL)
      expect(result.targetBar).not.toBeNull()
      expect(result.targetBar!.total).toBe(6)
    })

    it('returns null when no target in cannon column', () => {
      const g = game({ cannonX: 3 })
      g.bars.push({ id: 1, total: 5, partA: 2, partB: 3, x: 5, y: 10 })
      g.lastSpawn = 99999
      const result = tick(g, 0, 100, CELL)
      expect(result.targetBar).toBeNull()
    })
  })
})
