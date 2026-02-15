'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import Link from 'next/link'

// ── Constants ──────────────────────────────────────────────
const MAX_GRID_W = 10
const GRID_H = 30
const STACK_CELLS = 2
const INITIAL_HP = 10
const BASE_SPEED = 20
const SPEED_PER_POINT = 0.5
const POINTS_PER_LEVEL = 10
const LEVEL_UP_MS = 2000
const BASE_SPAWN_MS = 3500
const MIN_SPAWN_MS = 1000
const SPAWN_DEC = 120
const SHOT_CD = 400
const KEYPAD_W = 72

const COLORS: Record<number, string> = {
  2: '#EF4444', 3: '#F97316', 4: '#EAB308', 5: '#22C55E',
  6: '#06B6D4', 7: '#3B82F6', 8: '#8B5CF6',
}

// ── Types ──────────────────────────────────────────────────
interface Plank { id: number; len: number; x: number; y: number }
interface Fx { id: number; text: string; x: number; y: number; t0: number; ok: boolean }
interface ShotAnim {
  id: number
  shotLen: number; shotColor: string
  targetLen: number; targetColor: string
  col: number; charCol: number
  phase: 'rising' | 'flying' | 'wrong_flash' | 'falling' | 'done'
  phaseStart: number; targetY: number; stackIdx: number
  hit: boolean
}

interface Game {
  planks: Plank[]; fx: Fx[]; shots: ShotAnim[]
  stack: string[]
  charX: number; score: number; hp: number
  nid: number; lastSpawn: number; alive: boolean
  hurtUntil: number
  level: number; levelUpUntil: number
}

function activeStart(lv: number) { return Math.floor((MAX_GRID_W - lv) / 2) }

function mkGame(): Game {
  const as = activeStart(1)
  return {
    planks: [], fx: [], shots: [], stack: [],
    charX: as, score: 0, hp: INITIAL_HP,
    nid: 1, lastSpawn: 0, alive: true,
    hurtUntil: 0, level: 1, levelUpUntil: 0,
  }
}

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

