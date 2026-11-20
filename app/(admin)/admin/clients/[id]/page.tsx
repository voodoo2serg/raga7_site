import Link from 'next/link';
import {AdminShell} from '@/components/AdminShell';
import {adminUserProjects,adminUsers} from '@/lib/admin';
import {currentUser,isDemo} from '@/lib/core';

export default async function AdminClientDetail({params}:{params:Promise<{id:string}>}){
 const user=(await currentUser())!;
 const {id}=await params;
 const projects=isDemo
  ?{items:[{id:'p1',name:'Демо проект',slug:'demo',status:'active',is_preset:false}],note:'demo'}
  :await adminUserProjects(id);
 const users=isDemo?{items:[{id,email:'demo@raga.local'}]}:await adminUsers();
 const client=(users?.items||[]).find(u=>u.id===id);
 const items=projects?.items||[];
 return (
  <AdminShell user={user} active="/admin/clients">
   <div className="section-page admin-depth">
    <div className="detail-heading">
     <span className="eyebrow">CLIENT</span>
     <h1>{client?.email||id}</h1>
     <p>Метаданные проектов владельца. {projects?.note||'Содержимое знаний недоступно.'}</p>
    </div>
    <p><Link href="/admin/clients">← Все клиенты</Link>
     {' · '}
     <Link href={`/admin/billing?user_id=${encodeURIComponent(id)}`}>Выдать дни доступа</Link>
    </p>
    <div className="admin-table-wrap">
     <table className="admin-table">
      <thead><tr><th>Проект</th><th>Slug</th><th>Статус</th><th>Preset</th></tr></thead>
      <tbody>
       {items.map(p=>(
        <tr key={p.id}>
         <td><b>{p.name}</b><div className="hint mono">{p.id}</div></td>
         <td>{p.slug||'—'}</td>
         <td>{p.status||'—'}</td>
         <td>{p.is_preset?'да':'нет'}</td>
        </tr>
       ))}
      </tbody>
     </table>
     {items.length===0?<div className="empty">Нет проектов или нет прав.</div>:null}
    </div>
   </div>
  </AdminShell>
 );
}
