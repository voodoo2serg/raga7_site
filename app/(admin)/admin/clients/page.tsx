import {AdminShell} from '@/components/AdminShell';
import {adminFetch,currentUser,isDemo} from '@/lib/core';

type Row={id:string;email:string;plan?:string|null;has_access?:boolean};

export default async function AdminClients(){
 const user=(await currentUser())!;
 const body=isDemo
  ?{items:[{id:'1',email:'demo@raga.local',plan:'raga5_1490',has_access:true}] as Row[]}
  :await adminFetch<{items:Row[]}>('/internal/admin/users');
 const items=body?.items||[];
 return (
  <AdminShell user={user} active="/admin/clients">
   <div className="section-page">
    <div className="detail-heading"><span className="eyebrow">CLIENTS</span><h1>Клиенты</h1><p>Email / plan / access — без тел знаний.</p></div>
    <div className="project-list">
     {items.map(u=>(
      <div className="project-line" key={u.id}>
       <span><b>{u.email}</b><small>{u.plan||'—'} · {u.has_access?'доступ есть':'нет доступа'}</small></span>
      </div>
     ))}
     {items.length===0?<div className="empty">Нет данных или нет прав.</div>:null}
    </div>
   </div>
  </AdminShell>
 );
}
