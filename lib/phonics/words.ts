/**
 * Phonics word bank organized by difficulty level.
 * Based on Primary Phonics progression (CVC → blends/digraphs → long vowels → vowel teams).
 */

export interface PhonicsWord {
  word: string
  level: 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12 | 13 | 14 | 15
}

// Level 1:  short 'a', first set
// Level 2:  short 'a', second set
// Level 3:  short 'a', third set
// Level 4:  short 'u'
// Level 5:  short 'o'
// Level 6:  short 'i'
// Level 7:  short 'e'
// Level 8:  mixed short vowels
// Level 9:  consonant blends (CCVC/CVCC)
// Level 10: digraphs (sh, ch, th, wh, ng, ck)
// Level 11: long 'a' — silent-e (CVCe)
// Level 12: long 'i' and long 'o' — silent-e
// Level 13: long 'u' and 'e' — silent-e + ee/ea vowel teams
// Level 14: vowel teams (ai/ay, oa, ow/ou)
// Level 15: r-controlled vowels (ar, or, er/ir/ur)

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
  // Level 10 — digraphs (sh, ch, th, wh, ng, ck)
  { word: 'ship', level: 10 },
  { word: 'shop', level: 10 },
  { word: 'shut', level: 10 },
  { word: 'shed', level: 10 },
  { word: 'fish', level: 10 },
  { word: 'dish', level: 10 },
  { word: 'chat', level: 10 },
  { word: 'chin', level: 10 },
  { word: 'chip', level: 10 },
  { word: 'chop', level: 10 },
  { word: 'much', level: 10 },
  { word: 'thin', level: 10 },
  { word: 'that', level: 10 },
  { word: 'with', level: 10 },
  { word: 'whip', level: 10 },
  { word: 'ring', level: 10 },
  { word: 'sing', level: 10 },
  { word: 'duck', level: 10 },
  { word: 'back', level: 10 },
  { word: 'kick', level: 10 },
  // Level 11 — long 'a' silent-e (CVCe)
  { word: 'cake', level: 11 },
  { word: 'bake', level: 11 },
  { word: 'lake', level: 11 },
  { word: 'make', level: 11 },
  { word: 'rake', level: 11 },
  { word: 'came', level: 11 },
  { word: 'game', level: 11 },
  { word: 'name', level: 11 },
  { word: 'same', level: 11 },
  { word: 'gate', level: 11 },
  { word: 'late', level: 11 },
  { word: 'rate', level: 11 },
  { word: 'cave', level: 11 },
  { word: 'wave', level: 11 },
  { word: 'face', level: 11 },
  { word: 'lace', level: 11 },
  { word: 'race', level: 11 },
  { word: 'pace', level: 11 },
  // Level 12 — long 'i' and long 'o' silent-e
  { word: 'bike', level: 12 },
  { word: 'like', level: 12 },
  { word: 'hike', level: 12 },
  { word: 'bite', level: 12 },
  { word: 'kite', level: 12 },
  { word: 'site', level: 12 },
  { word: 'hide', level: 12 },
  { word: 'ride', level: 12 },
  { word: 'mine', level: 12 },
  { word: 'pine', level: 12 },
  { word: 'nose', level: 12 },
  { word: 'note', level: 12 },
  { word: 'bone', level: 12 },
  { word: 'cone', level: 12 },
  { word: 'hope', level: 12 },
  { word: 'rope', level: 12 },
  { word: 'mole', level: 12 },
  { word: 'pole', level: 12 },
  // Level 13 — long 'u'/'e' silent-e + ee/ea vowel teams
  { word: 'tube', level: 13 },
  { word: 'cute', level: 13 },
  { word: 'mule', level: 13 },
  { word: 'fuse', level: 13 },
  { word: 'tree', level: 13 },
  { word: 'free', level: 13 },
  { word: 'bee', level: 13 },
  { word: 'see', level: 13 },
  { word: 'feet', level: 13 },
  { word: 'meet', level: 13 },
  { word: 'sea', level: 13 },
  { word: 'tea', level: 13 },
  { word: 'pea', level: 13 },
  { word: 'read', level: 13 },
  { word: 'bead', level: 13 },
  { word: 'meal', level: 13 },
  { word: 'seal', level: 13 },
  { word: 'leaf', level: 13 },
  // Level 14 — vowel teams (ai/ay, oa, ow/ou)
  { word: 'rain', level: 14 },
  { word: 'pain', level: 14 },
  { word: 'tail', level: 14 },
  { word: 'mail', level: 14 },
  { word: 'sail', level: 14 },
  { word: 'wait', level: 14 },
  { word: 'day', level: 14 },
  { word: 'say', level: 14 },
  { word: 'play', level: 14 },
  { word: 'stay', level: 14 },
  { word: 'coat', level: 14 },
  { word: 'boat', level: 14 },
  { word: 'goat', level: 14 },
  { word: 'road', level: 14 },
  { word: 'toad', level: 14 },
  { word: 'snow', level: 14 },
  { word: 'grow', level: 14 },
  { word: 'flow', level: 14 },
  { word: 'out', level: 14 },
  { word: 'loud', level: 14 },
  // Level 15 — r-controlled vowels (ar, or, er/ir/ur)
  { word: 'car', level: 15 },
  { word: 'bar', level: 15 },
  { word: 'far', level: 15 },
  { word: 'jar', level: 15 },
  { word: 'star', level: 15 },
  { word: 'barn', level: 15 },
  { word: 'farm', level: 15 },
  { word: 'fort', level: 15 },
  { word: 'corn', level: 15 },
  { word: 'horn', level: 15 },
  { word: 'born', level: 15 },
  { word: 'form', level: 15 },
  { word: 'her', level: 15 },
  { word: 'fern', level: 15 },
  { word: 'bird', level: 15 },
  { word: 'girl', level: 15 },
  { word: 'stir', level: 15 },
  { word: 'burn', level: 15 },
  { word: 'turn', level: 15 },
  { word: 'hurt', level: 15 },
]

export function getWordsForLevel(maxLevel: number): PhonicsWord[] {
  return WORD_BANK.filter(w => w.level <= maxLevel)
}

export const ALL_WORDS = WORD_BANK.map(w => w.word)
