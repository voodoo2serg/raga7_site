import {NextRequest} from 'next/server';

function allowedOrigins(): string[] {
  const items = [
    process.env.RAGA_SITE_ORIGIN,
    process.env.RAGA_ADMIN_ORIGIN,
    'https://raga7.vodopetov.ru',
    'https://raga7admin.vodopetov.ru',
  ].filter(Boolean) as string[];
  const out: string[] = [];
  for (const raw of items) {
    try {
      const o = new URL(raw).origin;
      if (!out.includes(o)) out.push(o);
    } catch {
      /* skip */
    }
  }
  return out;
}

export function verifiedOrigin(req: NextRequest) {
  const origin = req.headers.get('origin');
  const host = req.headers.get('host');
  if (!origin) return false;
  try {
    const parsed = new URL(origin);
    const allowed = allowedOrigins();
    if (allowed.length && allowed.includes(parsed.origin)) return true;
    return parsed.host === host;
  } catch {
    return false;
  }
}

export function redirectSafe(value: string | null, fallback = '/') {
  return value?.startsWith('/') && !value.startsWith('//') && !value.includes('\\') ? value : fallback;
}
