'use client'

interface AnswerOptionsProps {
  options: number[]
  onSelect: (answer: number) => void
  disabled: boolean
  correctAnswer: number | null // non-null when showing result
  selectedAnswer: number | null
}

export default function AnswerOptions({
  options,
  onSelect,
  disabled,
  correctAnswer,
  selectedAnswer,
}: AnswerOptionsProps) {
  return (
    <div className="flex gap-4 sm:gap-6 justify-center flex-wrap">
      {options.map((option) => {
        let bgClass = 'bg-gradient-to-br from-blue-400 to-purple-500 hover:from-blue-500 hover:to-purple-600 active:scale-95'

        if (correctAnswer !== null) {
          if (option === correctAnswer) {
            bgClass = 'bg-gradient-to-br from-green-400 to-emerald-500 ring-4 ring-green-300 scale-105'
          } else if (option === selectedAnswer && option !== correctAnswer) {
            bgClass = 'bg-gradient-to-br from-orange-300 to-orange-400 opacity-60'
          } else {
            bgClass = 'bg-gradient-to-br from-gray-300 to-gray-400 opacity-40'
          }
        }

        return (
          <button
            key={option}
            onClick={() => onSelect(option)}
            disabled={disabled}
            className={`
              w-20 h-20 sm:w-24 sm:h-24
              rounded-2xl
              text-4xl sm:text-5xl font-extrabold text-white
              shadow-lg
              transition-all duration-200
              select-none cursor-pointer
              disabled:cursor-default
              ${bgClass}
            `}
          >
            {option}
          </button>
        )
      })}
    </div>
  )
}
