import Link from 'next/link'
import { getDashboardData, getBlocksDashboardData } from '@/server/actions/game'

export default async function DashboardPage() {
  const [data, blocksData] = await Promise.all([
    getDashboardData(),
    getBlocksDashboardData(),
  ])

  const hasAny = data.totalRounds > 0 || blocksData.games.length > 0

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
          {blocksData.games.length > 0 && (
            <>
              <h2 className="text-xl font-extrabold text-gray-700">🪵 Making 10</h2>

              {/* Stats cards */}
              <div className="grid grid-cols-3 gap-4">
                <div className="rounded-3xl bg-white/80 shadow-xl p-5 text-center">
                  <div className="text-3xl font-extrabold text-orange-600">{blocksData.games.length}</div>
                  <div className="text-xs font-semibold text-gray-500 mt-1">Games</div>
                </div>
                <div className="rounded-3xl bg-white/80 shadow-xl p-5 text-center">
                  <div className="text-3xl font-extrabold text-yellow-600">
                    {Math.max(...blocksData.games.map(g => g.score))}
                  </div>
                  <div className="text-xs font-semibold text-gray-500 mt-1">Best Score</div>
                </div>
                <div className="rounded-3xl bg-white/80 shadow-xl p-5 text-center">
                  <div className="text-3xl font-extrabold text-red-500">
                    {Math.max(...blocksData.games.map(g => g.level))}
                  </div>
                  <div className="text-xs font-semibold text-gray-500 mt-1">Max Level</div>
                </div>
              </div>

              {/* Chart 1: Game History — score & duration lines */}
              <div className="rounded-3xl bg-white/80 shadow-xl p-6">
                <h3 className="text-lg font-bold text-gray-700 mb-2">Game History</h3>
                <div className="flex items-center gap-4 mb-4 text-xs text-gray-500">
                  <span className="flex items-center gap-1">
                    <span className="inline-block w-3 h-3 rounded-full bg-orange-400" /> Score
                  </span>
                  <span className="flex items-center gap-1">
                    <span className="inline-block w-3 h-3 rounded-full bg-blue-400" /> Duration (s)
                  </span>
                </div>
                {(() => {
                  const g = blocksData.games
                  const W = 500, H = 160, PX = 36, PY = 16
                  const n = g.length
                  const sMin = Math.min(...g.map(v => v.score))
                  const sMax = Math.max(...g.map(v => v.score))
                  const dMin = Math.min(...g.map(v => v.duration))
                  const dMax = Math.max(...g.map(v => v.duration))
                  const sRange = sMax - sMin || 1
                  const dRange = dMax - dMin || 1
                  const x = (i: number) => PX + (n > 1 ? i / (n - 1) : 0.5) * (W - PX * 2)
                  const yS = (v: number) => PY + (1 - (v - sMin) / sRange) * (H - PY * 2)
                  const yD = (v: number) => PY + (1 - (v - dMin) / dRange) * (H - PY * 2)
                  const scoreLine = g.map((p, i) => `${i === 0 ? 'M' : 'L'}${x(i)},${yS(p.score)}`).join(' ')
                  const durLine = g.map((p, i) => `${i === 0 ? 'M' : 'L'}${x(i)},${yD(p.duration)}`).join(' ')
                  // Show ~5 evenly spaced x labels
                  const labelStep = Math.max(1, Math.floor(n / 5))
                  return (
                    <div className="overflow-x-auto">
                      <svg viewBox={`0 0 ${W} ${H + 30}`} className="w-full" style={{ minWidth: '300px' }}>
                        {/* Y axis labels — score (left) */}
                        <text x={4} y={PY + 3} fontSize="9" fill="#ea580c" fontWeight="bold">{sMax}</text>
                        <text x={4} y={H - PY + 3} fontSize="9" fill="#ea580c" fontWeight="bold">{sMin}</text>
                        {/* Y axis labels — duration (right) */}
                        <text x={W - 4} y={PY + 3} fontSize="9" fill="#3b82f6" fontWeight="bold" textAnchor="end">{dMax}s</text>
                        <text x={W - 4} y={H - PY + 3} fontSize="9" fill="#3b82f6" fontWeight="bold" textAnchor="end">{dMin}s</text>
                        {/* Grid lines */}
                        <line x1={PX} y1={PY} x2={W - PX} y2={PY} stroke="#e5e7eb" strokeWidth="0.5" />
                        <line x1={PX} y1={H - PY} x2={W - PX} y2={H - PY} stroke="#e5e7eb" strokeWidth="0.5" />
                        <line x1={PX} y1={H / 2} x2={W - PX} y2={H / 2} stroke="#e5e7eb" strokeWidth="0.5" strokeDasharray="4" />
                        {/* Score line */}
                        <path d={scoreLine} fill="none" stroke="#f97316" strokeWidth="2" strokeLinejoin="round" />
                        {g.map((p, i) => <circle key={`s${i}`} cx={x(i)} cy={yS(p.score)} r="3" fill="#f97316" />)}
                        {/* Duration line */}
                        <path d={durLine} fill="none" stroke="#3b82f6" strokeWidth="2" strokeLinejoin="round" strokeDasharray="6 3" />
                        {g.map((p, i) => <circle key={`d${i}`} cx={x(i)} cy={yD(p.duration)} r="3" fill="#3b82f6" />)}
                        {/* X labels */}
                        {g.map((p, i) => i % labelStep === 0 || i === n - 1 ? (
                          <text key={`x${i}`} x={x(i)} y={H + 12} fontSize="8" fill="#9ca3af" textAnchor="middle">{p.datetime}</text>
                        ) : null)}
                      </svg>
                    </div>
                  )
                })()}
              </div>

              {/* Chart 2: Daily Stats — avg/max/min score lines + games count */}
              <div className="rounded-3xl bg-white/80 shadow-xl p-6">
                <h3 className="text-lg font-bold text-gray-700 mb-2">Daily Stats</h3>
                <div className="flex items-center gap-4 mb-4 text-xs text-gray-500">
                  <span className="flex items-center gap-1">
                    <span className="inline-block w-3 h-3 rounded-full bg-red-400" /> Max
                  </span>
                  <span className="flex items-center gap-1">
                    <span className="inline-block w-3 h-3 rounded-full bg-orange-400" /> Avg
                  </span>
                  <span className="flex items-center gap-1">
                    <span className="inline-block w-3 h-3 rounded-full bg-gray-400" /> Min
                  </span>
                  <span className="flex items-center gap-1">
                    <span className="inline-block w-3 h-3 rounded-full bg-emerald-400" /> Games
                  </span>
                </div>
                {(() => {
                  const d = blocksData.dailyStats
                  const W = 500, H = 160, PX = 36, PY = 16
                  const n = d.length
                  const allScores = d.flatMap(v => [v.maxScore, v.avgScore, v.minScore])
                  const scMin = Math.min(...allScores)
                  const scMax = Math.max(...allScores)
                  const gMin = Math.min(...d.map(v => v.gamesPlayed))
                  const gMax = Math.max(...d.map(v => v.gamesPlayed))
                  const scRange = scMax - scMin || 1
                  const gRange = gMax - gMin || 1
                  const x = (i: number) => PX + (n > 1 ? i / (n - 1) : 0.5) * (W - PX * 2)
                  const yS = (v: number) => PY + (1 - (v - scMin) / scRange) * (H - PY * 2)
                  const yG = (v: number) => PY + (1 - (v - gMin) / gRange) * (H - PY * 2)
                  const mkLine = (vals: number[]) => vals.map((v, i) => `${i === 0 ? 'M' : 'L'}${x(i)},${yS(v)}`).join(' ')
                  const maxLine = mkLine(d.map(v => v.maxScore))
                  const avgLine = mkLine(d.map(v => v.avgScore))
                  const minLine = mkLine(d.map(v => v.minScore))
                  const gamesLine = d.map((v, i) => `${i === 0 ? 'M' : 'L'}${x(i)},${yG(v.gamesPlayed)}`).join(' ')
                  // Shaded area between max and min
                  const area = d.map((v, i) => `${i === 0 ? 'M' : 'L'}${x(i)},${yS(v.maxScore)}`).join(' ')
                    + d.map((v, i) => `L${x(n - 1 - i)},${yS(d[n - 1 - i].minScore)}`).join(' ') + ' Z'
                  return (
                    <div className="overflow-x-auto">
                      <svg viewBox={`0 0 ${W} ${H + 30}`} className="w-full" style={{ minWidth: '300px' }}>
                        {/* Y axis labels — score (left) */}
                        <text x={4} y={PY + 3} fontSize="9" fill="#ea580c" fontWeight="bold">{scMax}</text>
                        <text x={4} y={H - PY + 3} fontSize="9" fill="#ea580c" fontWeight="bold">{scMin}</text>
                        {/* Y axis labels — games (right) */}
                        <text x={W - 4} y={PY + 3} fontSize="9" fill="#10b981" fontWeight="bold" textAnchor="end">{gMax}g</text>
                        <text x={W - 4} y={H - PY + 3} fontSize="9" fill="#10b981" fontWeight="bold" textAnchor="end">{gMin}g</text>
                        {/* Grid */}
                        <line x1={PX} y1={PY} x2={W - PX} y2={PY} stroke="#e5e7eb" strokeWidth="0.5" />
                        <line x1={PX} y1={H - PY} x2={W - PX} y2={H - PY} stroke="#e5e7eb" strokeWidth="0.5" />
                        <line x1={PX} y1={H / 2} x2={W - PX} y2={H / 2} stroke="#e5e7eb" strokeWidth="0.5" strokeDasharray="4" />
                        {/* Max-min shaded area */}
                        <path d={area} fill="#fecaca" opacity="0.3" />
                        {/* Max line */}
                        <path d={maxLine} fill="none" stroke="#ef4444" strokeWidth="2" strokeLinejoin="round" />
                        {d.map((v, i) => <circle key={`mx${i}`} cx={x(i)} cy={yS(v.maxScore)} r="3" fill="#ef4444" />)}
                        {/* Avg line */}
                        <path d={avgLine} fill="none" stroke="#f97316" strokeWidth="2.5" strokeLinejoin="round" />
                        {d.map((v, i) => <circle key={`av${i}`} cx={x(i)} cy={yS(v.avgScore)} r="3.5" fill="#f97316" />)}
                        {/* Min line */}
                        <path d={minLine} fill="none" stroke="#9ca3af" strokeWidth="1.5" strokeLinejoin="round" strokeDasharray="4 2" />
                        {d.map((v, i) => <circle key={`mn${i}`} cx={x(i)} cy={yS(v.minScore)} r="2.5" fill="#9ca3af" />)}
                        {/* Games played line */}
                        <path d={gamesLine} fill="none" stroke="#10b981" strokeWidth="1.5" strokeLinejoin="round" strokeDasharray="6 3" />
                        {d.map((v, i) => <circle key={`gp${i}`} cx={x(i)} cy={yG(v.gamesPlayed)} r="2.5" fill="#10b981" />)}
                        {/* X labels */}
                        {d.map((v, i) => (
                          <text key={`x${i}`} x={x(i)} y={H + 12} fontSize="9" fill="#6b7280" textAnchor="middle" fontWeight="600">{v.date}</text>
                        ))}
                        {d.map((v, i) => (
                          <text key={`xg${i}`} x={x(i)} y={H + 24} fontSize="8" fill="#9ca3af" textAnchor="middle">{v.gamesPlayed}g</text>
                        ))}
                      </svg>
                    </div>
                  )
                })()}
              </div>
            </>
          )}
        </div>
      )}
    </div>
  )
}
