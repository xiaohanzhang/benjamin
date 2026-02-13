import { describe, it, expect } from 'vitest'
import { adjustDifficulty, DIFFICULTY_LABELS } from './difficultyManager'

describe('adjustDifficulty', () => {
  it('promotes when accuracy >= 80%', () => {
    const result = adjustDifficulty(2, 8, 10)
    expect(result).toEqual({ newDifficulty: 3, leveledUp: true })
  })

  it('promotes at exactly 80%', () => {
    const result = adjustDifficulty(1, 80, 100)
    expect(result).toEqual({ newDifficulty: 2, leveledUp: true })
  })

  it('demotes when accuracy <= 30%', () => {
    const result = adjustDifficulty(3, 3, 10)
    expect(result).toEqual({ newDifficulty: 2, leveledUp: false })
  })

  it('demotes at exactly 30%', () => {
    const result = adjustDifficulty(4, 30, 100)
    expect(result).toEqual({ newDifficulty: 3, leveledUp: false })
  })

  it('stays same when accuracy is between thresholds', () => {
    const result = adjustDifficulty(3, 5, 10)
    expect(result).toEqual({ newDifficulty: 3, leveledUp: false })
  })

  it('caps at level 5 (no promote beyond)', () => {
    const result = adjustDifficulty(5, 10, 10)
    expect(result).toEqual({ newDifficulty: 5, leveledUp: false })
  })

  it('caps at level 1 (no demote below)', () => {
    const result = adjustDifficulty(1, 0, 10)
    expect(result).toEqual({ newDifficulty: 1, leveledUp: false })
  })

  it('returns 0 accuracy when totalCount is 0', () => {
    const result = adjustDifficulty(3, 0, 0)
    // accuracy = 0, which is <= DEMOTION_THRESHOLD, but current > 1, so demotes
    expect(result).toEqual({ newDifficulty: 2, leveledUp: false })
  })

  it('returns same level when totalCount is 0 and already at level 1', () => {
    const result = adjustDifficulty(1, 0, 0)
    expect(result).toEqual({ newDifficulty: 1, leveledUp: false })
  })
})

describe('DIFFICULTY_LABELS', () => {
  it('maps all 5 levels', () => {
    expect(DIFFICULTY_LABELS).toEqual({
      1: 'Easy',
      2: 'Easy+',
      3: 'Medium',
      4: 'Hard',
      5: 'Super',
    })
  })
})
