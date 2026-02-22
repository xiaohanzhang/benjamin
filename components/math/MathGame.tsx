'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import type { MathQuestion, GamePhase, GameState, QuestionRecord, DifficultyLevel } from '@/types/game'
import { QUESTIONS_PER_ROUND } from '@/types/game'
import { generateQuestion, questionKey } from '@/lib/math/questionGenerator'
import { adjustDifficulty, DIFFICULTY_LABELS } from '@/lib/math/difficultyManager'
import {
  addWrongAnswer,
  promoteAnswer,
  demoteAnswer,
  getDueReviewQuestions,
} from '@/lib/spaced-repetition/leitnerBox'
import { saveMathResult } from '@/server/actions/game'
import QuestionDisplay from './QuestionDisplay'
import AnswerOptions from './AnswerOptions'
import ProgressBar from './ProgressBar'
import ScoreDisplay from './ScoreDisplay'
import {
  ConfettiOverlay,
  Encouragement,
  generateRewardData,
  type ConfettiPiece,
} from './RewardAnimation'
import QuestionHistory from './QuestionHistory'

const LS_KEY = 'math_game_state'

function loadLocalState(): GameState {
  if (typeof window === 'undefined') {
    return { currentDifficulty: 1, currentRound: 0, wrongAnswers: [] }
  }
  try {
    const raw = localStorage.getItem(LS_KEY)
    if (raw) {
      const parsed = JSON.parse(raw)
      return {
        currentDifficulty: (parsed.currentDifficulty ?? 1) as DifficultyLevel,
        currentRound: parsed.currentRound ?? 0,
        wrongAnswers: parsed.wrongAnswers ?? [],
      }
    }
  } catch { /* ignore parse errors */ }
  return { currentDifficulty: 1, currentRound: 0, wrongAnswers: [] }
}

function saveLocalState(state: GameState) {
  try {
    localStorage.setItem(LS_KEY, JSON.stringify(state))
  } catch { /* ignore quota errors */ }
}

