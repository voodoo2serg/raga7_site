import {redirect} from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import {currentUser} from '@/lib/core';
import {oidcConfig} from '@/lib/oidc';

export const dynamic = 'force-dynamic';

export default async function Page({
  searchParams,
}: {
  searchParams: Promise<{error?: string; registered?: string}>;
}) {
  try {
    if (await currentUser()) redirect('/');
  } catch {
    // Core unreachable — still show login form.
  }
  const {error, registered} = await searchParams;
  const ssoReady = oidcConfig() !== null;
  const linkRequired = error === 'link_required' || error === 'link_failed';
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
          Гости могут войти или зарегистрироваться здесь — без перехода на курсы и маркетинговый лендинг.
        </p>
        {registered === '1' ? (
          <div className="auth-hint" role="status" style={{color: '#14745b', marginBottom: 12}}>
            Письмо со ссылкой для входа у вас на почте.
          </div>
        ) : null}
        {error ? (
          <div className="error-box">
            {error === 'credentials'
              ? 'Не удалось войти. Проверьте email и пароль.'
              : error === 'link_required'
                ? 'Keycloak подтвердил ваш email. Для сохранения прежних проектов один раз подтвердите старый пароль RAGA ниже.'
                : error === 'link_failed'
                  ? 'Не удалось привязать аккаунт. Проверьте прежние данные входа; проекты не изменены.'
                  : error === 'oidc_unavailable'
                    ? 'Единый вход ещё не включён на сервере.'
                    : error === 'oidc_failed'
                      ? 'Вход через Keycloak не завершился. Повторите попытку.'
                      : 'Не удалось установить сессию.'}
          </div>
        ) : null}
        {ssoReady && !linkRequired && (
          <p>
            <a className="blue-button" href="/api/auth/oidc/start">
              Войти через единый аккаунт SIGNAL →
            </a>
          </p>
        )}
        {ssoReady && !linkRequired && (
          <p>
            <a className="blue-button" href="/api/auth/oidc/start?register=1" style={{background: '#168268'}}>
              Зарегистрироваться (Keycloak) →
            </a>
          </p>
        )}
        <form className="login-form" method="post" action={linkRequired ? '/api/auth/oidc/link' : '/api/session'}>
          {ssoReady && (
            <p className="auth-hint">
              {linkRequired
                ? 'Подтвердите прежнюю учётную запись RAGA'
                : 'Для ранее созданных учётных записей доступен переходный вход.'}
            </p>
          )}
          <label>
            Электронная почта
            <input name="email" type="email" required autoComplete="username" placeholder="you@company.ru" />
          </label>
          <label>
            Пароль
            <input name="password" type="password" required autoComplete="current-password" />
          </label>
          <button className="blue-button" type="submit">
            Войти в кабинет <span>→</span>
          </button>
        </form>
        <p className="auth-hint">
          Нет аккаунта? <Link href="/register">Одна форма регистрации на этом сайте</Link>
          <br />
          Самостоятельная регистрация создаёт роль пользователя (без прав администратора).
        </p>
        <p className="auth-hint">
          <Link href="/set-password">Есть письмо со ссылкой? Установить пароль</Link>
        </p>
        <p className="auth-secure">
          {ssoReady
            ? 'Единый вход через Keycloak. Ваши проекты остаются в RAGA Core.'
            : 'Вход через RAGA Core до включения общего Keycloak SSO.'}
        </p>
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
