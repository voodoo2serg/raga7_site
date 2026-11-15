# RAGA 5 — пользовательский кабинет (`raga7.vodopetov.ru`)

Next.js-интерфейс поверх действующего **RAGA Core** из `voodoo2serg/RAG_for_AI`. Репозиторий **не** содержит ещё одну базу пользователей, копию знаний или собственный биллинг.

## Что реализовано

- Главная 2×2: **Проекты / Интеграции / Контекст / Структура знаний**; ниже — статусы API/моделей и быстрые переходы.
- Шесть **типов знаний**, точно совпадающих с `backend/app/services/knowledge_read_model.py`: `fact`, `decision`, `hypothesis`, `prompt_or_skill`, `task`, `technical`. Показываются реальные числа из доступной выборки `/knowledge/items?limit=200`, а не выдуманный процент технического/векторного объёма.
- Отдельные страницы `/projects`, `/context`, `/integrations`, `/analytics`, `/settings`, `/billing`, `/support`.
- Отправка файлов и GitHub URL вручную на штатный `POST /api/projects/{id}/imports`. Автоматического непрерывного сбора нет.
- Вход через `/api/auth/login` Core, HttpOnly cookie на домене сайта, серверные запросы BFF к закрытому API.
- Мобильная адаптация. Логотип RAGA 5 — только в футере, интерфейс без графического перегруза.
- Явный **demo mode** для локального просмотра, никогда не выдаваемый за живые подключения.

## Запуск

```bash
cp .env.example .env.local
npm ci # после создания package-lock.json; первый раз: npm install
npm run dev
```

Укажите `RAGA_CORE_URL` (внутренний адрес контейнера FastAPI) и `RAGA_SITE_ORIGIN` (публичный HTTPS origin). Для просмотра без backend **локально** установите `RAGA_DEMO_MODE=true`. Для настоящих пользователей — `false`. Никаких `NEXT_PUBLIC_` секретов.

### Важно для безопасности

- PostgreSQL, Redis, внутренние API и секреты не публикуются на внешнем интерфейсе.
- Все действия, меняющие данные, проверяют Origin и требуют серверной сессии; доступ к проектам дополнительно проверяет **RAGA Core**.
- Токен JWT сейчас хранится в HttpOnly cookie до 8 часов (нет refresh/revoke). Перед production требуется заменить его непрозрачной серверной сессией с ротацией и отзывом, добавить rate limit на BFF login и email verification/MFA по проектному ТЗ.
- Не выкладывать `/api/auth`, `/mcp`, PostgreSQL или админские маршруты наружу без разграничения и gateway.
- Нельзя заявлять полное zero-knowledge, пока оно не подтверждено криптографической реализацией.
- CSP не разрешает внешние скрипты аналитики: менять только при обоснованной необходимости с согласиями.

## Контракт и границы готовности

| UI | Core endpoint | Поведение |
|---|---|---|
| Вход | `POST /api/auth/login`, `GET /api/auth/me` | JWT / серверная сессия |
| Проекты | `GET /api/auth/me/projects`, `POST /api/projects` | один tenant Core |
| Знания | `GET /api/projects/{id}/knowledge/items`, `.../knowledge/summary` | выборка до 200 записей |
| Импорт | `POST /api/projects/{id}/imports` | `multipart/form-data` |
| Интеграции | `GET /api/public/client-compatibility`, `GET /api/projects/{id}/integrations/status` | статусы без фиктивного «подключено» |
| Потребление | `GET /api/projects/{id}/usage` | события/квоты, **не** объем векторов |
| Биллинг | `GET /api/billing/me` | в Core — источник истины |
| Стили | `/api/projects/{id}/answer-styles` | 6 осей культуры ответа; отображается текстом, настройки без сохранения |
| Поддержка | `/api/support/*` | backend ещё не подтвержден, форма не отправляет «в никуда» |

Перед production: полноценные E2E/нагрузочные тесты, привязка обнаружений проектов к агрегатору Core, объемы файлов/векторов и метрики всех данных, поддержка, безопасный JWT refresh/revoke, обязательное подключение real tenant/auth and CORS.
