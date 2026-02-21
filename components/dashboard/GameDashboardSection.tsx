/**
 * Reusable dashboard section for arcade-style games.
 *
 * Renders 3 stat cards + 2 SVG line charts (game history & daily stats),
 * parameterized by title, emoji, data, and color scheme.
 */

import type { GameDashboardData } from '@/server/actions/game'

interface Colors {
  /** Tailwind text-color classes for the 3 stat cards [Games, Best Score, Max Level] */
  stats: [string, string, string]
  /** Hex color for score line / score axis labels */
  score: string
  /** Hex color for max line in daily chart */
  max: string
  /** Hex color for avg line in daily chart */
  avg: string
  /** Hex color for shaded area between max and min */
  area: string
}

interface Props {
  title: string
  emoji: string
  data: GameDashboardData
  colors: Colors
}

export default function GameDashboardSection({ title, emoji, data, colors }: Props) {
  const { games, dailyStats } = data
  if (games.length === 0) return null

  return (
    <>
      <h2 className="text-xl font-extrabold text-gray-700">{emoji} {title}</h2>

      {/* Stats cards */}
      <div className="grid grid-cols-3 gap-4">
        <div className="rounded-3xl bg-white/80 shadow-xl p-5 text-center">
          <div className={`text-3xl font-extrabold ${colors.stats[0]}`}>{games.length}</div>
          <div className="text-xs font-semibold text-gray-500 mt-1">Games</div>
        </div>
        <div className="rounded-3xl bg-white/80 shadow-xl p-5 text-center">
          <div className={`text-3xl font-extrabold ${colors.stats[1]}`}>
            {Math.max(...games.map(g => g.score))}
          </div>
          <div className="text-xs font-semibold text-gray-500 mt-1">Best Score</div>
        </div>
        <div className="rounded-3xl bg-white/80 shadow-xl p-5 text-center">
          <div className={`text-3xl font-extrabold ${colors.stats[2]}`}>
            {Math.max(...games.map(g => g.level))}
          </div>
          <div className="text-xs font-semibold text-gray-500 mt-1">Max Level</div>
        </div>
      </div>

      {/* Chart 1: Game History — score & duration lines */}
      <div className="rounded-3xl bg-white/80 shadow-xl p-6">
        <h3 className="text-lg font-bold text-gray-700 mb-2">Game History</h3>
        <div className="flex items-center gap-4 mb-4 text-xs text-gray-500">
          <span className="flex items-center gap-1">
            <span className="inline-block w-3 h-3 rounded-full" style={{ background: colors.score }} /> Score
          </span>
          <span className="flex items-center gap-1">
            <span className="inline-block w-3 h-3 rounded-full bg-blue-400" /> Duration (s)
          </span>
        </div>
        <GameHistoryChart games={games} scoreColor={colors.score} />
      </div>

      {/* Chart 2: Daily Stats — avg/max/min score lines + games count */}
      <div className="rounded-3xl bg-white/80 shadow-xl p-6">
        <h3 className="text-lg font-bold text-gray-700 mb-2">Daily Stats</h3>
        <div className="flex items-center gap-4 mb-4 text-xs text-gray-500">
          <span className="flex items-center gap-1">
            <span className="inline-block w-3 h-3 rounded-full" style={{ background: colors.max }} /> Max
          </span>
          <span className="flex items-center gap-1">
            <span className="inline-block w-3 h-3 rounded-full" style={{ background: colors.avg }} /> Avg
          </span>
          <span className="flex items-center gap-1">
            <span className="inline-block w-3 h-3 rounded-full bg-gray-400" /> Min
          </span>
          <span className="flex items-center gap-1">
            <span className="inline-block w-3 h-3 rounded-full bg-emerald-400" /> Games
          </span>
        </div>
        <DailyStatsChart dailyStats={dailyStats} maxColor={colors.max} avgColor={colors.avg} areaColor={colors.area} />
      </div>
    </>
  )
}

// ── Sub-charts ──

