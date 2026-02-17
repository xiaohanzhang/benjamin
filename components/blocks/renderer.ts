/**
 * Canvas rendering for Making 10.
 *
 * Pure drawing functions — reads game state, writes to canvas.
 * No game-state mutation happens here.
 */

import type { Game } from './types'
import {
  MAX_GRID_W, GRID_H, STACK_PLANK_COLS,
  PLANKS_PER_BUILDING, BUILDING_ANIM_MS, LEVEL_UP_MS,
  BUILDING_NAMES, BUILDING_SIZES, COLORS,
} from './constants'
import { activeStart, gridWidth, stackCells, findTarget } from './logic'

// ── Helpers ──────────────────────────────────────────────────

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

function drawChar(ctx: CanvasRenderingContext2D, cx: number, groundY: number, cell: number, hurt: boolean) {
  const r = cell * 0.28
  const headY = groundY - cell * 0.65
  ctx.fillStyle = '#4CAF50'
  rrect(ctx, cx - cell * 0.2, groundY - cell * 0.42, cell * 0.4, cell * 0.4, 3)
  ctx.fill()
  ctx.fillStyle = '#FFD93D'
  ctx.beginPath(); ctx.arc(cx, headY, r, 0, Math.PI * 2); ctx.fill()
  ctx.strokeStyle = '#E8A800'; ctx.lineWidth = 1.5; ctx.stroke()
  if (hurt) {
    // Crying eyes: small arcs
    ctx.strokeStyle = '#333'; ctx.lineWidth = 1.2
    ctx.beginPath()
    ctx.arc(cx - r * 0.35, headY - r * 0.05, r * 0.15, 0, Math.PI)
    ctx.stroke()
    ctx.beginPath()
    ctx.arc(cx + r * 0.35, headY - r * 0.05, r * 0.15, 0, Math.PI)
    ctx.stroke()
    // Tears
    ctx.fillStyle = '#60A5FA'
    ctx.beginPath()
    ctx.ellipse(cx - r * 0.5, headY + r * 0.25, r * 0.06, r * 0.15, 0, 0, Math.PI * 2)
    ctx.fill()
    ctx.beginPath()
    ctx.ellipse(cx + r * 0.5, headY + r * 0.3, r * 0.06, r * 0.15, 0, 0, Math.PI * 2)
    ctx.fill()
    // Frown
    ctx.strokeStyle = '#333'; ctx.lineWidth = 1.2
    ctx.beginPath()
    ctx.arc(cx, headY + r * 0.45, r * 0.3, 1.15 * Math.PI, 1.85 * Math.PI)
    ctx.stroke()
  } else {
    // Normal eyes
    ctx.fillStyle = '#333'
    ctx.beginPath()
    ctx.arc(cx - r * 0.35, headY - r * 0.1, r * 0.12, 0, Math.PI * 2)
    ctx.arc(cx + r * 0.35, headY - r * 0.1, r * 0.12, 0, Math.PI * 2)
    ctx.fill()
    // Smile
    ctx.strokeStyle = '#333'; ctx.lineWidth = 1.2
    ctx.beginPath()
    ctx.arc(cx, headY + r * 0.05, r * 0.35, 0.15 * Math.PI, 0.85 * Math.PI)
    ctx.stroke()
  }
}

// ── Building Images ──────────────────────────────────────────
// Preload PNGs from /blocks/ and render via drawImage.
const BUILDING_FILES = ['shack', 'cabin', 'house', 'villa', 'mansion', 'estate', 'castle']
const buildingImages: HTMLImageElement[] = []
if (typeof window !== 'undefined') {
  for (const name of BUILDING_FILES) {
    const img = new Image()
    img.src = `/blocks/${name}.png`
    buildingImages.push(img)
  }
}

function drawBuilding(ctx: CanvasRenderingContext2D, level: number, x: number, groundY: number, w: number, h: number) {
  if (level <= 0 || level > 7) return
  const img = buildingImages[level - 1]
  if (img && img.complete && img.naturalWidth > 0) {
    ctx.drawImage(img, x, groundY - h, w, h)
  }
}

