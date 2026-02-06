export type OperationType = 'addition' | 'subtraction'
export type DifficultyLevel = 1 | 2 | 3 | 4 | 5
export type LeitnerBox = 1 | 2 | 3 | 4 | 5
export type GamePhase = 'idle' | 'question' | 'correct' | 'incorrect' | 'roundComplete' | 'levelUp'

export interface MathQuestion {
  id: string
  operand1: number
  operand2: number
  operation: OperationType
  correctAnswer: number
  difficulty: DifficultyLevel
}

export interface QuestionRecord {
  question: MathQuestion
  userAnswer: number
  isCorrect: boolean
}

export interface WrongAnswerRecord {
  questionKey: string // e.g. "3+5" for deduplication
  question: MathQuestion
  box: LeitnerBox
  lastReviewedRound: number
}

export interface RoundResult {
  round: number
  correct: number
  total: number
  difficulty: DifficultyLevel
  timestamp: number
}

export interface GameState {
  currentDifficulty: DifficultyLevel
  currentRound: number
  wrongAnswers: WrongAnswerRecord[]
  roundHistory: RoundResult[]
}

export const QUESTIONS_PER_ROUND = 10
export const PROMOTION_THRESHOLD = 0.8 // 80% to level up
export const DEMOTION_THRESHOLD = 0.3 // 30% to level down

export const LEITNER_REVIEW_INTERVALS: Record<LeitnerBox, number> = {
  1: 1,
  2: 3,
  3: 5,
  4: 10,
  5: 20,
}
