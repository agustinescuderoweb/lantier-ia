import { NextRequest, NextResponse } from 'next/server';

export function proxy(request: NextRequest) {
  const session =
    request.cookies.get('lantier_session')?.value;

  const pathname = request.nextUrl.pathname;

  // Dejar pasar la pantalla y API de login
  if (
    pathname === '/login' ||
    pathname.startsWith('/api/login')
  ) {
    // Si ya tiene sesión y entra a /login,
    // mandarlo al dashboard
    if (session && pathname === '/login') {
      return NextResponse.redirect(
        new URL('/', request.url)
      );
    }

    return NextResponse.next();
  }

  // Sin sesión → login
  if (!session) {
    return NextResponse.redirect(
      new URL('/login', request.url)
    );
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
};