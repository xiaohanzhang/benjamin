import type { MathQuestion, WrongAnswerRecord, LeitnerBox } from '@/types/game'
import { LEITNER_REVIEW_INTERVALS } from '@/types/game'
import { questionKey } from '@/lib/math/questionGenerator'

export function addWrongAnswer(
  wrongAnswers: WrongAnswerRecord[],
  question: MathQuestion,
  currentRound: number
): WrongAnswerRecord[] {
  const key = questionKey(question)
  const existing = wrongAnswers.find((r) => r.questionKey === key)

  if (existing) {
    // Answer wrong again → back to box 1
    return wrongAnswers.map((r) =>
      r.questionKey === key ? { ...r, box: 1 as LeitnerBox, lastReviewedRound: currentRound } : r
    )
  }

  return [
    ...wrongAnswers,
    { questionKey: key, question, box: 1 as LeitnerBox, lastReviewedRound: currentRound },
  ]
}

export function promoteAnswer(
  wrongAnswers: WrongAnswerRecord[],
  key: string,
  currentRound: number
): WrongAnswerRecord[] {
  return wrongAnswers
    .map((r) => {
      if (r.questionKey !== key) return r
      if (r.box >= 5) return null // mastered — remove from system
      return { ...r, box: (r.box + 1) as LeitnerBox, lastReviewedRound: currentRound }
    })
    .filter((r): r is WrongAnswerRecord => r !== null)
}

export function demoteAnswer(
  wrongAnswers: WrongAnswerRecord[],
  key: string,
  currentRound: number
): WrongAnswerRecord[] {
  return wrongAnswers.map((r) =>
    r.questionKey === key ? { ...r, box: 1 as LeitnerBox, lastReviewedRound: currentRound } : r
  )
}

export function getDueReviewQuestions(
  wrongAnswers: WrongAnswerRecord[],
  currentRound: number,
  maxCount: number = 2
): WrongAnswerRecord[] {
  const due = wrongAnswers.filter((r) => {
    const interval = LEITNER_REVIEW_INTERVALS[r.box]
    return currentRound - r.lastReviewedRound >= interval
  })

  // Shuffle and take up to maxCount
  const shuffled = [...due].sort(() => Math.random() - 0.5)
  return shuffled.slice(0, maxCount)
}
