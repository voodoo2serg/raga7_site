import Link from 'next/link';
import {AdminShell} from '@/components/AdminShell';
import {adminUsers,fmtWhen,type AdminUser} from '@/lib/admin';
import {currentUser,isDemo} from '@/lib/core';

export default async function AdminClients({searchParams}:{searchParams:Promise<{email?:string}>}){
 const user=(await currentUser())!;
 const sp=await searchParams;
 const email=(sp.email||'').trim();
 const body=isDemo
  ?{items:[{id:'1',email:'demo@raga.local',name:'Demo',plan:'raga5_1490',has_access:true,created_at:new Date().toISOString()}] as AdminUser[]}
  :await adminUsers(email||undefined);
 const items=body?.items||[];
 return (
  <AdminShell user={user} active="/admin/clients">
   <div className="section-page admin-depth">
    <div className="detail-heading">
     <span className="eyebrow">CLIENTS</span>
     <h1>Клиенты</h1>
     <p>Email / план / доступ / проекты — без тел знаний.</p>
    </div>
    <form className="admin-search" method="get">
     <label>Поиск по email
      <input name="email" defaultValue={email} placeholder="часть@email" maxLength={200}/>
     </label>
     <button className="blue-button" type="submit">Найти</button>
     {email?<Link className="ghost-btn" href="/admin/clients">Сбросить</Link>:null}
    </form>
    <div className="admin-table-wrap">
     <table className="admin-table">
      <thead>
       <tr>
        <th>Email</th>
        <th>Имя</th>
        <th>План</th>
        <th>Доступ</th>
        <th>Создан</th>
        <th></th>
       </tr>
      </thead>
      <tbody>
       {items.map(u=>(
        <tr key={u.id}>
         <td><b>{u.email}</b>{u.is_superadmin?<span className="status-badge">super</span>:null}</td>
         <td>{u.name||'—'}</td>
         <td>{u.plan||'—'}</td>
         <td>{u.has_access?<span className="status-badge ok">есть</span>:<span className="status-badge">нет</span>}</td>
         <td>{fmtWhen(u.created_at)}</td>
         <td><Link href={`/admin/clients/${encodeURIComponent(u.id)}`}>Проекты →</Link></td>
        </tr>
       ))}
      </tbody>
     </table>
     {items.length===0?<div className="empty">Нет данных или нет прав.</div>:null}
    </div>
   </div>
  </AdminShell>
 );
}
