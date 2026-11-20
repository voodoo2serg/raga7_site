import {AdminShell} from '@/components/AdminShell';
import {adminPayments,adminSubscriptions,fmtWhen,type AdminPayment,type AdminSub} from '@/lib/admin';
import {currentUser,isDemo} from '@/lib/core';

export default async function AdminBilling({searchParams}:{searchParams:Promise<{user_id?:string;ok?:string;error?:string}>}){
 const user=(await currentUser())!;
 const sp=await searchParams;
 const subsBody=isDemo?{items:[] as AdminSub[]}:await adminSubscriptions();
 const payBody=isDemo?{items:[] as AdminPayment[]}:await adminPayments();
 const subs=subsBody?.items||[];
 const payments=payBody?.items||[];
 return (
  <AdminShell user={user} active="/admin/billing">
   <div className="section-page admin-depth">
    <div className="detail-heading">
     <span className="eyebrow">BILLING OPS</span>
     <h1>Биллинг</h1>
     <p>Подписки и платежи Core. Корректировки только через ledger adjust + MFA — без подделки webhook.</p>
    </div>
    {sp.ok==='adjust'?<div className="demo-message">Корректировка применена и записана в security events.</div>:null}
    {sp.error?<div className="demo-message" style={{background:'#fff1f1',borderColor:'#f0c0c0',color:'#8a3030'}}>Не удалось: {sp.error}</div>:null}

    <section className="detail-box">
     <h2>Выдать дни доступа</h2>
     <form className="admin-form" action="/api/admin/adjust" method="post">
      <label>User ID<input name="user_id" required defaultValue={sp.user_id||''} placeholder="uuid клиента"/></label>
      <label>Дни<input name="days" type="number" min={1} max={365} required defaultValue={30}/></label>
      <label>План<input name="plan" defaultValue="promo" maxLength={40}/></label>
      <label>Причина (audit)<input name="reason" required minLength={5} maxLength={500} placeholder="минимум 5 символов"/></label>
      <label>MFA reauth (если требуется)<input name="mfa" maxLength={12} placeholder="опционально" autoComplete="one-time-code"/></label>
      <button className="blue-button" type="submit">Применить adjust</button>
     </form>
    </section>

    <section className="detail-box">
     <h2>Подписки ({subs.length})</h2>
     <div className="admin-table-wrap">
      <table className="admin-table">
       <thead><tr><th>User</th><th>План</th><th>Статус</th><th>До</th><th>Источник</th></tr></thead>
       <tbody>
        {subs.slice(0,50).map(s=>(
         <tr key={s.id}>
          <td className="mono">{s.user_id}</td>
          <td>{s.plan}</td>
          <td>{s.status}</td>
          <td>{fmtWhen(s.expires_at)}</td>
          <td>{s.source||s.promo_code||'—'}</td>
         </tr>
        ))}
       </tbody>
      </table>
      {subs.length===0?<div className="empty">Нет подписок или нет прав.</div>:null}
     </div>
    </section>

    <section className="detail-box">
     <h2>Платежи ({payments.length})</h2>
     <div className="admin-table-wrap">
      <table className="admin-table">
       <thead><tr><th>Провайдер</th><th>План</th><th>₽</th><th>Статус</th><th>Создан</th></tr></thead>
       <tbody>
        {payments.slice(0,50).map(p=>(
         <tr key={p.id}>
          <td>{p.provider||'—'}</td>
          <td>{p.plan||'—'}</td>
          <td>{p.amount_rub??'—'}</td>
          <td>{p.status||'—'}</td>
          <td>{fmtWhen(p.created_at||p.confirmed_at)}</td>
         </tr>
        ))}
       </tbody>
      </table>
      {payments.length===0?<div className="empty">Нет платежей или нет прав.</div>:null}
     </div>
    </section>
   </div>
  </AdminShell>
 );
}
