import Link from 'next/link';
import {AdminShell} from '@/components/AdminShell';
import {adminOpsHealth,adminOverview} from '@/lib/admin';
import {currentUser,isDemo} from '@/lib/core';

export default async function AdminOverview(){
 const user=(await currentUser())!;
 const data=isDemo
  ?{users:12,projects:34,active_subscriptions:8,payment_events:40,support_open:2,role:'owner_admin',content_policy:'metadata_only_default'}
  :await adminOverview();
 const health=isDemo?{db_pool:{ok:true},role:'owner_admin'}:await adminOpsHealth();
 const cards:[string,string,string][]=[
  ['users','Пользователи','/admin/clients'],
  ['projects','Проекты','/admin/clients'],
  ['active_subscriptions','Активные подписки','/admin/billing'],
  ['support_open','Открытая поддержка','/admin/support'],
 ];
 return (
  <AdminShell user={user} active="/admin">
   <div className="section-page admin-depth">
    <div className="detail-heading">
     <span className="eyebrow">ADMIN</span>
     <h1>Обзор платформы</h1>
     <p>Метаданные Core. Контент проектов не читается. Brand Voice — отдельный путь, не в этом shell.</p>
    </div>
    {isDemo?<div className="demo-message">Демо admin · Core не подключён</div>:null}
    {!data?<div className="detail-box"><p>Нет доступа к <code>/internal/admin</code> (staff role / MFA / IP allowlist).</p></div>:
     <>
      <div className="admin-cta-row">
       <Link className="blue-button" href="/admin/support">Работа сегодня · очередь</Link>
       <Link className="ghost-btn" href="/admin/clients">Найти клиента</Link>
       <Link className="ghost-btn" href="/admin/billing">Корректировка доступа</Link>
      </div>
      <div className="dashboard-grid">
       {cards.map(([k,label,href])=>(
        <Link className="dash-card admin-metric-card" key={k} href={href}>
         <div className="card-head"><div>
          <h2 style={{fontSize:18}}>{label}</h2>
          <p className="billing-value">{String(data[k]??'—')}</p>
         </div></div>
        </Link>
       ))}
      </div>
      <section className="detail-box">
       <h2>Роль и политика</h2>
       <p>Роль: <strong>{String(data.role||'—')}</strong> · политика: <code>{String(data.content_policy||'metadata_only_default')}</code></p>
       <p className="hint">Платежные события: {String(data.payment_events??'—')} · Ops health: {health?JSON.stringify(health.db_pool||health):'нет доступа'}</p>
      </section>
     </>}
   </div>
  </AdminShell>
 );
}
