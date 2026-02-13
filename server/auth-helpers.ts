import { auth } from '@/server/auth'

export async function requireUserId(): Promise<string> {
  const session = await auth()
  if (!session?.user?.id) {
    throw new Error('Not authenticated')
  }
  return session.user.id
}
