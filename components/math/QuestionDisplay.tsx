'use client'

import type { MathQuestion } from '@/types/game'

interface QuestionDisplayProps {
  question: MathQuestion
  showHint?: boolean
  onHintClick?: () => void
}

const EMOJI_SETS = ['🍎', '⭐', '🌸', '🐱', '🎈', '🍊', '💜', '🐶']

function getEmoji(questionId: string): string {
  // Deterministic emoji per question
  const hash = questionId.charCodeAt(0) + questionId.charCodeAt(questionId.length - 1)
  return EMOJI_SETS[hash % EMOJI_SETS.length]
}

function EmojiRow({ count, emoji }: { count: number; emoji: string }) {
  // Show emojis in a wrapped row, max 10 per line
  return (
    <div className="flex flex-wrap justify-center gap-1">
      {Array.from({ length: count }, (_, i) => (
        <span key={i} className="text-2xl sm:text-3xl animate-pop" style={{ animationDelay: `${i * 50}ms` }}>
          {emoji}
        </span>
      ))}
    </div>
  )
}

export default function QuestionDisplay({ question, showHint, onHintClick }: QuestionDisplayProps) {
  const emoji = getEmoji(question.id)
  const symbol = question.operation === 'addition' ? '+' : '−'

  const sum = question.operand1 + question.operand2
  const hintAvailable = question.operation === 'addition' && sum > 10

  // Compute "make 10" decomposition: pick x as the operand closer to 10
  let hintX = 0, hintA = 0, hintB = 0
  if (hintAvailable) {
    const d1 = Math.abs(10 - question.operand1)
    const d2 = Math.abs(10 - question.operand2)
    if (d1 <= d2) {
      hintX = question.operand1
      const y = question.operand2
      hintA = 10 - hintX
      hintB = y - hintA
    } else {
      hintX = question.operand2
      const y = question.operand1
      hintA = 10 - hintX
      hintB = y - hintA
    }
  }

  return (
    <div className="flex flex-col items-center gap-4">
      {/* Visual counting aid */}
      <div className="flex items-center gap-3 flex-wrap justify-center">
        <EmojiRow count={question.operand1} emoji={emoji} />
        <span className="text-4xl font-bold text-pink-500">{symbol}</span>
        <EmojiRow count={question.operand2} emoji={emoji} />
      </div>

      {/* Numeric question */}
      <div className="text-6xl sm:text-7xl font-extrabold tracking-wider select-none">
        <span className="text-blue-500">{question.operand1}</span>
        <span className="text-pink-500 mx-3">{symbol}</span>
        <span className="text-green-500">{question.operand2}</span>
        <span className="text-purple-500 mx-3">=</span>
        <span className="text-orange-400">?</span>
      </div>

      {/* Make 10 hint */}
      {hintAvailable && !showHint && (
        <button
          onClick={onHintClick}
          className="mt-1 px-4 py-2 rounded-full text-sm font-semibold
            bg-yellow-100 text-yellow-700 hover:bg-yellow-200
            transition-colors cursor-pointer select-none"
        >
          💡 Hint
        </button>
      )}
      {hintAvailable && showHint && (
        <div className="mt-1 text-2xl sm:text-3xl font-bold tracking-wide select-none animate-pop">
          <span className="text-blue-500">{hintX}</span>
          <span className="text-pink-500 mx-2">+</span>
          <span className="text-amber-500">{hintA}</span>
          <span className="text-pink-500 mx-2">+</span>
          <span className="text-green-500">{hintB}</span>
          <span className="text-purple-500 mx-2">=</span>
          <span className="text-orange-400">?</span>
          <div className="text-xs text-gray-400 mt-1 text-center font-medium">
            {hintX} + {hintA} = 10 , then + {hintB} = make 10!
          </div>
        </div>
      )}
    </div>
  )
}
