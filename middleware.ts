import {NextRequest, NextResponse} from 'next/server';

/** VR-206: raga7 is not a public product entry — send everyone to raga.vodopetov.ru. */
const CANONICAL = 'https://raga.vodopetov.ru';

export function middleware(req: NextRequest) {
  const {pathname, search} = req.nextUrl;
  // Keep health/internal probes local if any; everything else redirects.
  if (pathname === '/api/health') {
    return NextResponse.next();
  }
  const target = new URL(CANONICAL);
  // Map auth deep-links onto the canonical host.
  if (pathname.startsWith('/login')) {
    target.pathname = '/login';
    target.search = search;
  } else if (pathname.startsWith('/register')) {
    target.pathname = '/register';
    target.search = search;
  } else if (pathname.startsWith('/set-password')) {
    target.pathname = '/set-password';
    target.search = search;
  } else if (pathname.startsWith('/app')) {
    target.pathname = pathname;
    target.search = search;
  } else {
    target.pathname = '/';
  }
  return NextResponse.redirect(target, 301);
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
};