export default function MathGame() {
  const [gameState, setGameState] = useState<GameState | null>(null)
  const [phase, setPhase] = useState<GamePhase>('idle')
  const [currentQuestion, setCurrentQuestion] = useState<MathQuestion | null>(null)
  const [answerInput, setAnswerInput] = useState('')
  const [questionIndex, setQuestionIndex] = useState(0)
  const [correctCount, setCorrectCount] = useState(0)
  const [streak, setStreak] = useState(0)
  const [bestStreak, setBestStreak] = useState(0)
  const [results, setResults] = useState<('correct' | 'incorrect' | 'pending')[]>([])
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null)
  const [showHint, setShowHint] = useState(false)
  const [isReviewQuestion, setIsReviewQuestion] = useState(false)
  const [roundStartTime, setRoundStartTime] = useState(0)
  const [roundElapsed, setRoundElapsed] = useState(0)

  const [questionHistory, setQuestionHistory] = useState<QuestionRecord[]>([])

  // Pre-generated reward data (set in event handlers, not render)
  const [rewardEncouragement, setRewardEncouragement] = useState('')
  const [rewardConfetti, setRewardConfetti] = useState<ConfettiPiece[]>([])

  // Refs for values used in setTimeout closures
  const questionIndexRef = useRef(0)
  const gameStateRef = useRef<GameState | null>(null)
  const roundStartTimeRef = useRef(0)
  const reviewQueueRef = useRef<MathQuestion[]>([])
  const reviewIndicesRef = useRef<Set<number>>(new Set())
  const correctCountRef = useRef(0)

  // Sync refs via effects for setTimeout closure access
  useEffect(() => { questionIndexRef.current = questionIndex }, [questionIndex])
  useEffect(() => { gameStateRef.current = gameState }, [gameState])
  useEffect(() => { roundStartTimeRef.current = roundStartTime }, [roundStartTime])
  useEffect(() => { correctCountRef.current = correctCount }, [correctCount])

  // Load saved state from localStorage on mount
  useEffect(() => {
    setGameState(loadLocalState())
  }, [])

  // Persist game state to localStorage whenever it changes
  useEffect(() => {
    if (gameState) saveLocalState(gameState)
  }, [gameState])

  const showQuestion = useCallback(
    (state: GameState, qIndex: number, revQueue: MathQuestion[], revIndices: Set<number>) => {
      if (revIndices.has(qIndex) && revQueue.length > 0) {
        const reviewQ = revQueue[0]
        setCurrentQuestion(reviewQ)
        setIsReviewQuestion(true)
        reviewQueueRef.current = revQueue.slice(1)
      } else {
        const q = generateQuestion(state.currentDifficulty)
        setCurrentQuestion(q)
        setIsReviewQuestion(false)
      }
      setSelectedAnswer(null)
      setAnswerInput('')
      setShowHint(false)
      setPhase('question')
    },
    []
  )

  const advanceToNext = useCallback(() => {
    const nextIdx = questionIndexRef.current + 1
    if (nextIdx >= QUESTIONS_PER_ROUND) {
      const elapsed = Math.round((Date.now() - roundStartTimeRef.current) / 1000)
      setRoundElapsed(elapsed)
      // Save to DB for dashboard
      const state = gameStateRef.current
      if (state) {
        saveMathResult({
          score: correctCountRef.current,
          level: state.currentDifficulty,
          duration: elapsed,
        })
      }
      setPhase('roundComplete')
      return
    }
    setQuestionIndex(nextIdx)
    questionIndexRef.current = nextIdx

    const state = gameStateRef.current
    if (state) {
      showQuestion(state, nextIdx, reviewQueueRef.current, reviewIndicesRef.current)
    }
  }, [showQuestion])

  const startRound = useCallback(() => {
    if (!gameState) return

    const newRound = gameState.currentRound + 1
    const newState = { ...gameState, currentRound: newRound }
    setGameState(newState)
    gameStateRef.current = newState

    const dueReviews = getDueReviewQuestions(gameState.wrongAnswers, newRound, 2)
    const revQueue = dueReviews.map((r) => r.question)

    const revIndices = new Set<number>()
    if (revQueue.length >= 1) revIndices.add(2 + Math.floor(Math.random() * 3))
    if (revQueue.length >= 2) revIndices.add(6 + Math.floor(Math.random() * 3))

    reviewQueueRef.current = revQueue
    reviewIndicesRef.current = revIndices

    setQuestionIndex(0)
    questionIndexRef.current = 0
    setCorrectCount(0)
    setStreak(0)
    setBestStreak(0)
    setResults([])
    setQuestionHistory([])
    setRoundStartTime(Date.now())

    showQuestion(newState, 0, revQueue, revIndices)
  }, [gameState, showQuestion])

  const handleDigit = useCallback((digit: number) => {
    setAnswerInput((prev) => {
      if (prev.length >= 3) return prev // max 3 digits
      return prev + digit.toString()
    })
  }, [])

  const handleDelete = useCallback(() => {
    setAnswerInput((prev) => prev.slice(0, -1))
  }, [])

  const handleAnswer = useCallback(
    (answer: number) => {
      if (!currentQuestion || !gameState || phase !== 'question') return

      setSelectedAnswer(answer)
      const isCorrect = answer === currentQuestion.correctAnswer
      setQuestionHistory((prev) => [...prev, { question: currentQuestion, userAnswer: answer, isCorrect }])

      if (isCorrect) {
        const newStreak = streak + 1
        setStreak(newStreak)
        if (newStreak > bestStreak) setBestStreak(newStreak)
        setCorrectCount((c) => c + 1)
        setResults((r) => [...r, 'correct'])
        setPhase('correct')

        const reward = generateRewardData(newStreak)
        setRewardEncouragement(reward.encouragement)
        setRewardConfetti(reward.confettiPieces)

        if (isReviewQuestion) {
          const key = questionKey(currentQuestion)
          setGameState((prev) => {
            if (!prev) return prev
            return { ...prev, wrongAnswers: promoteAnswer(prev.wrongAnswers, key, prev.currentRound) }
          })
        }

        setTimeout(advanceToNext, 1800)
      } else {
        setStreak(0)
        setResults((r) => [...r, 'incorrect'])
        setPhase('incorrect')

        if (isReviewQuestion) {
          const key = questionKey(currentQuestion)
          setGameState((prev) => {
            if (!prev) return prev
            return { ...prev, wrongAnswers: demoteAnswer(prev.wrongAnswers, key, prev.currentRound) }
          })
        } else {
          setGameState((prev) => {
            if (!prev) return prev
            return { ...prev, wrongAnswers: addWrongAnswer(prev.wrongAnswers, currentQuestion, prev.currentRound) }
          })
        }

        setTimeout(advanceToNext, 3000)
      }
    },
    [currentQuestion, gameState, phase, streak, bestStreak, isReviewQuestion, advanceToNext]
  )

  const handleSubmit = useCallback(() => {
    if (answerInput.length === 0) return
    const answer = parseInt(answerInput, 10)
    handleAnswer(answer)
  }, [answerInput, handleAnswer])

  const handleRoundComplete = useCallback(() => {
    if (!gameState) return

    const { newDifficulty, leveledUp } = adjustDifficulty(
      gameState.currentDifficulty,
      correctCount,
      QUESTIONS_PER_ROUND
    )

    if (leveledUp) {
      const reward = generateRewardData(bestStreak)
      setRewardEncouragement(reward.encouragement)
      setRewardConfetti(reward.confettiPieces)
    }

    setGameState((prev) => {
      if (!prev) return prev
      return { ...prev, currentDifficulty: newDifficulty }
    })

    if (leveledUp) {
      setPhase('levelUp')
    }
  }, [gameState, correctCount, bestStreak])

  // Loading
  if (!gameState) {
    return (
      <div className="flex flex-1 items-center justify-center">
        <div className="text-4xl animate-pulse">🎮 Loading...</div>
      </div>
    )
  }

  // Idle screen
  if (phase === 'idle') {
    return (
      <div className="flex flex-col flex-1 items-center justify-center gap-8 p-6">
        <div className="text-center">
          <h1 className="text-4xl sm:text-5xl font-extrabold mb-2 bg-gradient-to-r from-pink-500 via-purple-500 to-blue-500 bg-clip-text text-transparent">
            Math Game
          </h1>
          <p className="text-xl text-gray-500">
            Level: {DIFFICULTY_LABELS[gameState.currentDifficulty]}
          </p>
        </div>

        <button
          onClick={startRound}
          className="px-12 py-6 rounded-3xl text-3xl font-extrabold text-white
            bg-gradient-to-r from-green-400 to-cyan-500
            shadow-xl hover:shadow-2xl hover:scale-105
            active:scale-95 transition-all duration-200
            cursor-pointer select-none"
        >
          Go! 🚀
        </button>

        {gameState.wrongAnswers.length > 0 && (
          <p className="text-gray-400">📝 Review: {gameState.wrongAnswers.length} to practice</p>
        )}
      </div>
    )
  }

  // Round complete summary
  if (phase === 'roundComplete' || phase === 'levelUp') {
    const accuracy = Math.round((correctCount / QUESTIONS_PER_ROUND) * 100)

    return (
      <div className="flex flex-col flex-1 items-center justify-center gap-6 p-6">
        <ConfettiOverlay show={phase === 'levelUp'} pieces={rewardConfetti} />
        <Encouragement show={phase === 'levelUp'} text={rewardEncouragement} />

        <h2 className="text-4xl font-extrabold text-center">
          {phase === 'levelUp' ? '🎊 Level Up! 🎊' : '🌟 All Done!'}
        </h2>

        <div className="bg-white/80 rounded-3xl p-8 shadow-xl text-center space-y-4 max-w-sm w-full">
          <div className="text-6xl font-extrabold bg-gradient-to-r from-yellow-400 to-orange-500 bg-clip-text text-transparent">
            {correctCount}/{QUESTIONS_PER_ROUND}
          </div>
          <div className="text-xl text-gray-600">{accuracy}% right</div>
          {bestStreak >= 2 && (
            <div className="text-lg text-orange-500 font-bold">🔥 Best streak x{bestStreak}</div>
          )}
          <div className="text-sm text-gray-400">{roundElapsed} seconds</div>
          {phase === 'levelUp' && (
            <div className="text-lg font-bold text-purple-600">
              New level: {DIFFICULTY_LABELS[gameState.currentDifficulty]}
            </div>
          )}
        </div>

        <button
          onClick={() => {
            if (phase === 'roundComplete') handleRoundComplete()
            setPhase('idle')
          }}
          className="px-10 py-5 rounded-3xl text-2xl font-extrabold text-white
            bg-gradient-to-r from-pink-500 to-purple-500
            shadow-xl hover:shadow-2xl hover:scale-105
            active:scale-95 transition-all duration-200
            cursor-pointer select-none"
        >
          Play Again! 🎯
        </button>
      </div>
    )
  }

  // Active game (question / correct / incorrect)
  return (
    <div className="flex flex-1 p-4 sm:p-6 gap-4">
      {/* Left: question history panel (hidden on small screens) */}
      <aside className="hidden md:flex w-48 shrink-0 flex-col overflow-y-auto rounded-2xl bg-white/60 p-3 shadow-inner">
        <h3 className="text-xs font-bold text-gray-400 uppercase mb-2">History</h3>
        <QuestionHistory history={questionHistory} />
      </aside>

      {/* Right: main game area */}
      <div className="flex flex-col flex-1 gap-4">
        {/* Header row */}
        <div className="flex items-center justify-between">
          <ScoreDisplay correct={correctCount} streak={streak} />
          <span className="text-sm text-gray-400 font-medium">
            {DIFFICULTY_LABELS[gameState.currentDifficulty]}
          </span>
        </div>

        {/* Progress */}
        <div className="max-w-md w-full mx-auto">
          <ProgressBar current={questionIndex} results={results} />
        </div>

        {/* Question area — fills remaining space */}
        <div className="flex flex-col flex-1 items-center justify-center gap-8">
          <Encouragement show={phase === 'correct'} text={rewardEncouragement} />

          {currentQuestion && (
              <QuestionDisplay
                question={currentQuestion}
                showHint={showHint}
                onHintClick={() => setShowHint(true)}
                inputValue={phase === 'question' ? answerInput : (selectedAnswer !== null ? String(selectedAnswer) : '')}
              />
            )}

          {/* Feedback messages */}
          {phase === 'correct' && (
            <div className="text-3xl font-extrabold text-green-500 animate-bounce">
              {streak >= 3 ? 'On fire! 🔥' : 'Yes! ✨'}
            </div>
          )}
          {phase === 'incorrect' && currentQuestion && (
            <div className="text-2xl font-bold text-orange-500 animate-pulse">
              Good try! It&apos;s <span className="text-green-600 text-3xl">{currentQuestion.correctAnswer}</span>
            </div>
          )}

          {/* Number pad */}
          {currentQuestion && (
            <AnswerOptions
              inputValue={answerInput}
              onDigit={handleDigit}
              onDelete={handleDelete}
              onSubmit={handleSubmit}
              disabled={phase !== 'question'}
            />
          )}

          {isReviewQuestion && phase === 'question' && (
            <div className="text-sm text-purple-400 font-medium">📝 Review</div>
          )}
        </div>
      </div>

      {/* Confetti overlay — only true viewport popup */}
      <ConfettiOverlay show={phase === 'correct'} pieces={rewardConfetti} />
    </div>
  )
}
