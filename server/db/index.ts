import Database from 'better-sqlite3'
import { drizzle } from 'drizzle-orm/better-sqlite3'
import * as schema from './schema'
import { existsSync, mkdirSync } from 'fs'
import { join } from 'path'

const dataDir = join(process.cwd(), 'data')
if (!existsSync(dataDir)) {
  mkdirSync(dataDir, { recursive: true })
}

const sqlite = new Database(join(dataDir, 'benjamin.db'))
sqlite.pragma('journal_mode = WAL')

export const db = drizzle(sqlite, { schema })
