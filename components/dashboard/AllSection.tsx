/**
 * "All" overview section — daily activity chart across all game types.
 */

import type { DailyActivity } from '@/server/actions/game'

const tooltipCSS = `
  .tt { cursor: pointer; }
  .tt .tip { opacity: 0; pointer-events: none; transition: opacity .1s; }
  .tt:hover .tip { opacity: 1; }
  .tt:hover .ring { opacity: 0.3; }
`

function Dot({ cx, cy, r, fill }: { cx: number; cy: number; r: string; fill: string }) {
  return <circle cx={cx} cy={cy} r={r} fill={fill} />
}

function Tip({ cx, cy, fill, label }: { cx: number; cy: number; fill: string; label: string }) {
  const above = cy > 40
  const ty = above ? cy - 8 : cy + 14
  return (
    <g className="tt">
      <circle cx={cx} cy={cy} r="8" fill="transparent" />
      <circle className="ring" cx={cx} cy={cy} r="6" fill={fill} opacity="0" />
      <g className="tip">
        <rect x={cx - 28} y={ty - 8} width="56" height="14" rx="3" fill="rgba(0,0,0,0.8)" />
        <text x={cx} y={ty} fontSize="8" fill="#fff" textAnchor="middle" dominantBaseline="middle">{label}</text>
      </g>
    </g>
  )
}

const COLORS = {
  math: '#8b5cf6',
  blocks: '#f97316',
  cannon: '#06b6d4',
  total: '#10b981',
}

export default function AllSection({ data }: { data: DailyActivity[] }) {
  const totalGames = data.reduce((s, d) => s + d.total, 0)
  const daysActive = data.length

  if (totalGames === 0) return null

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 gap-4">
        <div className="rounded-3xl bg-white/80 shadow-xl p-6 text-center">
          <div className="text-4xl font-extrabold text-emerald-600">{totalGames}</div>
          <div className="text-sm font-semibold text-gray-500 mt-1">Total Games</div>
        </div>
        <div className="rounded-3xl bg-white/80 shadow-xl p-6 text-center">
          <div className="text-4xl font-extrabold text-teal-600">{daysActive}</div>
          <div className="text-sm font-semibold text-gray-500 mt-1">Days Active</div>
        </div>
      </div>

      <div className="rounded-3xl bg-white/80 shadow-xl p-6">
        <h3 className="text-lg font-bold text-gray-700 mb-2">Daily Activity</h3>
        <div className="flex items-center gap-4 mb-4 text-xs text-gray-500">
          <span className="flex items-center gap-1">
            <span className="inline-block w-3 h-3 rounded-full" style={{ background: COLORS.total }} /> Total
          </span>
          <span className="flex items-center gap-1">
            <span className="inline-block w-3 h-3 rounded-full" style={{ background: COLORS.math }} /> Math
          </span>
          <span className="flex items-center gap-1">
            <span className="inline-block w-3 h-3 rounded-full" style={{ background: COLORS.blocks }} /> Making 10
          </span>
          <span className="flex items-center gap-1">
            <span className="inline-block w-3 h-3 rounded-full" style={{ background: COLORS.cannon }} /> Cannon
          </span>
        </div>
        <ActivityChart data={data} />
      </div>
    </div>
  )
}

