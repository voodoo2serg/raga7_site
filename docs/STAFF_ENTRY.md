# Cabinet staff entry — one mental model

## Product vs staff

| Surface | Path | Audience |
|---------|------|----------|
| Blue cabinet | `/cabinet` | Linked RAGA users |
| Staff admin | `/cabinet/admin` | Platform staff (clients / billing / support / security) |

There is **no** separate public product at `/admin` or on `raga7admin.*`.

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

## Brand Voice (sibling repo)

Brand Voice OIDC in **RAG_for_AI** is a separate staff/product surface (`scope=brand_voice`). It is **not** part of `/cabinet/admin`. Leave its `browser_e2e_verified` false until a dedicated BV browser pass.
