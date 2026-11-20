# Cabinet staff entry — one mental model

## Product vs staff

| Surface | Path | Audience |
|---------|------|----------|
| Blue cabinet | `/cabinet` | Linked RAGA users |
| Staff admin | `/cabinet/admin` | Platform staff (clients / billing / support / security) |

There is **no** separate public product at `/admin` or on `raga7admin.*`.

## Staff product (VR-275)

`/cabinet/admin` is the real ops surface (not JSON stubs):

| Section | Work |
|---------|------|
| Overview | Counts + «Работа сегодня» → support queue |
| Clients | Email search, access/plan, project metadata drill-down |
| Billing | Subscriptions / payments tables + ledger **adjust** (reason + optional MFA) |
| Support | Status filters, thread detail, reply, assign |
| Security | Readable audit of admin adjustments / perimeter events |

Data from Core `/internal/admin/*` (RBAC + MFA + IP). Content of knowledge is never shown by default.

## Entry

1. Guest hits `/cabinet/admin` (or legacy `raga7admin.vodopetov.ru`)  
2. → marketing `https://raga.vodopetov.ru/login?next=https://raga.vodopetov.ru/cabinet/admin`  
3. → IdP `raga7-bff` (OIDC start seals `next`)  
4. → callback restores session and redirects to sealed `next` when safe  

## `browser_e2e_verified`

Status JSON reports `browser_e2e_verified:true` only when **both**:

- Cabinet env `RAGA_OIDC_BROWSER_E2E_VERIFIED=1`
- Core env `RAGA_OIDC_BROWSER_E2E_VERIFIED=1`

Set after a real browser IdP → `/cabinet` proof. Clear either env to flip the flag back to false.

## Brand Voice (sibling — do not fold)

Brand Voice OIDC in **RAG_for_AI** (`/api/brand-voice/*`, client `raga-brand-voice`, ACL `issuer+sub`) is a **separate** staff/product surface.

- **Not** part of `/cabinet/admin` nav or chrome.
- Keep `BRAND_VOICE_OIDC_BROWSER_E2E_VERIFIED` unset / false until a dedicated BV browser pass.
- Docs: Core `docs/AUTH_209_BRAND_VOICE_OIDC.md`.
