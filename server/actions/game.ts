'use server'

import { db } from '@/server/db'
import { mathHistory, blocksHistory, cannonHistory, phonicsHistory, phonicsProgress } from '@/server/db/schema'
import { eq, and } from 'drizzle-orm'
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

type GameHistoryTable = typeof mathHistory | typeof blocksHistory | typeof cannonHistory | typeof phonicsHistory

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

export async function savePhonicsResult(r: { score: number; level: number; duration: number }) {
  return saveGameResult(phonicsHistory, r)
}
export async function getPhonicsDashboardData() {
  return getGameDashboardData(phonicsHistory)
}

// -- Phonics word mastery --

export interface WordProgress {
  word: string
  attempts: number
  correct: number
  streak: number
  mastery: number // 0=new, 1=learning, 2=familiar, 3=mastered
  lastSeen: number
}

export async function getPhonicsProgress(): Promise<WordProgress[]> {
  const userId = await requireUserId()
  const rows = await db.select().from(phonicsProgress).where(eq(phonicsProgress.userId, userId))
  return rows.map(r => ({
    word: r.word,
    attempts: r.attempts,
    correct: r.correct,
    streak: r.streak,
    mastery: r.mastery,
    lastSeen: r.lastSeen,
  }))
}

export async function updateWordProgress(word: string, correct: boolean): Promise<void> {
  const userId = await requireUserId()
  const now = Date.now()

  const existing = await db.select().from(phonicsProgress)
    .where(and(eq(phonicsProgress.userId, userId), eq(phonicsProgress.word, word)))

  if (existing.length === 0) {
    // First time seeing this word
    const streak = correct ? 1 : 0
    const accuracy = correct ? 1 : 0
    await db.insert(phonicsProgress).values({
      userId, word,
      attempts: 1,
      correct: correct ? 1 : 0,
      streak,
      mastery: correct ? 1 : 0,
      lastSeen: now,
    })
    return
  }

  const row = existing[0]
  const newAttempts = row.attempts + 1
  const newCorrect = row.correct + (correct ? 1 : 0)
  const newStreak = correct ? row.streak + 1 : 0
  const accuracy = newCorrect / newAttempts

  let newMastery = row.mastery
  if (correct) {
    if (newStreak >= 4 && accuracy > 0.85) {
      newMastery = 3
    } else if (newStreak >= 2 && accuracy >= 0.6) {
      newMastery = 2
    } else {
      newMastery = Math.max(1, row.mastery)
    }
  } else {
    newMastery = Math.max(0, row.mastery - 1)
  }

  await db.update(phonicsProgress)
    .set({
      attempts: newAttempts,
      correct: newCorrect,
      streak: newStreak,
      mastery: newMastery,
      lastSeen: now,
    })
    .where(and(eq(phonicsProgress.userId, userId), eq(phonicsProgress.word, word)))
}

// -- Daily activity across all games --

export interface DailyActivity {
  date: string
  math: number
  blocks: number
  cannon: number
  phonics: number
  total: number
}

export async function getAllDailyActivity(): Promise<DailyActivity[]> {
  const userId = await requireUserId()
  const [mathRows, blocksRows, cannonRows, phonicsRows] = await Promise.all([
    db.select().from(mathHistory).where(eq(mathHistory.userId, userId)),
    db.select().from(blocksHistory).where(eq(blocksHistory.userId, userId)),
    db.select().from(cannonHistory).where(eq(cannonHistory.userId, userId)),
    db.select().from(phonicsHistory).where(eq(phonicsHistory.userId, userId)),
  ])

  const fmt = (ts: number) => new Date(ts).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
  const byDate = new Map<string, { math: number; blocks: number; cannon: number; phonics: number }>()

  const ensure = (date: string) => {
    if (!byDate.has(date)) byDate.set(date, { math: 0, blocks: 0, cannon: 0, phonics: 0 })
    return byDate.get(date)!
  }

  for (const r of mathRows) ensure(fmt(r.timestamp)).math++
  for (const r of blocksRows) ensure(fmt(r.timestamp)).blocks++
  for (const r of cannonRows) ensure(fmt(r.timestamp)).cannon++
  for (const r of phonicsRows) ensure(fmt(r.timestamp)).phonics++

  return Array.from(byDate.entries()).map(([date, s]) => ({
    date, math: s.math, blocks: s.blocks, cannon: s.cannon, phonics: s.phonics,
    total: s.math + s.blocks + s.cannon + s.phonics,
  }))
}
