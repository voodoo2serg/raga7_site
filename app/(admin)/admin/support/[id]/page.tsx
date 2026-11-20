import Link from 'next/link';
import {AdminShell} from '@/components/AdminShell';
import {adminSupportThread,fmtWhen} from '@/lib/admin';
import {currentUser,isDemo} from '@/lib/core';

export default async function AdminSupportThread({params,searchParams}:{params:Promise<{id:string}>;searchParams:Promise<{ok?:string;error?:string}>}){
 const user=(await currentUser())!;
 const {id}=await params;
 const sp=await searchParams;
 const body=isDemo
  ?{thread:{id,subject:'Демо',status:'open',category:'import',user_id:'u1'},messages:[{id:'m1',body:'Здравствуйте',author_role:'user',created_at:new Date().toISOString()}]}
  :await adminSupportThread(id);
 const thread=body?.thread;
 const messages=body?.messages||[];
 return (
  <AdminShell user={user} active="/admin/support">
   <div className="section-page admin-depth">
    <p><Link href="/admin/support">← Очередь</Link></p>
    {!thread?<div className="detail-box"><p>Тикет не найден или нет прав.</p></div>:
     <>
      <div className="detail-heading">
       <span className="eyebrow">TICKET</span>
       <h1>{thread.subject}</h1>
       <p>{thread.category||'—'} · <span className="status-badge">{thread.status}</span> · user <code>{thread.user_id||'—'}</code>
        {thread.project_id?<> · project <code>{thread.project_id}</code> (metadata only)</>:null}
       </p>
      </div>
      {sp.ok?<div className="demo-message">Сохранено: {sp.ok}</div>:null}
      {sp.error?<div className="demo-message" style={{background:'#fff1f1',borderColor:'#f0c0c0',color:'#8a3030'}}>Ошибка: {sp.error}</div>:null}

      <section className="detail-box admin-thread">
       <h2>Переписка</h2>
       {messages.length===0?<p className="empty">Пока нет сообщений.</p>:messages.map(m=>(
        <div className={`admin-msg ${m.author_role}`} key={m.id}>
         <div className="admin-msg-meta">{m.author_role} · {fmtWhen(m.created_at)}</div>
         <div className="admin-msg-body">{m.body}</div>
        </div>
       ))}
      </section>

      <section className="detail-box">
       <h2>Ответ оператора</h2>
       <form className="admin-form" action="/api/admin/support/reply" method="post">
        <input type="hidden" name="thread_id" value={thread.id}/>
        <label>Сообщение<textarea name="body" rows={4} required maxLength={20000}/></label>
        <button className="blue-button" type="submit">Отправить</button>
       </form>
      </section>

      <section className="detail-box">
       <h2>Назначить</h2>
       <form className="admin-form" action="/api/admin/support/assign" method="post">
        <input type="hidden" name="thread_id" value={thread.id}/>
        <label>Assignee user id<input name="assignee_id" required defaultValue={user.id} placeholder="uuid оператора"/></label>
        <button className="ghost-btn" type="submit">Назначить на себя / id</button>
       </form>
      </section>
     </>}
   </div>
  </AdminShell>
 );
}
