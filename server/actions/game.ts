'use server'

import { db } from '@/server/db'
import { mathHistory, blocksHistory, cannonHistory } from '@/server/db/schema'
import { eq } from 'drizzle-orm'
import { requireUserId } from '@/server/auth-helpers'

// -- Shared game dashboard types & helpers --

export interface GameEntry {
  score: number
  level: number
  duration: number
  datetime: string
}

export interface DailyStats {
  date: string
  gamesPlayed: number
  avgScore: number
  maxScore: number
  minScore: number
}

export interface GameDashboardData {
  games: GameEntry[]
  dailyStats: DailyStats[]
}

type GameHistoryTable = typeof mathHistory | typeof blocksHistory | typeof cannonHistory

async function saveGameResult(table: GameHistoryTable, result: {
  score: number
  level: number
  duration: number
}): Promise<void> {
  const userId = await requireUserId()
  await db.insert(table).values({
    userId,
    score: result.score,
    level: result.level,
    duration: result.duration,
    timestamp: Date.now(),
  })
}

async function getGameDashboardData(table: GameHistoryTable): Promise<GameDashboardData> {
  const userId = await requireUserId()
  const rows = await db.select().from(table).where(eq(table.userId, userId))

  const games: GameEntry[] = rows.map(r => ({
    score: r.score,
    level: r.level,
    duration: r.duration,
    datetime: new Date(r.timestamp).toLocaleString('en-US', {
      month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit',
    }),
  }))

  const byDate = new Map<string, { scores: number[]; count: number }>()
  for (const r of rows) {
    const date = new Date(r.timestamp).toLocaleDateString('en-US', {
      month: 'short', day: 'numeric',
    })
    const entry = byDate.get(date) ?? { scores: [], count: 0 }
    entry.scores.push(r.score)
    entry.count++
    byDate.set(date, entry)
  }

  const dailyStats: DailyStats[] = Array.from(byDate.entries()).map(([date, stats]) => ({
    date,
    gamesPlayed: stats.count,
    avgScore: Math.round(stats.scores.reduce((a, b) => a + b, 0) / stats.count),
    maxScore: Math.max(...stats.scores),
    minScore: Math.min(...stats.scores),
  }))

  return { games, dailyStats }
}

export async function saveMathResult(r: { score: number; level: number; duration: number }) {
  return saveGameResult(mathHistory, r)
}
export async function saveBlocksResult(r: { score: number; level: number; duration: number }) {
  return saveGameResult(blocksHistory, r)
}
export async function saveCannonResult(r: { score: number; level: number; duration: number }) {
  return saveGameResult(cannonHistory, r)
}
export async function getMathDashboardData() {
  return getGameDashboardData(mathHistory)
}
export async function getBlocksDashboardData() {
  return getGameDashboardData(blocksHistory)
}
export async function getCannonDashboardData() {
  return getGameDashboardData(cannonHistory)
}

// -- Daily activity across all games --

export interface DailyActivity {
  date: string
  math: number
  blocks: number
  cannon: number
  total: number
}

export async function getAllDailyActivity(): Promise<DailyActivity[]> {
  const userId = await requireUserId()
  const [mathRows, blocksRows, cannonRows] = await Promise.all([
    db.select().from(mathHistory).where(eq(mathHistory.userId, userId)),
    db.select().from(blocksHistory).where(eq(blocksHistory.userId, userId)),
    db.select().from(cannonHistory).where(eq(cannonHistory.userId, userId)),
  ])

  const fmt = (ts: number) => new Date(ts).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
  const byDate = new Map<string, { math: number; blocks: number; cannon: number }>()

  const ensure = (date: string) => {
    if (!byDate.has(date)) byDate.set(date, { math: 0, blocks: 0, cannon: 0 })
    return byDate.get(date)!
  }

  for (const r of mathRows) ensure(fmt(r.timestamp)).math++
  for (const r of blocksRows) ensure(fmt(r.timestamp)).blocks++
  for (const r of cannonRows) ensure(fmt(r.timestamp)).cannon++

  return Array.from(byDate.entries()).map(([date, s]) => ({
    date, math: s.math, blocks: s.blocks, cannon: s.cannon,
    total: s.math + s.blocks + s.cannon,
  }))
}
