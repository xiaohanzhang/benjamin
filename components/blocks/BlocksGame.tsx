/**
 * BlocksGame — "Making 10" math game (React component)
 *
 * Thin React shell: state management, event handlers, and game loop
 * that delegates to tick() for logic and renderFrame() for drawing.
 *
 * See types.ts, constants.ts, logic.ts, renderer.ts for details.
 */
'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import Link from 'next/link'
import { saveBlocksResult } from '@/server/actions/game'
import {
  MAX_GRID_W, GRID_H, INITIAL_HP, SHOT_CD,
  BUILDING_NAMES, COLORS,
} from './constants'
import { activeStart, stackCells, mkGame, tryShoot, tick } from './logic'
import { renderFrame } from './renderer'

const KEYPAD_W = 72

export default function BlocksGame() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const gRef = useRef(mkGame())
  const cellRef = useRef(20)
  const dprRef = useRef(1)
  const lastShotRef = useRef(0)
  const targetRef = useRef<number | null>(null)

  const [phase, setPhase] = useState<'idle' | 'play' | 'over'>('idle')
  const [score, setScore] = useState(0)
  const [hp, setHp] = useState(INITIAL_HP)
  const [targetW, setTargetW] = useState<number | null>(null)
  const defaultBest = typeof window !== 'undefined' ? localStorage.getItem('blocks-best') : null
  const [best, setBest] = useState(defaultBest ? parseInt(defaultBest) : 0)
  const [level, setLevel] = useState(1)
  const [buildingLevel, setBuildingLevel] = useState(0)

  const resizeCanvas = useCallback(() => {
    const cvs = canvasRef.current
    if (!cvs) return
    const sc = stackCells(gRef.current.buildingLevel)
    const availW = window.innerWidth - KEYPAD_W - 12
    const availH = window.innerHeight - 4
    const totalCols = sc + MAX_GRID_W
    const cell = Math.floor(Math.min(availW / totalCols, availH / GRID_H))
    const w = cell * totalCols
    const h = cell * GRID_H
    const dpr = window.devicePixelRatio || 1
    dprRef.current = dpr
    cellRef.current = cell
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

      // Sync React state from TickResult
      if (result.hpChanged) setHp(g.hp)
      if (result.scoreChanged) setScore(g.score)
      if (result.levelChanged) setLevel(g.level)
      if (result.buildingChanged) {
        setBuildingLevel(g.buildingLevel)
        resizeCanvas()
      }
      if (result.gameOver) {
        if (g.score > best) { setBest(g.score); localStorage.setItem('blocks-best', String(g.score)) }
        const duration = Math.round((Date.now() - g.startedAt) / 1000)
        saveBlocksResult({ score: g.score, level: g.level, duration })
        setPhase('over')
        return
      }
      if (result.targetW !== targetRef.current) {
        targetRef.current = result.targetW
        setTargetW(result.targetW)
      }

      // Render
      const ctx = cvs.getContext('2d')!
      renderFrame(ctx, g, t, cell, dprRef.current)

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
    const g = gRef.current
    const gridOffX = stackCells(g.buildingLevel) * cell
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
    setScore(0); setHp(INITIAL_HP); setTargetW(null); setLevel(1); setBuildingLevel(0)
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
        {buildingLevel > 0 && (
          <div className="text-xs font-bold text-amber-700 whitespace-nowrap">🏠{BUILDING_NAMES[buildingLevel - 1]}</div>
        )}
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
