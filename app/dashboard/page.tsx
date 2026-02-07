import Link from 'next/link'
import { getDashboardData } from '@/lib/actions/game'

export default async function DashboardPage() {
  const data = await getDashboardData()

  return (
    <div className="min-h-screen flex flex-col items-center p-6 sm:p-10">
      {/* Header */}
      <div className="w-full max-w-2xl mb-10">
        <Link
          href="/"
          className="text-sm font-semibold text-purple-500 hover:text-purple-700 transition-colors"
        >
          &larr; Back to Games
        </Link>
        <h1 className="mt-3 text-3xl sm:text-5xl font-extrabold bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500 bg-clip-text text-transparent">
          Dashboard
        </h1>
      </div>

      {data.totalRounds === 0 ? (
        /* Empty state */
        <div className="flex flex-col items-center justify-center flex-1 text-center">
          <div className="text-6xl mb-4">📊</div>
          <h2 className="text-2xl font-bold text-gray-700 mb-2">No games played yet!</h2>
          <p className="text-gray-500 mb-6">Play some math rounds and come back to see your stats.</p>
          <Link
            href="/math"
            className="rounded-2xl bg-gradient-to-r from-blue-500 to-purple-500 px-6 py-3 text-white font-bold shadow-lg hover:scale-105 transition-transform"
          >
            Play Math
          </Link>
        </div>
      ) : (
        <div className="w-full max-w-2xl space-y-8">
          {/* Stats cards */}
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

          {/* Daily trend chart */}
          <div className="rounded-3xl bg-white/80 shadow-xl p-6">
            <h2 className="text-lg font-bold text-gray-700 mb-6">Daily Accuracy</h2>
            <div className="flex items-end gap-3 h-48">
              {data.dailyStats.map((day) => (
                <div key={day.date} className="flex-1 flex flex-col items-center gap-2">
                  {/* Accuracy label */}
                  <span className="text-xs font-bold text-gray-600">{day.averageAccuracy}%</span>
                  {/* Bar */}
                  <div className="w-full flex items-end" style={{ height: '140px' }}>
                    <div
                      className="w-full rounded-t-xl bg-gradient-to-t from-emerald-400 to-teal-400 transition-all duration-500"
                      style={{ height: `${Math.max(day.averageAccuracy, 4)}%` }}
                    />
                  </div>
                  {/* Date + count */}
                  <div className="text-center">
                    <div className="text-xs font-semibold text-gray-600">{day.date}</div>
                    <div className="text-[10px] text-gray-400">{day.gamesPlayed}g</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
