import Link from 'next/link';
import {AdminShell} from '@/components/AdminShell';
import {adminSupportThreads,fmtWhen,type AdminThread} from '@/lib/admin';
import {currentUser,isDemo} from '@/lib/core';

const FILTERS=['','new','open','waiting_support','waiting_user','closed'];

export default async function AdminSupport({searchParams}:{searchParams:Promise<{status?:string;error?:string}>}){
 const user=(await currentUser())!;
 const sp=await searchParams;
 const status=(sp.status||'').trim();
 const body=isDemo
  ?{items:[{id:'1',subject:'Демо тикет',status:'new',category:'import',updated_at:new Date().toISOString()}] as AdminThread[]}
  :await adminSupportThreads(status||undefined);
 const items=body?.items||[];
 return (
  <AdminShell user={user} active="/admin/support">
   <div className="section-page admin-depth">
    <div className="detail-heading">
     <span className="eyebrow">SUPPORT</span>
     <h1>Очередь поддержки</h1>
     <p>support_* · не agent tickets · без knowledge body. Работа сегодня = открыть тикет → ответить.</p>
    </div>
    {sp.error?<div className="demo-message" style={{background:'#fff1f1',borderColor:'#f0c0c0',color:'#8a3030'}}>Ошибка: {sp.error}</div>:null}
    <div className="admin-filters">
     {FILTERS.map(s=>(
      <Link key={s||'all'} className={`ghost-btn ${status===s?'selected':''}`} href={s?`/admin/support?status=${s}`:'/admin/support'}>
       {s||'все'}
      </Link>
     ))}
    </div>
    <div className="admin-table-wrap">
     <table className="admin-table">
      <thead><tr><th>Тема</th><th>Категория</th><th>Статус</th><th>Обновлён</th><th></th></tr></thead>
      <tbody>
       {items.map(t=>(
        <tr key={t.id}>
         <td><b>{t.subject}</b></td>
         <td>{t.category||'—'}</td>
         <td><span className="status-badge">{t.status}</span></td>
         <td>{fmtWhen(t.updated_at||t.created_at)}</td>
         <td><Link href={`/admin/support/${encodeURIComponent(t.id)}`}>Открыть →</Link></td>
        </tr>
       ))}
      </tbody>
     </table>
     {items.length===0?<div className="empty">Очередь пуста или нет прав.</div>:null}
    </div>
   </div>
  </AdminShell>
 );
}