function ActivityChart({ data }: { data: DailyActivity[] }) {
  const W = 500, H = 180, PX = 30, PY = 16
  const n = data.length
  const maxVal = Math.max(...data.map(d => d.total), 1)
  const x = (i: number) => PX + (n > 1 ? i / (n - 1) : 0.5) * (W - PX * 2)
  const y = (v: number) => PY + (1 - v / maxVal) * (H - PY * 2)

  const mkLine = (vals: number[]) =>
    vals.map((v, i) => `${i === 0 ? 'M' : 'L'}${x(i)},${y(v)}`).join(' ')

  const totalLine = mkLine(data.map(d => d.total))
  const mathLine = mkLine(data.map(d => d.math))
  const blocksLine = mkLine(data.map(d => d.blocks))
  const cannonLine = mkLine(data.map(d => d.cannon))

  // Shaded area under total line
  const areaPath = data.map((d, i) => `${i === 0 ? 'M' : 'L'}${x(i)},${y(d.total)}`).join(' ')
    + ` L${x(n - 1)},${y(0)} L${x(0)},${y(0)} Z`

  return (
    <div className="overflow-x-auto">
      <svg viewBox={`0 0 ${W} ${H + 30}`} className="w-full" style={{ minWidth: '300px' }}>
        <style>{tooltipCSS}</style>
        {/* Y axis labels */}
        <text x={4} y={PY + 3} fontSize="9" fill="#6b7280" fontWeight="bold">{maxVal}</text>
        <text x={4} y={H - PY + 3} fontSize="9" fill="#6b7280" fontWeight="bold">0</text>
        {/* Grid */}
        <line x1={PX} y1={PY} x2={W - PX} y2={PY} stroke="#e5e7eb" strokeWidth="0.5" />
        <line x1={PX} y1={H - PY} x2={W - PX} y2={H - PY} stroke="#e5e7eb" strokeWidth="0.5" />
        <line x1={PX} y1={H / 2} x2={W - PX} y2={H / 2} stroke="#e5e7eb" strokeWidth="0.5" strokeDasharray="4" />
        {/* Layer 1: area + lines */}
        <path d={areaPath} fill={COLORS.total} opacity="0.1" />
        <path d={mathLine} fill="none" stroke={COLORS.math} strokeWidth="1.5" strokeLinejoin="round" strokeDasharray="4 2" />
        <path d={blocksLine} fill="none" stroke={COLORS.blocks} strokeWidth="1.5" strokeLinejoin="round" strokeDasharray="4 2" />
        <path d={cannonLine} fill="none" stroke={COLORS.cannon} strokeWidth="1.5" strokeLinejoin="round" strokeDasharray="4 2" />
        <path d={totalLine} fill="none" stroke={COLORS.total} strokeWidth="2.5" strokeLinejoin="round" />
        {/* X labels */}
        {data.map((d, i) => (
          <text key={`x${i}`} x={x(i)} y={H + 12} fontSize="9" fill="#6b7280" textAnchor="middle" fontWeight="600">{d.date}</text>
        ))}
        {/* Layer 2: dots */}
        {data.map((d, i) => <Dot key={`tm${i}`} cx={x(i)} cy={y(d.math)} r="2" fill={COLORS.math} />)}
        {data.map((d, i) => <Dot key={`tb${i}`} cx={x(i)} cy={y(d.blocks)} r="2" fill={COLORS.blocks} />)}
        {data.map((d, i) => <Dot key={`tc${i}`} cx={x(i)} cy={y(d.cannon)} r="2" fill={COLORS.cannon} />)}
        {data.map((d, i) => <Dot key={`tt${i}`} cx={x(i)} cy={y(d.total)} r="3" fill={COLORS.total} />)}
        {/* Layer 3: tooltips */}
        {data.map((d, i) => <Tip key={`hm${i}`} cx={x(i)} cy={y(d.math)} fill={COLORS.math} label={`Math: ${d.math}`} />)}
        {data.map((d, i) => <Tip key={`hb${i}`} cx={x(i)} cy={y(d.blocks)} fill={COLORS.blocks} label={`Blocks: ${d.blocks}`} />)}
        {data.map((d, i) => <Tip key={`hc${i}`} cx={x(i)} cy={y(d.cannon)} fill={COLORS.cannon} label={`Cannon: ${d.cannon}`} />)}
        {data.map((d, i) => <Tip key={`ht${i}`} cx={x(i)} cy={y(d.total)} fill={COLORS.total} label={`Total: ${d.total}`} />)}
      </svg>
    </div>
  )
}