/** Draw a plank with grid-cell dividers. Vertical orientation: w is 1 cell wide, h = len * cell. */
function drawGridPlank(
  ctx: CanvasRenderingContext2D,
  x: number, y: number, w: number, h: number,
  len: number, color: string, r: number,
) {
  // Shadow
  ctx.fillStyle = 'rgba(0,0,0,0.06)'
  rrect(ctx, x + 2, y + 2, w, h, r); ctx.fill()
  // Fill
  ctx.fillStyle = color
  rrect(ctx, x, y, w, h, r); ctx.fill()
  // Border
  ctx.strokeStyle = 'rgba(0,0,0,0.12)'; ctx.lineWidth = 1
  rrect(ctx, x, y, w, h, r); ctx.stroke()
  // Grid dividers between cells
  const cellH = h / len
  ctx.strokeStyle = 'rgba(255,255,255,0.4)'; ctx.lineWidth = 1
  for (let i = 1; i < len; i++) {
    const ly = y + i * cellH
    ctx.beginPath(); ctx.moveTo(x + 2, ly); ctx.lineTo(x + w - 2, ly); ctx.stroke()
  }
  // Number label
  const fontSize = Math.min(w * 0.7, cellH * 0.6)
  ctx.font = `bold ${fontSize}px Arial`
  ctx.textAlign = 'center'; ctx.textBaseline = 'middle'
  ctx.strokeStyle = 'rgba(0,0,0,0.2)'; ctx.lineWidth = 2
  ctx.strokeText(String(len), x + w / 2, y + h / 2)
  ctx.fillStyle = '#fff'
  ctx.fillText(String(len), x + w / 2, y + h / 2)
}

// ── Main Render ──────────────────────────────────────────────

