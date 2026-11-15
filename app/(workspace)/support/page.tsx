import {SectionPage} from '@/components/SectionPage';
import {listSupportThreads} from '@/lib/core';
import {LifeBuoy,Info} from '@/components/Icons';

export default async function Page(){
 const threads=await listSupportThreads();
 return <SectionPage active="/support">{()=> <>
  <div className="detail-heading">
   <span className="eyebrow">ПОМОЩЬ</span>
   <h1>Поддержка</h1>
   <p>Переписка с оператором без доступа к знаниям проекта. project_id — только метаданные.</p>
  </div>
  <section className="detail-box">
   <LifeBuoy size={25}/>
   <h2>Новое обращение</h2>
   <form className="import-link-form" action="/api/support" method="post">
    <label>Тема<input name="subject" required maxLength={240} placeholder="Кратко опишите вопрос"/></label>
    <label>Категория
     <select name="category" defaultValue="other" style={{marginTop:7,padding:'12px 14px',border:'1px solid #cad9e9',borderRadius:8,width:'100%'}}>
      <option value="import">Импорт</option>
      <option value="billing">Оплата</option>
      <option value="connect_ai">Подключение AI</option>
      <option value="security">Безопасность</option>
      <option value="error">Ошибка</option>
      <option value="other">Другое</option>
     </select>
    </label>
    <label>Сообщение<textarea name="body" rows={4} required maxLength={20000} style={{marginTop:7,padding:'12px 14px',border:'1px solid #cad9e9',borderRadius:8,width:'100%',font:'inherit'}}/></label>
    <button className="blue-button" type="submit">Отправить</button>
   </form>
   <div className="callout"><Info size={17}/> Не прикладывайте секреты и пароли. Контент знаний проекта поддержке недоступен без отдельного grant.</div>
  </section>
  <section className="detail-box">
   <h2>Мои обращения</h2>
   {threads.length===0?<p className="empty">Пока нет обращений.</p>:threads.map(t=>
    <div className="connection-row" key={t.id}><strong>{t.subject}</strong><span className="status-badge">{t.status}</span></div>
   )}
  </section>
 </>}</SectionPage>
}
