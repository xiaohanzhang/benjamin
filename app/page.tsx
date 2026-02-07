import GameCard from '@/components/shared/GameCard'

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6 sm:p-10">
      <div className="text-center mb-12">
        <h1 className="text-4xl sm:text-6xl font-extrabold mb-3 bg-gradient-to-r from-pink-500 via-purple-500 to-blue-500 bg-clip-text text-transparent">
          Benjamin&apos;s Games
        </h1>
        <p className="text-lg sm:text-xl text-gray-500">Pick a game to play!</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 max-w-2xl w-full">
        <GameCard
          title="Math"
          description="Add numbers up to 20"
          emoji="🧮"
          href="/math"
          gradient="bg-gradient-to-br from-blue-400 via-purple-500 to-pink-500"
        />
        <GameCard
          title="Dashboard"
          description="View your stats"
          emoji="📊"
          href="/dashboard"
          gradient="bg-gradient-to-br from-emerald-400 via-teal-500 to-cyan-500"
        />
        <GameCard
          title="More Games"
          description="Coming soon..."
          emoji="🎮"
          href="#"
          gradient="bg-gradient-to-br from-gray-300 to-gray-400"
        />
      </div>
    </div>
  )
}