export function renderFrame(ctx: CanvasRenderingContext2D, g: Game, t: number, cell: number, dpr: number) {
  const gw = gridWidth(g.level)
  const as = activeStart(g.level)
  const sc = stackCells(g.buildingLevel)
  const totalCols = sc + MAX_GRID_W
  const cw = cell * totalCols
  const ch = cell * GRID_H
  const gridOffX = sc * cell
  const groundY = (GRID_H - 1) * cell
  const stackItemH = cell * 0.4
  const stackW = cell * STACK_PLANK_COLS * 0.75
  // Stack planks go in the rightmost STACK_PLANK_COLS of the stack area
  const stackX = gridOffX - STACK_PLANK_COLS * cell + (STACK_PLANK_COLS * cell - stackW) / 2
  const pad = cell * 0.08

  const levelingUp = t < g.levelUpUntil
  const buildingUp = t < g.buildingUntil

  ctx.save()
  ctx.scale(dpr, dpr)
  ctx.clearRect(0, 0, cw, ch)

  // Sky
  const sky = ctx.createLinearGradient(0, 0, 0, ch)
  sky.addColorStop(0, '#7EC8E3'); sky.addColorStop(1, '#D4F1F9')
  ctx.fillStyle = sky; ctx.fillRect(0, 0, cw, ch)

  // Stack area background
  ctx.fillStyle = 'rgba(0,0,0,0.04)'
  ctx.fillRect(0, 0, gridOffX, ch)

  // Divider
  ctx.strokeStyle = 'rgba(0,0,0,0.1)'; ctx.lineWidth = 1
  ctx.beginPath(); ctx.moveTo(gridOffX, 0); ctx.lineTo(gridOffX, groundY); ctx.stroke()

  // Dark overlay on inactive columns (left side)
  if (as > 0) {
    ctx.fillStyle = 'rgba(0,0,0,0.75)'
    ctx.fillRect(gridOffX, 0, as * cell, groundY)
  }
  // Dark overlay on inactive columns (right side)
  if (as + gw < MAX_GRID_W) {
    ctx.fillStyle = 'rgba(0,0,0,0.75)'
    ctx.fillRect(gridOffX + (as + gw) * cell, 0, (MAX_GRID_W - as - gw) * cell, groundY)
  }

  // Grid lines (active area only)
  ctx.strokeStyle = 'rgba(255,255,255,0.18)'; ctx.lineWidth = 1
  for (let i = as + 1; i < as + gw; i++) {
    ctx.beginPath()
    ctx.moveTo(gridOffX + i * cell, 0)
    ctx.lineTo(gridOffX + i * cell, groundY)
    ctx.stroke()
  }
  // Active area borders
  ctx.strokeStyle = 'rgba(255,255,255,0.3)'; ctx.lineWidth = 1.5
  ctx.beginPath()
  ctx.moveTo(gridOffX + as * cell, 0); ctx.lineTo(gridOffX + as * cell, groundY)
  ctx.moveTo(gridOffX + (as + gw) * cell, 0); ctx.lineTo(gridOffX + (as + gw) * cell, groundY)
  ctx.stroke()

  // Ground
  ctx.fillStyle = '#8B5E3C'; ctx.fillRect(0, groundY, cw, cell)
  ctx.fillStyle = '#6BBF59'; ctx.fillRect(0, groundY, cw, cell * 0.2)

  // Column highlight
  ctx.fillStyle = 'rgba(255,255,100,0.08)'
  ctx.fillRect(gridOffX + g.charX * cell, 0, cell, groundY)

  // ── Building + Stack ──
  const buildMargin = cell * 0.3
  if (g.buildingLevel > 0 && !buildingUp) {
    const [bwu, bhu] = BUILDING_SIZES[g.buildingLevel - 1]
    const bw = bwu * cell, bh = bhu * cell
    const bx = buildMargin
    drawBuilding(ctx, g.buildingLevel, bx, groundY, bw, bh)
    // Building name label
    ctx.font = `bold ${Math.max(cell * 0.35, 8)}px Arial`
    ctx.textAlign = 'center'; ctx.textBaseline = 'bottom'
    ctx.fillStyle = '#5C3317'
    ctx.fillText(BUILDING_NAMES[g.buildingLevel - 1], bx + bw / 2, groundY - bh - 2)
  }
  // Stack planks
  for (let i = 0; i < g.stack.length; i++) {
    const sy = groundY - (i + 1) * stackItemH
    if (sy < 0) break
    ctx.fillStyle = g.stack[i]
    rrect(ctx, stackX, sy, stackW, stackItemH - 1, 2); ctx.fill()
    ctx.strokeStyle = 'rgba(0,0,0,0.1)'; ctx.lineWidth = 0.5
    rrect(ctx, stackX, sy, stackW, stackItemH - 1, 2); ctx.stroke()
  }
  if (g.stack.length > 0) {
    ctx.font = `bold ${cell * 0.4}px Arial`
    ctx.textAlign = 'center'; ctx.textBaseline = 'bottom'
    ctx.fillStyle = '#555'
    const topY = groundY - g.stack.length * stackItemH
    ctx.fillText(`${g.stack.length}/${PLANKS_PER_BUILDING}`, stackX + stackW / 2, topY - 4)
  }

  // ── Falling planks ──
  for (const p of g.planks) {
    const px = gridOffX + p.x * cell + pad
    const pw = cell - pad * 2
    const ph = p.len * cell
    drawGridPlank(ctx, px, p.y, pw, ph, p.len, COLORS[p.len], 4)
  }

  // ── Hint on targeted plank ──
  const tgt = findTarget(g, groundY, cell)
  if (tgt && g.shots.length === 0) {
    const hx = gridOffX + (tgt.x + 0.5) * cell
    const hy = tgt.y - 4
    ctx.font = `bold ${cell * 0.38}px Arial`
    ctx.textAlign = 'center'; ctx.textBaseline = 'bottom'
    ctx.strokeStyle = 'rgba(0,0,0,0.4)'; ctx.lineWidth = 2
    ctx.strokeText(`${tgt.len} + ? = 10`, hx, hy)
    ctx.fillStyle = '#fff'
    ctx.fillText(`${tgt.len} + ? = 10`, hx, hy)
  }

  // ── Shot animations ──
  for (const s of g.shots) {
    const elapsed = t - s.phaseStart
    const gx = gridOffX + s.col * cell
    const pw = cell - pad * 2

    if (s.phase === 'rising') {
      const progress = Math.min(elapsed / 700, 1)
      const eased = 1 - Math.pow(1 - progress, 3)

      // Frozen target plank
      drawGridPlank(ctx, gx + pad, s.targetY, pw, s.targetLen * cell, s.targetLen, s.targetColor, 4)

      // Rising shot plank
      const shotH = s.shotLen * cell
      const startTopY = groundY - cell * 0.5
      const endTopY = s.targetY + s.targetLen * cell
      const shotTopY = startTopY + (endTopY - startTopY) * eased
      const startX = gridOffX + s.charCol * cell + pad
      const endX = gx + pad
      const shotX = startX + (endX - startX) * eased

      drawGridPlank(ctx, shotX, shotTopY, pw, shotH, s.shotLen, s.shotColor, 4)
    }

    if (s.phase === 'flying') {
      const progress = Math.min(elapsed / 800, 1)
      const eased = 1 - Math.pow(1 - progress, 2)

      const fromX = gx + pad
      const fromY = s.targetY
      const fromH = 10 * cell
      const fromW = pw
      const toX = stackX
      const toY = groundY - (s.stackIdx + 1) * stackItemH
      const toH = stackItemH
      const toW = stackW

      const cx = fromX + (toX - fromX) * eased
      const cy = fromY + (toY - fromY) * eased
      const cw2 = fromW + (toW - fromW) * eased
      const ch2 = fromH + (toH - fromH) * eased

      if (progress < 0.2) {
        const glow = 1 - progress / 0.2
        ctx.globalAlpha = glow * 0.5
        ctx.fillStyle = '#FFD700'
        rrect(ctx, cx - 4, cy - 4, cw2 + 8, ch2 + 8, 6); ctx.fill()
        ctx.globalAlpha = 1
      }

      ctx.fillStyle = '#FFD700'
      rrect(ctx, cx, cy, cw2, ch2, 3); ctx.fill()

      if (ch2 > cell * 1.5) {
        const labelAlpha = Math.max(0, 1 - eased * 1.5)
        if (labelAlpha > 0) {
          ctx.globalAlpha = labelAlpha
          ctx.font = `bold ${Math.min(ch2 * 0.2, cw2 * 0.6)}px Arial`
          ctx.textAlign = 'center'; ctx.textBaseline = 'middle'
          ctx.fillStyle = '#fff'
          ctx.fillText('10', cx + cw2 / 2, cy + ch2 / 2)
          ctx.globalAlpha = 1
        }
      }
    }

    if (s.phase === 'wrong_flash') {
      const combinedH = (s.targetLen + s.shotLen) * cell
      const flash = Math.sin(elapsed / 80 * Math.PI)
      ctx.globalAlpha = 0.6 + 0.4 * Math.abs(flash)
      ctx.fillStyle = '#EF4444'
      rrect(ctx, gx + pad, s.targetY, pw, combinedH, 4); ctx.fill()
      ctx.globalAlpha = 1
      // Sum label
      const sum = s.targetLen + s.shotLen
      const fs = Math.min(pw * 0.6, combinedH * 0.2)
      ctx.font = `bold ${fs}px Arial`
      ctx.textAlign = 'center'; ctx.textBaseline = 'middle'
      ctx.fillStyle = '#fff'
      ctx.fillText(`${s.targetLen}+${s.shotLen}=${sum}`, gx + cell / 2, s.targetY + combinedH / 2)
    }

    if (s.phase === 'falling') {
      const progress = Math.min(elapsed / 500, 1)
      const eased = progress * progress // accelerating fall
      const combinedH = (s.targetLen + s.shotLen) * cell
      const startY = s.targetY
      const endY = groundY - cell * 0.3
      const cy = startY + (endY - startY) * eased

      ctx.fillStyle = '#EF4444'
      rrect(ctx, gx + pad, cy, pw, combinedH, 4); ctx.fill()
      const sum = s.targetLen + s.shotLen
      const fs = Math.min(pw * 0.6, combinedH * 0.2)
      ctx.font = `bold ${fs}px Arial`
      ctx.textAlign = 'center'; ctx.textBaseline = 'middle'
      ctx.fillStyle = '#fff'
      ctx.fillText(`${sum}`, gx + cell / 2, cy + combinedH / 2)
    }
  }

  // Character
  const isHurt = t < g.hurtUntil
  drawChar(ctx, gridOffX + (g.charX + 0.5) * cell, groundY, cell, isHurt)

  // Effects
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

  // Building animation overlay
  if (buildingUp) {
    const elapsed = BUILDING_ANIM_MS - (g.buildingUntil - t)
    const progress = Math.min(elapsed / BUILDING_ANIM_MS, 1)

    // Darken background
    ctx.fillStyle = `rgba(0,0,0,${0.35 * Math.min(1, progress * 4)})`
    ctx.fillRect(0, 0, cw, ch)

    const [bwu, bhu] = BUILDING_SIZES[g.buildingLevel - 1]
    const abw = bwu * cell, abh = bhu * cell
    const abx = buildMargin

    if (elapsed < 600) {
      // Phase 1: Planks shimmer/scatter
      const phase1 = elapsed / 600
      const plankCount = 8
      for (let i = 0; i < plankCount; i++) {
        const angle = (i / plankCount) * Math.PI * 2 + elapsed * 0.005
        const scatter = (1 - phase1) * cell * 2
        const px = abx + abw / 2 + Math.cos(angle) * scatter
        const py = groundY - abh / 2 + Math.sin(angle) * scatter
        const alpha = 0.3 + 0.7 * phase1
        ctx.globalAlpha = alpha
        ctx.fillStyle = '#A0522D'
        rrect(ctx, px - cell * 0.3, py - cell * 0.1, cell * 0.6, cell * 0.2, 2); ctx.fill()
        ctx.globalAlpha = 1
      }
    } else if (elapsed < 2500) {
      // Phase 2: Assembly — house builds bottom-up
      const phase2 = (elapsed - 600) / 1900
      ctx.save()
      ctx.beginPath()
      ctx.rect(abx - 5, groundY - abh * phase2, abw + 10, abh * phase2 + 5)
      ctx.clip()
      drawBuilding(ctx, g.buildingLevel, abx, groundY, abw, abh)
      ctx.restore()
      // Construction particles
      if (phase2 < 0.9) {
        const buildLine = groundY - abh * phase2
        for (let i = 0; i < 4; i++) {
          const sparkX = abx + Math.random() * abw
          const sparkY = buildLine + Math.random() * cell * 0.5
          ctx.fillStyle = `rgba(255,200,50,${0.5 + Math.random() * 0.5})`
          ctx.beginPath(); ctx.arc(sparkX, sparkY, 1.5 + Math.random() * 1.5, 0, Math.PI * 2); ctx.fill()
        }
      }
    } else {
      // Phase 3: Complete house + name label bounce-in + sparkles
      const phase3 = (elapsed - 2500) / 1000
      const scaleT = Math.min(phase3 * 2, 1)
      const bounce = scaleT < 1
        ? 1 + 0.15 * Math.sin(scaleT * Math.PI)
        : 1

      const centerX = abx + abw / 2
      const centerY = groundY - abh / 2

      ctx.save()
      ctx.translate(centerX, centerY)
      ctx.scale(bounce, bounce)
      ctx.translate(-centerX, -centerY)
      drawBuilding(ctx, g.buildingLevel, abx, groundY, abw, abh)
      ctx.restore()

      // Name label
      const labelAlpha = Math.min(phase3 * 3, 1)
      ctx.globalAlpha = labelAlpha
      const labelScale = scaleT < 1 ? 0.8 + 0.2 * scaleT : 1
      ctx.save()
      ctx.translate(centerX, groundY - abh - cell * 0.4)
      ctx.scale(labelScale, labelScale)
      ctx.font = `bold ${cell * 0.45}px Arial`
      ctx.textAlign = 'center'; ctx.textBaseline = 'middle'
      ctx.strokeStyle = 'rgba(0,0,0,0.3)'; ctx.lineWidth = 3
      ctx.strokeText(BUILDING_NAMES[g.buildingLevel - 1], 0, 0)
      ctx.fillStyle = '#FFD700'
      ctx.fillText(BUILDING_NAMES[g.buildingLevel - 1], 0, 0)
      ctx.restore()
      ctx.globalAlpha = 1

      // Sparkles
      for (let i = 0; i < 6; i++) {
        const angle = (i / 6) * Math.PI * 2 + elapsed * 0.003
        const dist = Math.max(abw, abh) * 0.5 + Math.sin(elapsed * 0.004 + i) * cell * 0.3
        const sx = centerX + Math.cos(angle) * dist
        const sy = centerY + Math.sin(angle) * dist * 0.6
        const sparkAlpha = 0.5 + 0.5 * Math.sin(elapsed * 0.01 + i * 2)
        ctx.globalAlpha = sparkAlpha
        ctx.fillStyle = '#FFD700'
        ctx.beginPath(); ctx.arc(sx, sy, 2 + Math.sin(elapsed * 0.008 + i) * 1.5, 0, Math.PI * 2); ctx.fill()
        ctx.globalAlpha = 1
      }
    }
  }

  // Level-up celebration overlay
  if (levelingUp) {
    const elapsed = LEVEL_UP_MS - (g.levelUpUntil - t)
    const progress = Math.min(elapsed / LEVEL_UP_MS, 1)

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
    const cx2 = cw / 2
    const cy2 = ch * 0.4
    ctx.translate(cx2, cy2)
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
      ctx.fillText('⭐', sx - cell * 0.4, sy + cell * 0.3)
    }

    ctx.restore()
    ctx.globalAlpha = 1
  }

  // Level indicator
  if (!levelingUp) {
    ctx.font = `bold ${cell * 0.4}px Arial`
    ctx.textAlign = 'left'; ctx.textBaseline = 'top'
    ctx.fillStyle = 'rgba(0,0,0,0.3)'
    ctx.fillText(`Lv.${g.level}`, gridOffX + 4, 4)
  }

  ctx.restore()
}
