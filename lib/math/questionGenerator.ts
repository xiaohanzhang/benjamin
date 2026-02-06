import type { MathQuestion, DifficultyLevel } from '@/types/game'

// Group 1: sum <= 10
function generateGroup1(): Pick<MathQuestion, 'operand1' | 'operand2' | 'operation' | 'correctAnswer'> {
  const sum = randomInt(1, 10)
  const operand1 = randomInt(1, sum)
  const operand2 = sum - operand1
  return { operand1, operand2, operation: 'addition', correctAnswer: sum }
}

// Group 2: operands <= 10, sum <= 20 but sum > 10
function generateGroup2(): Pick<MathQuestion, 'operand1' | 'operand2' | 'operation' | 'correctAnswer'> {
  // Ensure sum > 10 so it's distinct from group 1
  const sum = randomInt(11, 20)
  const minOp1 = Math.max(1, sum - 10)
  const maxOp1 = Math.min(10, sum - 1)
  const operand1 = randomInt(minOp1, maxOp1)
  const operand2 = sum - operand1
  return { operand1, operand2, operation: 'addition', correctAnswer: sum }
}

// Difficulty config: probability of picking group2
const GROUP2_PROBABILITY: Record<DifficultyLevel, number> = {
  1: 0,
  2: 0.2,
  3: 0.5,
  4: 0.8,
  5: 1,
}

export function generateQuestion(difficulty: DifficultyLevel): MathQuestion {
  const useGroup2 = Math.random() < GROUP2_PROBABILITY[difficulty]
  const base = useGroup2 ? generateGroup2() : generateGroup1()

  const id = `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`
  return { id, difficulty, ...base }
}

export function generateOptions(correctAnswer: number): number[] {
  const options = new Set<number>([correctAnswer])

  // Generate 2 distractors near the correct answer
  const attempts = 0
  while (options.size < 3 && attempts < 50) {
    const offset = randomInt(1, 3) * (Math.random() < 0.5 ? -1 : 1)
    const distractor = correctAnswer + offset
    if (distractor >= 0 && distractor <= 20 && distractor !== correctAnswer) {
      options.add(distractor)
    }
  }

  // Fallback if we somehow can't get 3 unique options
  let fallback = correctAnswer + 1
  while (options.size < 3) {
    if (!options.has(fallback) && fallback >= 0 && fallback <= 20) {
      options.add(fallback)
    }
    fallback++
  }

  return shuffle([...options])
}

export function questionKey(q: MathQuestion): string {
  return `${q.operand1}+${q.operand2}`
}

function randomInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min
}

function shuffle<T>(arr: T[]): T[] {
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]]
  }
  return arr
}
