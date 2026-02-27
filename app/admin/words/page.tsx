import { WORD_BANK } from '@/lib/phonics/words'
import { illustrations } from '@/lib/phonics/illustrations'
import { getPhonicsProgress } from '@/server/actions/game'

const LEVEL_LABELS: Record<number, string> = {
  1: "Level 1 — Short 'a' (first set)",
  2: "Level 2 — Short 'a' (second set)",
  3: "Level 3 — Short 'a' (third set)",
  4: "Level 4 — Short 'u'",
}

const MASTERY_LABEL = ['New', 'Learning', 'Familiar', 'Mastered'] as const
const MASTERY_STYLE = [
  'bg-gray-100 text-gray-500 border-gray-200',
  'bg-amber-50 text-amber-700 border-amber-200',
  'bg-blue-50 text-blue-700 border-blue-200',
  'bg-green-50 text-green-700 border-green-300',
] as const

export default async function AdminWordsPage() {
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
                      ? <Illust />
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
