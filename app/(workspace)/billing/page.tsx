import {SectionPage} from '@/components/SectionPage';
import {listCatalog} from '@/lib/core';
import {Wallet,Info} from '@/components/Icons';

export default async function Page(){
 const products=await listCatalog();
 return <SectionPage active="/billing">{data=>{
  const b=data.billing||{};
  const sub=((b as {subscription?:Record<string,unknown>}).subscription||(b as {billing?:{subscription?:Record<string,unknown>}}).billing?.subscription||{}) as Record<string,unknown>;
  const warnings=((b as {warnings?:unknown[]}).warnings||(b as {billing?:{warnings?:unknown[]}}).billing?.warnings||[]) as unknown[];
  return <>
   <div className="detail-heading"><span className="eyebrow">АККАУНТ</span><h1>Тариф и оплата</h1><p>Подписки и промокоды — в единой биллинговой системе RAGA Core. Доступ после confirmed webhook.</p></div>
   <section className="detail-box billing-panel"><Wallet size={25}/><div><h2>Текущий доступ</h2><div className="billing-value">{String(sub.plan||'Нет активного тарифа')}</div><p>Статус: {String(sub.status||'не определён')} · До: {String(sub.expires_at||'не указано')}</p>{warnings.length?<p className="hint">Предупреждения: {JSON.stringify(warnings)}</p>:null}</div></section>
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
    <div className="callout"><Info size={18}/> Двойной webhook идемпотентен. Фиктивных списаний нет — доступ появляется только после подтверждения провайдера.</div>
   </section>
  </>
 }}</SectionPage>
}
