import type { GameState } from '@/types/game'

const STORAGE_KEY = 'benjamin_math_game'

const DEFAULT_STATE: GameState = {
  currentDifficulty: 1,
  currentRound: 0,
  wrongAnswers: [],
  roundHistory: [],
}

export function loadGameState(): GameState {
  if (typeof window === 'undefined') return DEFAULT_STATE
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return DEFAULT_STATE
    return JSON.parse(raw) as GameState
  } catch {
    return DEFAULT_STATE
  }
}

export function saveGameState(state: GameState): void {
  if (typeof window === 'undefined') return
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state))
  } catch {
    // localStorage full or unavailable — silently ignore
  }
}
