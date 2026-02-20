/**
 * CannonGame — "Number Cannon" addition game (React component)
 *
 * Thin React shell: state management, event handlers, and game loop
 * that delegates to tick() for logic and renderFrame() for drawing.
 *
 * See types.ts, constants.ts, logic.ts, renderer.ts for details.
 */
'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import Link from 'next/link'
import { GRID_H, INITIAL_HP, SHOT_CD, COLORS } from './constants'
import { mkGame, tryShoot, tick, gridWidth } from './logic'
import { renderFrame } from './renderer'
import type { Bar } from './types'

const KEYPAD_W_MIN = 72
const KEYPAD_PAD = 16

export default function CannonGame() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const gRef = useRef(mkGame())
  const cellRef = useRef(20)
  const dprRef = useRef(1)
  const lastShotRef = useRef(0)
  const targetRef = useRef<Bar | null>(null)

  const [phase, setPhase] = useState<'idle' | 'play' | 'over'>('idle')
  const [score, setScore] = useState(0)
  const [hp, setHp] = useState(INITIAL_HP)
  const [level, setLevel] = useState(1)
  const [targetBar, setTargetBar] = useState<Bar | null>(null)
  const defaultBest = typeof window !== 'undefined' ? localStorage.getItem('cannon-best') : null
  const [best, setBest] = useState(defaultBest ? parseInt(defaultBest) : 0)
  const [cellSize, setCellSize] = useState(20)
  const [keypadW, setKeypadW] = useState(KEYPAD_W_MIN)

  const resizeCanvas = useCallback(() => {
    const cvs = canvasRef.current
    if (!cvs) return
    const gridW = gridWidth(gRef.current.level)
    const availH = window.innerHeight - 4
    // Try wider keypad first: keypadW = 10 * cell + padding
    let cell = Math.floor(Math.min(
      (window.innerWidth - KEYPAD_PAD - 12) / (gridW + 10),
      availH / GRID_H,
    ))
    let kw = 10 * cell + KEYPAD_PAD
    if (kw < KEYPAD_W_MIN) {
      cell = Math.floor(Math.min(
        (window.innerWidth - KEYPAD_W_MIN - 12) / gridW,
        availH / GRID_H,
      ))
      kw = KEYPAD_W_MIN
    }
    const w = cell * gridW
    const h = cell * GRID_H
    const dpr = window.devicePixelRatio || 1
    dprRef.current = dpr
    cellRef.current = cell
    setCellSize(cell)
    setKeypadW(kw)
    cvs.width = w * dpr; cvs.height = h * dpr
    cvs.style.width = `${w}px`; cvs.style.height = `${h}px`
  }, [])

  useEffect(() => {
    resizeCanvas()
    window.addEventListener('resize', resizeCanvas)
    return () => window.removeEventListener('resize', resizeCanvas)
  }, [phase, resizeCanvas])

  const shoot = useCallback((n: number) => {
    const g = gRef.current
    if (!g.alive) return
    const now = performance.now()
    if (now - lastShotRef.current < SHOT_CD) return
    if (g.shots.length > 0) return
    lastShotRef.current = now
    tryShoot(g, n, cellRef.current, now)
  }, [])

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

      const cell = cellRef.current
      const result = tick(g, dt, t, cell)

      if (result.hpChanged) setHp(g.hp)
      if (result.scoreChanged) setScore(g.score)
      if (result.levelChanged) {
        setLevel(g.level)
        resizeCanvas()
      }
      if (result.gameOver) {
        if (g.score > best) { setBest(g.score); localStorage.setItem('cannon-best', String(g.score)) }
        setPhase('over')
        return
      }
      if (result.targetBar !== targetRef.current) {
        targetRef.current = result.targetBar
        setTargetBar(result.targetBar)
      }

      const gridW = gridWidth(g.level)
      const ctx = cvs.getContext('2d')!
      renderFrame(ctx, g, t, cell, dprRef.current, gridW)

      raf = requestAnimationFrame(loop)
    }

    raf = requestAnimationFrame(loop)
    return () => cancelAnimationFrame(raf)
  }, [phase, best, resizeCanvas])

  // Keyboard
  useEffect(() => {
    if (phase !== 'play') return
    const onKey = (e: KeyboardEvent) => {
      const g = gRef.current
      const gw = gridWidth(g.level)
      if (e.key === 'ArrowLeft') { g.cannonX = Math.max(0, g.cannonX - 1); e.preventDefault() }
      else if (e.key === 'ArrowRight') { g.cannonX = Math.min(gw - 1, g.cannonX + 1); e.preventDefault() }
      else {
        const n = parseInt(e.key)
        if (n >= 1 && n <= 9) { shoot(n); e.preventDefault() }
        if (e.key === '0') { shoot(10); e.preventDefault() }
      }
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
    const gw = gridWidth(gRef.current.level)
    const col = Math.floor((e.clientX - rect.left) / cell)
    gRef.current.cannonX = Math.max(0, Math.min(gw - 1, col))
  }, [phase])

  const startGame = useCallback(() => {
    const g = mkGame()
    g.lastSpawn = performance.now()
    gRef.current = g
    lastShotRef.current = 0
    targetRef.current = null
    setScore(0); setHp(INITIAL_HP); setLevel(1); setTargetBar(null)
    setPhase('play')
  }, [])

  // -- Idle screen --
  if (phase === 'idle') {
    return (
      <div className="flex flex-col flex-1 items-center justify-center gap-8 p-6">
        <div className="text-center">
          <h1 className="text-4xl sm:text-5xl font-extrabold mb-2 bg-gradient-to-r from-cyan-500 via-blue-500 to-purple-500 bg-clip-text text-transparent">
            Number Cannon!
          </h1>
          <p className="text-6xl my-4">💥</p>
          <p className="text-lg text-gray-500 max-w-xs mx-auto">
            Add the colored sections and fire the sum! Hit the right number to score.
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
          Play!
        </button>
      </div>
    )
  }

  // -- Game over screen --
  if (phase === 'over') {
    const isNewBest = score > 0 && score >= best
    return (
      <div className="flex flex-col flex-1 items-center justify-center gap-6 p-6">
        <Link href="/" className="absolute top-4 left-4 text-2xl">🏠</Link>
        <h2 className="text-4xl font-extrabold">Game Over!</h2>
        <div className="bg-white/80 rounded-3xl p-8 shadow-xl text-center space-y-3 max-w-sm w-full">
          <div className="text-6xl font-extrabold bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent">
            {score}
          </div>
          <div className="text-xl text-gray-600">bars cleared</div>
          {isNewBest && <div className="text-lg font-bold text-purple-600">New best!</div>}
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
          Play Again!
        </button>
      </div>
    )
  }

  // -- Playing screen --
  return (
    <div className="fixed inset-0 flex flex-row items-start justify-center select-none overflow-hidden"
         style={{ background: '#D4F1F9' }}>
      <canvas
        ref={canvasRef}
        onPointerDown={onPointer}
        className="block cursor-pointer"
        style={{ touchAction: 'none' }}
      />

      <div className="flex flex-col items-center gap-2 p-2 pt-3 shrink-0" style={{ width: keypadW }}>
        <div className="text-sm font-extrabold text-orange-500 whitespace-nowrap">💥{score} Lv.{level}</div>
        <div className="flex flex-col items-center leading-none text-sm">
          {Array.from({ length: INITIAL_HP }, (_, i) => (
            <span key={i}>{i < hp ? '❤️' : '🖤'}</span>
          ))}
        </div>
        <div className="h-5 flex items-center">
          {targetBar !== null && (
            <span className="text-xs font-bold text-gray-600 whitespace-nowrap">
              {targetBar.partA > 0 ? `${targetBar.partA}+${targetBar.partB}=?` : `${targetBar.total}=?`}
            </span>
          )}
        </div>
        {keypadW > KEYPAD_W_MIN ? (
          // Wide keypad: shell-shaped, color-tinted, facing left, with grid cells
          Array.from({ length: 10 }, (_, i) => i + 1).map(n => {
            const h = cellSize * 0.8
            return (
              <button
                key={n}
                onClick={() => shoot(n)}
                className="active:scale-95 transition-all duration-150
                  cursor-pointer select-none"
                style={{ width: n * cellSize, height: h }}
              >
                <div
                  className="w-full h-full flex items-center justify-center"
                  style={{
                    backgroundColor: COLORS[n],
                    backgroundImage: `
                      repeating-linear-gradient(90deg,
                        transparent, transparent ${cellSize - 1}px,
                        rgba(255,255,255,0.35) ${cellSize - 1}px,
                        rgba(255,255,255,0.35) ${cellSize}px),
                      url(/cannon/shell.png)`,
                    backgroundSize: '100% 100%',
                    backgroundBlendMode: 'normal, luminosity',
                    imageRendering: 'pixelated',
                    transform: 'scaleX(-1)',
                    WebkitMaskImage: 'url(/cannon/shell.png)',
                    WebkitMaskSize: '100% 100%',
                    maskImage: 'url(/cannon/shell.png)',
                    maskSize: '100% 100%',
                  }}
                >
                  <span
                    className="font-extrabold text-white"
                    style={{
                      transform: 'scaleX(-1)',
                      fontSize: Math.max(cellSize * 0.55, 14),
                      textShadow: '0 1px 3px rgba(0,0,0,0.7)',
                    }}
                  >{n}</span>
                </div>
              </button>
            )
          })
        ) : (
          // Compact keypad: shell-shaped, color-tinted, facing left
          <div className="grid grid-cols-2 gap-1">
            {Array.from({ length: 10 }, (_, i) => i + 1).map(n => (
              <button
                key={n}
                onClick={() => shoot(n)}
                className="w-10 h-7 active:scale-90 transition-all duration-150
                  cursor-pointer select-none"
              >
                <div
                  className="w-full h-full flex items-center justify-center"
                  style={{
                    backgroundColor: COLORS[n],
                    backgroundImage: 'url(/cannon/shell.png)',
                    backgroundSize: '100% 100%',
                    backgroundBlendMode: 'luminosity',
                    imageRendering: 'pixelated',
                    transform: 'scaleX(-1)',
                    WebkitMaskImage: 'url(/cannon/shell.png)',
                    WebkitMaskSize: '100% 100%',
                    maskImage: 'url(/cannon/shell.png)',
                    maskSize: '100% 100%',
                  }}
                >
                  <span
                    className="font-extrabold text-white"
                    style={{
                      transform: 'scaleX(-1)',
                      fontSize: 14,
                      textShadow: '0 1px 3px rgba(0,0,0,0.7)',
                    }}
                  >{n}</span>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
