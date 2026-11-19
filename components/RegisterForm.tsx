'use client';

import {useState} from 'react';
import {useRouter} from 'next/navigation';

const TERMS = '2026-11-01';
const PRIVACY = '2026-11-01';

/** Public promo signup → Core /api/public/access-signup via BFF. Role = user only. */
export function RegisterForm() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [promo, setPromo] = useState('ZIMA2027');
  const [consent, setConsent] = useState(false);
  const [marketing, setMarketing] = useState(false);
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState('');
  const [ok, setOk] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!consent) return;
    setBusy(true);
    setMsg('');
    try {
      const res = await fetch('/api/register', {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({
          email,
          promo_code: promo.trim() || undefined,
          consent: {
            terms_version: TERMS,
            privacy_version: PRIVACY,
            accepted: true,
            marketing_opt_in: marketing,
          },
          source: 'raga7-cabinet',
        }),
      });
      const data = (await res.json()) as {message?: string; detail?: string; email_sent?: boolean};
      if (!res.ok) {
        const detail = data.detail || data.message || '';
        if (String(detail).includes('already') || res.status === 409) {
          setMsg('Уже есть аккаунт — войдите.');
        } else {
          setMsg(data.message || 'Не удалось зарегистрироваться. Проверьте данные.');
        }
        return;
      }
      setOk(true);
      setMsg('Письмо со ссылкой для входа у вас на почте!');
      router.push('/login?registered=1');
    } catch {
      setMsg('Сеть недоступна. Повторите позже.');
    } finally {
      setBusy(false);
    }
  }

  return (
    <form className="login-form" onSubmit={onSubmit}>
      <label>
        Электронная почта
        <input
          type="email"
          required
          maxLength={254}
          autoComplete="email"
          placeholder="you@company.ru"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
      </label>
      <label>
        Промокод (необязательно)
        <input
          type="text"
          maxLength={40}
          autoComplete="off"
          placeholder="ZIMA2027"
          value={promo}
          onChange={(e) => setPromo(e.target.value)}
        />
      </label>
      <label style={{display: 'flex', gap: 10, alignItems: 'flex-start', fontSize: 13}}>
        <input type="checkbox" checked={consent} onChange={(e) => setConsent(e.target.checked)} required />
        <span>
          Согласен на обработку персональных данных (оферта / политика · версии {TERMS}). Без этого
          регистрация невозможна.
        </span>
      </label>
      <label style={{display: 'flex', gap: 10, alignItems: 'flex-start', fontSize: 13}}>
        <input type="checkbox" checked={marketing} onChange={(e) => setMarketing(e.target.checked)} />
        <span>Получать новости о продукте (необязательно).</span>
      </label>
      <button className="blue-button" type="submit" disabled={busy || !consent}>
        {busy ? 'Отправляем…' : 'Зарегистрироваться →'}
      </button>
      {msg ? (
        <p role="status" className="auth-hint" style={{color: ok ? '#14745b' : '#b33343'}}>
          {msg}
        </p>
      ) : null}
    </form>
  );
}
