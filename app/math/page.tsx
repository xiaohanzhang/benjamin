import MathGame from '@/components/math/MathGame'

export const metadata = {
  title: "Math Game - Benjamin's Learning Games",
}

export default function MathPage() {
  return (
    <div className="min-h-screen flex flex-col">
      <MathGame />
    </div>
  )
}
