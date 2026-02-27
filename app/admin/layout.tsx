import { auth } from '@/server/auth'
import { redirect } from 'next/navigation'
import Link from 'next/link'

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await auth()
  if (!session?.user) redirect('/signin')

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-200 px-6 py-3 flex items-center gap-6">
        <span className="font-bold text-gray-800 text-lg">Admin</span>
        <nav className="flex gap-4 text-sm">
          <Link href="/admin/words" className="text-gray-600 hover:text-gray-900 font-medium">
            Words
          </Link>
        </nav>
        <Link href="/" className="ml-auto text-sm text-gray-400 hover:text-gray-600">
          ← Back to app
        </Link>
      </header>
      <main className="p-6">{children}</main>
    </div>
  )
}
