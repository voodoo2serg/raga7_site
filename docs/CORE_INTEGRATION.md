# Контракт интеграции с RAGA Core

Источник истины — `voodoo2serg/RAG_for_AI`, `openapi/simple.v0.yaml`. Использовать одно хранилище PostgreSQL/pgvector и биллинг Core. Next.js-слой только отображает и проксирует вызовы Core через server-only API client.

**Шесть категорий контекста:** `fact`, `decision`, `hypothesis`, `prompt_or_skill`, `task`, `technical` — из `knowledge_read_model.py`. Не путать с шестью осями *стиля* (`directness`, `brevity`, `argumentation`, `formality`, `terminology`, `citation_density`) и восемью осями RAGA-64.

Текущее API `knowledge/items` возвращает срез максимум 200 записей, поэтому числа на домашней странице обозначены «в выборке». Не строить фальшивые оценки «доля векторов» без нового агрегирующего backend endpoint.

## Желаемый будущий агрегатор `/api/projects/{id}/dashboard`

```
{
  "project_id":"uuid",
  "projects_count":3,
  "discoveries":{"proposed_projects":0,"new_links":0,"since":"ISO 8601"},
  "knowledge":{"by_type":{"fact":0,"decision":0,"hypothesis":0,"prompt_or_skill":0,"task":0,"technical":0},"total":0,"pending_review":0},
  "storage":{"files_bytes":0,"vectors_bytes":null,"quota_bytes":null},
  "imports":{"latest_run_at":null,"running":0,"status":"idle"}
}
```

Все поля привязаны к проекту/пользователю. `null` означает, что размер не измеряется, а не `0`. Нужно покрыть tenant isolation + cross-project IDOR, реальную долгую очередь и ограничение нагрузки.
