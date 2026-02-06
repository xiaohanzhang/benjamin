import type { DifficultyLevel } from '@/types/game'
import { PROMOTION_THRESHOLD, DEMOTION_THRESHOLD } from '@/types/game'

export function adjustDifficulty(
  current: DifficultyLevel,
  correctCount: number,
  totalCount: number
): { newDifficulty: DifficultyLevel; leveledUp: boolean } {
  const accuracy = totalCount > 0 ? correctCount / totalCount : 0

  if (accuracy >= PROMOTION_THRESHOLD && current < 5) {
    return { newDifficulty: (current + 1) as DifficultyLevel, leveledUp: true }
  }

  if (accuracy <= DEMOTION_THRESHOLD && current > 1) {
    return { newDifficulty: (current - 1) as DifficultyLevel, leveledUp: false }
  }

  return { newDifficulty: current, leveledUp: false }
}

export const DIFFICULTY_LABELS: Record<DifficultyLevel, string> = {
  1: 'Easy',
  2: 'Easy+',
  3: 'Medium',
  4: 'Hard',
  5: 'Super',
}
