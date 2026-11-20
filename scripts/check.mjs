import {readFileSync,existsSync} from 'node:fs';
const load=p=>readFileSync(new URL('../'+p,import.meta.url),'utf8');
const files=[
 'components/Dashboard.tsx','app/(workspace)/analytics/page.tsx','app/(workspace)/context/page.tsx',
 'app/api/session/route.ts','app/api/import/route.ts','lib/core.ts','lib/admin.ts',
 'app/(admin)/admin/page.tsx','app/(admin)/admin/clients/page.tsx','app/(admin)/admin/billing/page.tsx',
 'app/(admin)/admin/support/page.tsx','app/(admin)/admin/security/page.tsx',
 'app/(admin)/admin/clients/[id]/page.tsx','app/(admin)/admin/support/[id]/page.tsx',
 'app/api/admin/adjust/route.ts','app/api/admin/support/reply/route.ts','app/api/admin/support/assign/route.ts',
 'components/AdminShell.tsx','docs/STAFF_ENTRY.md',
];
for (const f of files)if(!existsSync(new URL('../'+f,import.meta.url)))throw new Error(`Missing ${f}`);
const data=load('lib/types.ts');
for(const label of ['fact','decision','hypothesis','prompt_or_skill','task','technical'])if(!data.includes(label))throw new Error(`Missing context type: ${label}`);
const dashboard=load('components/Dashboard.tsx');
for(const name of ['Проекты','Интеграции','Контекст','Структура знаний'])if(!dashboard.includes(name))throw new Error(`Missing card ${name}`);
const auth=load('app/api/session/route.ts');if(!auth.includes('httpOnly:true'))throw new Error('Session cookie must be HttpOnly');
const imp=load('app/api/import/route.ts');if(!imp.includes('verifiedOrigin')||!imp.includes('github.com'))throw new Error('Import safety missing');
const shell=load('components/AdminShell.tsx');
for(const m of ['Работа сегодня','/admin/clients','/admin/billing','/admin/support','/admin/security','Brand Voice']){
 if(!shell.includes(m)&&m!=='Brand Voice')throw new Error(`AdminShell missing ${m}`);
}
if(!shell.includes('Brand Voice')&&!load('docs/STAFF_ENTRY.md').includes('Brand Voice'))throw new Error('Brand Voice separate-path note missing');
const billing=load('app/(admin)/admin/billing/page.tsx');
if(!billing.includes('/api/admin/adjust')||!billing.includes('reason'))throw new Error('Billing adjust form missing');
const support=load('app/(admin)/admin/support/[id]/page.tsx');
if(!support.includes('/api/admin/support/reply')||!support.includes('assign'))throw new Error('Support reply/assign missing');
const staff=load('docs/STAFF_ENTRY.md');
if(!staff.includes('do not fold')&&!staff.includes('Not** part')&&!staff.includes('отдельн'))throw new Error('STAFF_ENTRY must keep Brand Voice separate');
console.log('PASS: 4 cards, six knowledge types, auth boundary, protected import, staff admin depth');
