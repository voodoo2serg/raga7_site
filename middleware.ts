import {NextRequest, NextResponse} from 'next/server';

const MARKETING_LOGIN = 'https://raga.vodopetov.ru/login';
const CABINET_ORIGIN = 'https://raga.vodopetov.ru/cabinet';

/**
 * VR-207: cabinet is mounted at /cabinet on the canonical host.
 * Guests without raga_session go to marketing Войти (not a parallel raga7 login UI).
 * basePath is stripped from pathname here.
 */
export function middleware(req: NextRequest) {
  const {pathname, search} = req.nextUrl;
  if (
    pathname.startsWith('/api/session/from-token') ||
    pathname.startsWith('/_next') ||
    pathname.startsWith('/favicon') ||
    pathname === '/api/health'
  ) {
    return NextResponse.next();
  }

  const token = req.cookies.get('raga_session')?.value;
  if (!token) {
    // Local auth pages also bounce to marketing single entry.
    if (
      pathname.startsWith('/login') ||
      pathname.startsWith('/register') ||
      pathname.startsWith('/set-password')
    ) {
      const url = new URL(MARKETING_LOGIN);
      url.searchParams.set('next', `${CABINET_ORIGIN}/`);
      return NextResponse.redirect(url);
    }
    const url = new URL(MARKETING_LOGIN);
    url.searchParams.set('next', `${CABINET_ORIGIN}${pathname}${search}`);
    return NextResponse.redirect(url);
  }
  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|.*\\.(?:png|jpg|jpeg|gif|svg|ico|webp)$).*)'],
};
