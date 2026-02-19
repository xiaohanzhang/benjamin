import { describe, it, expect, vi } from 'vitest'
import { renderFrame } from './renderer'
import { mkGame } from './logic'
import { COLORS, LEVEL_UP_MS, BUILDING_ANIM_MS } from './constants'
import type { Game } from './types'

/** Minimal mock of CanvasRenderingContext2D for smoke testing. */
function mockCtx(): CanvasRenderingContext2D {
  const noop = vi.fn()
  const gradient = { addColorStop: noop }
  return {
    save: noop, restore: noop, scale: noop, translate: noop,
    clearRect: noop, fillRect: noop,
    beginPath: noop, closePath: noop, moveTo: noop, lineTo: noop,
    quadraticCurveTo: noop, arc: noop, ellipse: noop, rect: noop,
    fill: noop, stroke: noop, clip: noop,
    fillText: noop, strokeText: noop,
    drawImage: noop,
    createLinearGradient: vi.fn(() => gradient),
    // Settable properties
    fillStyle: '', strokeStyle: '', lineWidth: 0,
    font: '', textAlign: '', textBaseline: '', globalAlpha: 1,
  } as unknown as CanvasRenderingContext2D
}

const CELL = 20

describe('renderFrame', () => {
  it('does not throw with fresh game state', () => {
    const ctx = mockCtx()
    const g = mkGame()
    expect(() => renderFrame(ctx, g, 0, CELL, 1)).not.toThrow()
  })

  it('does not throw with falling planks', () => {
    const ctx = mockCtx()
    const g = mkGame()
    g.planks.push({ id: 1, len: 3, x: 4, y: 100 })
    g.planks.push({ id: 2, len: 5, x: 5, y: 200 })
    expect(() => renderFrame(ctx, g, 500, CELL, 2)).not.toThrow()
  })

  it('does not throw with active shot animations', () => {
    const ctx = mockCtx()
    const g = mkGame()
    const phases = ['rising', 'flying', 'wrong_flash', 'falling'] as const
    for (const phase of phases) {
      g.shots = [{
        id: 1, shotLen: 3, shotColor: COLORS[3],
        targetLen: 7, targetColor: COLORS[7],
        col: 4, charCol: 4, phase, phaseStart: 0,
        targetY: 100, stackIdx: 0, hit: phase === 'flying',
      }]
      expect(() => renderFrame(ctx, g, 400, CELL, 1)).not.toThrow()
    }
  })

  it('does not throw with FX particles', () => {
    const ctx = mockCtx()
    const g = mkGame()
    g.fx.push({ id: 1, text: '+10', x: 100, y: 200, t0: 0, ok: true })
    g.fx.push({ id: 2, text: '-1', x: 150, y: 300, t0: 0, ok: false })
    expect(() => renderFrame(ctx, g, 500, CELL, 1)).not.toThrow()
  })

  it('does not throw during level-up overlay', () => {
    const ctx = mockCtx()
    const g = mkGame()
    g.level = 2
    g.levelUpUntil = LEVEL_UP_MS + 100
    expect(() => renderFrame(ctx, g, 100, CELL, 1)).not.toThrow()
  })

  it('does not throw during building animation', () => {
    const ctx = mockCtx()
    const g = mkGame()
    g.buildingLevel = 3
    g.buildingUntil = BUILDING_ANIM_MS + 100
    // Test all 3 phases of building animation
    expect(() => renderFrame(ctx, g, 100, CELL, 1)).not.toThrow()     // phase 1: scatter
    expect(() => renderFrame(ctx, g, 1000, CELL, 1)).not.toThrow()    // phase 2: assembly
    expect(() => renderFrame(ctx, g, 3000, CELL, 1)).not.toThrow()    // phase 3: complete
  })

  it('does not throw with building + stack visible', () => {
    const ctx = mockCtx()
    const g = mkGame()
    g.buildingLevel = 2
    g.stack = ['#EF4444', '#3B82F6', '#22C55E']
    expect(() => renderFrame(ctx, g, 99999, CELL, 1)).not.toThrow()
  })

  it('renders hurt character without error', () => {
    const ctx = mockCtx()
    const g = mkGame()
    g.hurtUntil = 5000 // hurt state active at t < 5000
    expect(() => renderFrame(ctx, g, 4000, CELL, 1)).not.toThrow()
  })
})
