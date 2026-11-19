import {NextRequest, NextResponse} from 'next/server';
import {core} from '@/lib/core';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const CABINET_HOME = 'https://raga.vodopetov.ru/cabinet/';
const MARKETING_LOGIN = 'https://raga.vodopetov.ru/login';

/**
 * Marketing login / set-password handoff.
 * Accepts Core JWT, verifies /api/auth/me, sets httpOnly raga_session, enters cabinet.
 */
export async function GET(req: NextRequest) {
  const token = (req.nextUrl.searchParams.get('access_token') || '').trim();
  if (!token || token.length < 16 || token.length > 4096) {
    return NextResponse.redirect(`${MARKETING_LOGIN}?error=credentials`, 302);
  }

  try {
    await core('/api/auth/me', {}, token);
  } catch {
    return NextResponse.redirect(`${MARKETING_LOGIN}?error=credentials`, 302);
  }

  const res = NextResponse.redirect(CABINET_HOME, 302);
  res.cookies.set('raga_session', token, {
    httpOnly: true,
    secure: true,
    sameSite: 'lax',
    path: '/',
    maxAge: 60 * 60 * 8,
  });
  return res;
}
