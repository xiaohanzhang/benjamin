/**
 * Shared canvas rendering utilities for arcade-style games.
 */

import type { Fx, BaseGame } from './types'

/** Draw a rounded rectangle path (does not fill or stroke). */
export function rrect(c: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number) {
  r = Math.min(r, w / 2, h / 2)
  c.beginPath()
  c.moveTo(x + r, y); c.lineTo(x + w - r, y)
  c.quadraticCurveTo(x + w, y, x + w, y + r)
  c.lineTo(x + w, y + h - r)
  c.quadraticCurveTo(x + w, y + h, x + w - r, y + h)
  c.lineTo(x + r, y + h)
  c.quadraticCurveTo(x, y + h, x, y + h - r)
  c.lineTo(x, y + r)
  c.quadraticCurveTo(x, y, x + r, y)
  c.closePath()
}

/** Draw the sky gradient background. */
export function drawSky(ctx: CanvasRenderingContext2D, cw: number, ch: number) {
  const sky = ctx.createLinearGradient(0, 0, 0, ch)
  sky.addColorStop(0, '#7EC8E3'); sky.addColorStop(1, '#D4F1F9')
  ctx.fillStyle = sky; ctx.fillRect(0, 0, cw, ch)
}

/** Draw the ground row. */
export function drawGround(ctx: CanvasRenderingContext2D, cw: number, groundY: number, cell: number) {
  ctx.fillStyle = '#8B5E3C'; ctx.fillRect(0, groundY, cw, cell)
  ctx.fillStyle = '#6BBF59'; ctx.fillRect(0, groundY, cw, cell * 0.2)
}

/** Draw vertical grid lines in the active area. */
export function drawGridLines(
  ctx: CanvasRenderingContext2D,
  gridW: number, groundY: number, cell: number,
  offsetX = 0,
) {
  ctx.strokeStyle = 'rgba(255,255,255,0.18)'; ctx.lineWidth = 1
  for (let i = 1; i < gridW; i++) {
    ctx.beginPath()
    ctx.moveTo(offsetX + i * cell, 0)
    ctx.lineTo(offsetX + i * cell, groundY)
    ctx.stroke()
  }
}

/** Draw column highlight under the player/cannon. */
export function drawColumnHighlight(
  ctx: CanvasRenderingContext2D,
  col: number, groundY: number, cell: number,
  offsetX = 0,
) {
  ctx.fillStyle = 'rgba(255,255,100,0.08)'
  ctx.fillRect(offsetX + col * cell, 0, cell, groundY)
}

/** Draw floating FX text (score popups, hit/miss feedback). */
export function drawFx(ctx: CanvasRenderingContext2D, fxList: Fx[], t: number, cell: number) {
  for (const f of fxList) {
    const age = (t - f.t0) / 1500
    if (age >= 1) continue
    ctx.globalAlpha = 1 - age
    ctx.font = `bold ${cell * 0.5}px Arial`
    ctx.textAlign = 'center'; ctx.textBaseline = 'middle'
    ctx.strokeStyle = '#fff'; ctx.lineWidth = 3
    const fy = f.y - age * 60
    ctx.strokeText(f.text, f.x, fy)
    ctx.fillStyle = f.ok ? '#16A34A' : '#DC2626'
    ctx.fillText(f.text, f.x, fy)
    ctx.globalAlpha = 1
  }
}

/** Draw level-up celebration overlay. */
export function drawLevelUpOverlay(
  ctx: CanvasRenderingContext2D,
  g: BaseGame, t: number, cell: number,
  cw: number, ch: number, levelUpMs = 2000,
) {
  if (t >= g.levelUpUntil) return

  const elapsed = levelUpMs - (g.levelUpUntil - t)
  const progress = Math.min(elapsed / levelUpMs, 1)

  // Darken background
  ctx.fillStyle = `rgba(0,0,0,${0.3 * Math.min(1, progress * 3)})`
  ctx.fillRect(0, 0, cw, ch)

  // Bounce-in scale
  const scaleT = Math.min(elapsed / 400, 1)
  const scale = scaleT < 1
    ? 1 + 0.3 * Math.sin(scaleT * Math.PI)
    : 1 + 0.05 * Math.sin((elapsed - 400) / 150)

  // Fade out near end
  const alpha = progress > 0.7 ? 1 - (progress - 0.7) / 0.3 : 1
  ctx.globalAlpha = alpha

  ctx.save()
  const cx = cw / 2
  const cy = ch * 0.4
  ctx.translate(cx, cy)
  ctx.scale(scale, scale)

  // "LEVEL UP!" text
  ctx.font = `bold ${cell * 1.8}px Arial`
  ctx.textAlign = 'center'; ctx.textBaseline = 'middle'
  ctx.strokeStyle = 'rgba(0,0,0,0.3)'; ctx.lineWidth = 4
  ctx.strokeText('LEVEL UP!', 0, 0)
  ctx.fillStyle = '#FFD700'
  ctx.fillText('LEVEL UP!', 0, 0)

  // Level number
  ctx.font = `bold ${cell * 1.2}px Arial`
  ctx.fillStyle = '#fff'
  ctx.strokeStyle = 'rgba(0,0,0,0.3)'; ctx.lineWidth = 3
  ctx.strokeText(`Level ${g.level}`, 0, cell * 2)
  ctx.fillText(`Level ${g.level}`, 0, cell * 2)

  // Stars
  const starCount = 6
  for (let i = 0; i < starCount; i++) {
    const angle = (i / starCount) * Math.PI * 2 + elapsed * 0.002
    const dist = cell * 3 + Math.sin(elapsed * 0.003 + i) * cell * 0.5
    const sx = Math.cos(angle) * dist
    const sy = Math.sin(angle) * dist
    ctx.font = `${cell * 0.8}px Arial`
    ctx.fillText('\u2B50', sx - cell * 0.4, sy + cell * 0.3)
  }

  ctx.restore()
  ctx.globalAlpha = 1
}
