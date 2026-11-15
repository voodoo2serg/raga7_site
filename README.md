# RAGA 5 + RAGA 7 Admin (`raga7.vodopetov.ru` / admin)

Next.js UX поверх **RAGA Core** (`voodoo2serg/RAG_for_AI`). Без второй БД пользователей, без копии знаний, без собственного биллинга.

## Что внутри

**Кабинет (RAGA 5)** — дизайн-система сайта (голубой Inter UI, 2×2 dashboard, six knowledge types):

- Главная: Проекты / Интеграции / Контекст / Структура знаний + статусы клиентов
- `/projects` — создание + **from-preset**
- `/context` — импорт файлов + **approve/reject** review
- `/integrations` — GitHub URL + compatibility matrix
- `/analytics` — 6 типов знаний
- `/billing` — каталог SKU + YooKassa checkout
- `/support` — живые `/api/support/*` threads
- `/settings` — privacy honesty (no ZK claims)

**Админка (RAGA 7)** — тот же визуальный язык, бренд RAGA 7:

- `/admin` overview · `/admin/clients` · `/admin/billing` · `/admin/support` · `/admin/security`
- Данные с `/internal/admin/*` (RBAC + MFA + IP allowlist на Core)
- Content policy: metadata only

## Запуск

```bash
cp .env.example .env.local
npm install
npm run dev
```

```
RAGA_CORE_URL=http://127.0.0.1:8000
RAGA_SITE_ORIGIN=http://localhost:3000
RAGA_DEMO_MODE=true   # только локальный просмотр
```

Production: `RAGA_DEMO_MODE=false`, HTTPS origin, Core private.

## Безопасность

- Нет `NEXT_PUBLIC_` секретов; JWT только HttpOnly cookie
- Origin check на mutating BFF routes
- CSP без внешних analytics scripts
- Не публиковать `:8000` / Postgres / Redis

## Связанный Core

Нужны маршруты из ветки RAGA7: catalog, checkout, support, `/internal/admin`, `/api/projects/{id}/dashboard`, alembic `041_raga7_saas_foundation`.
