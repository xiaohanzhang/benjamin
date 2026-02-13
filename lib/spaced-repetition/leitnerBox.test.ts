import { describe, it, expect } from 'vitest'
import { addWrongAnswer, promoteAnswer, demoteAnswer, getDueReviewQuestions } from './leitnerBox'
import type { MathQuestion, WrongAnswerRecord } from '@/types/game'

function makeQuestion(op1: number, op2: number): MathQuestion {
  return {
    id: `${op1}-${op2}`,
    operand1: op1,
    operand2: op2,
    operation: 'addition',
    correctAnswer: op1 + op2,
    difficulty: 1,
  }
}

function makeRecord(op1: number, op2: number, box: 1 | 2 | 3 | 4 | 5, lastRound: number): WrongAnswerRecord {
  return {
    questionKey: `${op1}+${op2}`,
    question: makeQuestion(op1, op2),
    box,
    lastReviewedRound: lastRound,
  }
}

describe('addWrongAnswer', () => {
  it('adds new record at box 1', () => {
    const result = addWrongAnswer([], makeQuestion(3, 5), 1)
    expect(result).toHaveLength(1)
    expect(result[0].questionKey).toBe('3+5')
    expect(result[0].box).toBe(1)
    expect(result[0].lastReviewedRound).toBe(1)
  })

  it('resets existing record to box 1', () => {
    const existing = [makeRecord(3, 5, 3, 5)]
    const result = addWrongAnswer(existing, makeQuestion(3, 5), 10)
    expect(result).toHaveLength(1)
    expect(result[0].box).toBe(1)
    expect(result[0].lastReviewedRound).toBe(10)
  })
})

describe('promoteAnswer', () => {
  it('advances box from 1 to 2', () => {
    const records = [makeRecord(3, 5, 1, 1)]
    const result = promoteAnswer(records, '3+5', 5)
    expect(result).toHaveLength(1)
    expect(result[0].box).toBe(2)
    expect(result[0].lastReviewedRound).toBe(5)
  })

  it('removes mastered questions (box 5)', () => {
    const records = [makeRecord(3, 5, 5, 1)]
    const result = promoteAnswer(records, '3+5', 10)
    expect(result).toHaveLength(0)
  })

  it('does not affect other records', () => {
    const records = [makeRecord(3, 5, 2, 1), makeRecord(4, 6, 1, 1)]
    const result = promoteAnswer(records, '3+5', 5)
    expect(result).toHaveLength(2)
    expect(result.find(r => r.questionKey === '3+5')!.box).toBe(3)
    expect(result.find(r => r.questionKey === '4+6')!.box).toBe(1)
  })
})

describe('demoteAnswer', () => {
  it('resets to box 1', () => {
    const records = [makeRecord(3, 5, 4, 1)]
    const result = demoteAnswer(records, '3+5', 10)
    expect(result).toHaveLength(1)
    expect(result[0].box).toBe(1)
    expect(result[0].lastReviewedRound).toBe(10)
  })
})

describe('getDueReviewQuestions', () => {
  it('returns questions due by interval', () => {
    // Box 1 interval = 1, so due after 1 round
    const records = [makeRecord(3, 5, 1, 1)]
    const result = getDueReviewQuestions(records, 2, 10)
    expect(result).toHaveLength(1)
    expect(result[0].questionKey).toBe('3+5')
  })

  it('respects maxCount limit', () => {
    const records = [
      makeRecord(1, 2, 1, 1),
      makeRecord(3, 4, 1, 1),
      makeRecord(5, 6, 1, 1),
    ]
    const result = getDueReviewQuestions(records, 5, 2)
    expect(result).toHaveLength(2)
  })

  it('returns empty when nothing is due', () => {
    // Box 3 interval = 5, reviewed at round 10, current round = 12 (only 2 rounds passed)
    const records = [makeRecord(3, 5, 3, 10)]
    const result = getDueReviewQuestions(records, 12, 10)
    expect(result).toHaveLength(0)
  })

  it('returns questions from different boxes when due', () => {
    const records = [
      makeRecord(1, 2, 1, 1), // interval 1, due at round 2+
      makeRecord(3, 4, 2, 1), // interval 3, due at round 4+
    ]
    // At round 5, both should be due
    const result = getDueReviewQuestions(records, 5, 10)
    expect(result).toHaveLength(2)
  })
})
