import { NextResponse } from 'next/server';
import { auth } from '@/server/auth';
import { NextAuthRequest } from 'next-auth';

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico|signin).*)'],
}

const publicRoutes = ['/signin', '/signup', '/'];

export const proxy = auth(async (req: NextAuthRequest) => {
  const { nextUrl } = req;
  if (!req.auth?.user && !publicRoutes.includes(nextUrl.pathname)) {
    return NextResponse.redirect(new URL('/signin', req.nextUrl))
  }

  return NextResponse.next();
});
