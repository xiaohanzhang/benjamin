import { auth, signOut } from '@/auth'
import Image from 'next/image'

export default async function UserMenu() {
  const session = await auth()
  if (!session?.user) return null

  return (
    <div className="fixed top-4 right-4 flex items-center gap-3 z-50">
      {session.user.image && (
        <Image
          src={session.user.image}
          alt={session.user.name ?? 'User'}
          width={36}
          height={36}
          className="rounded-full"
        />
      )}
      <form
        action={async () => {
          'use server'
          await signOut({ redirectTo: '/signin' })
        }}
      >
        <button
          type="submit"
          className="text-sm text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 transition-colors cursor-pointer"
        >
          Sign out
        </button>
      </form>
    </div>
  )
}
