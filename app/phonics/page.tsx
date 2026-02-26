import PhonicsGame from '@/components/phonics/PhonicsGame'

export const metadata = {
  title: "Phonics Fun - Benjamin's Learning Games",
}

export default function PhonicsPage() {
  return (
    <div className="min-h-screen flex flex-col">
      <PhonicsGame />
    </div>
  )
}
