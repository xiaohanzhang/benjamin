'use client'

import Link from 'next/link'

interface GameCardProps {
  title: string
  description: string
  emoji: string
  href: string
  gradient: string
}

export default function GameCard({ title, description, emoji, href, gradient }: GameCardProps) {
  return (
    <Link
      href={href}
      className={`
        block rounded-3xl p-8 shadow-xl
        transition-all duration-300
        hover:scale-105 hover:shadow-2xl
        active:scale-95
        select-none cursor-pointer
        ${gradient}
      `}
    >
      <div className="text-6xl mb-4">{emoji}</div>
      <h2 className="text-2xl font-extrabold text-white mb-2">{title}</h2>
      <p className="text-white/80 text-lg">{description}</p>
    </Link>
  )
}
