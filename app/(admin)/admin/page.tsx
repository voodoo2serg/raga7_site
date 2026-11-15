import {AdminShell} from '@/components/AdminShell';
import {adminFetch,currentUser,isDemo} from '@/lib/core';

export default async function AdminOverview(){
 const user=(await currentUser())!;
 const data=isDemo
  ?{users:12,projects:34,active_subscriptions:8,payment_events:40,support_open:2,role:'owner_admin',content_policy:'metadata_only_default'}
  :await adminFetch<Record<string,unknown>>('/internal/admin/overview');
 return (
  <AdminShell user={user} active="/admin">
   <div className="section-page">
    <div className="detail-heading">
     <span className="eyebrow">ADMIN</span>
     <h1>Overview</h1>
     <p>Метаданные платформы. Контент проектов не читается по умолчанию.</p>
    </div>
    {isDemo?<div className="demo-message">Демо admin · Core не подключён</div>:null}
    {!data?<div className="detail-box"><p>Нет доступа к `/internal/admin` (нужны staff role / MFA / IP allowlist).</p></div>:
     <div className="dashboard-grid">
      {[['users','Пользователи'],['projects','Проекты'],['active_subscriptions','Активные подписки'],['support_open','Открытая поддержка']].map(([k,label])=>(
       <section className="dash-card" key={k} style={{minHeight:140}}>
        <div className="card-head"><div><h2 style={{fontSize:18}}>{label}</h2><p className="billing-value">{String(data[k]??'—')}</p></div></div>
       </section>
      ))}
     </div>}
    {data?<pre className="json-box" style={{marginTop:18}}>{JSON.stringify(data,null,2)}</pre>:null}
   </div>
  </AdminShell>
 );
}
