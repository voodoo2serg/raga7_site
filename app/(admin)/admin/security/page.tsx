import {AdminShell} from '@/components/AdminShell';
import {adminSecurityEvents,fmtWhen,type SecurityEvent} from '@/lib/admin';
import {currentUser,isDemo} from '@/lib/core';

export default async function AdminSecurity(){
 const user=(await currentUser())!;
 const body=isDemo
  ?{items:[{id:'1',event_type:'demo',severity:'info',detail:'Демо',created_at:new Date().toISOString()}] as SecurityEvent[]}
  :await adminSecurityEvents();
 const items=body?.items||[];
 return (
  <AdminShell user={user} active="/admin/security">
   <div className="section-page admin-depth">
    <div className="detail-heading">
     <span className="eyebrow">SECURITY</span>
     <h1>События безопасности</h1>
     <p>Аудит admin adjustments / perimeter. Без содержимого знаний.</p>
    </div>
    <div className="admin-table-wrap">
     <table className="admin-table">
      <thead><tr><th>Когда</th><th>Тип</th><th>Severity</th><th>Actor</th><th>Деталь</th></tr></thead>
      <tbody>
       {items.map(e=>(
        <tr key={e.id}>
         <td>{fmtWhen(e.created_at)}</td>
         <td><b>{e.event_type}</b></td>
         <td><span className="status-badge">{e.severity||'—'}</span></td>
         <td className="mono">{e.actor_user_id||'—'}</td>
         <td>{e.detail||'—'}</td>
        </tr>
       ))}
      </tbody>
     </table>
     {items.length===0?<div className="empty">Нет событий или нет прав.</div>:null}
    </div>
   </div>
  </AdminShell>
 );
}
