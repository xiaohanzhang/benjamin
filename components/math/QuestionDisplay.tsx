'use client'

import type { MathQuestion } from '@/types/game'

interface QuestionDisplayProps {
  question: MathQuestion
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

export default function QuestionDisplay({ question }: QuestionDisplayProps) {
  const emoji = getEmoji(question.id)
  const symbol = question.operation === 'addition' ? '+' : '−'

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
    </div>
  )
}
