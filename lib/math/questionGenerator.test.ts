import { describe, it, expect } from 'vitest'
import { generateQuestion, generateOptions, questionKey } from './questionGenerator'
import type { MathQuestion } from '@/types/game'

describe('generateQuestion', () => {
  it('difficulty 1 always generates group1 (sum <= 10, operands >= 1)', () => {
    for (let i = 0; i < 50; i++) {
      const q = generateQuestion(1)
      expect(q.correctAnswer).toBeGreaterThanOrEqual(1)
      expect(q.correctAnswer).toBeLessThanOrEqual(10)
      expect(q.operand1).toBeGreaterThanOrEqual(1)
      expect(q.operand2).toBeGreaterThanOrEqual(0)
      expect(q.operand1 + q.operand2).toBe(q.correctAnswer)
      expect(q.operation).toBe('addition')
      expect(q.difficulty).toBe(1)
    }
  })

  it('difficulty 5 always generates group2 (sum 11-20)', () => {
    for (let i = 0; i < 50; i++) {
      const q = generateQuestion(5)
      expect(q.correctAnswer).toBeGreaterThanOrEqual(11)
      expect(q.correctAnswer).toBeLessThanOrEqual(20)
      expect(q.operand1).toBeGreaterThanOrEqual(1)
      expect(q.operand1).toBeLessThanOrEqual(10)
      expect(q.operand2).toBeGreaterThanOrEqual(1)
      expect(q.operand2).toBeLessThanOrEqual(10)
      expect(q.operand1 + q.operand2).toBe(q.correctAnswer)
      expect(q.difficulty).toBe(5)
    }
  })

  it('returns a question with a unique id', () => {
    const q1 = generateQuestion(1)
    const q2 = generateQuestion(1)
    expect(q1.id).not.toBe(q2.id)
  })
})

describe('generateOptions', () => {
  it('returns 3 unique numbers including correctAnswer', () => {
    for (let i = 0; i < 20; i++) {
      const answer = Math.floor(Math.random() * 15) + 1
      const options = generateOptions(answer)
      expect(options).toHaveLength(3)
      expect(options).toContain(answer)
      expect(new Set(options).size).toBe(3)
    }
  })

  it('all options are in range 0-20', () => {
    for (let i = 0; i <= 20; i++) {
      const options = generateOptions(i)
      for (const opt of options) {
        expect(opt).toBeGreaterThanOrEqual(0)
        expect(opt).toBeLessThanOrEqual(20)
      }
    }
  })
})

describe('questionKey', () => {
  it('returns "operand1+operand2" format', () => {
    const q: MathQuestion = {
      id: 'test',
      operand1: 3,
      operand2: 5,
      operation: 'addition',
      correctAnswer: 8,
      difficulty: 1,
    }
    expect(questionKey(q)).toBe('3+5')
  })
})
