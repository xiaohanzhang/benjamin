import { sqliteTable, integer, text } from 'drizzle-orm/sqlite-core'

export const gameState = sqliteTable('game_state', {
  id: integer('id').primaryKey(),
  currentDifficulty: integer('current_difficulty').notNull().default(1),
  currentRound: integer('current_round').notNull().default(0),
})

export const wrongAnswers = sqliteTable('wrong_answers', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  questionKey: text('question_key').notNull().unique(),
  operand1: integer('operand1').notNull(),
  operand2: integer('operand2').notNull(),
  operation: text('operation').notNull(),
  correctAnswer: integer('correct_answer').notNull(),
  difficulty: integer('difficulty').notNull(),
  box: integer('box').notNull().default(1),
  lastReviewedRound: integer('last_reviewed_round').notNull().default(0),
})

export const roundHistory = sqliteTable('round_history', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  round: integer('round').notNull(),
  correct: integer('correct').notNull(),
  total: integer('total').notNull(),
  difficulty: integer('difficulty').notNull(),
  timestamp: integer('timestamp').notNull(),
})

export const questionHistory = sqliteTable('question_history', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  round: integer('round').notNull(),
  operand1: integer('operand1').notNull(),
  operand2: integer('operand2').notNull(),
  operation: text('operation').notNull(),
  correctAnswer: integer('correct_answer').notNull(),
  userAnswer: integer('user_answer').notNull(),
  isCorrect: integer('is_correct').notNull(),
  timestamp: integer('timestamp').notNull(),
})
