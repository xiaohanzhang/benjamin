'use server'

import { db } from '@/server/db'
import { gameState as gameStateTable, wrongAnswers, roundHistory, questionHistory, blocksHistory, cannonHistory } from '@/server/db/schema'
import { eq } from 'drizzle-orm'
import { requireUserId } from '@/server/auth-helpers'
import type { GameState, DifficultyLevel, LeitnerBox, OperationType, QuestionRecord } from '@/types/game'

export async function getGameState(): Promise<GameState> {
  const userId = await requireUserId()
  const rows = await db.select().from(gameStateTable).where(eq(gameStateTable.userId, userId))
  const row = rows[0]

  if (!row) {
    await db.insert(gameStateTable).values({ userId, currentDifficulty: 1, currentRound: 0 })
    return {
      currentDifficulty: 1,
      currentRound: 0,
      wrongAnswers: [],
      roundHistory: [],
    }
  }

  const wrongRows = await db.select().from(wrongAnswers).where(eq(wrongAnswers.userId, userId))
  const roundRows = await db.select().from(roundHistory).where(eq(roundHistory.userId, userId))

  return {
    currentDifficulty: row.currentDifficulty as DifficultyLevel,
    currentRound: row.currentRound,
    wrongAnswers: wrongRows.map((w) => ({
      questionKey: w.questionKey,
      question: {
        id: w.questionKey,
        operand1: w.operand1,
        operand2: w.operand2,
        operation: w.operation as OperationType,
        correctAnswer: w.correctAnswer,
        difficulty: w.difficulty as DifficultyLevel,
      },
      box: w.box as LeitnerBox,
      lastReviewedRound: w.lastReviewedRound,
    })),
    roundHistory: roundRows.map((r) => ({
      round: r.round,
      correct: r.correct,
      total: r.total,
      difficulty: r.difficulty as DifficultyLevel,
      timestamp: r.timestamp,
    })),
  }
}

export async function saveGameState(state: GameState): Promise<void> {
  const userId = await requireUserId()

  await db.update(gameStateTable)
    .set({
      currentDifficulty: state.currentDifficulty,
      currentRound: state.currentRound,
    })
    .where(eq(gameStateTable.userId, userId))

  // Sync wrong answers: delete all for this user and re-insert
  await db.delete(wrongAnswers).where(eq(wrongAnswers.userId, userId))
  for (const w of state.wrongAnswers) {
    await db.insert(wrongAnswers)
      .values({
        userId,
        questionKey: w.questionKey,
        operand1: w.question.operand1,
        operand2: w.question.operand2,
        operation: w.question.operation,
        correctAnswer: w.question.correctAnswer,
        difficulty: w.question.difficulty,
        box: w.box,
        lastReviewedRound: w.lastReviewedRound,
      })
  }
}

export async function saveRoundResult(result: {
  round: number
  correct: number
  total: number
  difficulty: number
  timestamp: number
}): Promise<void> {
  const userId = await requireUserId()

  await db.insert(roundHistory)
    .values({
      userId,
      round: result.round,
      correct: result.correct,
      total: result.total,
      difficulty: result.difficulty,
      timestamp: result.timestamp,
    })
}

export interface DashboardData {
  totalRounds: number
  overallAccuracy: number
  dailyStats: {
    date: string
    gamesPlayed: number
    averageAccuracy: number
  }[]
}

export async function getDashboardData(): Promise<DashboardData> {
  const userId = await requireUserId()
  const rows = await db.select().from(roundHistory).where(eq(roundHistory.userId, userId))

  if (rows.length === 0) {
    return { totalRounds: 0, overallAccuracy: 0, dailyStats: [] }
  }

  const totalCorrect = rows.reduce((sum, r) => sum + r.correct, 0)
  const totalQuestions = rows.reduce((sum, r) => sum + r.total, 0)
  const overallAccuracy = totalQuestions > 0 ? Math.round((totalCorrect / totalQuestions) * 100) : 0

  // Group by date
  const byDate = new Map<string, { correct: number; total: number; count: number }>()
  for (const r of rows) {
    const date = new Date(r.timestamp).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
    })
    const entry = byDate.get(date) ?? { correct: 0, total: 0, count: 0 }
    entry.correct += r.correct
    entry.total += r.total
    entry.count += 1
    byDate.set(date, entry)
  }

  const dailyStats = Array.from(byDate.entries()).map(([date, stats]) => ({
    date,
    gamesPlayed: stats.count,
    averageAccuracy: stats.total > 0 ? Math.round((stats.correct / stats.total) * 100) : 0,
  }))

  return { totalRounds: rows.length, overallAccuracy, dailyStats }
}

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

type GameHistoryTable = typeof blocksHistory | typeof cannonHistory

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

export async function saveBlocksResult(r: { score: number; level: number; duration: number }) {
  return saveGameResult(blocksHistory, r)
}
export async function saveCannonResult(r: { score: number; level: number; duration: number }) {
  return saveGameResult(cannonHistory, r)
}
export async function getBlocksDashboardData() {
  return getGameDashboardData(blocksHistory)
}
export async function getCannonDashboardData() {
  return getGameDashboardData(cannonHistory)
}

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
    db.select().from(roundHistory).where(eq(roundHistory.userId, userId)),
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

export async function saveQuestionRecords(round: number, records: QuestionRecord[]): Promise<void> {
  const userId = await requireUserId()
  const now = Date.now()
  for (const r of records) {
    await db.insert(questionHistory)
      .values({
        userId,
        round,
        operand1: r.question.operand1,
        operand2: r.question.operand2,
        operation: r.question.operation,
        correctAnswer: r.question.correctAnswer,
        userAnswer: r.userAnswer,
        isCorrect: r.isCorrect ? 1 : 0,
        timestamp: now,
      })
  }
}
