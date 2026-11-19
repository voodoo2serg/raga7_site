import {redirect} from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import {currentUser} from '@/lib/core';
import {oidcConfig} from '@/lib/oidc';
import {RegisterForm} from '@/components/RegisterForm';

export const dynamic = 'force-dynamic';

/** Guest-reachable registration on the promo cabinet (VR-198). Self-reg = user only. */
export default async function RegisterPage() {
  try {
    if (await currentUser()) redirect('/');
  } catch {
    // Core unreachable — still show form.
  }
  const ssoReady = oidcConfig() !== null;
  return (
    <div className="auth-page">
      <div className="auth-card">
        <div className="auth-brand">
          <div className="auth-word">
            RAGA <span>5</span>
          </div>
          <span>Регистрация · Промо</span>
        </div>
        <h1>Создать аккаунт</h1>
        <p>
          Одна форма на промо-кабинете. Гости открывают эту страницу без входа. Роль после
          саморегистрации — только пользователь.
        </p>
        {ssoReady ? (
          <p>
            <a className="blue-button" href="/api/auth/oidc/start?register=1">
              Зарегистрироваться через единый аккаунт SIGNAL →
            </a>
          </p>
        ) : null}
        <RegisterForm />
        <p className="auth-hint">
          Уже есть аккаунт — <Link href="/login">войдите</Link>.
        </p>
      </div>
      <div className="auth-aside">
        <div className="auth-visual">
          <Image src="/brand/raga-5.png" alt="RAGA 5" width={250} height={250} priority />
        </div>
        <h2>Промо-доступ к кабинету знаний</h2>
        <p>После письма со ссылкой авторизации вы попадёте сюда же — на raga7.</p>
      </div>
    </div>
  );
}
