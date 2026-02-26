/**
 * Phonics word bank organized by difficulty level.
 * Based on Primary Phonics Level 1 workbook (CVC words).
 */

export interface PhonicsWord {
  word: string
  level: 1 | 2 | 3 | 4
}

// Level 1: short 'a', first set
// Level 2: short 'a', second set
// Level 3: short 'a', third set
// Level 4: short 'u'/'o' introduction

export const WORD_BANK: PhonicsWord[] = [
  // Level 1
  { word: 'cat', level: 1 },
  { word: 'bat', level: 1 },
  { word: 'hat', level: 1 },
  { word: 'pan', level: 1 },
  { word: 'rat', level: 1 },
  { word: 'fan', level: 1 },
  { word: 'man', level: 1 },
  { word: 'van', level: 1 },
  { word: 'can', level: 1 },
  // Level 2
  { word: 'sad', level: 2 },
  { word: 'dad', level: 2 },
  { word: 'pad', level: 2 },
  { word: 'mad', level: 2 },
  { word: 'ham', level: 2 },
  { word: 'ram', level: 2 },
  { word: 'dam', level: 2 },
  { word: 'jam', level: 2 },
  { word: 'mat', level: 2 },
  // Level 3
  { word: 'bag', level: 3 },
  { word: 'tag', level: 3 },
  { word: 'cap', level: 3 },
  { word: 'map', level: 3 },
  { word: 'cab', level: 3 },
  { word: 'gas', level: 3 },
  { word: 'nap', level: 3 },
  { word: 'rag', level: 3 },
  // Level 4
  { word: 'bud', level: 4 },
  { word: 'bun', level: 4 },
  { word: 'hut', level: 4 },
  { word: 'bug', level: 4 },
  { word: 'cup', level: 4 },
  { word: 'mug', level: 4 },
  { word: 'rug', level: 4 },
  { word: 'sun', level: 4 },
  { word: 'run', level: 4 },
  { word: 'gum', level: 4 },
]

export function getWordsForLevel(maxLevel: number): PhonicsWord[] {
  return WORD_BANK.filter(w => w.level <= maxLevel)
}

export const ALL_WORDS = WORD_BANK.map(w => w.word)
