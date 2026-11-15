import {AdminShell} from '@/components/AdminShell';
import {adminFetch,currentUser,isDemo} from '@/lib/core';

export default async function AdminBilling(){
 const user=(await currentUser())!;
 const subs=isDemo?{items:[]}:await adminFetch<{items:unknown[]}>('/internal/admin/subscriptions');
 const payments=isDemo?{items:[]}:await adminFetch<{items:unknown[]}>('/internal/admin/payments');
 return (
  <AdminShell user={user} active="/admin/billing">
   <div className="section-page">
    <div className="detail-heading"><span className="eyebrow">BILLING OPS</span><h1>Биллинг</h1><p>Корректировки только через ledger adjust + MFA — без подделки webhook.</p></div>
    <section className="detail-box"><h2>Subscriptions</h2><pre className="json-box">{JSON.stringify(subs?.items?.slice?.(0,30)||subs||[],null,2)}</pre></section>
    <section className="detail-box"><h2>Payments</h2><pre className="json-box">{JSON.stringify(payments?.items?.slice?.(0,30)||payments||[],null,2)}</pre></section>
   </div>
  </AdminShell>
 );
}
