'use client'

import { useEffect, useRef } from 'react'
import type { QuestionRecord } from '@/types/game'

interface QuestionHistoryProps {
  history: QuestionRecord[]
}

export default function QuestionHistory({ history }: QuestionHistoryProps) {
  const bottomRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [history.length])

  if (history.length === 0) return null

  return (
    <div className="flex flex-col gap-1.5">
      {history.map((record, i) => {
        const symbol = record.question.operation === 'addition' ? '+' : '−'
        return (
          <div
            key={i}
            className={`flex items-center gap-1.5 text-sm font-medium rounded-lg px-2 py-1 ${
              record.isCorrect ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-600'
            }`}
          >
            <span className="shrink-0">{record.isCorrect ? '✅' : '❌'}</span>
            <span>
              {record.question.operand1} {symbol} {record.question.operand2} ={' '}
              {record.isCorrect ? (
                <span className="font-bold">{record.userAnswer}</span>
              ) : (
                <>
                  <span className="line-through opacity-50">{record.userAnswer}</span>
                  <span className="font-bold ml-1">{record.question.correctAnswer}</span>
                </>
              )}
            </span>
          </div>
        )
      })}
      <div ref={bottomRef} />
    </div>
  )
}
