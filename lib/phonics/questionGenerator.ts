/**
 * Generates phonics questions using mastery-based word selection.
 * Prioritizes review words, introduces new words gradually, and
 * mixes question types based on the current difficulty level.
 */

import type { WordProgress } from '@/server/actions/game'
import { getWordsForLevel } from './words'
import { illustrations } from './illustrations'

// Question types
export type QuestionType = 'picture_match' | 'read_pick' | 'sentence_match'

export interface Question {
  type: QuestionType
  targetWord: string
  options: string[]           // 3 word choices (or 3 picture choices for read_pick)
  correctIndex: number
  sentence?: string           // for sentence_match: "The ___ is red."
  sentenceColor?: string      // color for sentence_match (correct answer's color)
  optionColors?: string[]     // per-option colors for sentence_match (only correct matches sentenceColor)
}

const COLORS_FOR_SENTENCES = ['red', 'blue', 'green', 'brown', 'black', 'pink', 'orange', 'purple']
const QUESTIONS_PER_ROUND = 10

// Words that have illustrations (only use these for picture-related questions)
function hasIllustration(word: string): boolean {
  return word in illustrations
}

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

function pick<T>(arr: T[], n: number): T[] {
  return shuffle(arr).slice(0, n)
}

function pickRandom<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)]
}

// Base appearance weight by mastery level.
// learning (1) appears most; mastered (3) appears rarely but still gets review.
const MASTERY_WEIGHTS = [4, 6, 3, 1] // indexed by mastery 0-3

/**
 * Compute appearance weight for a word.
 * Higher mastery and higher streak both reduce weight so well-known words
 * appear less often and harder/newer words get more repetition.
 */
function wordWeight(prog: WordProgress | undefined): number {
  const mastery = prog?.mastery ?? 0
  const streak = prog?.streak ?? 0
  const base = MASTERY_WEIGHTS[Math.min(mastery, 3)]
  // Exponential decay: each streak point multiplies weight by 0.8
  return base * Math.pow(0.8, streak)
}

/**
 * Weighted sampling without replacement.
 * Zero-weight words are excluded. If all weights are zero (every word
 * has a very high streak), falls back to uniform sampling so the round
 * can still be filled.
 * Cycles through the pool if QUESTIONS_PER_ROUND > available words.
 */
function weightedSample(words: string[], weights: number[], n: number): string[] {
  if (words.length === 0) return []

  const result: string[] = []
  const pool = [...words]
  const poolW = [...weights]

  while (result.length < n) {
    if (pool.length === 0) {
      pool.push(...words)
      poolW.push(...weights)
    }
    const total = poolW.reduce((a, b) => a + b, 0)
    let r = Math.random() * total
    let idx = pool.length - 1
    for (let i = 0; i < pool.length; i++) {
      r -= poolW[i]
      if (r <= 0) { idx = i; break }
    }
    result.push(pool[idx])
    pool.splice(idx, 1)
    poolW.splice(idx, 1)
  }
  return result
}

/**
 * Select words for a round using mastery-weighted sampling.
 * Words with lower mastery and lower streak appear more frequently.
 */
export function selectWordsForRound(
  level: number,
  progressMap: Map<string, WordProgress>,
): string[] {
  const available = getWordsForLevel(level).map(w => w.word)
  const weights = available.map(w => wordWeight(progressMap.get(w)))
  return shuffle(weightedSample(available, weights, QUESTIONS_PER_ROUND))
}

/**
 * Get question types available at a given level.
 */
function getQuestionTypes(level: number): QuestionType[] {
  switch (level) {
    case 1: return ['picture_match']
    case 2: return ['picture_match', 'read_pick']
    case 3: return ['picture_match', 'read_pick', 'sentence_match']
    default: return ['picture_match', 'read_pick'] // no colour questions above level 3
  }
}

/**
 * Pick 2 distractor words different from the target.
 */
function pickDistractors(target: string, pool: string[], requireIllustration: boolean): string[] {
  const candidates = pool.filter(w => w !== target && (!requireIllustration || hasIllustration(w)))
  return pick(candidates, 2)
}

/**
 * Generate a single question for a target word.
 */
function generateQuestion(
  targetWord: string,
  type: QuestionType,
  allWords: string[],
): Question {
  if (type === 'picture_match') {
    // Show picture, pick the correct written word from 3
    const distractors = pickDistractors(targetWord, allWords, false)
    const options = shuffle([targetWord, ...distractors])
    return {
      type,
      targetWord,
      options,
      correctIndex: options.indexOf(targetWord),
    }
  }

  if (type === 'read_pick') {
    // Show written word, pick the correct picture from 3
    const distractors = pickDistractors(targetWord, allWords, true)
    const options = shuffle([targetWord, ...distractors])
    return {
      type,
      targetWord,
      options,
      correctIndex: options.indexOf(targetWord),
    }
  }

  // sentence_match: "The ___ is [color]."
  const color = pickRandom(COLORS_FOR_SENTENCES)
  const otherColors = COLORS_FOR_SENTENCES.filter(c => c !== color)
  const distractors = pickDistractors(targetWord, allWords, true)
  const options = shuffle([targetWord, ...distractors])
  const correctIdx = options.indexOf(targetWord)
  // Assign distinct colors per option: correct gets sentenceColor, distractors get other colors
  const optionColors = options.map((_, i) => {
    if (i === correctIdx) return color
    const idx = i < correctIdx ? i : i - 1
    return otherColors[idx % otherColors.length]
  })
  return {
    type,
    targetWord,
    options,
    correctIndex: correctIdx,
    sentence: `The ___ is ${color}.`,
    sentenceColor: color,
    optionColors,
  }
}

/**
 * Generate a full round of questions.
 */
export function generateRound(
  level: number,
  progressMap: Map<string, WordProgress>,
): Question[] {
  const words = selectWordsForRound(level, progressMap)
  const types = getQuestionTypes(level)
  const allWords = getWordsForLevel(level).map(w => w.word)

  return words.map(word => {
    // For picture-related types, ensure the word has an illustration
    let availableTypes = types
    if (!hasIllustration(word)) {
      availableTypes = types.filter(t => t === 'picture_match')
      if (availableTypes.length === 0) availableTypes = ['picture_match']
    }
    const type = pickRandom(availableTypes)
    return generateQuestion(word, type, allWords)
  })
}
