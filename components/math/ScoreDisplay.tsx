'use client'

interface ScoreDisplayProps {
  correct: number
  streak: number
}

export default function ScoreDisplay({ correct, streak }: ScoreDisplayProps) {
  return (
    <div className="flex items-center gap-6 text-lg font-bold select-none">
      <div className="flex items-center gap-1">
        <span className="text-2xl">⭐</span>
        <span className="text-yellow-600">{correct}</span>
      </div>
      {streak >= 2 && (
        <div className="flex items-center gap-1 animate-bounce">
          <span className="text-2xl">🔥</span>
          <span className="text-orange-500">x{streak}</span>
        </div>
      )}
    </div>
  )
}
