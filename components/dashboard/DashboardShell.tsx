'use client'

import { useState } from 'react'
import Link from 'next/link'
import type { DashboardData, GameDashboardData, DailyActivity } from '@/server/actions/game'
import GameDashboardSection from './GameDashboardSection'
import AllSection from './AllSection'

interface Props {
  mathData: DashboardData
  blocksData: GameDashboardData
  cannonData: GameDashboardData
  dailyActivity: DailyActivity[]
}

const TABS = [
  { id: 'all', label: 'All', emoji: '📊' },
  { id: 'math', label: 'Math', emoji: '🧮' },
  { id: 'blocks', label: 'Making 10', emoji: '🪵' },
  { id: 'cannon', label: 'Cannon', emoji: '💥' },
] as const

export default function DashboardShell({ mathData, blocksData, cannonData, dailyActivity }: Props) {
  const [active, setActive] = useState('all')

  const hasAny = mathData.totalRounds > 0 || blocksData.games.length > 0 || cannonData.games.length > 0

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

            {active === 'math' && mathData.totalRounds > 0 && (
              <>
                <div className="grid grid-cols-2 gap-4">
                  <div className="rounded-3xl bg-white/80 shadow-xl p-6 text-center">
                    <div className="text-4xl font-extrabold text-emerald-600">{mathData.totalRounds}</div>
                    <div className="text-sm font-semibold text-gray-500 mt-1">Games Played</div>
                  </div>
                  <div className="rounded-3xl bg-white/80 shadow-xl p-6 text-center">
                    <div className="text-4xl font-extrabold text-teal-600">{mathData.overallAccuracy}%</div>
                    <div className="text-sm font-semibold text-gray-500 mt-1">Overall Accuracy</div>
                  </div>
                </div>

                <div className="rounded-3xl bg-white/80 shadow-xl p-6">
                  <h3 className="text-lg font-bold text-gray-700 mb-6">Daily Accuracy</h3>
                  <div className="flex items-end gap-3 h-48">
                    {mathData.dailyStats.map((day) => (
                      <div key={day.date} className="flex-1 flex flex-col items-center gap-2">
                        <span className="text-xs font-bold text-gray-600">{day.averageAccuracy}%</span>
                        <div className="w-full flex items-end" style={{ height: '140px' }}>
                          <div
                            className="w-full rounded-t-xl bg-gradient-to-t from-emerald-400 to-teal-400 transition-all duration-500"
                            style={{ height: `${Math.max(day.averageAccuracy, 4)}%` }}
                          />
                        </div>
                        <div className="text-center">
                          <div className="text-xs font-semibold text-gray-600">{day.date}</div>
                          <div className="text-[10px] text-gray-400">{day.gamesPlayed}g</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </>
            )}

            {active === 'blocks' && (
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
            )}

            {active === 'cannon' && (
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
            )}
          </div>
        </div>
      </main>
    </div>
  )
}
