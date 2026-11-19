import {NextRequest, NextResponse} from 'next/server';
import {verifiedOrigin} from '@/lib/security';

export const runtime = 'nodejs';

const CORE = (process.env.RAGA_CORE_URL || '').replace(/\/$/, '');

export async function POST(req: NextRequest) {
  if (!verifiedOrigin(req)) {
    return NextResponse.json({message: 'Недопустимый источник.'}, {status: 403});
  }
  if (!CORE.startsWith('http')) {
    return NextResponse.json({message: 'Сервис восстановления недоступен.'}, {status: 503});
  }
  try {
    const b = await req.json();
    const setup_token = String(b.token || '');
    const password = String(b.password || '');
    if (
      setup_token.length < 16 ||
      setup_token.length > 200 ||
      password.length < 8 ||
      password.length > 128
    ) {
      return NextResponse.json({message: 'Проверьте ссылку и новый пароль.'}, {status: 400});
    }
    const res = await fetch(`${CORE}/api/public/set-password`, {
      method: 'POST',
      headers: {'Content-Type': 'application/json'},
      body: JSON.stringify({setup_token, password}),
      signal: AbortSignal.timeout(15000),
      cache: 'no-store',
    });
    return NextResponse.json(
      {
        message: res.ok
          ? 'Пароль установлен. Теперь войдите в кабинет.'
          : 'Ссылка недействительна или срок её действия истёк.',
        ok: res.ok,
      },
      {status: res.ok ? 200 : 400, headers: {'Cache-Control': 'no-store'}},
    );
  } catch {
    return NextResponse.json({message: 'Сервис восстановления временно недоступен.'}, {status: 503});
  }
}
