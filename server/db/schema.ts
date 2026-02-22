import { sqliteTable, integer, text, primaryKey } from 'drizzle-orm/sqlite-core';
import type { AdapterAccountType } from "next-auth/adapters";

// Auth.js tables
export const users = sqliteTable("user", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  name: text("name"),
  email: text("email").unique(),
  emailVerified: integer("emailVerified", { mode: "timestamp_ms" }),
  image: text("image"),
});
 
export const accounts = sqliteTable(
  "account",
  {
    provider: text("provider").notNull(),
    providerAccountId: text("providerAccountId").notNull(),
    userId: text("userId")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    type: text("type").$type<AdapterAccountType>().notNull(),
    refresh_token: text("refresh_token"),
    access_token: text("access_token"),
    expires_at: integer("expires_at"),
    token_type: text("token_type"),
    scope: text("scope"),
    id_token: text("id_token"),
    session_state: text("session_state"),
  },
  (account) => [
    primaryKey({
      columns: [account.provider, account.providerAccountId],
    }),
  ]
);
 
export const sessions = sqliteTable("session", {
  sessionToken: text("sessionToken").primaryKey(),
  userId: text("userId")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  expires: integer("expires", { mode: "timestamp_ms" }).notNull(),
});
 
export const verificationTokens = sqliteTable(
  "verificationToken",
  {
    identifier: text("identifier").notNull(),
    token: text("token").notNull(),
    expires: integer("expires", { mode: "timestamp_ms" }).notNull(),
  },
  (verificationToken) => [
    primaryKey({
      columns: [verificationToken.identifier, verificationToken.token],
    }),
  ]
);
 
// Math game local state (difficulty/round) — kept for reference, no longer written by app
export const gameState = sqliteTable('game_state', {
  userId: text('user_id')
    .primaryKey()
    .references(() => users.id, { onDelete: 'cascade' }),
  currentDifficulty: integer('current_difficulty').notNull().default(1),
  currentRound: integer('current_round').notNull().default(0),
})

// Game history tables — scoped by userId, shared schema
function createGameHistoryTable(name: string) {
  return sqliteTable(name, {
    id: integer('id').primaryKey({ autoIncrement: true }),
    userId: text('user_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    score: integer('score').notNull(),
    level: integer('level').notNull(),
    duration: integer('duration').notNull(), // seconds
    timestamp: integer('timestamp').notNull(),
  })
}

export const mathHistory = createGameHistoryTable('math_history')
export const blocksHistory = createGameHistoryTable('blocks_history')
export const cannonHistory = createGameHistoryTable('cannon_history')
