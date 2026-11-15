import {AdminShell} from '@/components/AdminShell';
import {adminFetch,currentUser,isDemo} from '@/lib/core';

type Thread={id:string;subject:string;status:string;category?:string};

export default async function AdminSupport(){
 const user=(await currentUser())!;
 const body=isDemo
  ?{items:[{id:'1',subject:'Демо тикет',status:'new',category:'import'}] as Thread[]}
  :await adminFetch<{items:Thread[]}>('/internal/admin/support/threads');
 const items=body?.items||[];
 return (
  <AdminShell user={user} active="/admin/support">
   <div className="section-page">
    <div className="detail-heading"><span className="eyebrow">SUPPORT</span><h1>Очередь поддержки</h1><p>support_* · не agent tickets · без knowledge body.</p></div>
    <div className="project-list">
     {items.map(t=>(
      <div className="project-line" key={t.id}><span><b>{t.subject}</b><small>{t.category||'—'} · {t.status}</small></span></div>
     ))}
     {items.length===0?<div className="empty">Очередь пуста или нет прав.</div>:null}
    </div>
   </div>
  </AdminShell>
 );
}
