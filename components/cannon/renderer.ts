/**
 * Canvas rendering for Number Cannon.
 *
 * Pure drawing functions — reads game state, writes to canvas.
 * No game-state mutation happens here.
 */

import type { Game, Bar } from './types'
import { GRID_H, COLORS, CANNON_FILES } from './constants'
import { findTarget, barHeight, barWidth, cannonTier } from './logic'

// -- Helpers --

function rrect(c: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number) {
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

// -- Cannon Sprites --

const cannonImages: HTMLImageElement[] = []
if (typeof window !== 'undefined') {
  for (const name of CANNON_FILES) {
    const img = new Image()
    img.src = `/cannon/${name}.png`
    cannonImages.push(img)
  }
}

/** Draw the cannon turret at position (cx, groundY). */
function drawCannon(ctx: CanvasRenderingContext2D, cx: number, groundY: number, cell: number, tier: number) {
  const img = cannonImages[tier]
  if (img && img.complete && img.naturalWidth > 0) {
    // Sprite: draw centered on cx, bottom at groundY + cell (include ground row)
    const spriteW = Math.max(3, 2 + tier * 0.4) * cell
    const aspect = img.naturalHeight / img.naturalWidth
    const spriteH = spriteW * aspect
    ctx.drawImage(img, cx - spriteW / 2, groundY + cell - spriteH, spriteW, spriteH)
    return
  }
  // Fallback: procedural cannon
  const w = cell * 0.6
  const h = cell * 0.8
  ctx.fillStyle = '#475569'
  rrect(ctx, cx - w / 2, groundY - h, w, h, 4)
  ctx.fill()
  const barrelW = cell * 0.2
  const barrelH = cell * 0.5
  ctx.fillStyle = '#334155'
  ctx.fillRect(cx - barrelW / 2, groundY - h - barrelH, barrelW, barrelH)
  ctx.fillStyle = '#F59E0B'
  ctx.beginPath()
  ctx.arc(cx, groundY - h - barrelH, barrelW * 0.6, 0, Math.PI * 2)
  ctx.fill()
  ctx.fillStyle = '#1E293B'
  ctx.beginPath()
  ctx.arc(cx - w * 0.3, groundY, cell * 0.12, 0, Math.PI * 2)
  ctx.arc(cx + w * 0.3, groundY, cell * 0.12, 0, Math.PI * 2)
  ctx.fill()
}

/** Draw a single column of cells with grid dividers and number label. */
function drawColumn(
  ctx: CanvasRenderingContext2D,
  x: number, y: number, w: number,
  numCells: number, cell: number, color: string,
) {
  const h = numCells * cell
  // Shadow
  ctx.fillStyle = 'rgba(0,0,0,0.06)'
  rrect(ctx, x + 1, y + 1, w, h, 3); ctx.fill()
  // Fill
  ctx.fillStyle = color
  rrect(ctx, x, y, w, h, 3); ctx.fill()
  // Border
  ctx.strokeStyle = 'rgba(0,0,0,0.12)'; ctx.lineWidth = 1
  rrect(ctx, x, y, w, h, 3); ctx.stroke()
  // Grid dividers
  ctx.strokeStyle = 'rgba(255,255,255,0.4)'; ctx.lineWidth = 1
  for (let i = 1; i < numCells; i++) {
    const ly = y + i * cell
    ctx.beginPath(); ctx.moveTo(x + 1, ly); ctx.lineTo(x + w - 1, ly); ctx.stroke()
  }
  // Number label
  const fs = Math.min(w * 0.7, h * 0.35)
  ctx.font = `bold ${fs}px Arial`
  ctx.textAlign = 'center'; ctx.textBaseline = 'middle'
  ctx.strokeStyle = 'rgba(0,0,0,0.2)'; ctx.lineWidth = 2
  ctx.strokeText(String(numCells), x + w / 2, y + h / 2)
  ctx.fillStyle = '#fff'
  ctx.fillText(String(numCells), x + w / 2, y + h / 2)
}

/** Draw a two-column split bar (partA | partB) occupying 2 grid columns, with hint below.
 *  The two halves are flush against each other with no gap, using clipping for flat inner edges. */
function drawSplitBar(
  ctx: CanvasRenderingContext2D,
  bar: Bar, x: number, y: number, cell: number, pad: number,
) {
  const colW = cell - pad          // each half: pad on outer edge only
  const midX = x + colW            // where the two halves meet
  const colorA = COLORS[bar.partA] || '#888'
  const colorB = COLORS[bar.partB] || '#888'
  const hA = bar.partA * cell
  const hB = bar.partB * cell
  const r = 3

  // -- Left half (rounded left, flat right via clipping) --
  ctx.save()
  ctx.beginPath(); ctx.rect(x - 1, y - 1, colW + 1, hA + 2); ctx.clip()
  ctx.fillStyle = 'rgba(0,0,0,0.06)'
  rrect(ctx, x + 1, y + 1, colW + r, hA, r); ctx.fill()
  ctx.fillStyle = colorA
  rrect(ctx, x, y, colW + r, hA, r); ctx.fill()
  ctx.strokeStyle = 'rgba(0,0,0,0.12)'; ctx.lineWidth = 1
  rrect(ctx, x, y, colW + r, hA, r); ctx.stroke()
  ctx.restore()

  // Left grid dividers
  ctx.strokeStyle = 'rgba(255,255,255,0.4)'; ctx.lineWidth = 1
  for (let i = 1; i < bar.partA; i++) {
    const ly = y + i * cell
    ctx.beginPath(); ctx.moveTo(x + 1, ly); ctx.lineTo(midX, ly); ctx.stroke()
  }
  // Left number label
  const fsA = Math.min(colW * 0.7, hA * 0.35)
  ctx.font = `bold ${fsA}px Arial`
  ctx.textAlign = 'center'; ctx.textBaseline = 'middle'
  ctx.strokeStyle = 'rgba(0,0,0,0.2)'; ctx.lineWidth = 2
  ctx.strokeText(String(bar.partA), x + colW / 2, y + hA / 2)
  ctx.fillStyle = '#fff'
  ctx.fillText(String(bar.partA), x + colW / 2, y + hA / 2)

  // -- Right half (flat left, rounded right via clipping) --
  ctx.save()
  ctx.beginPath(); ctx.rect(midX, y - 1, colW + 1, hB + 2); ctx.clip()
  ctx.fillStyle = 'rgba(0,0,0,0.06)'
  rrect(ctx, midX - r + 1, y + 1, colW + r, hB, r); ctx.fill()
  ctx.fillStyle = colorB
  rrect(ctx, midX - r, y, colW + r, hB, r); ctx.fill()
  ctx.strokeStyle = 'rgba(0,0,0,0.12)'; ctx.lineWidth = 1
  rrect(ctx, midX - r, y, colW + r, hB, r); ctx.stroke()
  ctx.restore()

  // Right grid dividers
  ctx.strokeStyle = 'rgba(255,255,255,0.4)'; ctx.lineWidth = 1
  for (let i = 1; i < bar.partB; i++) {
    const ly = y + i * cell
    ctx.beginPath(); ctx.moveTo(midX, ly); ctx.lineTo(midX + colW - 1, ly); ctx.stroke()
  }
  // Right number label
  const fsB = Math.min(colW * 0.7, hB * 0.35)
  ctx.font = `bold ${fsB}px Arial`
  ctx.textAlign = 'center'; ctx.textBaseline = 'middle'
  ctx.strokeStyle = 'rgba(0,0,0,0.2)'; ctx.lineWidth = 2
  ctx.strokeText(String(bar.partB), midX + colW / 2, y + hB / 2)
  ctx.fillStyle = '#fff'
  ctx.fillText(String(bar.partB), midX + colW / 2, y + hB / 2)

  // Vertical divider between halves (in overlapping height region)
  const minH = Math.min(hA, hB)
  ctx.strokeStyle = 'rgba(255,255,255,0.3)'; ctx.lineWidth = 1
  ctx.beginPath(); ctx.moveTo(midX, y); ctx.lineTo(midX, y + minH); ctx.stroke()

  // "+" between columns at mid-height of shorter column
  const plusSize = cell * 0.4
  ctx.font = `bold ${plusSize}px Arial`
  ctx.textAlign = 'center'; ctx.textBaseline = 'middle'
  ctx.fillStyle = 'rgba(255,255,255,0.9)'
  ctx.strokeStyle = 'rgba(0,0,0,0.4)'; ctx.lineWidth = 1.5
  ctx.strokeText('+', midX, y + minH / 2)
  ctx.fillText('+', midX, y + minH / 2)

  // Hint below bar: "partA + partB = ?"
  const bh = barHeight(bar) * cell
  const totalW = 2 * colW
  const hintFs = Math.min(totalW * 0.2, cell * 0.38)
  ctx.font = `bold ${hintFs}px Arial`
  ctx.textAlign = 'center'; ctx.textBaseline = 'top'
  ctx.strokeStyle = 'rgba(0,0,0,0.4)'; ctx.lineWidth = 1.5
  const hintText = `${bar.partA}+${bar.partB}=?`
  ctx.strokeText(hintText, midX, y + bh + 2)
  ctx.fillStyle = '#fff'
  ctx.fillText(hintText, midX, y + bh + 2)
}

/** Draw a single-segment remainder bar (1 column wide). */
function drawRemainderBar(
  ctx: CanvasRenderingContext2D,
  bar: Bar, x: number, y: number, cell: number, pad: number,
) {
  const w = cell - pad * 2
  const color = COLORS[bar.total] || '#888'
  drawColumn(ctx, x, y, w, bar.total, cell, color)
}

// -- Main Render --

export function renderFrame(
  ctx: CanvasRenderingContext2D, g: Game, t: number,
  cell: number, dpr: number, gridW: number,
) {
  const cw = cell * gridW
  const ch = cell * GRID_H
  const groundY = (GRID_H - 1) * cell
  const pad = cell * 0.08

  ctx.save()
  ctx.scale(dpr, dpr)
  ctx.clearRect(0, 0, cw, ch)

  // Sky gradient
  const sky = ctx.createLinearGradient(0, 0, 0, ch)
  sky.addColorStop(0, '#7EC8E3'); sky.addColorStop(1, '#D4F1F9')
  ctx.fillStyle = sky; ctx.fillRect(0, 0, cw, ch)

  // Grid lines
  ctx.strokeStyle = 'rgba(255,255,255,0.18)'; ctx.lineWidth = 1
  for (let i = 1; i < gridW; i++) {
    ctx.beginPath()
    ctx.moveTo(i * cell, 0); ctx.lineTo(i * cell, groundY)
    ctx.stroke()
  }

  // Ground
  ctx.fillStyle = '#8B5E3C'; ctx.fillRect(0, groundY, cw, cell)
  ctx.fillStyle = '#6BBF59'; ctx.fillRect(0, groundY, cw, cell * 0.2)

  // Column highlight under cannon
  ctx.fillStyle = 'rgba(255,255,100,0.08)'
  ctx.fillRect(g.cannonX * cell, 0, cell, groundY)

  // Falling bars (hint drawn as part of each bar)
  for (const b of g.bars) {
    const bx = b.x * cell + pad
    if (b.partA > 0 && b.partB > 0) {
      drawSplitBar(ctx, b, bx, b.y, cell, pad)
    } else {
      drawRemainderBar(ctx, b, bx, b.y, cell, pad)
    }
  }

  // Shot animations
  for (const s of g.shots) {
    const elapsed = t - s.phaseStart
    const gx = s.col * cell
    const tbw = barWidth(s.targetBar)
    const pw = tbw * cell - pad * 2

    if (s.phase === 'rising') {
      const progress = Math.min(elapsed / 500, 1)
      const eased = 1 - Math.pow(1 - progress, 3)

      // Frozen target bar
      const bar = s.targetBar
      const bx = gx + pad
      if (bar.partA > 0 && bar.partB > 0) {
        drawSplitBar(ctx, bar, bx, s.targetY, cell, pad)
      } else {
        drawRemainderBar(ctx, bar, bx, s.targetY, cell, pad)
      }

      // Rising projectile (circle with number)
      const startY = groundY - cell * 1.5
      const endY = s.targetY + barHeight(s.targetBar) * cell
      const projY = startY + (endY - startY) * eased
      const startX = (s.charCol + 0.5) * cell
      const endX = (s.col + tbw / 2) * cell
      const projX = startX + (endX - startX) * eased
      const projR = cell * 0.3

      ctx.fillStyle = COLORS[s.num] || '#888'
      ctx.beginPath(); ctx.arc(projX, projY, projR, 0, Math.PI * 2); ctx.fill()
      ctx.strokeStyle = 'rgba(0,0,0,0.2)'; ctx.lineWidth = 1.5; ctx.stroke()
      const fs = Math.max(projR * 0.9, 10)
      ctx.font = `bold ${fs}px Arial`
      ctx.textAlign = 'center'; ctx.textBaseline = 'middle'
      ctx.fillStyle = '#fff'
      ctx.fillText(String(s.num), projX, projY)
    }

    if (s.phase === 'hit') {
      const progress = Math.min(elapsed / 300, 1)
      const cx = (s.col + tbw / 2) * cell
      const cy = s.targetY + barHeight(s.targetBar) * cell / 2

      ctx.globalAlpha = 1 - progress
      ctx.strokeStyle = '#FFD700'; ctx.lineWidth = 3
      ctx.beginPath()
      ctx.arc(cx, cy, cell * (0.5 + progress * 1.5), 0, Math.PI * 2)
      ctx.stroke()

      for (let i = 0; i < 6; i++) {
        const angle = (i / 6) * Math.PI * 2 + elapsed * 0.01
        const dist = cell * progress * 1.5
        const sx = cx + Math.cos(angle) * dist
        const sy = cy + Math.sin(angle) * dist
        ctx.fillStyle = '#FFD700'
        ctx.beginPath(); ctx.arc(sx, sy, 2 + (1 - progress) * 2, 0, Math.PI * 2); ctx.fill()
      }
      ctx.globalAlpha = 1
    }

    if (s.phase === 'miss') {
      const bh = barHeight(s.targetBar) * cell
      const flash = Math.sin(elapsed / 80 * Math.PI)
      ctx.globalAlpha = 0.6 + 0.4 * Math.abs(flash)
      ctx.fillStyle = '#EF4444'
      rrect(ctx, gx + pad, s.targetY, pw, bh, 4); ctx.fill()
      ctx.globalAlpha = 1

      const fs = Math.min(pw * 0.5, bh * 0.25)
      ctx.font = `bold ${fs}px Arial`
      ctx.textAlign = 'center'; ctx.textBaseline = 'middle'
      ctx.fillStyle = '#fff'
      ctx.fillText(`${s.num} ✗`, gx + tbw * cell / 2, s.targetY + bh / 2)
    }
  }

  // Cannon
  const tier = cannonTier(g.level)
  const isHurt = t < g.hurtUntil
  const cannonCx = (g.cannonX + 0.5) * cell
  if (isHurt) {
    const shake = Math.sin(t * 0.03) * 2
    drawCannon(ctx, cannonCx + shake, groundY, cell, tier)
  } else {
    drawCannon(ctx, cannonCx, groundY, cell, tier)
  }

  // FX text
  for (const f of g.fx) {
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

  // Level-up overlay
  if (t < g.levelUpUntil) {
    const elapsed = g.levelUpUntil - t
    const total = 2000
    const progress = 1 - elapsed / total
    ctx.fillStyle = `rgba(0,0,0,${0.4 * (1 - progress)})`
    ctx.fillRect(0, 0, cw, ch)

    const scale = 0.5 + 0.5 * Math.min(1, progress * 3)
    const textY = ch * 0.35
    ctx.save()
    ctx.translate(cw / 2, textY)
    ctx.scale(scale, scale)
    ctx.font = `bold ${cell * 1.5}px Arial`
    ctx.textAlign = 'center'; ctx.textBaseline = 'middle'
    ctx.strokeStyle = '#fff'; ctx.lineWidth = 4
    ctx.strokeText('LEVEL UP!', 0, 0)
    ctx.fillStyle = '#FFD700'
    ctx.fillText('LEVEL UP!', 0, 0)
    ctx.font = `bold ${cell * 0.8}px Arial`
    ctx.strokeText(`Level ${g.level}`, 0, cell * 1.8)
    ctx.fillStyle = '#fff'
    ctx.fillText(`Level ${g.level}`, 0, cell * 1.8)
    ctx.restore()

    // Orbiting stars
    for (let i = 0; i < 5; i++) {
      const angle = (i / 5) * Math.PI * 2 + progress * Math.PI * 4
      const dist = cell * 3
      const sx = cw / 2 + Math.cos(angle) * dist
      const sy = textY + Math.sin(angle) * dist * 0.5
      ctx.fillStyle = '#FFD700'
      ctx.globalAlpha = 1 - progress
      ctx.beginPath(); ctx.arc(sx, sy, cell * 0.15, 0, Math.PI * 2); ctx.fill()
    }
    ctx.globalAlpha = 1
  }

  ctx.restore()
}
