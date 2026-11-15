import {redirect} from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import {currentUser} from '@/lib/core';

export const dynamic = 'force-dynamic';

const MARKETING = 'https://raga.vodopetov.ru';

export default async function Page({
  searchParams,
}: {
  searchParams: Promise<{error?: string}>;
}) {
  try {
    if (await currentUser()) redirect('/');
  } catch {
    // Core unreachable — still show login form.
  }
  const {error} = await searchParams;
  return (
    <div className="auth-page">
      <div className="auth-card">
        <div className="auth-brand">
          <div className="auth-word">
            RAGA <span>7</span>
          </div>
          <span>Управление контекстом</span>
        </div>
        <h1>Вход</h1>
        <p>Email и пароль. Промо / RAGA5 / RAGA7 — на сайте регистрации.</p>
        {error ? (
          <div className="error-box">
            {error === 'credentials'
              ? 'Не удалось войти. Проверьте email и пароль.'
              : 'Не удалось установить сессию.'}
          </div>
        ) : null}
        <form className="login-form" method="post" action="/api/session">
          <label>
            Электронная почта
            <input name="email" type="email" required autoComplete="username" placeholder="you@company.ru" />
          </label>
          <label>
            Пароль
            <input name="password" type="password" required autoComplete="current-password" />
          </label>
          <button className="blue-button" type="submit">
            Войти <span>→</span>
          </button>
        </form>
        <p className="auth-hint">
          Нет аккаунта?{' '}
          <Link href={`${MARKETING}/login`}>Регистрация и выбор модели</Link>
        </p>
        <p className="auth-secure">Авторизация через RAGA Core.</p>
      </div>
      <div className="auth-aside">
        <div className="auth-visual">
          <Image src="/brand/raga-5.png" alt="RAGA" width={250} height={250} priority />
        </div>
        <h2>
          Управляйте знаниями.
          <br />
          Не начинайте каждый раз заново.
        </h2>
      </div>
    </div>
  );
}
