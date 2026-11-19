'use client';

import {useState} from 'react';
import Link from 'next/link';

export function SetPasswordForm({token}: {token: string}) {
  const [password, setPassword] = useState('');
  const [busy, setBusy] = useState(false);
  const [ok, setOk] = useState(false);
  const [msg, setMsg] = useState('');

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setMsg('');
    try {
      const r = await fetch('/api/set-password', {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({token, password}),
      });
      const d = (await r.json()) as {message?: string};
      setMsg(d.message || 'Не удалось установить пароль.');
      setOk(r.ok);
    } catch {
      setMsg('Связь с сервером временно недоступна.');
    } finally {
      setBusy(false);
    }
  }

  if (!token) {
    return (
      <p className="auth-hint">
        Ссылка неполная. Запросите новое письмо или{' '}
        <Link href="/register">зарегистрируйтесь снова</Link>.
      </p>
    );
  }

  return (
    <form className="login-form" onSubmit={submit}>
      {!ok && (
        <>
          <label>
            Новый пароль
            <input
              type="password"
              name="new-password"
              autoComplete="new-password"
              minLength={8}
              maxLength={128}
              placeholder="От 8 символов"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </label>
          <button className="blue-button" type="submit" disabled={busy}>
            {busy ? 'Сохраняем…' : 'Установить пароль →'}
          </button>
        </>
      )}
      {msg ? (
        <p role="status" className="auth-hint" style={{color: ok ? '#14745b' : '#b33343'}}>
          {msg}
        </p>
      ) : null}
      {ok ? (
        <p>
          <a className="blue-button" href="/login">
            Войти в кабинет →
          </a>
        </p>
      ) : null}
    </form>
  );
}
