import {AdminShell} from '@/components/AdminShell';
import {adminFetch,currentUser,isDemo} from '@/lib/core';

export default async function AdminSecurity(){
 const user=(await currentUser())!;
 const body=isDemo?{items:[{event_type:'demo',severity:'info',detail:'Демо'}]}:await adminFetch<{items:unknown[]}>('/internal/admin/security/events');
 return (
  <AdminShell user={user} active="/admin/security">
   <div className="section-page">
    <div className="detail-heading"><span className="eyebrow">SECURITY</span><h1>События безопасности</h1><p>Аудит admin adjustments / perimeter.</p></div>
    <pre className="json-box">{JSON.stringify(body?.items||body||[],null,2)}</pre>
   </div>
  </AdminShell>
 );
}
