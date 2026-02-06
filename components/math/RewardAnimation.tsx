'use client'

const CONFETTI_COLORS = [
  'bg-pink-400',
  'bg-yellow-400',
  'bg-green-400',
  'bg-blue-400',
  'bg-purple-400',
  'bg-orange-400',
  'bg-red-400',
  'bg-cyan-400',
]

export const ENCOURAGEMENTS = [
  'Yay! 🎉',
  'So good! 💪',
  'You rock! 🌟',
  'So smart! 🧠',
  'Go go go! 🚀',
  'Super! ✨',
  'Wow wow! 👏',
  'Amazing! 🏆',
]

export interface ConfettiPiece {
  id: number
  left: number
  color: string
  delay: number
  size: number
}

export function generateRewardData(streak: number) {
  const encouragement = ENCOURAGEMENTS[Math.floor(Math.random() * ENCOURAGEMENTS.length)]
  const confettiPieces: ConfettiPiece[] = Array.from(
    { length: streak >= 3 ? 30 : 15 },
    (_, i) => ({
      id: i,
      left: Math.random() * 100,
      color: CONFETTI_COLORS[Math.floor(Math.random() * CONFETTI_COLORS.length)],
      delay: Math.random() * 0.5,
      size: Math.random() * 8 + 4,
    })
  )
  return { encouragement, confettiPieces }
}

interface RewardAnimationProps {
  show: boolean
  encouragement: string
  confettiPieces: ConfettiPiece[]
}

export default function RewardAnimation({ show, encouragement, confettiPieces }: RewardAnimationProps) {
  if (!show) return null

  return (
    <div className="fixed inset-0 pointer-events-none z-50">
      {confettiPieces.map((piece) => (
        <div
          key={piece.id}
          className={`absolute rounded-full ${piece.color} animate-confetti`}
          style={{
            left: `${piece.left}%`,
            top: '-10px',
            width: `${piece.size}px`,
            height: `${piece.size}px`,
            animationDelay: `${piece.delay}s`,
          }}
        />
      ))}

      <div className="absolute inset-0 flex items-center justify-center">
        <div className="text-5xl sm:text-6xl font-extrabold animate-reward-text drop-shadow-lg">
          {encouragement}
        </div>
      </div>
    </div>
  )
}
