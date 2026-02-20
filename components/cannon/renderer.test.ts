import { describe, it, expect, vi } from 'vitest'
import { renderFrame } from './renderer'
import { mkGame, gridWidth } from './logic'
import { COLORS } from './constants'

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
    fillStyle: '', strokeStyle: '', lineWidth: 0,
    font: '', textAlign: '', textBaseline: '', globalAlpha: 1,
  } as unknown as CanvasRenderingContext2D
}

const CELL = 20

describe('renderFrame', () => {
  it('does not throw with fresh game state', () => {
    const ctx = mockCtx()
    const g = mkGame()
    expect(() => renderFrame(ctx, g, 0, CELL, 1, gridWidth(g.level))).not.toThrow()
  })

  it('does not throw with split bars', () => {
    const ctx = mockCtx()
    const g = mkGame()
    g.bars.push({ id: 1, total: 7, partA: 3, partB: 4, x: 2, y: 100 })
    g.bars.push({ id: 2, total: 5, partA: 2, partB: 3, x: 4, y: 200 })
    expect(() => renderFrame(ctx, g, 500, CELL, 2, gridWidth(g.level))).not.toThrow()
  })

  it('does not throw with remainder bars', () => {
    const ctx = mockCtx()
    const g = mkGame()
    g.bars.push({ id: 1, total: 3, partA: 0, partB: 0, x: 1, y: 150 })
    expect(() => renderFrame(ctx, g, 500, CELL, 1, gridWidth(g.level))).not.toThrow()
  })

  it('does not throw with active shot animations', () => {
    const ctx = mockCtx()
    const g = mkGame()
    const phases = ['rising', 'hit', 'miss'] as const
    for (const phase of phases) {
      g.shots = [{
        id: 1, num: 7, col: 3, charCol: 3,
        phase, phaseStart: 0,
        targetY: 100,
        targetBar: { id: 99, total: 7, partA: 3, partB: 4, x: 3, y: 100 },
        exact: phase === 'hit',
      }]
      expect(() => renderFrame(ctx, g, 400, CELL, 1, gridWidth(g.level))).not.toThrow()
    }
  })

  it('does not throw with FX particles', () => {
    const ctx = mockCtx()
    const g = mkGame()
    g.fx.push({ id: 1, text: '7!', x: 100, y: 200, t0: 0, ok: true })
    g.fx.push({ id: 2, text: '-1', x: 150, y: 300, t0: 0, ok: false })
    expect(() => renderFrame(ctx, g, 500, CELL, 1, gridWidth(g.level))).not.toThrow()
  })

  it('renders hurt cannon without error', () => {
    const ctx = mockCtx()
    const g = mkGame()
    g.hurtUntil = 5000
    expect(() => renderFrame(ctx, g, 4000, CELL, 1, gridWidth(g.level))).not.toThrow()
  })

  it('does not throw during level-up overlay', () => {
    const ctx = mockCtx()
    const g = mkGame()
    g.level = 3
    g.levelUpUntil = 5000
    expect(() => renderFrame(ctx, g, 4000, CELL, 1, gridWidth(g.level))).not.toThrow()
  })
})
