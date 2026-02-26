'use client'

import { useState } from 'react'
import Link from 'next/link'
import type { GameDashboardData, DailyActivity } from '@/server/actions/game'
import GameDashboardSection from './GameDashboardSection'
import AllSection from './AllSection'

interface Props {
  mathData: GameDashboardData
  blocksData: GameDashboardData
  cannonData: GameDashboardData
  phonicsData: GameDashboardData
  dailyActivity: DailyActivity[]
}

const TABS = [
  { id: 'all', label: 'All', emoji: '📊' },
  { id: 'math', label: 'Math', emoji: '🧮' },
  { id: 'blocks', label: 'Making 10', emoji: '🪵' },
  { id: 'cannon', label: 'Cannon', emoji: '💥' },
  { id: 'phonics', label: 'Phonics', emoji: '📖' },
] as const

function EmptyTab({ href, label }: { href: string; label: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-20 text-center">
      <p className="text-gray-400 mb-4">No games played yet.</p>
      <Link href={href} className="rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-500 px-6 py-3 text-white font-bold shadow-lg hover:scale-105 transition-transform">
        {label}
      </Link>
    </div>
  )
}

export default function DashboardShell({ mathData, blocksData, cannonData, phonicsData, dailyActivity }: Props) {
  const [active, setActive] = useState('all')

  const hasAny = mathData.games.length > 0 || blocksData.games.length > 0 || cannonData.games.length > 0 || phonicsData.games.length > 0

  if (!hasAny) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center text-center p-6">
        <div className="text-6xl mb-4">📊</div>
        <h2 className="text-2xl font-bold text-gray-700 mb-2">No games played yet!</h2>
        <p className="text-gray-500 mb-6">Play some games and come back to see your stats.</p>
        <div className="flex gap-4">
          <Link href="/math" className="rounded-2xl bg-gradient-to-r from-blue-500 to-purple-500 px-6 py-3 text-white font-bold shadow-lg hover:scale-105 transition-transform">
            Play Math
          </Link>
          <Link href="/blocks" className="rounded-2xl bg-gradient-to-r from-yellow-500 to-orange-500 px-6 py-3 text-white font-bold shadow-lg hover:scale-105 transition-transform">
            Making 10
          </Link>
          <Link href="/cannon" className="rounded-2xl bg-gradient-to-r from-cyan-500 to-blue-500 px-6 py-3 text-white font-bold shadow-lg hover:scale-105 transition-transform">
            Number Cannon
          </Link>
          <Link href="/phonics" className="rounded-2xl bg-gradient-to-r from-pink-500 to-orange-500 px-6 py-3 text-white font-bold shadow-lg hover:scale-105 transition-transform">
            Phonics Fun
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex">
      {/* Sidebar */}
      <nav className="w-44 shrink-0 border-r border-gray-200 p-4 pt-14 space-y-1">
        {TABS.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActive(tab.id)}
            className={`w-full text-left px-3 py-2.5 rounded-xl text-sm font-semibold transition-colors ${
              active === tab.id
                ? 'bg-gradient-to-r from-emerald-50 to-teal-50 text-emerald-700'
                : 'text-gray-500 hover:bg-gray-100 hover:text-gray-700'
            }`}
          >
            {tab.emoji} {tab.label}
          </button>
        ))}
      </nav>

      {/* Content */}
      <main className="flex-1 p-6 sm:p-10 overflow-y-auto">
        <div className="max-w-2xl mx-auto">
          <h1 className="mb-8 text-3xl sm:text-5xl font-extrabold bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500 bg-clip-text text-transparent">
            Dashboard
          </h1>

          <div className="space-y-10">
            {active === 'all' && <AllSection data={dailyActivity} />}

            {active === 'math' && (mathData.games.length > 0 ? (
              <GameDashboardSection
                title="Math"
                emoji="🧮"
                data={mathData}
                colors={{
                  stats: ['text-purple-600', 'text-blue-600', 'text-pink-500'],
                  score: '#8b5cf6',
                  max: '#ec4899',
                  avg: '#8b5cf6',
                  area: '#ede9fe',
                }}
              />
            ) : <EmptyTab href="/math" label="Play Math" />)}

            {active === 'blocks' && (blocksData.games.length > 0 ? (
              <GameDashboardSection
                title="Making 10"
                emoji="🪵"
                data={blocksData}
                colors={{
                  stats: ['text-orange-600', 'text-yellow-600', 'text-red-500'],
                  score: '#f97316',
                  max: '#ef4444',
                  avg: '#f97316',
                  area: '#fecaca',
                }}
              />
            ) : <EmptyTab href="/blocks" label="Play Making 10" />)}

            {active === 'cannon' && (cannonData.games.length > 0 ? (
              <GameDashboardSection
                title="Number Cannon"
                emoji="💥"
                data={cannonData}
                colors={{
                  stats: ['text-cyan-600', 'text-blue-600', 'text-purple-500'],
                  score: '#06b6d4',
                  max: '#a855f7',
                  avg: '#06b6d4',
                  area: '#e9d5ff',
                }}
              />
            ) : <EmptyTab href="/cannon" label="Play Number Cannon" />)}

            {active === 'phonics' && (phonicsData.games.length > 0 ? (
              <GameDashboardSection
                title="Phonics Fun"
                emoji="📖"
                data={phonicsData}
                colors={{
                  stats: ['text-pink-600', 'text-rose-600', 'text-orange-500'],
                  score: '#ec4899',
                  max: '#f97316',
                  avg: '#ec4899',
                  area: '#fce7f3',
                }}
              />
            ) : <EmptyTab href="/phonics" label="Play Phonics Fun" />)}
          </div>
        </div>
      </main>
    </div>
  )
}
