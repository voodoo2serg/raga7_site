import {SectionPage} from '@/components/SectionPage';
import {listCatalog} from '@/lib/core';
import {Wallet,Info} from '@/components/Icons';

function formatExpiry(value: unknown): string {
  if (!value) return 'не указано';
  const s = String(value);
  return s.includes('T') ? s.split('T')[0] : s;
}

export default async function Page(){
 const products=await listCatalog();
 return <SectionPage active="/billing">{data=>{
  const b=data.billing||{};
  const sub=((b as {subscription?:Record<string,unknown>}).subscription||(b as {billing?:{subscription?:Record<string,unknown>}}).billing?.subscription||{}) as Record<string,unknown>;
  const billingBlock=((b as {billing?:Record<string,unknown>}).billing||{}) as Record<string,unknown>;
  const warnings=((b as {warnings?:unknown[]}).warnings||billingBlock.warnings||[]) as Array<Record<string,unknown>>;
  const status = String(sub.status || billingBlock.status || 'не определён');
  const expired = status === 'expired' || String(billingBlock.status||'') === 'overdue';
  return <>
   <div className="detail-heading"><span className="eyebrow">АККАУНТ</span><h1>Тариф и оплата</h1><p>Срок доступа, промокоды и продление. Портал: raga7.vodopetov.ru</p></div>
   <section className="detail-box billing-panel"><Wallet size={25}/><div><h2>Текущий доступ</h2><div className="billing-value">{String(sub.plan||billingBlock.plan||'Нет активного тарифа')}</div><p>Статус: {status} · До: {formatExpiry(sub.expires_at || billingBlock.expires_at)}</p>{expired?<p className="hint">Срок истёк, но ваши данные сохранены. Оплатите тариф или введите новый промокод ниже.</p>:<p className="hint">Промокод ZIMA2027 даёт 1 календарный месяц. После окончания данные не удаляются.</p>}{warnings.length?<ul className="hint">{warnings.map((w,i)=><li key={i}>{String(w.message||w.code||JSON.stringify(w))}</li>)}</ul>:null}</div></section>
   <section className="detail-box">
    <h2>Продлить промокодом</h2>
    <p>Введите код (например ZIMA2027), если у вас есть новый промо-период. Письмо с подтверждением придёт на email аккаунта.</p>
    <form action="/api/promo-redeem" method="post" className="flex-between" style={{marginTop:16,gap:12,flexWrap:'wrap'}}>
      <input name="code" required maxLength={40} placeholder="Промокод" style={{flex:'1 1 220px',minHeight:44,padding:'10px 12px',borderRadius:10,border:'1px solid var(--line)'}}/>
      <button className="blue-button" type="submit">Активировать</button>
    </form>
   </section>
   <section className="detail-box">
    <h2>Тарифы</h2>
    <p>Оплата через YooKassa (основной канал для RU). Кнопка создаёт checkout в Core.</p>
    <div className="stack" style={{display:'grid',gap:12,marginTop:16}}>
     {products.filter(p=>p.kind==='plan').map(p=>(
      <form key={p.sku} action="/api/checkout" method="post" className="flex-between" style={{borderTop:'1px solid var(--line)',paddingTop:14}}>
       <div><strong>{p.name}</strong><div className="subtle">{p.price_rub} ₽ · {p.period_days} дн. · {p.storage_gb??'—'} ГБ · {p.sku}</div></div>
       <input type="hidden" name="sku" value={p.sku}/>
       <input type="hidden" name="provider" value="yookassa"/>
       <button className="blue-button" type="submit">Оплатить</button>
      </form>
     ))}
    </div>
    <div className="callout"><Info size={18}/> Данные после окончания промо-периода сохраняются. Доступ появляется снова после оплаты или активации промокода.</div>
   </section>
  </>
 }}</SectionPage>
}
