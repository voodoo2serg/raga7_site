import Link from 'next/link';
import {SetPasswordForm} from '@/components/SetPasswordForm';

export const dynamic = 'force-dynamic';

/** Auth-only password setup on promo cabinet (VR-198). Guests reach this from mail. */
export default async function SetPasswordPage({
  searchParams,
}: {
  searchParams: Promise<{token?: string}>;
}) {
  const {token} = await searchParams;
  return (
    <div className="auth-page">
      <div className="auth-card">
        <div className="auth-brand">
          <div className="auth-word">
            RAGA <span>5</span>
          </div>
          <span>Установка пароля</span>
        </div>
        <h1>Задайте пароль</h1>
        <p>Одноразовая ссылка из письма. После сохранения войдите в этот кабинет.</p>
        <SetPasswordForm token={typeof token === 'string' ? token : ''} />
        <p className="auth-hint">
          <Link href="/login">Вернуться ко входу</Link>
        </p>
      </div>
      <div className="auth-aside">
        <h2>Авторизация без курсов</h2>
        <p>Письма содержат только ссылку для входа или установки пароля.</p>
      </div>
    </div>
  );
}
