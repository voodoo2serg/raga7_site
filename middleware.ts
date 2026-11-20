import {NextRequest, NextResponse} from 'next/server';

const MARKETING_LOGIN = 'https://raga.vodopetov.ru/login';
const MARKETING_SET_PASSWORD = 'https://raga.vodopetov.ru/set-password';
const CABINET_ORIGIN = 'https://raga.vodopetov.ru/cabinet';

/**
 * VR-207 / VR-212: cabinet at /cabinet on canonical host.
 * Guests → marketing Войти (IdP). Preserve set-password tokens (P0).
 * basePath is stripped from pathname here.
 */
export function middleware(req: NextRequest) {
  const {pathname, search} = req.nextUrl;
  if (
    pathname.startsWith('/api/session/from-token') ||
    pathname.startsWith('/api/auth/oidc') ||
    pathname.startsWith('/api/health') ||
    pathname.startsWith('/api/ready') ||
    pathname.startsWith('/_next') ||
    pathname.startsWith('/favicon')
  ) {
    return NextResponse.next();
  }

  const token = req.cookies.get('raga_session')?.value;
  if (!token) {
    // P0: never strip magic-link tokens — hand off to marketing set-password.
    if (pathname.startsWith('/set-password')) {
      return NextResponse.redirect(`${MARKETING_SET_PASSWORD}${search}`, 307);
    }
    if (pathname.startsWith('/login') || pathname.startsWith('/register')) {
      const url = new URL(MARKETING_LOGIN);
      const incoming = req.nextUrl.searchParams.get('next') || '';
      const next =
        incoming.startsWith(CABINET_ORIGIN) ? incoming : `${CABINET_ORIGIN}/`;
      url.searchParams.set('next', next);
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