function GameHistoryChart({ games, scoreColor }: { games: GameDashboardData['games']; scoreColor: string }) {
  const W = 500, H = 160, PX = 36, PY = 16
  const n = games.length
  const sMin = Math.min(...games.map(v => v.score))
  const sMax = Math.max(...games.map(v => v.score))
  const dMin = Math.min(...games.map(v => v.duration))
  const dMax = Math.max(...games.map(v => v.duration))
  const sRange = sMax - sMin || 1
  const dRange = dMax - dMin || 1
  const x = (i: number) => PX + (n > 1 ? i / (n - 1) : 0.5) * (W - PX * 2)
  const yS = (v: number) => PY + (1 - (v - sMin) / sRange) * (H - PY * 2)
  const yD = (v: number) => PY + (1 - (v - dMin) / dRange) * (H - PY * 2)
  const scoreLine = games.map((p, i) => `${i === 0 ? 'M' : 'L'}${x(i)},${yS(p.score)}`).join(' ')
  const durLine = games.map((p, i) => `${i === 0 ? 'M' : 'L'}${x(i)},${yD(p.duration)}`).join(' ')
  const labelStep = Math.max(1, Math.floor(n / 5))
  const blue = '#3b82f6'

  return (
    <div className="overflow-x-auto">
      <svg viewBox={`0 0 ${W} ${H + 30}`} className="w-full" style={{ minWidth: '300px' }}>
        {/* Y axis labels — score (left) */}
        <text x={4} y={PY + 3} fontSize="9" fill={scoreColor} fontWeight="bold">{sMax}</text>
        <text x={4} y={H - PY + 3} fontSize="9" fill={scoreColor} fontWeight="bold">{sMin}</text>
        {/* Y axis labels — duration (right) */}
        <text x={W - 4} y={PY + 3} fontSize="9" fill={blue} fontWeight="bold" textAnchor="end">{dMax}s</text>
        <text x={W - 4} y={H - PY + 3} fontSize="9" fill={blue} fontWeight="bold" textAnchor="end">{dMin}s</text>
        {/* Grid lines */}
        <line x1={PX} y1={PY} x2={W - PX} y2={PY} stroke="#e5e7eb" strokeWidth="0.5" />
        <line x1={PX} y1={H - PY} x2={W - PX} y2={H - PY} stroke="#e5e7eb" strokeWidth="0.5" />
        <line x1={PX} y1={H / 2} x2={W - PX} y2={H / 2} stroke="#e5e7eb" strokeWidth="0.5" strokeDasharray="4" />
        {/* Score line */}
        <path d={scoreLine} fill="none" stroke={scoreColor} strokeWidth="2" strokeLinejoin="round" />
        {games.map((p, i) => <circle key={`s${i}`} cx={x(i)} cy={yS(p.score)} r="3" fill={scoreColor} />)}
        {/* Duration line */}
        <path d={durLine} fill="none" stroke={blue} strokeWidth="2" strokeLinejoin="round" strokeDasharray="6 3" />
        {games.map((p, i) => <circle key={`d${i}`} cx={x(i)} cy={yD(p.duration)} r="3" fill={blue} />)}
        {/* X labels */}
        {games.map((p, i) => i % labelStep === 0 || i === n - 1 ? (
          <text key={`x${i}`} x={x(i)} y={H + 12} fontSize="8" fill="#9ca3af" textAnchor="middle">{p.datetime}</text>
        ) : null)}
      </svg>
    </div>
  )
}

function DailyStatsChart({ dailyStats, maxColor, avgColor, areaColor }: {
  dailyStats: GameDashboardData['dailyStats']; maxColor: string; avgColor: string; areaColor: string
}) {
  const W = 500, H = 160, PX = 36, PY = 16
  const d = dailyStats
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
  const area = d.map((v, i) => `${i === 0 ? 'M' : 'L'}${x(i)},${yS(v.maxScore)}`).join(' ')
    + d.map((v, i) => `L${x(n - 1 - i)},${yS(d[n - 1 - i].minScore)}`).join(' ') + ' Z'

  return (
    <div className="overflow-x-auto">
      <svg viewBox={`0 0 ${W} ${H + 30}`} className="w-full" style={{ minWidth: '300px' }}>
        {/* Y axis labels — score (left) */}
        <text x={4} y={PY + 3} fontSize="9" fill={avgColor} fontWeight="bold">{scMax}</text>
        <text x={4} y={H - PY + 3} fontSize="9" fill={avgColor} fontWeight="bold">{scMin}</text>
        {/* Y axis labels — games (right) */}
        <text x={W - 4} y={PY + 3} fontSize="9" fill="#10b981" fontWeight="bold" textAnchor="end">{gMax}g</text>
        <text x={W - 4} y={H - PY + 3} fontSize="9" fill="#10b981" fontWeight="bold" textAnchor="end">{gMin}g</text>
        {/* Grid */}
        <line x1={PX} y1={PY} x2={W - PX} y2={PY} stroke="#e5e7eb" strokeWidth="0.5" />
        <line x1={PX} y1={H - PY} x2={W - PX} y2={H - PY} stroke="#e5e7eb" strokeWidth="0.5" />
        <line x1={PX} y1={H / 2} x2={W - PX} y2={H / 2} stroke="#e5e7eb" strokeWidth="0.5" strokeDasharray="4" />
        {/* Max-min shaded area */}
        <path d={area} fill={areaColor} opacity="0.3" />
        {/* Max line */}
        <path d={maxLine} fill="none" stroke={maxColor} strokeWidth="2" strokeLinejoin="round" />
        {d.map((v, i) => <circle key={`mx${i}`} cx={x(i)} cy={yS(v.maxScore)} r="3" fill={maxColor} />)}
        {/* Avg line */}
        <path d={avgLine} fill="none" stroke={avgColor} strokeWidth="2.5" strokeLinejoin="round" />
        {d.map((v, i) => <circle key={`av${i}`} cx={x(i)} cy={yS(v.avgScore)} r="3.5" fill={avgColor} />)}
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
}