// ── Component ──────────────────────────────────────────────
export default function BlocksGame() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const gRef = useRef<Game>(mkGame())
  const cellRef = useRef(20)
  const dprRef = useRef(1)
  const lastShotRef = useRef(0)
  const targetRef = useRef<number | null>(null)

  const [phase, setPhase] = useState<'idle' | 'play' | 'over'>('idle')
  const [score, setScore] = useState(0)
  const [hp, setHp] = useState(INITIAL_HP)
  const [targetW, setTargetW] = useState<number | null>(null)
  const [best, setBest] = useState(0)
  const [level, setLevel] = useState(1)

  useEffect(() => {
    const s = localStorage.getItem('blocks-best')
    if (s) setBest(parseInt(s))
  }, [])

  useEffect(() => {
    const cvs = canvasRef.current
    if (!cvs) return
    const resize = () => {
      const availW = window.innerWidth - KEYPAD_W - 12
      const availH = window.innerHeight - 4
      const totalCols = STACK_CELLS + MAX_GRID_W
      const cell = Math.floor(Math.min(availW / totalCols, availH / GRID_H))
      const w = cell * totalCols
      const h = cell * GRID_H
      const dpr = window.devicePixelRatio || 1
      dprRef.current = dpr
      cellRef.current = cell
      cvs.width = w * dpr; cvs.height = h * dpr
      cvs.style.width = `${w}px`; cvs.style.height = `${h}px`
    }
    resize()
    window.addEventListener('resize', resize)
    return () => window.removeEventListener('resize', resize)
  }, [phase])

  const spawn = useCallback((g: Game) => {
    const gw = g.level
    const as = activeStart(gw)
    const cell = cellRef.current
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
  }, [])

  const findTarget = useCallback((g: Game, groundY: number, cell: number): Plank | null => {
    let closest: Plank | null = null
    for (const p of g.planks) {
      const bottom = p.y + p.len * cell
      if (p.x === g.charX && bottom < groundY) {
        if (!closest || bottom > closest.y + closest.len * cell) closest = p
      }
    }
    return closest
  }, [])

  const shoot = useCallback((n: number) => {
    const g = gRef.current
    if (!g.alive) return
    const now = performance.now()
    if (now - lastShotRef.current < SHOT_CD) return
    if (g.shots.length > 0) return
    lastShotRef.current = now

    const cell = cellRef.current
    const groundY = (GRID_H - 1) * cell
    const target = findTarget(g, groundY, cell)
    if (!target) return

    const isHit = n + target.len === 10
    g.shots.push({
      id: g.nid++,
      shotLen: n, shotColor: COLORS[n],
      targetLen: target.len, targetColor: COLORS[target.len],
      col: target.x, charCol: g.charX,
      phase: 'rising', phaseStart: now,
      targetY: target.y, stackIdx: g.stack.length,
      hit: isHit,
    })
    g.planks = g.planks.filter(p => p.id !== target.id)
  }, [findTarget])

  // Game loop
  useEffect(() => {
    if (phase !== 'play') return
    let raf: number
    let prev = 0

    const loop = (t: number) => {
      const dt = prev ? Math.min((t - prev) / 1000, 0.1) : 0
      prev = t
      const g = gRef.current
      const cvs = canvasRef.current
      if (!cvs || !g.alive) return

      const dpr = dprRef.current
      const cell = cellRef.current
      const gw = g.level
      const as = activeStart(gw)
      const totalCols = STACK_CELLS + MAX_GRID_W
      const cw = cell * totalCols
      const ch = cell * GRID_H
      const gridOffX = STACK_CELLS * cell
      const groundY = (GRID_H - 1) * cell
      const fallSpeed = BASE_SPEED + g.score * SPEED_PER_POINT
      const stackItemH = cell * 0.4
      const stackW = cell * 1.5
      const stackX = (gridOffX - stackW) / 2
      const pad = cell * 0.08

      const shooting = g.shots.length > 0
      const levelingUp = t < g.levelUpUntil

      // Freeze everything while shot animation or level-up plays
      if (!shooting && !levelingUp) {
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
          setHp(g.hp)
          if (g.hp <= 0) {
            g.alive = false
            if (g.score > best) { setBest(g.score); localStorage.setItem('blocks-best', String(g.score)) }
            setPhase('over')
            return
          }
        }

        const maxP = Math.min(5, 1 + Math.floor(g.score / 3))
        const interval = Math.max(MIN_SPAWN_MS, BASE_SPAWN_MS - g.score * SPAWN_DEC)
        if (g.planks.length < maxP && t - g.lastSpawn >= interval) { spawn(g); g.lastSpawn = t }
        if (g.planks.length === 0) { spawn(g); g.lastSpawn = t }
      }

      // Update shot animations
      for (const s of g.shots) {
        const elapsed = t - s.phaseStart
        if (s.phase === 'rising' && elapsed >= 700) {
          s.phaseStart = t
          if (s.hit) {
            s.phase = 'flying'
            g.score++
            setScore(g.score)
            // Level up check
            const newLevel = Math.min(MAX_GRID_W, 1 + Math.floor(g.score / POINTS_PER_LEVEL))
            if (newLevel > g.level) {
              g.level = newLevel
              g.levelUpUntil = t + LEVEL_UP_MS
              g.planks = []
              const newAs = activeStart(newLevel)
              g.charX = Math.max(newAs, Math.min(newAs + newLevel - 1, g.charX))
              setLevel(newLevel)
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
          setHp(g.hp)
          g.hurtUntil = t + 1200
          g.fx.push({ id: g.nid++, text: '-1', x: gridOffX + (s.col + 0.5) * cell, y: groundY - cell, t0: t, ok: false })
          if (g.hp <= 0) {
            g.alive = false
            if (g.score > best) { setBest(g.score); localStorage.setItem('blocks-best', String(g.score)) }
            setPhase('over')
          }
          s.phase = 'done'
        }
      }
      g.shots = g.shots.filter(s => s.phase !== 'done')

      g.fx = g.fx.filter(f => t - f.t0 < 1500)

      const tgt = findTarget(g, groundY, cell)
      const tw = tgt?.len ?? null
      if (tw !== targetRef.current) { targetRef.current = tw; setTargetW(tw) }

      // ── Render ──
      const ctx = cvs.getContext('2d')!
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

      // ── Stack ──
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
        ctx.fillText(String(g.stack.length), gridOffX / 2, topY - 4)
      }

      // ── Falling planks ──
      for (const p of g.planks) {
        const px = gridOffX + p.x * cell + pad
        const pw = cell - pad * 2
        const ph = p.len * cell
        ctx.fillStyle = 'rgba(0,0,0,0.06)'
        rrect(ctx, px + 2, p.y + 2, pw, ph, 4); ctx.fill()
        ctx.fillStyle = COLORS[p.len]
        rrect(ctx, px, p.y, pw, ph, 4); ctx.fill()
        ctx.strokeStyle = 'rgba(0,0,0,0.12)'; ctx.lineWidth = 1
        rrect(ctx, px, p.y, pw, ph, 4); ctx.stroke()
        const fontSize = Math.min(pw * 0.7, ph * 0.25)
        ctx.font = `bold ${fontSize}px Arial`
        ctx.textAlign = 'center'; ctx.textBaseline = 'middle'
        ctx.strokeStyle = 'rgba(0,0,0,0.2)'; ctx.lineWidth = 2
        ctx.strokeText(String(p.len), gridOffX + p.x * cell + cell / 2, p.y + ph / 2)
        ctx.fillStyle = '#fff'
        ctx.fillText(String(p.len), gridOffX + p.x * cell + cell / 2, p.y + ph / 2)
      }

      // ── Hint on targeted plank ──
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
          ctx.fillStyle = s.targetColor
          rrect(ctx, gx + pad, s.targetY, pw, s.targetLen * cell, 4); ctx.fill()
          const tfs = Math.min(pw * 0.7, s.targetLen * cell * 0.25)
          ctx.font = `bold ${tfs}px Arial`
          ctx.textAlign = 'center'; ctx.textBaseline = 'middle'
          ctx.fillStyle = '#fff'
          ctx.fillText(String(s.targetLen), gx + cell / 2, s.targetY + s.targetLen * cell / 2)

          // Rising shot plank
          const shotH = s.shotLen * cell
          const startTopY = groundY - cell * 0.5
          const endTopY = s.targetY + s.targetLen * cell
          const shotTopY = startTopY + (endTopY - startTopY) * eased
          const startX = gridOffX + s.charCol * cell + pad
          const endX = gx + pad
          const shotX = startX + (endX - startX) * eased

          ctx.fillStyle = 'rgba(0,0,0,0.06)'
          rrect(ctx, shotX + 2, shotTopY + 2, pw, shotH, 4); ctx.fill()
          ctx.fillStyle = s.shotColor
          rrect(ctx, shotX, shotTopY, pw, shotH, 4); ctx.fill()
          const sfs = Math.min(pw * 0.7, shotH * 0.25)
          ctx.font = `bold ${sfs}px Arial`
          ctx.textAlign = 'center'; ctx.textBaseline = 'middle'
          ctx.fillStyle = '#fff'
          ctx.fillText(String(s.shotLen), shotX + pw / 2, shotTopY + shotH / 2)
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
      raf = requestAnimationFrame(loop)
    }

    raf = requestAnimationFrame(loop)
    return () => cancelAnimationFrame(raf)
  }, [phase, spawn, findTarget, best])

  // Keyboard
  useEffect(() => {
    if (phase !== 'play') return
    const onKey = (e: KeyboardEvent) => {
      const g = gRef.current
      const as = activeStart(g.level)
      if (e.key === 'ArrowLeft') { g.charX = Math.max(as, g.charX - 1); e.preventDefault() }
      else if (e.key === 'ArrowRight') { g.charX = Math.min(as + g.level - 1, g.charX + 1); e.preventDefault() }
      else if (e.key >= '2' && e.key <= '8') { shoot(parseInt(e.key)); e.preventDefault() }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [phase, shoot])

  const onPointer = useCallback((e: React.PointerEvent) => {
    if (phase !== 'play') return
    const cvs = canvasRef.current
    if (!cvs) return
    const rect = cvs.getBoundingClientRect()
    const cell = cellRef.current
    const gridOffX = STACK_CELLS * cell
    const g = gRef.current
    const as = activeStart(g.level)
    const col = Math.floor((e.clientX - rect.left - gridOffX) / cell)
    g.charX = Math.max(as, Math.min(as + g.level - 1, col))
  }, [phase])

  const startGame = useCallback(() => {
    const g = mkGame()
    g.lastSpawn = performance.now()
    gRef.current = g
    lastShotRef.current = 0
    targetRef.current = null
    setScore(0); setHp(INITIAL_HP); setTargetW(null); setLevel(1)
    setPhase('play')
  }, [])

  // ── Idle screen ──
  if (phase === 'idle') {
    return (
      <div className="flex flex-col flex-1 items-center justify-center gap-8 p-6">
        <div className="text-center">
          <h1 className="text-4xl sm:text-5xl font-extrabold mb-2 bg-gradient-to-r from-yellow-500 via-orange-500 to-red-500 bg-clip-text text-transparent">
            Making 10!
          </h1>
          <p className="text-6xl my-4">🪵</p>
          <p className="text-lg text-gray-500 max-w-xs mx-auto">
            Shoot planks to make 10! Move under a falling plank and pick the right number.
          </p>
          {best > 0 && <p className="text-gray-400 mt-2">Best: {best}</p>}
        </div>
        <button
          onClick={startGame}
          className="px-12 py-6 rounded-3xl text-3xl font-extrabold text-white
            bg-gradient-to-r from-green-400 to-cyan-500
            shadow-xl hover:shadow-2xl hover:scale-105
            active:scale-95 transition-all duration-200
            cursor-pointer select-none"
        >
          Play! 🚀
        </button>
      </div>
    )
  }

  // ── Game over screen ──
  if (phase === 'over') {
    const isNewBest = score > 0 && score >= best
    return (
      <div className="flex flex-col flex-1 items-center justify-center gap-6 p-6">
        <Link href="/" className="absolute top-4 left-4 text-2xl">🏠</Link>
        <h2 className="text-4xl font-extrabold">Game Over!</h2>
        <div className="bg-white/80 rounded-3xl p-8 shadow-xl text-center space-y-3 max-w-sm w-full">
          <div className="text-6xl font-extrabold bg-gradient-to-r from-yellow-400 to-orange-500 bg-clip-text text-transparent">
            {score}
          </div>
          <div className="text-xl text-gray-600">planks cleared</div>
          {isNewBest && <div className="text-lg font-bold text-purple-600">New best! 🎉</div>}
          {!isNewBest && best > 0 && <div className="text-sm text-gray-400">Best: {best}</div>}
        </div>
        <button
          onClick={startGame}
          className="px-10 py-5 rounded-3xl text-2xl font-extrabold text-white
            bg-gradient-to-r from-pink-500 to-purple-500
            shadow-xl hover:shadow-2xl hover:scale-105
            active:scale-95 transition-all duration-200
            cursor-pointer select-none"
        >
          Play Again! 🔄
        </button>
      </div>
    )
  }

  // ── Playing screen ──
  return (
    <div className="fixed inset-0 flex flex-row items-start justify-center select-none overflow-hidden"
         style={{ background: '#D4F1F9' }}>
      <canvas
        ref={canvasRef}
        onPointerDown={onPointer}
        className="block cursor-pointer"
        style={{ touchAction: 'none' }}
      />

      <div className="flex flex-col items-center gap-3 p-2 pt-3 shrink-0" style={{ width: KEYPAD_W }}>
        <div className="text-xs font-bold text-purple-500 whitespace-nowrap">Lv.{level}</div>
        <div className="text-sm font-extrabold text-orange-500 whitespace-nowrap">🪵{score}</div>
        <div className="flex flex-col items-center leading-none text-sm">
          {Array.from({ length: INITIAL_HP }, (_, i) => (
            <span key={i}>{i < hp ? '❤️' : '🖤'}</span>
          ))}
        </div>
        <div className="h-5 flex items-center">
          {targetW !== null && (
            <span className="text-xs font-bold text-gray-600 whitespace-nowrap">
              {targetW}+?=10
            </span>
          )}
        </div>
        {[2, 3, 4, 5, 6, 7, 8].map(n => (
          <button
            key={n}
            onClick={() => shoot(n)}
            className="rounded-xl w-14 h-12 text-xl font-extrabold text-white
              shadow-md active:scale-90 transition-all duration-150
              cursor-pointer select-none"
            style={{ backgroundColor: COLORS[n] }}
          >
            {n}
          </button>
        ))}
      </div>
    </div>
  )
}
