/**
 * Main phonics game component.
 * Manages game state, round progression, difficulty levels, and DB sync.
 * Both level and word progress are persisted via server actions (no localStorage).
 */
'use client'

import { useState, useEffect, useRef, useCallback, useTransition } from 'react'
import Link from 'next/link'
import { getPhonicsProgress, getPhonicsLevel, savePhonicsLevel, updateWordProgress, savePhonicsResult } from '@/server/actions/game'
import type { WordProgress } from '@/server/actions/game'
import { generateRound, type Question } from '@/lib/phonics/questionGenerator'
import { ConfettiOverlay, Encouragement, generateRewardData, type ConfettiPiece } from '@/components/math/RewardAnimation'
import QuestionCard from './QuestionCard'

const QUESTIONS_PER_ROUND = 10
const PROMOTE_THRESHOLD = 0.8   // 80% to level up
const DEMOTE_THRESHOLD = 0.3    // 30% to level down
const MAX_LEVEL = 10

type Phase = 'loading' | 'ready' | 'playing' | 'result'

export default function PhonicsGame() {
  const [phase, setPhase] = useState<Phase>('loading')
  const [level, setLevel] = useState(1)
  const [questions, setQuestions] = useState<Question[]>([])
  const [questionIndex, setQuestionIndex] = useState(0)
  const [results, setResults] = useState<('correct' | 'incorrect' | 'pending')[]>([])
  const [correctCount, setCorrectCount] = useState(0)
  const [streak, setStreak] = useState(0)

  // Reward animation
  const [showReward, setShowReward] = useState(false)
  const [encouragement, setEncouragement] = useState('')
  const [confettiPieces, setConfettiPieces] = useState<ConfettiPiece[]>([])

  // Word progress from server
  const progressRef = useRef<Map<string, WordProgress>>(new Map())
  const startTimeRef = useRef(0)
  const [isPending, startTransition] = useTransition()

  // Load level + word progress from server on mount
  useEffect(() => {
    Promise.all([getPhonicsLevel(), getPhonicsProgress()])
      .then(([savedLevel, progress]) => {
        setLevel(savedLevel)
        const map = new Map<string, WordProgress>()
        for (const p of progress) map.set(p.word, p)
        progressRef.current = map
        setPhase('ready')
      })
      .catch(() => setPhase('ready'))
  }, [])

  const startRound = useCallback(() => {
    const round = generateRound(level, progressRef.current)
    setQuestions(round)
    setQuestionIndex(0)
    setResults(Array(QUESTIONS_PER_ROUND).fill('pending'))
    setCorrectCount(0)
    setStreak(0)
    startTimeRef.current = Date.now()
    setPhase('playing')
  }, [level])

  const handleAnswer = useCallback((correct: boolean) => {
    const word = questions[questionIndex].targetWord

    // Update results
    setResults(prev => {
      const next = [...prev]
      next[questionIndex] = correct ? 'correct' : 'incorrect'
      return next
    })

    if (correct) {
      setCorrectCount(c => c + 1)
      setStreak(s => {
        const newStreak = s + 1
        if (newStreak >= 2) {
          const reward = generateRewardData(newStreak)
          setEncouragement(reward.encouragement)
          setConfettiPieces(reward.confettiPieces)
          setShowReward(true)
          setTimeout(() => setShowReward(false), 1200)
        }
        return newStreak
      })
    } else {
      setStreak(0)
    }

    // Update word progress on server (fire and forget)
    startTransition(() => {
      updateWordProgress(word, correct).then(() => {
        // Update local cache
        const prev = progressRef.current.get(word)
        if (prev) {
          const newAttempts = prev.attempts + 1
          const newCorrect = prev.correct + (correct ? 1 : 0)
          const newStreak = correct ? prev.streak + 1 : 0
          const accuracy = newCorrect / newAttempts
          let newMastery = prev.mastery
          if (correct) {
            if (newStreak >= 4 && accuracy > 0.85) newMastery = 3
            else if (newStreak >= 2 && accuracy >= 0.6) newMastery = 2
            else newMastery = Math.max(1, prev.mastery)
          } else {
            newMastery = Math.max(0, prev.mastery - 1)
          }
          progressRef.current.set(word, {
            ...prev,
            attempts: newAttempts,
            correct: newCorrect,
            streak: newStreak,
            mastery: newMastery,
            lastSeen: Date.now(),
          })
        } else {
          progressRef.current.set(word, {
            word,
            attempts: 1,
            correct: correct ? 1 : 0,
            streak: correct ? 1 : 0,
            mastery: correct ? 1 : 0,
            lastSeen: Date.now(),
          })
        }
      }).catch(() => { /* ignore network errors */ })
    })

    // Advance to next question or end round
    const nextIndex = questionIndex + 1
    if (nextIndex >= QUESTIONS_PER_ROUND) {
      // End of round — use refs for accurate count
      setTimeout(() => {
        const finalCorrect = results.filter(r => r === 'correct').length + (correct ? 1 : 0)
        const elapsed = Math.round((Date.now() - startTimeRef.current) / 1000)

        // Save round result for dashboard
        savePhonicsResult({ score: finalCorrect, level, duration: elapsed })

        // Level adjustment
        const accuracy = finalCorrect / QUESTIONS_PER_ROUND
        let newLevel = level
        if (accuracy >= PROMOTE_THRESHOLD && level < MAX_LEVEL) {
          newLevel = level + 1
        } else if (accuracy <= DEMOTE_THRESHOLD && level > 1) {
          newLevel = level - 1
        }
        setLevel(newLevel)
        savePhonicsLevel(newLevel)
        setPhase('result')
      }, 500)
    } else {
      setQuestionIndex(nextIndex)
    }
  }, [questions, questionIndex, level, results, startTransition])

  // Loading state
  if (phase === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-2xl text-gray-400 animate-pulse">Loading...</div>
      </div>
    )
  }

  // Ready state — show start button
  if (phase === 'ready') {
    const masteredCount = Array.from(progressRef.current.values()).filter(p => p.mastery >= 3).length
    const totalSeen = progressRef.current.size

    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-8 p-6">
        <h1 className="text-4xl sm:text-6xl font-extrabold bg-gradient-to-r from-pink-500 via-rose-500 to-orange-500 bg-clip-text text-transparent">
          Phonics Fun
        </h1>

        <div className="text-center space-y-2">
          <p className="text-lg text-gray-500">Level {level}</p>
          {totalSeen > 0 && (
            <p className="text-sm text-gray-400">
              {masteredCount} words mastered / {totalSeen} words seen
            </p>
          )}
        </div>

        <button
          onClick={startRound}
          className="text-2xl font-bold px-10 py-5 rounded-3xl bg-gradient-to-r from-pink-500 to-orange-500 text-white shadow-xl hover:scale-105 active:scale-95 transition-transform"
        >
          Start!
        </button>

        <Link href="/" className="text-gray-400 hover:text-gray-600 transition-colors text-sm mt-4">
          Back to home
        </Link>
      </div>
    )
  }

  // Playing state
  if (phase === 'playing') {
    const question = questions[questionIndex]
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-6 p-6">
        <ConfettiOverlay show={showReward} pieces={confettiPieces} />
        <Encouragement show={showReward} text={encouragement} />

        {/* Progress dots */}
        <div className="w-full max-w-md">
          <div className="flex gap-1.5">
            {results.map((status, i) => {
              let bgClass = 'bg-gray-200'
              if (status === 'correct') bgClass = 'bg-green-400'
              else if (status === 'incorrect') bgClass = 'bg-orange-300'
              else if (i === questionIndex) bgClass = 'bg-pink-400 animate-pulse'
              return <div key={i} className={`h-3 flex-1 rounded-full transition-colors duration-300 ${bgClass}`} />
            })}
          </div>
          <p className="text-center text-sm text-gray-500 mt-1">
            {questionIndex + 1} / {QUESTIONS_PER_ROUND}
          </p>
        </div>

        {/* Level indicator */}
        <div className="text-xs text-gray-400 font-medium">
          Level {level}
        </div>

        {/* Question */}
        <QuestionCard
          question={question}
          onAnswer={handleAnswer}
          disabled={false}
        />
      </div>
    )
  }

  // Result state
  const finalCorrect = results.filter(r => r === 'correct').length
  const accuracy = Math.round((finalCorrect / QUESTIONS_PER_ROUND) * 100)
  const stars = accuracy >= 90 ? 3 : accuracy >= 70 ? 2 : accuracy >= 50 ? 1 : 0

  return (
    <div className="min-h-screen flex flex-col items-center justify-center gap-6 p-6">
      <h2 className="text-3xl sm:text-5xl font-extrabold bg-gradient-to-r from-pink-500 via-rose-500 to-orange-500 bg-clip-text text-transparent">
        Round Complete!
      </h2>

      {/* Stars */}
      <div className="text-5xl">
        {Array.from({ length: 3 }, (_, i) => (
          <span key={i} className={i < stars ? '' : 'opacity-20'}>
            {i < stars ? '⭐' : '☆'}
          </span>
        ))}
      </div>

      {/* Score */}
      <div className="text-center">
        <div className="text-6xl font-extrabold text-gray-800">{finalCorrect}/{QUESTIONS_PER_ROUND}</div>
        <div className="text-lg text-gray-500 mt-1">{accuracy}% correct</div>
      </div>

      {/* Answer summary */}
      <div className="flex gap-1.5 w-full max-w-md">
        {results.map((status, i) => (
          <div
            key={i}
            className={`h-3 flex-1 rounded-full ${
              status === 'correct' ? 'bg-green-400' : 'bg-orange-300'
            }`}
          />
        ))}
      </div>

      {/* Level change indicator */}
      {accuracy >= PROMOTE_THRESHOLD * 100 && level < MAX_LEVEL && (
        <p className="text-green-600 font-bold text-lg">Level Up! ↑ Level {level}</p>
      )}

      <div className="flex gap-4 mt-4">
        <button
          onClick={() => { setPhase('ready') }}
          className="text-xl font-bold px-8 py-4 rounded-2xl bg-gradient-to-r from-pink-500 to-orange-500 text-white shadow-xl hover:scale-105 active:scale-95 transition-transform"
        >
          Play Again
        </button>
        <Link
          href="/"
          className="text-xl font-bold px-8 py-4 rounded-2xl bg-gray-200 text-gray-700 shadow-lg hover:scale-105 active:scale-95 transition-transform"
        >
          Home
        </Link>
      </div>
    </div>
  )
}
