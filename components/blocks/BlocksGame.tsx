'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import Link from 'next/link'

// ── Constants ──────────────────────────────────────────────
const GRID_W = 10
const GRID_H = 30
const INITIAL_HP = 10
const BASE_SPEED = 50
const SPEED_PER_POINT = 3
const BASE_SPAWN_MS = 3500
const MIN_SPAWN_MS = 1000
const SPAWN_DEC = 120
const SHOT_CD = 400
const KEYPAD_W = 56 // px reserved for keypad column

const COLORS: Record<number, string> = {
  2: '#EF4444', 3: '#F97316', 4: '#EAB308', 5: '#22C55E',
  6: '#06B6D4', 7: '#3B82F6', 8: '#8B5CF6',
}

// ── Types ──────────────────────────────────────────────────
interface Plank { id: number; len: number; x: number; y: number }
interface Fx { id: number; text: string; x: number; y: number; t0: number; ok: boolean }
interface Beam { id: number; x1: number; y1: number; x2: number; y2: number; t0: number; color: string }

interface Game {
  planks: Plank[]; fx: Fx[]; beams: Beam[]
  charX: number; score: number; hp: number
  nid: number; lastSpawn: number; alive: boolean
}

function mkGame(): Game {
  return {
    planks: [], fx: [], beams: [],
    charX: 4, score: 0, hp: INITIAL_HP,
    nid: 1, lastSpawn: 0, alive: true,
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

/** Draw the character using canvas primitives */
function drawChar(ctx: CanvasRenderingContext2D, cx: number, groundY: number, cell: number) {
  const r = cell * 0.28
  const headY = groundY - cell * 0.65
  // body
  ctx.fillStyle = '#4CAF50'
  rrect(ctx, cx - cell * 0.2, groundY - cell * 0.42, cell * 0.4, cell * 0.4, 3)
  ctx.fill()
  // head
  ctx.fillStyle = '#FFD93D'
  ctx.beginPath(); ctx.arc(cx, headY, r, 0, Math.PI * 2); ctx.fill()
  ctx.strokeStyle = '#E8A800'; ctx.lineWidth = 1.5; ctx.stroke()
  // eyes
  ctx.fillStyle = '#333'
  ctx.beginPath()
  ctx.arc(cx - r * 0.35, headY - r * 0.1, r * 0.12, 0, Math.PI * 2)
  ctx.arc(cx + r * 0.35, headY - r * 0.1, r * 0.12, 0, Math.PI * 2)
  ctx.fill()
  // smile
  ctx.strokeStyle = '#333'; ctx.lineWidth = 1.2
  ctx.beginPath()
  ctx.arc(cx, headY + r * 0.05, r * 0.35, 0.15 * Math.PI, 0.85 * Math.PI)
  ctx.stroke()
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

  useEffect(() => {
    const s = localStorage.getItem('blocks-best')
    if (s) setBest(parseInt(s))
  }, [])

  // Canvas resize — use window dimensions directly
  // Re-run when phase changes so canvas gets sized when it first mounts into the DOM
  useEffect(() => {
    const cvs = canvasRef.current
    if (!cvs) return
    const resize = () => {
      const availW = window.innerWidth - KEYPAD_W - 12
      const availH = window.innerHeight - 4
      const cell = Math.floor(Math.min(availW / GRID_W, availH / GRID_H))
      const w = cell * GRID_W
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
    const len = 2 + Math.floor(Math.random() * 7)
    const x = Math.floor(Math.random() * GRID_W)
    const cell = cellRef.current
    g.planks.push({ id: g.nid++, len, x, y: -len * cell })
  }, [])

  const findTarget = useCallback((g: Game, groundY: number, cell: number): Plank | null => {
    let best: Plank | null = null
    for (const p of g.planks) {
      const bottom = p.y + p.len * cell
      if (Math.abs(g.charX - p.x) <= 1 && bottom < groundY) {
        if (!best || bottom > best.y + best.len * cell) best = p
      }
    }
    return best
  }, [])

  const shoot = useCallback((n: number) => {
    const g = gRef.current
    if (!g.alive) return
    const now = performance.now()
    if (now - lastShotRef.current < SHOT_CD) return
    lastShotRef.current = now

    const cell = cellRef.current
    const groundY = (GRID_H - 1) * cell
    const target = findTarget(g, groundY, cell)
    if (!target) return

    const cx = (g.charX + 0.5) * cell
    const cy = groundY - cell * 0.3
    const tx = (target.x + 0.5) * cell
    const ty = target.y + target.len * cell / 2

    if (n + target.len === 10) {
      g.fx.push({ id: g.nid++, text: `${target.len} + ${n} = 10!`, x: tx, y: target.y, t0: now, ok: true })
      g.beams.push({ id: g.nid++, x1: cx, y1: cy, x2: tx, y2: ty, t0: now, color: COLORS[n] })
      g.planks = g.planks.filter(p => p.id !== target.id)
      g.score++
      setScore(g.score)
    } else {
      g.fx.push({ id: g.nid++, text: `${target.len}+${n}=${target.len + n} ✗`, x: tx, y: target.y, t0: now, ok: false })
      g.beams.push({ id: g.nid++, x1: cx, y1: cy, x2: tx, y2: ty, t0: now, color: '#EF4444' })
      g.hp--
      setHp(g.hp)
      if (g.hp <= 0) { g.alive = false; setPhase('over') }
    }
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
      const cw = cell * GRID_W
      const ch = cell * GRID_H
      const groundY = (GRID_H - 1) * cell
      const fallSpeed = BASE_SPEED + g.score * SPEED_PER_POINT

      for (const p of g.planks) p.y += fallSpeed * dt

      // Planks hitting ground
      const dead: number[] = []
      for (const p of g.planks) {
        if (p.y + p.len * cell >= groundY) {
          dead.push(p.id)
          g.hp--
          g.fx.push({ id: g.nid++, text: '💥 -1', x: (p.x + 0.5) * cell, y: groundY - p.len * cell, t0: t, ok: false })
        }
      }
      if (dead.length) {
        g.planks = g.planks.filter(p => !dead.includes(p.id))
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

      g.fx = g.fx.filter(f => t - f.t0 < 1500)
      g.beams = g.beams.filter(b => t - b.t0 < 300)

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

      // Grid lines
      ctx.strokeStyle = 'rgba(255,255,255,0.18)'; ctx.lineWidth = 1
      for (let i = 1; i < GRID_W; i++) {
        ctx.beginPath(); ctx.moveTo(i * cell, 0); ctx.lineTo(i * cell, groundY); ctx.stroke()
      }

      // Ground
      ctx.fillStyle = '#8B5E3C'; ctx.fillRect(0, groundY, cw, cell)
      ctx.fillStyle = '#6BBF59'; ctx.fillRect(0, groundY, cw, cell * 0.2)

      // Column highlight
      ctx.fillStyle = 'rgba(255,255,100,0.08)'
      ctx.fillRect(g.charX * cell, 0, cell, groundY)

      // Beams
      for (const b of g.beams) {
        const age = (t - b.t0) / 300
        if (age >= 1) continue
        ctx.globalAlpha = (1 - age) * 0.7
        ctx.strokeStyle = b.color; ctx.lineWidth = 3
        ctx.beginPath(); ctx.moveTo(b.x1, b.y1); ctx.lineTo(b.x2, b.y2); ctx.stroke()
        ctx.globalAlpha = 1
      }

      // Falling planks
      const pad = cell * 0.08
      for (const p of g.planks) {
        const px = p.x * cell + pad
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
        ctx.strokeText(String(p.len), p.x * cell + cell / 2, p.y + ph / 2)
        ctx.fillStyle = '#fff'
        ctx.fillText(String(p.len), p.x * cell + cell / 2, p.y + ph / 2)
      }

      // Hint on targeted plank
      if (tgt) {
        const hx = (tgt.x + 0.5) * cell
        const hy = tgt.y - 4
        ctx.font = `bold ${cell * 0.38}px Arial`
        ctx.textAlign = 'center'; ctx.textBaseline = 'bottom'
        ctx.strokeStyle = 'rgba(0,0,0,0.4)'; ctx.lineWidth = 2
        ctx.strokeText(`${tgt.len} + ? = 10`, hx, hy)
        ctx.fillStyle = '#fff'
        ctx.fillText(`${tgt.len} + ? = 10`, hx, hy)
      }

      // Character (canvas primitives)
      drawChar(ctx, (g.charX + 0.5) * cell, groundY, cell)

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
      if (e.key === 'ArrowLeft') { g.charX = Math.max(0, g.charX - 1); e.preventDefault() }
      else if (e.key === 'ArrowRight') { g.charX = Math.min(GRID_W - 1, g.charX + 1); e.preventDefault() }
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
    const col = Math.floor((e.clientX - rect.left) / cellRef.current)
    gRef.current.charX = Math.max(0, Math.min(GRID_W - 1, col))
  }, [phase])

  const startGame = useCallback(() => {
    const g = mkGame()
    g.lastSpawn = performance.now()
    gRef.current = g
    lastShotRef.current = 0
    targetRef.current = null
    setScore(0); setHp(INITIAL_HP); setTargetW(null)
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
  const hearts = Array.from({ length: INITIAL_HP }, (_, i) => i < hp ? '❤️' : '🖤').join('')

  return (
    <div className="fixed inset-0 flex flex-row items-start justify-center select-none overflow-hidden"
         style={{ background: '#D4F1F9' }}>
      {/* Canvas — left side, full height */}
      <canvas
        ref={canvasRef}
        onPointerDown={onPointer}
        className="block cursor-pointer"
        style={{ touchAction: 'none' }}
      />

      {/* Right panel: HP, score, hint, keypad */}
      <div className="flex flex-col items-center gap-2 p-2 pt-3 shrink-0" style={{ width: KEYPAD_W }}>
        {/* Score */}
        <div className="text-sm font-extrabold text-orange-500 whitespace-nowrap">🪵{score}</div>

        {/* HP */}
        <div className="flex flex-col items-center leading-none text-sm">
          {Array.from({ length: INITIAL_HP }, (_, i) => (
            <span key={i}>{i < hp ? '❤️' : '🖤'}</span>
          ))}
        </div>

        {/* Hint */}
        <div className="h-5 flex items-center">
          {targetW !== null && (
            <span className="text-xs font-bold text-gray-600 whitespace-nowrap">
              {targetW}+?=10
            </span>
          )}
        </div>

        {/* Number buttons */}
        {[2, 3, 4, 5, 6, 7, 8].map(n => (
          <button
            key={n}
            onClick={() => shoot(n)}
            className="rounded-lg w-10 h-8 text-sm font-extrabold text-white
              shadow active:scale-90 transition-all duration-150
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
