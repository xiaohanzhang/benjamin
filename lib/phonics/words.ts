/**
 * Phonics word bank organized by difficulty level.
 * Based on Primary Phonics progression (CVC → blends/digraphs).
 */

export interface PhonicsWord {
  word: string
  level: 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10
}

// Level 1: short 'a', first set
// Level 2: short 'a', second set
// Level 3: short 'a', third set
// Level 4: short 'u'
// Level 5: short 'o'
// Level 6: short 'i'
// Level 7: short 'e'
// Level 8: mixed short vowels
// Level 9: consonant blends (CCVC/CVCC)
// Level 10: digraphs

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
  // Level 5
  { word: 'cot', level: 5 },
  { word: 'hot', level: 5 },
  { word: 'pot', level: 5 },
  { word: 'top', level: 5 },
  { word: 'mop', level: 5 },
  { word: 'hop', level: 5 },
  { word: 'dog', level: 5 },
  { word: 'log', level: 5 },
  { word: 'fog', level: 5 },
  { word: 'box', level: 5 },
  // Level 6
  { word: 'pig', level: 6 },
  { word: 'big', level: 6 },
  { word: 'dig', level: 6 },
  { word: 'lid', level: 6 },
  { word: 'kid', level: 6 },
  { word: 'fin', level: 6 },
  { word: 'pin', level: 6 },
  { word: 'sit', level: 6 },
  { word: 'hit', level: 6 },
  { word: 'lip', level: 6 },
  // Level 7
  { word: 'bed', level: 7 },
  { word: 'red', level: 7 },
  { word: 'pen', level: 7 },
  { word: 'hen', level: 7 },
  { word: 'ten', level: 7 },
  { word: 'net', level: 7 },
  { word: 'pet', level: 7 },
  { word: 'leg', level: 7 },
  { word: 'peg', level: 7 },
  { word: 'web', level: 7 },
  // Level 8
  { word: 'rod', level: 8 },
  { word: 'nod', level: 8 },
  { word: 'sob', level: 8 },
  { word: 'zip', level: 8 },
  { word: 'bib', level: 8 },
  { word: 'vet', level: 8 },
  { word: 'jet', level: 8 },
  { word: 'hem', level: 8 },
  { word: 'tub', level: 8 },
  // Level 9
  { word: 'flag', level: 9 },
  { word: 'clap', level: 9 },
  { word: 'crab', level: 9 },
  { word: 'frog', level: 9 },
  { word: 'stop', level: 9 },
  { word: 'sled', level: 9 },
  { word: 'spin', level: 9 },
  { word: 'drum', level: 9 },
  { word: 'jump', level: 9 },
  { word: 'milk', level: 9 },
  // Level 10
  { word: 'ship', level: 10 },
  { word: 'shop', level: 10 },
  { word: 'chat', level: 10 },
  { word: 'chin', level: 10 },
  { word: 'whip', level: 10 },
  { word: 'ring', level: 10 },
  { word: 'duck', level: 10 },
]

export function getWordsForLevel(maxLevel: number): PhonicsWord[] {
  return WORD_BANK.filter(w => w.level <= maxLevel)
}

export const ALL_WORDS = WORD_BANK.map(w => w.word)
