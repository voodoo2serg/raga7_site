import {SectionPage} from '@/components/SectionPage';
import {SIX_TYPES} from '@/lib/types';
import {UploadCloud} from '@/components/Icons';

export default async function Page({searchParams}:{searchParams:Promise<{project?:string;state?:string}>}){
 const {project,state}=await searchParams;
 return <SectionPage active="/context" projectId={project}>{data=<>
  <div className="detail-heading"><span className="eyebrow">БИБЛИОТЕКА ПАМЯТИ</span><h1>Контекст проекта</h1><p>{data.project?.name||'Выберите проект'} · Факты, решения, гипотезы, навыки, задачи и технические сведения.</p></div>
  <div className="detail-two">
   <section className="detail-box"><h2>Добавить материалы</h2><p>Файлы попадут в очередь RAGA Core. До подтверждения найденное не становится правилом.</p>
    <form action="/api/import" method="post" encType="multipart/form-data" className="upload-form">
     <input type="hidden" name="project_id" value={data.project?.id||''}/>
     <label className="dropzone"><UploadCloud size={25}/><span>Выберите документы или архив</span><input type="file" name="files" multiple accept=".txt,.md,.json,.csv,.pdf,.docx,.zip"/></label>
     <button className="blue-button" disabled={!data.project}>Отправить на обработку</button>
    </form>
   </section>
   <section className="detail-box"><h2>Извлечённые знания</h2>
    <div className="type-list">{SIX_TYPES.map(([k,label,desc])=><div key={k}><span><b>{label}</b><small>{desc}</small></span><strong>{(data.dashboard?.knowledge?.by_type?.[k]) ?? data.knowledge.filter(x=>x.type===k).length}</strong></div>)}</div>
    <p className="hint">Счётчики — выборка ≤200 (или dashboard-агрегатор Core).</p>
   </section>
  </div>
  <section className="detail-box">
   <div className="flex-between"><h2>Проверка знаний</h2><span className="subtle">{data.knowledge.length} в выборке</span></div>
   <div className="knowledge-list">
    {data.knowledge.filter(x=>!state||x.review_state===state).map(x=>(
     <div className="knowledge-line" key={x.id}>
      <div>
       <span className="label-inline">{SIX_TYPES.find(y=>y[0]===x.type)?.[1]||x.type}</span>
       <h3>{x.title}</h3>
       <small>{x.source_refs?.length?`Источников: ${x.source_refs.length}`:'Источник не указан'}</small>
       {x.review_state==='proposed'&&data.project?(
        <div style={{display:'flex',gap:8,marginTop:10}}>
         <form action="/api/review" method="post"><input type="hidden" name="project_id" value={data.project.id}/><input type="hidden" name="item_id" value={x.id}/><input type="hidden" name="action" value="approve"/><button className="blue-button" type="submit" style={{minHeight:34,padding:'6px 12px'}}>Подтвердить</button></form>
         <form action="/api/review" method="post"><input type="hidden" name="project_id" value={data.project.id}/><input type="hidden" name="item_id" value={x.id}/><input type="hidden" name="action" value="reject"/><button className="ghost-btn" type="submit">Отклонить</button></form>
        </div>
       ):null}
      </div>
      <span className={'status-badge '+(x.review_state==='trusted'?'green':'')}>{x.review_state==='trusted'?'Подтверждено':x.review_state==='rejected'?'Отклонено':'На проверке'}</span>
     </div>
    ))}
    {data.knowledge.length===0&&<p className="empty">Пока нет извлечённых записей. Добавьте файлы в проект.</p>}
   </div>
  </section>
 </>}</SectionPage>
}
