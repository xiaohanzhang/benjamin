import { sqliteTable, integer, text, primaryKey } from 'drizzle-orm/sqlite-core'

// Auth.js tables
export const users = sqliteTable('user', {
  id: text('id')
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  name: text('name'),
  email: text('email').notNull(),
  emailVerified: integer('emailVerified', { mode: 'timestamp_ms' }),
  image: text('image'),
})

export const accounts = sqliteTable(
  'account',
  {
    userId: text('userId')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    type: text('type').notNull(),
    provider: text('provider').notNull(),
    providerAccountId: text('providerAccountId').notNull(),
    refresh_token: text('refresh_token'),
    access_token: text('access_token'),
    expires_at: integer('expires_at'),
    token_type: text('token_type'),
    scope: text('scope'),
    id_token: text('id_token'),
    session_state: text('session_state'),
  },
  (account) => [
    primaryKey({ columns: [account.provider, account.providerAccountId] }),
  ],
)

export const verificationTokens = sqliteTable(
  'verificationToken',
  {
    identifier: text('identifier').notNull(),
    token: text('token').notNull(),
    expires: integer('expires', { mode: 'timestamp_ms' }).notNull(),
  },
  (vt) => [primaryKey({ columns: [vt.identifier, vt.token] })],
)

// Game tables — scoped by userId
export const gameState = sqliteTable('game_state', {
  userId: text('user_id')
    .primaryKey()
    .references(() => users.id, { onDelete: 'cascade' }),
  currentDifficulty: integer('current_difficulty').notNull().default(1),
  currentRound: integer('current_round').notNull().default(0),
})

export const wrongAnswers = sqliteTable('wrong_answers', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  userId: text('user_id')
    .notNull()
    .references(() => users.id, { onDelete: 'cascade' }),
  questionKey: text('question_key').notNull(),
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
  userId: text('user_id')
    .notNull()
    .references(() => users.id, { onDelete: 'cascade' }),
  round: integer('round').notNull(),
  correct: integer('correct').notNull(),
  total: integer('total').notNull(),
  difficulty: integer('difficulty').notNull(),
  timestamp: integer('timestamp').notNull(),
})

export const questionHistory = sqliteTable('question_history', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  userId: text('user_id')
    .notNull()
    .references(() => users.id, { onDelete: 'cascade' }),
  round: integer('round').notNull(),
  operand1: integer('operand1').notNull(),
  operand2: integer('operand2').notNull(),
  operation: text('operation').notNull(),
  correctAnswer: integer('correct_answer').notNull(),
  userAnswer: integer('user_answer').notNull(),
  isCorrect: integer('is_correct').notNull(),
  timestamp: integer('timestamp').notNull(),
})
