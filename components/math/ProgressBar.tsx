'use client'

import { QUESTIONS_PER_ROUND } from '@/types/game'

interface ProgressBarProps {
  current: number
  results: ('correct' | 'incorrect' | 'pending')[]
}

export default function ProgressBar({ current, results }: ProgressBarProps) {
  return (
    <div className="w-full">
      <div className="flex gap-1.5">
        {Array.from({ length: QUESTIONS_PER_ROUND }, (_, i) => {
          const status = results[i] ?? 'pending'
          let bgClass = 'bg-gray-200'
          if (status === 'correct') bgClass = 'bg-green-400'
          else if (status === 'incorrect') bgClass = 'bg-orange-300'
          else if (i === current) bgClass = 'bg-blue-400 animate-pulse'

          return (
            <div
              key={i}
              className={`h-3 flex-1 rounded-full transition-colors duration-300 ${bgClass}`}
            />
          )
        })}
      </div>
      <p className="text-center text-sm text-gray-500 mt-1">
        {current + 1} / {QUESTIONS_PER_ROUND}
      </p>
    </div>
  )
}
