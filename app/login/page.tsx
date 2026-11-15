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
            RAGA <span>5</span>
          </div>
          <span>Простой кабинет знаний</span>
        </div>
        <h1>Добро пожаловать</h1>
        <p>
          Войдите, чтобы за минуты собрать контекст проекта — без серверов, VPN и Enterprise Lab.
        </p>
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
            Войти в RAGA 5 <span>→</span>
          </button>
        </form>
        <p className="auth-hint">
          Нет аккаунта? <Link href={MARKETING}>Регистрация на raga.vodopetov.ru</Link>
          <br />
          Простой тариф открывает этот кабинет. RAGA OS (Lab) — отдельный вход.
        </p>
        <p className="auth-secure">Авторизация через RAGA Core. Это не обрезанный RAGA OS.</p>
      </div>
      <div className="auth-aside">
        <div className="auth-visual">
          <Image src="/brand/raga-5.png" alt="RAGA 5" width={250} height={250} priority />
        </div>
        <h2>
          Управляйте знаниями.
          <br />
          Не начинайте каждый раз заново.
        </h2>
        <p>Проекты · импорт · проверка · handoff — один светлый экран.</p>
      </div>
    </div>
  );
}
