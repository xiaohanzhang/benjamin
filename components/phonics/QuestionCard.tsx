/**
 * Renders a single phonics question. Supports 3 question types:
 * - picture_match: Show picture, pick correct written word
 * - read_pick: Show written word, pick correct picture
 * - sentence_match: Show sentence with blank, pick correct picture
 */
'use client'

import { useEffect, useCallback, useState } from 'react'
import type { Question } from '@/lib/phonics/questionGenerator'
import { illustrations } from '@/lib/phonics/illustrations'

interface Props {
  question: Question
  onAnswer: (correct: boolean) => void
  disabled: boolean
}

function WordButton({ word, onClick, state }: {
  word: string
  onClick: () => void
  state: 'default' | 'correct' | 'wrong' | 'disabled'
}) {
  const base = 'text-2xl sm:text-3xl font-bold py-4 px-6 rounded-2xl transition-all duration-200 min-w-[120px]'
  const styles = {
    default: 'bg-white shadow-lg border-2 border-gray-200 hover:border-blue-400 hover:shadow-xl hover:scale-105 active:scale-95',
    correct: 'bg-green-100 border-2 border-green-500 text-green-700 scale-105 shadow-lg',
    wrong: 'bg-red-100 border-2 border-red-400 text-red-600 scale-95',
    disabled: 'bg-gray-50 border-2 border-gray-200 text-gray-400 cursor-not-allowed',
  }

  return (
    <button
      onClick={onClick}
      disabled={state !== 'default'}
      className={`${base} ${styles[state]}`}
    >
      {word}
    </button>
  )
}

function PictureButton({ word, onClick, state, color }: {
  word: string
  onClick: () => void
  state: 'default' | 'correct' | 'wrong' | 'disabled'
  color?: string
}) {
  const Illust = illustrations[word]
  const base = 'w-24 h-24 sm:w-28 sm:h-28 p-3 rounded-2xl transition-all duration-200'
  const styles = {
    default: 'bg-white shadow-lg border-2 border-gray-200 hover:border-blue-400 hover:shadow-xl hover:scale-105 active:scale-95',
    correct: 'bg-green-100 border-2 border-green-500 scale-105 shadow-lg',
    wrong: 'bg-red-100 border-2 border-red-400 scale-95',
    disabled: 'bg-gray-50 border-2 border-gray-200 opacity-50 cursor-not-allowed',
  }

  return (
    <button
      onClick={onClick}
      disabled={state !== 'default'}
      className={`${base} ${styles[state]}`}
    >
      {Illust ? <Illust color={color} /> : <span className="text-3xl">{word}</span>}
    </button>
  )
}

export default function QuestionCard({ question, onAnswer, disabled }: Props) {
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null)
  const [showResult, setShowResult] = useState(false)

  const isCorrect = selectedIndex === question.correctIndex

  // Reset state when question changes
  useEffect(() => {
    setSelectedIndex(null)
    setShowResult(false)
  }, [question])

  const handleSelect = useCallback((index: number) => {
    if (disabled || selectedIndex !== null) return
    setSelectedIndex(index)
    setShowResult(true)

    const correct = index === question.correctIndex

    // Delay before moving on
    setTimeout(() => {
      onAnswer(correct)
    }, correct ? 800 : 1500)
  }, [disabled, selectedIndex, question, onAnswer])

  function getButtonState(index: number): 'default' | 'correct' | 'wrong' | 'disabled' {
    if (selectedIndex === null) return disabled ? 'disabled' : 'default'
    if (index === question.correctIndex) return 'correct'
    if (index === selectedIndex) return 'wrong'
    return 'disabled'
  }

  const Illustration = illustrations[question.targetWord]

  // Prompt text shown above options
  let prompt: React.ReactNode

  if (question.type === 'picture_match') {
    prompt = (
      <div className="flex flex-col items-center gap-3">
        <p className="text-lg text-gray-500 font-semibold">What word is this?</p>
        <div className="w-32 h-32 sm:w-40 sm:h-40">
          {Illustration ? <Illustration /> : <span className="text-6xl">{question.targetWord}</span>}
        </div>
      </div>
    )
  } else if (question.type === 'read_pick') {
    prompt = (
      <div className="flex flex-col items-center gap-3">
        <p className="text-lg text-gray-500 font-semibold">Pick the picture!</p>
        <div className="text-5xl sm:text-6xl font-extrabold text-gray-800 tracking-wider">
          {question.targetWord}
        </div>
      </div>
    )
  } else {
    // sentence_match
    prompt = (
      <div className="flex flex-col items-center gap-3">
        <p className="text-lg text-gray-500 font-semibold">Pick the right picture!</p>
        <div className="text-2xl sm:text-3xl font-bold text-gray-700">
          {question.sentence}
        </div>
      </div>
    )
  }

  // Option buttons — word buttons or picture buttons
  const usesPictures = question.type === 'read_pick' || question.type === 'sentence_match'

  return (
    <div className="flex flex-col items-center gap-8">
      {prompt}

      <div className="flex gap-4 flex-wrap justify-center">
        {question.options.map((option, i) => (
          usesPictures ? (
            <PictureButton
              key={option}
              word={option}
              onClick={() => handleSelect(i)}
              state={getButtonState(i)}
              color={question.type === 'sentence_match' ? question.optionColors?.[i] : undefined}
            />
          ) : (
            <WordButton
              key={option}
              word={option}
              onClick={() => handleSelect(i)}
              state={getButtonState(i)}
            />
          )
        ))}
      </div>

      {/* Show correct answer label after wrong answer */}
      {showResult && !isCorrect && selectedIndex !== null && (
        <div className="text-center animate-bounce">
          <p className="text-lg font-bold text-orange-600">
            It&apos;s &ldquo;{question.targetWord}&rdquo;!
          </p>
          <div className="w-20 h-20 mx-auto mt-2">
            {Illustration && <Illustration />}
          </div>
        </div>
      )}
    </div>
  )
}
