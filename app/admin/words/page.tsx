import Link from 'next/link'
import { WORD_BANK } from '@/lib/phonics/words'
import { COLOR_OPTIONS, illustrations } from '@/lib/phonics/illustrations'
import { getPhonicsProgress } from '@/server/actions/game'

const LEVEL_LABELS: Record<number, string> = {
  1: "Level 1 — Short 'a' (first set)",
  2: "Level 2 — Short 'a' (second set)",
  3: "Level 3 — Short 'a' (third set)",
  4: "Level 4 — Short 'u'",
  5: "Level 5 — Short 'o'",
  6: "Level 6 — Short 'i'",
  7: "Level 7 — Short 'e'",
  8: "Level 8 — Mixed short vowels",
  9: "Level 9 — Blends (CCVC/CVCC)",
  10: 'Level 10 — Digraphs (sh/ch/th/wh/ng/ck)',
  11: "Level 11 — Long 'a' silent-e",
  12: "Level 12 — Long 'i' and 'o' silent-e",
  13: "Level 13 — Long 'u'/'e' + ee/ea",
  14: 'Level 14 — Vowel teams (ai/ay, oa, ow/ou)',
  15: 'Level 15 — R-controlled vowels (ar/or/er/ir/ur)',
}

const MASTERY_LABEL = ['New', 'Learning', 'Familiar', 'Mastered'] as const
const MASTERY_STYLE = [
  'bg-gray-100 text-gray-500 border-gray-200',
  'bg-amber-50 text-amber-700 border-amber-200',
  'bg-blue-50 text-blue-700 border-blue-200',
  'bg-green-50 text-green-700 border-green-300',
] as const

const COLOR_LABELS: Record<string, string> = {
  black: 'Black',
  red: 'Red',
  blue: 'Blue',
  green: 'Green',
  brown: 'Brown',
  pink: 'Pink',
  orange: 'Orange',
  purple: 'Purple',
}

const FALLBACK_COLOR = 'black'

export default async function AdminWordsPage({
  searchParams,
}: {
  searchParams?: Promise<{ color?: string }>
}) {
  const params = (await searchParams) ?? {}
  const rawColor = typeof params.color === 'string' ? params.color.toLowerCase() : FALLBACK_COLOR
  const selectedColor = COLOR_OPTIONS.includes(rawColor) ? rawColor : FALLBACK_COLOR

  const progress = await getPhonicsProgress()
  const progressMap = new Map(progress.map(p => [p.word, p]))

  const byLevel = new Map<number, string[]>()
  for (const { word, level } of WORD_BANK) {
    if (!byLevel.has(level)) byLevel.set(level, [])
    byLevel.get(level)!.push(word)
  }

  const totalWords = WORD_BANK.length
  const seen = progress.length
  const mastered = progress.filter(p => p.mastery === 3).length

  return (
    <div className="max-w-5xl mx-auto space-y-8">
      {/* Summary bar */}
      <div className="flex gap-6 bg-white rounded-xl border border-gray-200 px-6 py-4">
        <Stat label="Total words" value={totalWords} />
        <Stat label="Seen" value={seen} sub={`${Math.round(seen / totalWords * 100)}%`} />
        <Stat label="Mastered" value={mastered} sub={`${Math.round(mastered / totalWords * 100)}%`} color="text-green-600" />
        {[1, 2, 3].map(m => {
          const count = progress.filter(p => p.mastery === m).length
          return <Stat key={m} label={MASTERY_LABEL[m]} value={count} color={['', 'text-amber-600', 'text-blue-600', ''][m]} />
        })}
      </div>

      {/* Color switcher for all word illustrations */}
      <div className="bg-white rounded-xl border border-gray-200 px-4 py-3">
        <div className="text-xs text-gray-500 font-semibold uppercase tracking-wide mb-2">
          Word color
        </div>
        <div className="flex flex-wrap gap-2">
          {COLOR_OPTIONS.map(color => {
            const active = color === selectedColor
            return (
              <Link
                key={color}
                href={`/admin/words?color=${color}`}
                className={`inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-xs font-semibold transition-colors ${
                  active ? 'border-blue-500 bg-blue-50 text-blue-700' : 'border-gray-200 bg-white text-gray-700 hover:border-gray-300'
                }`}
              >
                <span
                  className="inline-block h-3 w-3 rounded-full border border-black/10"
                  style={{ backgroundColor: color }}
                />
                {COLOR_LABELS[color] ?? color}
              </Link>
            )
          })}
        </div>
      </div>

      {/* Word groups by level */}
      {Array.from(byLevel.entries()).map(([level, words]) => (
        <section key={level}>
          <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">
            {LEVEL_LABELS[level]}
          </h2>
          <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-9 gap-3">
            {words.map(word => {
              const Illust = illustrations[word]
              const prog = progressMap.get(word)
              const mastery = prog?.mastery ?? 0

              return (
                <div
                  key={word}
                  className="bg-white rounded-xl border border-gray-200 p-2 flex flex-col items-center gap-1.5 hover:shadow-md transition-shadow"
                >
                  {/* illustration */}
                  <div className="w-14 h-14 flex items-center justify-center">
                    {Illust
                      ? <Illust color={selectedColor} />
                      : <span className="text-3xl text-gray-200">?</span>}
                  </div>

                  {/* word */}
                  <span className="text-sm font-bold text-gray-800">{word}</span>

                  {/* mastery badge */}
                  <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${MASTERY_STYLE[mastery]}`}>
                    {MASTERY_LABEL[mastery]}
                  </span>

                  {/* stats */}
                  {prog ? (
                    <span className="text-[10px] text-gray-400">
                      {prog.correct}/{prog.attempts} · streak {prog.streak}
                    </span>
                  ) : (
                    <span className="text-[10px] text-gray-300">not seen</span>
                  )}
                </div>
              )
            })}
          </div>
        </section>
      ))}
    </div>
  )
}

function Stat({ label, value, sub, color = 'text-gray-800' }: {
  label: string
  value: number
  sub?: string
  color?: string
}) {
  return (
    <div className="flex flex-col">
      <span className="text-xs text-gray-400">{label}</span>
      <span className={`text-xl font-bold ${color}`}>
        {value}
        {sub && <span className="text-xs font-normal text-gray-400 ml-1">{sub}</span>}
      </span>
    </div>
  )
}
