# Проверки и границы релиза

Проверки локальной исходной версии:
- `node scripts/check.mjs`: пройдено.
- `TypeScript transpileModule`: синтаксических ошибок нет.
- `npm install` не завершился: пакетный реестр недоступен из среды, поэтому production build и браузерный E2E **не проверены**.

Для запуска на CI выполнить `npm install`, `npm run typecheck`, `npm run build`, `npm run check`; затем Playwright: desktop 1440px, tablet 768px, phone 390px, 320px.

Необходимые backend проверки: login/logout, валидный/невалидный Origin, чужой project UUID (403/404), multipart и GitHub импорт, тишина фоновых задач без ручного действия, billing billing/me и workspace isolation.

**Проверка безопасности перед публичным запуском:** серверные session ids вместо хранения JWT в cookie, refresh/revoke, MFA, rate-limit, backend tenant policy, reverse proxy, HTTPS, CSRF, раздельный admin hostname.
