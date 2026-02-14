'use client'

interface AnswerOptionsProps {
  inputValue: string
  onDigit: (digit: number) => void
  onDelete: () => void
  onSubmit: () => void
  disabled: boolean
}

export default function AnswerOptions({
  inputValue,
  onDigit,
  onDelete,
  onSubmit,
  disabled,
}: AnswerOptionsProps) {
  const btnBase = `
    w-20 h-16 sm:w-24 sm:h-20
    rounded-2xl
    text-3xl sm:text-4xl font-extrabold text-white
    shadow-lg
    transition-all duration-200
    select-none cursor-pointer
    disabled:cursor-default disabled:opacity-40
    active:scale-95
  `

  const digitClass = `${btnBase} bg-gradient-to-br from-blue-400 to-purple-500 hover:from-blue-500 hover:to-purple-600`
  const deleteClass = `${btnBase} bg-gradient-to-br from-orange-400 to-red-400 hover:from-orange-500 hover:to-red-500`
  const okClass = `${btnBase} bg-gradient-to-br from-green-400 to-emerald-500 hover:from-green-500 hover:to-emerald-600`

  return (
    <div className="grid grid-cols-3 gap-3 sm:gap-4 justify-items-center">
      {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((n) => (
        <button
          key={n}
          onClick={() => onDigit(n)}
          disabled={disabled}
          className={digitClass}
        >
          {n}
        </button>
      ))}
      <button
        onClick={() => onDigit(0)}
        disabled={disabled}
        className={digitClass}
      >
        0
      </button>
      <button
        onClick={onDelete}
        disabled={disabled || inputValue.length === 0}
        className={deleteClass}
      >
        &larr;
      </button>
      <button
        onClick={onSubmit}
        disabled={disabled || inputValue.length === 0}
        className={okClass}
      >
        OK
      </button>
    </div>
  )
}
