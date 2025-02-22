import { NextRequest, NextResponse } from 'next/server';
import { getToken } from 'next-auth/jwt';
export { default } from 'next-auth/middleware';

export const config = {
  matcher: [],
};

export async function middleware(request: NextRequest) {
  const token = await getToken({ req: request });
  const url = request.nextUrl;

  console.log("Middleware triggered")


  if (
    token &&
    (url.pathname.startsWith('/register') ||
      url.pathname.startsWith('/login') ||
      url.pathname.startsWith('/verify') ||
      url.pathname === '/')
  ) {
    return NextResponse.redirect(new URL('/homePage', request.url));
  }

  if (!token && (url.pathname.startsWith('/sanyam') || url.pathname === '/')) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  return NextResponse.next();
}