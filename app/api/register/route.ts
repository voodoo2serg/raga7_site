import {NextRequest, NextResponse} from 'next/server';
import {verifiedOrigin} from '@/lib/security';

export const runtime = 'nodejs';

const CORE = (process.env.RAGA_CORE_URL || '').replace(/\/$/, '');

/** Guest signup BFF → Core public access-signup. Self-reg = user only (Core). */
export async function POST(req: NextRequest) {
  if (!verifiedOrigin(req)) {
    return NextResponse.json({message: 'Недопустимый источник.'}, {status: 403});
  }
  if (!CORE.startsWith('http')) {
    return NextResponse.json({message: 'Сервис регистрации недоступен.'}, {status: 503});
  }
  try {
    const body = await req.json();
    const email = String(body.email || '')
      .trim()
      .toLowerCase();
    if (!email.includes('@') || email.length > 254) {
      return NextResponse.json({message: 'Проверьте адрес электронной почты.'}, {status: 400});
    }
    const res = await fetch(`${CORE}/api/public/access-signup`, {
      method: 'POST',
      headers: {'Content-Type': 'application/json'},
      body: JSON.stringify({
        email,
        name: body.name ? String(body.name).slice(0, 200) : undefined,
        promo_code: body.promo_code ? String(body.promo_code).trim().toUpperCase().slice(0, 40) : undefined,
        source: String(body.source || 'raga7-cabinet').slice(0, 80),
        consent: body.consent,
      }),
      cache: 'no-store',
      signal: AbortSignal.timeout(20000),
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      const detail = typeof data.detail === 'string' ? data.detail : data.message;
      return NextResponse.json(
        {
          message:
            res.status === 409
              ? 'Уже есть аккаунт — войдите.'
              : detail || 'Не удалось зарегистрироваться.',
          detail,
        },
        {status: res.status, headers: {'Cache-Control': 'no-store'}},
      );
    }
    return NextResponse.json(
      {
        ok: true,
        email_sent: Boolean(data.email_sent),
        message: data.message || 'Письмо со ссылкой для входа у вас на почте!',
      },
      {status: 200, headers: {'Cache-Control': 'no-store'}},
    );
  } catch {
    return NextResponse.json({message: 'Регистрация временно недоступна.'}, {status: 503});
  }
}
