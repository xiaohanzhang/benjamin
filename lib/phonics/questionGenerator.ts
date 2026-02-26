/**
 * Generates phonics questions using mastery-based word selection.
 * Prioritizes review words, introduces new words gradually, and
 * mixes question types based on the current difficulty level.
 */

import type { WordProgress } from '@/server/actions/game'
import { getWordsForLevel, type PhonicsWord } from './words'
import { illustrations } from './illustrations'

// Question types
export type QuestionType = 'picture_match' | 'read_pick' | 'sentence_match'

export interface Question {
  type: QuestionType
  targetWord: string
  options: string[]           // 3 word choices (or 3 picture choices for read_pick)
  correctIndex: number
  sentence?: string           // for sentence_match: "The ___ is red."
  sentenceColor?: string      // color for sentence_match
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

/**
 * Select words for a round based on mastery data.
 * Priority:
 *   1. 2-3 review words (mastery 1-2, oldest last_seen first)
 *   2. 1-2 new words (mastery 0, introduce gradually)
 *   3. Fill remaining with practice words (all seen, weighted by mastery)
 */
export function selectWordsForRound(
  level: number,
  progressMap: Map<string, WordProgress>,
): string[] {
  const available = getWordsForLevel(level).map(w => w.word)

  const newWords: string[] = []
  const reviewWords: { word: string; lastSeen: number; mastery: number }[] = []
  const practiceWords: { word: string; mastery: number }[] = []

  for (const word of available) {
    const prog = progressMap.get(word)
    if (!prog || prog.mastery === 0) {
      newWords.push(word)
    } else if (prog.mastery <= 2) {
      reviewWords.push({ word, lastSeen: prog.lastSeen, mastery: prog.mastery })
    } else {
      practiceWords.push({ word, mastery: prog.mastery })
    }
  }

  // Sort review words by oldest first
  reviewWords.sort((a, b) => a.lastSeen - b.lastSeen)

  const selected: string[] = []

  // 1. Review words (2-3)
  const reviewCount = Math.min(reviewWords.length, Math.random() < 0.5 ? 2 : 3)
  for (let i = 0; i < reviewCount; i++) {
    selected.push(reviewWords[i].word)
  }

  // 2. New words (1-2)
  const newCount = Math.min(newWords.length, Math.random() < 0.5 ? 1 : 2)
  const chosenNew = pick(newWords, newCount)
  selected.push(...chosenNew)

  // 3. Fill remainder with practice words (weighted by lower mastery = more likely)
  const remaining = QUESTIONS_PER_ROUND - selected.length
  const allAvailableForPractice = [
    ...reviewWords.slice(reviewCount).map(r => r.word),
    ...practiceWords.map(p => p.word),
    ...newWords.filter(w => !chosenNew.includes(w)),
  ]

  if (remaining > 0 && allAvailableForPractice.length > 0) {
    selected.push(...pick(allAvailableForPractice, Math.min(remaining, allAvailableForPractice.length)))
  }

  // If we still don't have enough, repeat some already selected
  while (selected.length < QUESTIONS_PER_ROUND && available.length > 0) {
    selected.push(pickRandom(available))
  }

  return shuffle(selected)
}

/**
 * Get question types available at a given level.
 */
function getQuestionTypes(level: number): QuestionType[] {
  switch (level) {
    case 1: return ['picture_match']
    case 2: return ['picture_match', 'read_pick']
    case 3: return ['picture_match', 'read_pick', 'sentence_match']
    default: return ['picture_match', 'read_pick', 'sentence_match']
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
  const distractors = pickDistractors(targetWord, allWords, true)
  const options = shuffle([targetWord, ...distractors])
  return {
    type,
    targetWord,
    options,
    correctIndex: options.indexOf(targetWord),
    sentence: `The ___ is ${color}.`,
    sentenceColor: color,
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
