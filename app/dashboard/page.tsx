import Link from 'next/link'
import { getDashboardData, getBlocksDashboardData, getCannonDashboardData } from '@/server/actions/game'
import GameDashboardSection from '@/components/dashboard/GameDashboardSection'

export default async function DashboardPage() {
  const [data, blocksData, cannonData] = await Promise.all([
    getDashboardData(),
    getBlocksDashboardData(),
    getCannonDashboardData(),
  ])

  const hasAny = data.totalRounds > 0 || blocksData.games.length > 0 || cannonData.games.length > 0

  return (
    <div className="min-h-screen flex flex-col items-center p-6 sm:p-10">
      {/* Header */}
      <div className="w-full max-w-2xl mb-10">
        <h1 className="mt-3 text-3xl sm:text-5xl font-extrabold bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500 bg-clip-text text-transparent">
          Dashboard
        </h1>
      </div>

      {!hasAny ? (
        /* Empty state */
        <div className="flex flex-col items-center justify-center flex-1 text-center">
          <div className="text-6xl mb-4">📊</div>
          <h2 className="text-2xl font-bold text-gray-700 mb-2">No games played yet!</h2>
          <p className="text-gray-500 mb-6">Play some games and come back to see your stats.</p>
          <div className="flex gap-4">
            <Link
              href="/math"
              className="rounded-2xl bg-gradient-to-r from-blue-500 to-purple-500 px-6 py-3 text-white font-bold shadow-lg hover:scale-105 transition-transform"
            >
              Play Math
            </Link>
            <Link
              href="/blocks"
              className="rounded-2xl bg-gradient-to-r from-yellow-500 to-orange-500 px-6 py-3 text-white font-bold shadow-lg hover:scale-105 transition-transform"
            >
              Making 10
            </Link>
            <Link
              href="/cannon"
              className="rounded-2xl bg-gradient-to-r from-cyan-500 to-blue-500 px-6 py-3 text-white font-bold shadow-lg hover:scale-105 transition-transform"
            >
              Number Cannon
            </Link>
          </div>
        </div>
      ) : (
        <div className="w-full max-w-2xl space-y-10">
          {/* ── Math Section ── */}
          {data.totalRounds > 0 && (
            <>
              <h2 className="text-xl font-extrabold text-gray-700">🧮 Math</h2>
              <div className="grid grid-cols-2 gap-4">
                <div className="rounded-3xl bg-white/80 shadow-xl p-6 text-center">
                  <div className="text-4xl font-extrabold text-emerald-600">{data.totalRounds}</div>
                  <div className="text-sm font-semibold text-gray-500 mt-1">Games Played</div>
                </div>
                <div className="rounded-3xl bg-white/80 shadow-xl p-6 text-center">
                  <div className="text-4xl font-extrabold text-teal-600">{data.overallAccuracy}%</div>
                  <div className="text-sm font-semibold text-gray-500 mt-1">Overall Accuracy</div>
                </div>
              </div>

              <div className="rounded-3xl bg-white/80 shadow-xl p-6">
                <h3 className="text-lg font-bold text-gray-700 mb-6">Daily Accuracy</h3>
                <div className="flex items-end gap-3 h-48">
                  {data.dailyStats.map((day) => (
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

          {/* ── Making 10 Section ── */}
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

          {/* ── Number Cannon Section ── */}
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
        </div>
      )}
    </div>
  )
}
