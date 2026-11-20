# Контракт интеграции с RAGA Core

Источник истины — `voodoo2serg/RAG_for_AI`, `openapi/simple.v0.yaml`. Один PostgreSQL/pgvector и биллинг Core. Next.js только отображает и проксирует через server-only BFF.

## Разделы UI

| Зона | URL | Cookie |
|---|---|---|
| RAGA 5 кабинет | `/`, `/projects`, `/context`, … | `raga_session` (HttpOnly) |
| RAGA 7 Admin | `/admin/*` | та же сессия + Core `/internal/admin` RBAC/MFA/IP |

## Endpoints

| UI | Core | Примечание |
|---|---|---|
| Login | `POST /api/auth/login`, `GET /api/auth/me` | JWT в HttpOnly cookie |
| Projects | `GET /api/auth/me/projects`, `POST /api/projects`, `POST /api/simple/projects/from-preset` | preset = 5‑мин старт |
| Knowledge | `.../knowledge/items`, `.../summary`, `.../review` | review только explicit approve/reject |
| Dashboard | `GET /api/projects/{id}/dashboard` | честная выборка ≤200, `vectors_bytes: null` если нет |
| Import | `POST /api/projects/{id}/imports` | multipart, ≤100 файлов |
| Integrations | client-compatibility + integrations/status | без фейкового «connected» |
| Billing | `/api/billing/me`, `/api/catalog/products`, `POST /api/billing/checkout` | YooKassa №1 |
| Support | `/api/support/*` | не agent tickets |
| Admin | `/internal/admin/*` | metadata only · users/search · subs/payments · adjust · support queue+reply · security events · ops health |
| Brand Voice | Core `/api/brand-voice/*` | **separate** surface — not folded into `/cabinet/admin` |

## Честность

- Не обещать E2EE / zero-knowledge.
- Не показывать «доля векторов», пока Core не отдаёт реальный объём.
- Demo mode только локально (`RAGA_DEMO_MODE=true`).
